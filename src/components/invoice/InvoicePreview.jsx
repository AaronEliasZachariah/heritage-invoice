import { useInvoice } from '../../context/InvoiceContext.jsx'
import { documentTitle, complianceFooter } from '../../lib/compliance.js'
import { lineSubtotal } from '../../lib/calculations.js'
import { formatCurrency, formatDate, formatABN } from '../../lib/format.js'
import EditableText from '../ui/EditableText.jsx'

// Helpers for click-to-edit fields. We store raw strings; the app's
// calculations coerce with Number(), so strings are safe.
const toMoney = (raw) => raw.replace(/[^0-9.]/g, '')

// Parse a combined "7 hours" / "30 minutes" string into { quantity, unit }.
const parseQtyUnit = (raw) => {
  const m = String(raw).trim().match(/^\s*(\d*\.?\d+)?\s*(.*)$/)
  return {
    quantity: m && m[1] != null ? m[1] : '',
    unit: (m && m[2] ? m[2] : '').trim(),
  }
}
const qtyNum = (q) => {
  const n = Number(q)
  return Number.isFinite(n) ? n : 0
}

/**
 * On-screen, true-to-PDF preview of the invoice — and a click-to-edit surface.
 * Click any field to tweak it; edits flow straight into the PDF (no re-prompt).
 * Wrapped in #print-area so the browser's native print also produces a clean doc.
 */
