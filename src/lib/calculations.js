// Money math. Rates are entered GST-exclusive (the usual way a contractor
// quotes an hourly/unit rate); GST is then added on top when registered.
// This keeps the GST exactly 1/11th of the total, satisfying the ATO rule.

import { GST_RATE } from './compliance.js'

/** Round to 2 decimal places, avoiding binary float drift (e.g. 1.005). */
export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

/** The ex-GST amount for a single line item (quantity x rate). */
export function lineSubtotal(item) {
  const quantity = Number(item?.quantity) || 0
  const rate = Number(item?.rate) || 0
  return round2(quantity * rate)
}

/**
 * Totals for the whole invoice.
 * @returns {{subtotal:number, gst:number, total:number}}
 */
export function calcTotals(lineItems = [], gstRegistered = false) {
  const subtotal = round2(
    lineItems.reduce((sum, item) => sum + lineSubtotal(item), 0),
  )
  const gst = gstRegistered ? round2(subtotal * GST_RATE) : 0
  const total = round2(subtotal + gst)
  return { subtotal, gst, total }
}
