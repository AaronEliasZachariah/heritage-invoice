// Formatting helpers. The app is Australian-first: AUD currency, en-AU dates.

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Format a number as AUD, e.g. 2000 -> "$2,000.00". */
export function formatCurrency(amount) {
  const value = Number.isFinite(amount) ? amount : 0
  return currencyFormatter.format(value)
}

/** Format an ISO date string (yyyy-mm-dd) as "13 June 2026". */
export function formatDate(iso) {
  if (!iso) return '-'
  // Parse as a local date to avoid timezone drift on yyyy-mm-dd strings.
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const date = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Today's date as an ISO yyyy-mm-dd string (local time). */
export function todayISO() {
  return toISO(new Date())
}

/** Add `days` to an ISO date string and return a new ISO string. */
export function addDays(iso, days) {
  const [y, m, d] = (iso || todayISO()).split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return toISO(date)
}

/** Group an ABN as "12 345 678 901" for display. */
export function formatABN(abn) {
  const digits = String(abn || '').replace(/\D/g, '')
  if (digits.length !== 11) return abn || ''
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`
}

function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
