// Vercel serverless function — POST /api/parse
//
// Turns a contractor's plain-English description into structured invoice data
// using OpenAI. The API key lives only on the server (OPENAI_API_KEY); it is
// never shipped to the browser. The client (src/lib/api.js) falls back to a
// local parser if this route is unavailable.

import OpenAI from 'openai'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Cheap + fast model for this simple extraction task. Override with OPENAI_MODEL.
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

// --- Per-IP rate limiting -----------------------------------------------------
// Protects your OpenAI tokens from spam. Active only when the Upstash Redis env
// vars are present (set automatically by the Vercel Upstash integration). When
// they're absent (local dev, or before you've added the integration), the
// limiter is skipped — fail-open — so nothing breaks. Tune the limits here.
const RATE_PER_MINUTE = 10
const RATE_PER_DAY = 100

let _limiters // undefined = unchecked, null = not configured
function getLimiters() {
  if (_limiters !== undefined) return _limiters
  // Accept either the Upstash-native names or Vercel KV's aliases.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    _limiters = null
    return null
  }
  const redis = new Redis({ url, token })
  _limiters = {
    minute: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_PER_MINUTE, '1 m'), prefix: 'rl:parse:min' }),
    day: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_PER_DAY, '1 d'), prefix: 'rl:parse:day' }),
  }
  return _limiters
}

function clientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.trim()) return xff.split(',')[0].trim()
  const real = req.headers['x-real-ip']
  return (typeof real === 'string' && real) || 'unknown'
}

// Returns true if the request was rate-limited (a 429 has been sent).
async function rateLimited(req, res) {
  const limiters = getLimiters()
  if (!limiters) return false
  try {
    const ip = clientIp(req)
    const [m, d] = await Promise.all([limiters.minute.limit(ip), limiters.day.limit(ip)])
    if (m.success && d.success) return false
    const blocked = m.success ? d : m
    const retry = Math.max(1, Math.ceil((blocked.reset - Date.now()) / 1000))
    res.setHeader('Retry-After', String(retry))
    res.status(429).json({ error: 'Too many requests — please wait a moment and try again.' })
    return true
  } catch (err) {
    // Never let a limiter outage take down the endpoint — fail open.
    console.error('[api/parse] rate limit check failed:', err?.message)
    return false
  }
}

const SYSTEM = `You convert a freelancer/contractor's plain-English description of work into structured data for an Australian invoice. Map EVERY detail to its dedicated field — never dump information into notes.

Rules:
- Extract ONLY what the user states or clearly implies. Never invent values. Use null for anything not provided.
- Treat bracketed placeholders such as "[Insert bank name]" or "[Insert 0000 0000]" as NOT provided — use null.
- Rates are GST-EXCLUSIVE (the amount before GST).
- "for <X>" usually names the client. Quantities like "100 hours" map to quantity + unit; "$20/hr" maps to rate.
- The unit MUST be one of: "hours", "days", "units", "items", "fixed". Map "/hr" or "per hour" to "hours", "/day" or "per day" to "days", and a single fixed-price job to "fixed" (quantity 1).
- Bank name, account name, BSB, account number and PayID go in the "payment" object — NEVER in notes.
- Invoice number -> invoiceNumber. Dates -> issueDate / dueDate, each in ISO format (YYYY-MM-DD).
- Set gstRegistered to true only if the user clearly indicates they are registered for GST or are charging GST. Otherwise use null.
- "notes" is ONLY for genuine free-text remarks or payment terms the user actually wrote (e.g. "Payment due within 14 days", "Thank you for your business"). NEVER put the document title/header, invoice number, dates, totals, GST status, or bank/account details in notes — each of those has its own field. If there are no genuine remarks, set notes to null.`

const nullableString = { type: ['string', 'null'] }