export default function InvoicePreview() {
  const { state, totals, setField, updateItem, setNotes } = useInvoice()
  const { supplier, client, meta, lineItems, gstRegistered, notes, payment } = state
  const title = documentTitle(gstRegistered)
  const footerLines = complianceFooter({
    gstRegistered,
    supplierName: supplier.name,
    gstAmount: totals.gst,
  })
  const items = lineItems.filter(
    (it) => it.description?.trim() || Number(it.rate) > 0 || Number(it.quantity) > 0,
  )
  const hasPayment =
    payment.bankName ||
    payment.accountName ||
    payment.bsb ||
    payment.accountNumber ||
    payment.payId

  return (
    <div
      id="print-area"
      className="mx-auto w-full max-w-[640px] overflow-hidden rounded-lg bg-white text-heritage-ink shadow-lift"
    >
      <div className="h-1.5 w-full bg-heritage-forest" />
      <div className="px-8 py-8 sm:px-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="font-serif text-xl font-semibold text-heritage-forest">
              <EditableText
                value={supplier.name}
                onCommit={(v) => setField('supplier', 'name', v)}
                placeholder="Your business name"
                ariaLabel="Business name"
              />
            </h2>
            <div className="mt-1 space-y-0.5 text-xs text-heritage-brownLight">
              {supplier.abn && (
                <p>
                  ABN:{' '}
                  <EditableText
                    value={supplier.abn}
                    onCommit={(v) => setField('supplier', 'abn', v)}
                    format={formatABN}
                    ariaLabel="Your ABN"
                  />
                </p>
              )}
              {supplier.address && (
                <p className="whitespace-pre-line">
                  <EditableText
                    value={supplier.address}
                    onCommit={(v) => setField('supplier', 'address', v)}
                    multiline
                    ariaLabel="Your address"
                  />
                </p>
              )}
              {supplier.email && (
                <p>
                  <EditableText
                    value={supplier.email}
                    onCommit={(v) => setField('supplier', 'email', v)}
                    ariaLabel="Your email"
                  />
                </p>
              )}
              {supplier.phone && (
                <p>
                  <EditableText
                    value={supplier.phone}
                    onCommit={(v) => setField('supplier', 'phone', v)}
                    ariaLabel="Your phone"
                  />
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-serif text-3xl font-semibold leading-none text-heritage-forest">
              {title}
            </p>
            <dl className="mt-3 space-y-0.5 text-xs text-heritage-brownLight">
              <div className="flex justify-end gap-2">
                <dt>No:</dt>
                <dd className="font-medium text-heritage-brown">
                  <EditableText
                    value={meta.invoiceNumber}
                    onCommit={(v) => setField('meta', 'invoiceNumber', v)}
                    placeholder="INV-0001"
                    ariaLabel="Invoice number"
                  />
                </dd>
              </div>
              <Meta label="Issued" value={formatDate(meta.issueDate)} />
              <Meta label="Due" value={formatDate(meta.dueDate)} />
            </dl>
          </div>
        </div>

        {/* Bill to */}
        <div className="mt-8 flex items-end justify-between gap-6">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-heritage-brass">
              Bill to
            </p>
            <p className="text-sm font-semibold text-heritage-brown">
              <EditableText
                value={client.name}
                onCommit={(v) => setField('client', 'name', v)}
                placeholder="Client name"
                ariaLabel="Client name"
              />
            </p>
            <div className="mt-0.5 space-y-0.5 text-xs text-heritage-brownLight">
              {client.abn && (
                <p>
                  ABN:{' '}
                  <EditableText
                    value={client.abn}
                    onCommit={(v) => setField('client', 'abn', v)}
                    format={formatABN}
                    ariaLabel="Client ABN"
                  />
                </p>
              )}
              {client.address && (
                <p className="whitespace-pre-line">
                  <EditableText
                    value={client.address}
                    onCommit={(v) => setField('client', 'address', v)}
                    multiline
                    ariaLabel="Client address"
                  />
                </p>
              )}
              {client.email && (
                <p>
                  <EditableText
                    value={client.email}
                    onCommit={(v) => setField('client', 'email', v)}
                    ariaLabel="Client email"
                  />
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-heritage-brass">
              Amount due
            </p>
            <p className="font-serif text-2xl font-semibold text-heritage-emerald">
              {formatCurrency(totals.total)}
            </p>
          </div>
        </div>

        {/* Items */}
        <table className="mt-7 w-full border-collapse text-sm">
          <thead>
            <tr className="rounded bg-heritage-forest text-left text-[10px] uppercase tracking-wide text-heritage-cream">
              <th className="rounded-l px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 text-center font-semibold">Qty</th>
              <th className="px-3 py-2 text-right font-semibold">Rate</th>
              <th className="rounded-r px-3 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr className="border-b border-heritage-sand">
                <td className="px-3 py-3 text-xs text-heritage-brownLight" colSpan={4}>
                  No items yet — add them in the Items step.
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} className="border-b border-heritage-sand align-top">
                  <td className="px-3 py-2.5 text-heritage-brown">
                    <EditableText
                      value={it.description}
                      onCommit={(v) => updateItem(it.id, 'description', v)}
                      placeholder="Description"
                      ariaLabel="Item description"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-center text-heritage-brownLight">
                    <EditableText
                      value={
                        it.unit && it.unit !== 'fixed'
                          ? `${qtyNum(it.quantity)} ${it.unit}`
                          : `${qtyNum(it.quantity)}`
                      }
                      onCommit={(parsed) => {
                        if (parsed.quantity !== '' && parsed.quantity != null)
                          updateItem(it.id, 'quantity', parsed.quantity)
                        if (parsed.unit) updateItem(it.id, 'unit', parsed.unit)
                      }}
                      parse={parseQtyUnit}
                      ariaLabel="Quantity and unit"
                      className="block w-full"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right text-heritage-brownLight">
                    <EditableText
                      value={it.rate}
                      onCommit={(v) => updateItem(it.id, 'rate', v)}
                      format={(v) => formatCurrency(Number(v) || 0)}
                      toRaw={(v) => String(v)}
                      parse={toMoney}
                      ariaLabel="Rate"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-heritage-brown">
                    {formatCurrency(lineSubtotal(it))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-56 space-y-1 text-sm">
            <div className="flex justify-between text-heritage-brownLight">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {gstRegistered && (
              <div className="flex justify-between text-heritage-brownLight">
                <span>GST (10%)</span>
                <span>{formatCurrency(totals.gst)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t-2 border-heritage-forest pt-2 font-serif text-base font-semibold text-heritage-forest">
              <span>Total (AUD)</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Compliance footer */}
        <div className="mt-7 rounded-md border-l-[3px] border-heritage-brass bg-heritage-beige/70 px-4 py-3">
          {footerLines.map((line, i) => (
            <p key={i} className="text-xs leading-relaxed text-heritage-brown">
              {line}
            </p>
          ))}
        </div>

        {(hasPayment || notes) && (
          <div className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
            {hasPayment && (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-heritage-brass">
                  Payment details
                </p>
                <div className="space-y-0.5 text-xs text-heritage-brownLight">
                  {payment.bankName && <p>Bank: {payment.bankName}</p>}
                  {payment.accountName && <p>Account name: {payment.accountName}</p>}
                  {payment.bsb && <p>BSB: {payment.bsb}</p>}
                  {payment.accountNumber && <p>Account no: {payment.accountNumber}</p>}
                  {payment.payId && <p>PayID: {payment.payId}</p>}
                </div>
              </div>
            )}
            {notes && (
              <div className="max-w-xs">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-heritage-brass">
                  Notes
                </p>
                <p className="whitespace-pre-line text-xs text-heritage-brownLight">
                  <EditableText
                    value={notes}
                    onCommit={setNotes}
                    multiline
                    ariaLabel="Notes"
                  />
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div className="flex justify-end gap-2">
      <dt>{label}:</dt>
      <dd className="font-medium text-heritage-brown">{value}</dd>
    </div>
  )
}
