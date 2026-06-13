// Offline fallback parser. Deliberately small — it covers the common
// "<qty> <unit> of <work> at $<rate>/<unit> for <client>" shape so the demo
// works without an API key. The serverless Claude route is the primary path
// and handles arbitrary phrasing far better.

export function localParse(prompt) {
  const text = String(prompt || '').trim()
  if (!text) return {}

  const result = { lineItems: [] }

  // Rate: "$20/hr", "20 per hour", "$150 each", "at 90/hour"
  const rateMatch = text.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:\/|\bper\b|\beach\b|\ba\b)?\s*(hr|hour|hours|day|days|unit|units|item|items)?/i)

  // Quantity + unit: "100 hours", "3 days", "5 units"
  const qtyMatch = text.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|days?|units?|items?)\b/i)

  // Client: "for <Name>" up to a delimiter
  const clientMatch = text.match(/\bfor\s+([A-Z0-9][\w&.\- ]{1,60}?)(?:\.|,|$|\s+at\b|\s+for\b)/i)

  // Work description: "of <work>" or "<qty unit> of <work>"
  const workMatch = text.match(/\bof\s+([\w&.\- ]{2,60}?)(?:\s+(?:at|for)\b|,|\.|$)/i)

  let quantity = qtyMatch ? Number(qtyMatch[1]) : 1
  let unit = normalizeUnit(qtyMatch?.[2] || rateMatch?.[2])

  // Avoid mistaking the quantity number for the rate.
  let rate
  if (rateMatch) {
    const candidate = Number(rateMatch[1])
    if (!qtyMatch || candidate !== quantity) rate = candidate
  }
  // Look for an explicit dollar amount if rate is still ambiguous.
  if (rate == null) {
    const dollar = text.match(/\$\s*(\d+(?:\.\d+)?)/)
    if (dollar) rate = Number(dollar[1])
  }

  const description = workMatch
    ? capitalize(workMatch[1].trim())
    : 'Professional services'

  result.lineItems.push({
    description,
    quantity: Number.isFinite(quantity) ? quantity : 1,
    unit: unit || 'hours',
    rate: Number.isFinite(rate) ? rate : 0,
  })

  if (clientMatch) {
    result.client = { name: clientMatch[1].trim() }
  }

  return result
}

function normalizeUnit(raw) {
  if (!raw) return null
  const u = raw.toLowerCase()
  if (u.startsWith('hr') || u.startsWith('hour')) return 'hours'
  if (u.startsWith('day')) return 'days'
  if (u.startsWith('unit')) return 'units'
  if (u.startsWith('item')) return 'items'
  return null
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
