// Client for the AI wizard. Calls the serverless route (api/parse.js) which
// securely talks to Claude. If the route is unavailable (e.g. running `vite dev`
// without `vercel dev`, or no API key configured), we transparently fall back
// to a lightweight local heuristic parser so the app still works offline.

import { localParse } from './localParse.js'

/**
 * Parse a natural-language description into a partial invoice.
 * @param {string} prompt
 * @returns {Promise<{ data: object, source: 'ai' | 'local' }>}
 */
export async function parsePrompt(prompt) {
  try {
    const res = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    if (!res.ok) {
      const detail = await safeJson(res)
      throw new Error(detail?.error || `Parser responded ${res.status}`)
    }

    const data = await res.json()
    return { data: data.invoice ?? data, source: 'ai' }
  } catch (err) {
    // Network/route/key failure; degrade gracefully rather than dead-end.
    console.warn('[ai] /api/parse unavailable, using local parser:', err.message)
    return { data: localParse(prompt), source: 'local' }
  }
}

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}
