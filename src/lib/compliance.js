// Australian Taxation Office (ATO) compliance logic.
//
// Every rule below is grounded in current (2025–2026) ATO / business.gov.au
// guidance — see SOURCES at the bottom of this file. This module is the single
// source of truth for: the document title, the GST calculation footer, and the
// validation that drives the wizard's educational guardrails.

import { isValidABN, isABNPresent } from './abn.js'
import { calcTotals } from './calculations.js'

export const GST_RATE = 0.1 // GST has been a flat 10% since 1 July 2000.
export const GST_THRESHOLD = 75000 // Mandatory GST registration at/above this turnover.
export const GST_THRESHOLD_NONPROFIT = 150000
export const HIGH_VALUE_THRESHOLD = 1000 // Buyer identity required at/above this total.
export const NO_ABN_WITHHOLDING_RATE = 0.47 // Top marginal rate withheld if no ABN quoted.
export const NO_ABN_WITHHOLDING_MIN = 75 // ...on payments over $75 (ex GST).

/**
 * The document title is legally determined by GST registration:
 *  - GST-registered & charging GST  -> "Tax Invoice" (must contain those words)
 *  - Not registered for GST         -> "Invoice" (must NOT say "tax invoice")
 */
export function documentTitle(gstRegistered) {
  return gstRegistered ? 'Tax Invoice' : 'Invoice'
}

/**
 * The footer GST declaration. The ATO requires every invoice to make the GST
 * position unambiguous. Returns an array of short statements to render.
 */
export function complianceFooter({ gstRegistered, supplierName, gstAmount }) {
  if (gstRegistered) {
    return [
      'This is a Tax Invoice.',
      `Total includes GST (10%) of ${formatPlain(gstAmount)}.`,
    ]
  }
  const who = supplierName?.trim() ? supplierName.trim() : 'The supplier'
  return [
    'No GST has been charged.',
    `${who} is not registered for GST. This price does not include GST.`,
  ]
}

/**
 * Validate the full invoice and return structured findings. Severities:
 *   - 'error':   breaks ATO compliance or basic correctness; block export.
 *   - 'warning': legal but risky / strongly recommended.
 *   - 'info':    contextual nudge.
 *
 * Each finding has a stable `id`, a `field` (for anchoring UI), and `message`.
 */
export function validateInvoice(state) {
  const findings = []
  const { supplier, client, meta, lineItems, gstRegistered } = state
  const { total } = calcTotals(lineItems, gstRegistered)

  const add = (severity, id, field, message) =>
    findings.push({ severity, id, field, message })

  // --- Supplier (you) ---
  if (!supplier.name?.trim()) {
    add('error', 'supplier-name', 'supplier.name', 'Add your name or business name — it must appear on every invoice.')
  }
  if (!isABNPresent(supplier.abn)) {
    add(
      'warning',
      'supplier-abn-missing',
      'supplier.abn',
      'No ABN supplied. Without one, your client may legally withhold 47% of payments over $75.',
    )
  } else if (!isValidABN(supplier.abn)) {
    add('error', 'supplier-abn-invalid', 'supplier.abn', 'This ABN fails the ATO checksum — double-check the 11 digits.')
  }

  // --- Client ---
  const clientIdentified = client.name?.trim() || isABNPresent(client.abn)
  if (total >= HIGH_VALUE_THRESHOLD && !clientIdentified) {
    add(
      'error',
      'client-identity',
      'client.name',
      `For invoices of $${HIGH_VALUE_THRESHOLD.toLocaleString()} or more, the ATO requires the buyer's name or ABN.`,
    )
  } else if (!client.name?.trim()) {
    add('warning', 'client-name', 'client.name', "Add your client's name so they can match and pay the invoice.")
  }
  if (isABNPresent(client.abn) && !isValidABN(client.abn)) {
    add('warning', 'client-abn-invalid', 'client.abn', "The client's ABN fails the checksum — verify it if you entered one.")
  }

  // --- Dates & numbering ---
  if (!meta.issueDate) {
    add('error', 'issue-date', 'meta.issueDate', 'A date of issue is required on a valid invoice.')
  }
  if (meta.issueDate && meta.dueDate && meta.dueDate < meta.issueDate) {
    add('warning', 'due-date', 'meta.dueDate', 'The due date is before the issue date — set a clear, later payment date.')
  }
  if (!meta.invoiceNumber?.trim()) {
    add('info', 'invoice-number', 'meta.invoiceNumber', 'Give each invoice a unique number to keep clean records.')
  }

  // --- Line items ---
  const usable = lineItems.filter((it) => it.description?.trim() || Number(it.rate) > 0)
  if (usable.length === 0) {
    add('error', 'line-items', 'lineItems', 'Add at least one line item describing the work and its price.')
  }
  lineItems.forEach((it) => {
    const hasValue = Number(it.rate) > 0 || Number(it.quantity) > 0
    if (hasValue && !it.description?.trim()) {
      add('warning', `item-desc-${it.id}`, 'lineItems', 'Describe each item — the ATO requires a brief description of what was sold.')
    }
  })

  return {
    findings,
    errors: findings.filter((f) => f.severity === 'error'),
    warnings: findings.filter((f) => f.severity === 'warning'),
    isExportable: findings.every((f) => f.severity !== 'error'),
  }
}

function formatPlain(amount) {
  const value = Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(value)
}

// Primary sources backing this module (current as of 2026):
export const SOURCES = [
  { label: 'ATO — Tax invoices', url: 'https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/tax-invoices' },
  { label: 'ATO — Registering for GST', url: 'https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/registering-for-gst' },
  { label: 'ATO — Withholding if ABN not provided', url: 'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/payg-withholding/payments-you-need-to-withhold-from/withholding-from-suppliers/withholding-if-abn-not-provided' },
  { label: 'business.gov.au — How to invoice', url: 'https://business.gov.au/finance/payments-and-invoicing/how-to-invoice' },
]