// JSON Schema for OpenAI Structured Outputs. In strict mode every property must
// be listed in `required`; optional fields are expressed as nullable unions.
const SCHEMA = {
  name: 'fill_invoice',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      supplier: {
        type: ['object', 'null'],
        additionalProperties: false,
        properties: {
          name: nullableString,
          abn: nullableString,
          email: nullableString,
          phone: nullableString,
          address: nullableString,
        },
        required: ['name', 'abn', 'email', 'phone', 'address'],
      },
      client: {
        type: ['object', 'null'],
        additionalProperties: false,
        properties: {
          name: nullableString,
          abn: nullableString,
          email: nullableString,
          address: nullableString,
        },
        required: ['name', 'abn', 'email', 'address'],
      },
      lineItems: {
        type: ['array', 'null'],
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            description: { type: 'string' },
            quantity: { type: ['number', 'null'] },
            unit: nullableString, // hours | days | units | items | fixed
            rate: { type: ['number', 'null'] },
          },
          required: ['description', 'quantity', 'unit', 'rate'],
        },
      },
      payment: {
        type: ['object', 'null'],
        additionalProperties: false,
        properties: {
          bankName: nullableString,
          accountName: nullableString,
          bsb: nullableString,
          accountNumber: nullableString,
          payId: nullableString,
        },
        required: ['bankName', 'accountName', 'bsb', 'accountNumber', 'payId'],
      },
      invoiceNumber: nullableString,
      issueDate: nullableString, // YYYY-MM-DD
      dueDate: nullableString, // YYYY-MM-DD
      gstRegistered: { type: ['boolean', 'null'] },
      notes: nullableString,
    },
    required: [
      'supplier',
      'client',
      'lineItems',
      'payment',
      'invoiceNumber',
      'issueDate',
      'dueDate',
      'gstRegistered',
      'notes',
    ],
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Reject spam before doing any work or spending tokens.
  if (await rateLimited(req, res)) return

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' })
  }

  const prompt = readPrompt(req.body)
  if (!prompt) {
    return res.status(400).json({ error: 'A non-empty "prompt" is required.' })
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await client.chat.completions.create({
      model: MODEL,
      // Newer OpenAI models require max_completion_tokens (max_tokens is rejected).
      // Headroom covers models that spend tokens on internal reasoning.
      max_completion_tokens: 2048,
      // Structured Outputs — guarantees the response matches SCHEMA exactly.
      response_format: { type: 'json_schema', json_schema: SCHEMA },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt.slice(0, 4000) },
      ],
    })

    const message = completion.choices?.[0]?.message
    if (message?.refusal) {
      return res.status(422).json({ error: 'The model declined to parse that prompt.' })
    }
    if (!message?.content) {
      return res.status(502).json({ error: 'The model did not return structured invoice data.' })
    }

    return res.status(200).json({ invoice: sanitize(JSON.parse(message.content)) })
  } catch (err) {
    // Log details server-side only; never echo error contents to the client,
    // as upstream error messages can contain the API key.
    const status = err?.status === 401 ? 401 : 502
    console.error('[api/parse] error:', err?.name, err?.message)
    return res.status(status).json({
      error:
        status === 401
          ? 'OpenAI rejected the API key.'
          : 'Failed to generate from that prompt. Please try again.',
    })
  }
}

function readPrompt(body) {
  let data = body
  if (typeof body === 'string') {
    try {
      data = JSON.parse(body)
    } catch {
      return ''
    }
  }
  return typeof data?.prompt === 'string' ? data.prompt.trim() : ''
}

// A bracketed placeholder like "[Insert bank name]" means "not provided".
const isPlaceholder = (v) => typeof v === 'string' && /^\s*\[.*\]\s*$/.test(v)

// Trim, and treat empty / placeholder strings as absent.
function clean(value) {
  if (value == null) return undefined
  const s = String(value).trim()
  if (!s || isPlaceholder(s)) return undefined
  return s
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Defensive: keep only the fields the client knows how to merge, dropping
// nulls, blanks and placeholders.
function sanitize(input) {
  if (!input || typeof input !== 'object') return {}
  const out = {}
  const pickObj = (obj, keys) => {
    if (!obj || typeof obj !== 'object') return undefined
    const r = {}
    for (const k of keys) {
      const c = clean(obj[k])
      if (c !== undefined) r[k] = c
    }
    return Object.keys(r).length ? r : undefined
  }

  const supplier = pickObj(input.supplier, ['name', 'abn', 'email', 'phone', 'address'])
  const client = pickObj(input.client, ['name', 'abn', 'email', 'address'])
  const payment = pickObj(input.payment, ['bankName', 'accountName', 'bsb', 'accountNumber', 'payId'])
  if (supplier) out.supplier = supplier
  if (client) out.client = client
  if (payment) out.payment = payment

  const invoiceNumber = clean(input.invoiceNumber)
  if (invoiceNumber) out.invoiceNumber = invoiceNumber

  const issueDate = clean(input.issueDate)
  if (issueDate && ISO_DATE.test(issueDate)) out.issueDate = issueDate
  const dueDate = clean(input.dueDate)
  if (dueDate && ISO_DATE.test(dueDate)) out.dueDate = dueDate

  if (typeof input.gstRegistered === 'boolean') out.gstRegistered = input.gstRegistered

  const notes = clean(input.notes)
  if (notes) out.notes = notes

  if (Array.isArray(input.lineItems)) {
    out.lineItems = input.lineItems
      .filter((it) => it && (it.description || it.rate != null))
      .map((it) => ({
        description: String(it.description || ''),
        quantity: Number(it.quantity) || 1,
        unit: normalizeUnit(it.unit),
        rate: Number(it.rate) || 0,
      }))
  }

  return out
}

// Normalise common unit synonyms; otherwise keep whatever the user said
// (e.g. "sessions", "licences") so the unit is never silently rewritten.
function normalizeUnit(value) {
  const s = String(value || '').toLowerCase().trim()
  if (!s) return 'hours'
  if (s === 'hr' || s === 'hrs' || s.startsWith('hour')) return 'hours'
  if (s === 'min' || s === 'mins' || s.startsWith('minute')) return 'minutes'
  if (s.startsWith('day')) return 'days'
  if (s === 'wk' || s === 'wks' || s.startsWith('week')) return 'weeks'
  if (s.startsWith('unit')) return 'units'
  if (s.startsWith('item')) return 'items'
  if (s.startsWith('fix')) return 'fixed'
  return s
}
