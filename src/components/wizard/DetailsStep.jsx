import { useInvoice } from '../../context/InvoiceContext.jsx'
import { tooltips } from '../../data/tooltips.js'
import { documentTitle, GST_THRESHOLD } from '../../lib/compliance.js'
import Field from '../ui/Field.jsx'
import Toggle from '../ui/Toggle.jsx'
import Tooltip from '../ui/Tooltip.jsx'
import { ShieldIcon } from '../ui/Icons.jsx'

export default function DetailsStep() {
  const { state, setField, setGst, validation } = useInvoice()
  const { supplier, meta, gstRegistered } = state

  const hintFor = (field, value) => {
    if (!value) return {}
    const f = validation.findings.find((x) => x.field === field)
    return f ? { hint: f.message, hintTone: f.severity } : {}
  }

  return (
    <div className="space-y-7">
      {/* GST registration — drives the whole document */}
      <div className="rounded-xl border border-heritage-sand bg-white/60 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5 text-heritage-emerald" />
              <h3 className="font-serif text-base text-heritage-forest">Registered for GST?</h3>
              <Tooltip content={tooltips.gstToggle} label="About GST registration" />
            </div>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-heritage-brownLight">
              Registration is mandatory once your turnover reaches{' '}
              <strong>${GST_THRESHOLD.toLocaleString()}</strong>. This sets whether you charge 10%
              GST and issue a <em>Tax Invoice</em> or a plain <em>Invoice</em>.
            </p>
          </div>
          <Toggle checked={gstRegistered} onChange={setGst} label="Registered for GST" />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-heritage-beige/70 px-3 py-2 text-xs">
          <span className="text-heritage-brownLight">This invoice will be titled</span>
          <span className="rounded-md bg-heritage-forest px-2 py-0.5 font-serif font-semibold text-heritage-cream">
            {documentTitle(gstRegistered)}
          </span>
        </div>
      </div>

      {/* Supplier (you) */}
      <div>
        <h3 className="mb-4 font-serif text-base text-heritage-forest">Your business details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Your name / business name"
            tooltip={tooltips.supplierName}
            value={supplier.name}
            onChange={(v) => setField('supplier', 'name', v)}
            placeholder="Jordan Smith"
            required
          />
          <Field
            label="ABN"
            tooltip={tooltips.supplierAbn}
            value={supplier.abn}
            onChange={(v) => setField('supplier', 'abn', v)}
            placeholder="12 345 678 901"
            inputMode="numeric"
            {...hintFor('supplier.abn', supplier.abn)}
          />
          <Field
            label="Email"
            type="email"
            value={supplier.email}
            onChange={(v) => setField('supplier', 'email', v)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            label="Phone"
            value={supplier.phone}
            onChange={(v) => setField('supplier', 'phone', v)}
            placeholder="0400 000 000"
          />
          <div className="sm:col-span-2">
            <Field
              label="Address"
              tooltip={tooltips.supplierAddress}
              as="textarea"
              rows={2}
              value={supplier.address}
              onChange={(v) => setField('supplier', 'address', v)}
              placeholder="12 Heritage Lane, Carlton VIC 3053"
            />
          </div>
        </div>
      </div>

      {/* Invoice meta */}
      <div>
        <h3 className="mb-4 font-serif text-base text-heritage-forest">Invoice details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field
            label="Invoice number"
            tooltip={tooltips.invoiceNumber}
            value={meta.invoiceNumber}
            onChange={(v) => setField('meta', 'invoiceNumber', v)}
            placeholder="INV-0001"
          />
          <Field
            label="Date of issue"
            tooltip={tooltips.issueDate}
            type="date"
            value={meta.issueDate}
            onChange={(v) => setField('meta', 'issueDate', v)}
            required
          />
          <Field
            label="Due date"
            tooltip={tooltips.dueDate}
            type="date"
            value={meta.dueDate}
            onChange={(v) => setField('meta', 'dueDate', v)}
            {...(meta.dueDate && meta.issueDate && meta.dueDate < meta.issueDate
              ? { hint: 'Due date is before the issue date.', hintTone: 'warning' }
              : {})}
          />
        </div>
      </div>
    </div>
  )
}
