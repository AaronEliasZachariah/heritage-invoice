import { useInvoice } from '../../context/InvoiceContext.jsx'
import { tooltips } from '../../data/tooltips.js'
import { lineSubtotal } from '../../lib/calculations.js'
import { formatCurrency } from '../../lib/format.js'
import Field from '../ui/Field.jsx'
import Tooltip from '../ui/Tooltip.jsx'
import { PlusIcon, TrashIcon } from '../ui/Icons.jsx'

const UNITS = ['hours', 'minutes', 'days', 'weeks', 'units', 'items', 'fixed']

export default function ItemsStep() {
  const { state, totals, addItem, updateItem, removeItem, setField, setNotes } = useInvoice()
  const { lineItems, gstRegistered, notes, payment } = state

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-serif text-base text-heritage-forest">Itemise your work</h3>
          <Tooltip content={tooltips.lineItems} label="About line items" />
        </div>

        {/* Column headers (desktop) */}
        <div className="mb-2 hidden grid-cols-[1fr_5rem_6rem_7rem_2rem] gap-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-heritage-brownLight md:grid">
          <span>Description</span>
          <span>Qty</span>
          <span>Unit</span>
          <span className="text-right">
            Rate <span className="font-normal normal-case">(ex GST)</span>
          </span>
          <span />
        </div>

        <div className="space-y-3">
          {lineItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-3 rounded-xl border border-heritage-sand bg-white/60 p-3 md:grid-cols-[1fr_5rem_6rem_7rem_2rem] md:items-center md:gap-3"
            >
              <input
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                placeholder="Software development"
                className="field-input"
                aria-label="Description"
              />
              <input
                value={item.quantity}
                onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                inputMode="decimal"
                placeholder="1"
                className="field-input md:text-center"
                aria-label="Quantity"
              />
              <input
                list="unit-suggestions"
                value={item.unit}
                onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                className="field-input"
                placeholder="hours"
                aria-label="Unit"
              />
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-heritage-brownLight">
                  $
                </span>
                <input
                  value={item.rate}
                  onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="field-input pl-7 md:text-right"
                  aria-label="Rate"
                />
              </div>
              <div className="flex items-center justify-between md:justify-end">
                <span className="text-sm font-medium text-heritage-forest md:hidden">
                  {formatCurrency(lineSubtotal(item))}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                  className="rounded-md p-1.5 text-heritage-brownLight transition hover:bg-red-50 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions for the free-text unit field — users can also type their own. */}
        <datalist id="unit-suggestions">
          {UNITS.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>

        <button
          type="button"
          onClick={addItem}
          className="btn-ghost mt-3 w-full border border-dashed border-heritage-sand"
        >
          <PlusIcon className="h-4 w-4" /> Add line item
        </button>
      </div>

      {/* Totals */}
      <div className="ml-auto w-full max-w-xs space-y-1.5 rounded-xl bg-heritage-beige/70 p-4 text-sm">
        <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
        {gstRegistered && <Row label="GST (10%)" value={formatCurrency(totals.gst)} />}
        {!gstRegistered && (
          <p className="text-xs text-heritage-brownLight">No GST (not registered).</p>
        )}
        <div className="my-2 h-px bg-heritage-sand" />
        <Row label="Total due" value={formatCurrency(totals.total)} strong />
      </div>

      {/* Notes & payment */}
      <div>
        <h3 className="mb-4 font-serif text-base text-heritage-forest">Payment & notes</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Bank name"
            value={payment.bankName}
            onChange={(v) => setField('payment', 'bankName', v)}
            placeholder="e.g. Commonwealth Bank"
          />
          <Field
            label="Account name"
            value={payment.accountName}
            onChange={(v) => setField('payment', 'accountName', v)}
            placeholder="Jordan Smith"
          />
          <Field
            label="BSB"
            value={payment.bsb}
            onChange={(v) => setField('payment', 'bsb', v)}
            placeholder="000-000"
            inputMode="numeric"
          />
          <Field
            label="Account number"
            value={payment.accountNumber}
            onChange={(v) => setField('payment', 'accountNumber', v)}
            placeholder="12345678"
            inputMode="numeric"
          />
          <Field
            label="PayID (optional)"
            value={payment.payId}
            onChange={(v) => setField('payment', 'payId', v)}
            placeholder="you@example.com"
          />
          <div className="sm:col-span-2">
            <Field
              label="Notes / terms"
              tooltip={tooltips.notes}
              as="textarea"
              value={notes}
              onChange={setNotes}
              placeholder="Payment due within 14 days. Thank you for your business!"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? 'font-serif text-base text-heritage-forest' : 'text-heritage-brownLight'}>
        {label}
      </span>
      <span className={strong ? 'font-serif text-base font-semibold text-heritage-forest' : 'text-heritage-brown'}>
        {value}
      </span>
    </div>
  )
}
