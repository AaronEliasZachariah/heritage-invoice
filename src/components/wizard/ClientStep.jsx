import { useInvoice } from '../../context/InvoiceContext.jsx'
import { tooltips } from '../../data/tooltips.js'
import { HIGH_VALUE_THRESHOLD } from '../../lib/compliance.js'
import { formatCurrency } from '../../lib/format.js'
import Field from '../ui/Field.jsx'
import { InfoIcon } from '../ui/Icons.jsx'

export default function ClientStep() {
  const { state, setField, totals, validation } = useInvoice()
  const { client } = state
  const highValue = totals.total >= HIGH_VALUE_THRESHOLD

  const hintFor = (field, value) => {
    if (!value && field !== 'client.name') return {}
    const f = validation.findings.find((x) => x.field === field)
    if (!f) return {}
    // Only surface the "name" requirement inline once it's actually required.
    if (field === 'client.name' && f.severity === 'warning') return {}
    return { hint: f.message, hintTone: f.severity }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 font-serif text-base text-heritage-forest">Who are you billing?</h3>
        <p className="mb-4 text-xs text-heritage-brownLight">
          Enter the client this invoice is addressed to.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Client name / business"
            tooltip={tooltips.clientName}
            value={client.name}
            onChange={(v) => setField('client', 'name', v)}
            placeholder="Acme Pty Ltd"
            required={highValue}
            {...hintFor('client.name', client.name)}
          />
          <Field
            label="Client ABN (optional)"
            tooltip={tooltips.clientAbn}
            value={client.abn}
            onChange={(v) => setField('client', 'abn', v)}
            placeholder="98 765 432 109"
            inputMode="numeric"
            {...hintFor('client.abn', client.abn)}
          />
          <Field
            label="Client email"
            type="email"
            value={client.email}
            onChange={(v) => setField('client', 'email', v)}
            placeholder="accounts@acme.com.au"
          />
          <Field
            label="Client address"
            value={client.address}
            onChange={(v) => setField('client', 'address', v)}
            placeholder="1 Collins St, Melbourne VIC 3000"
          />
        </div>
      </div>

      {/* Contextual high-value rule */}
      <div
        className={`flex items-start gap-2.5 rounded-lg border p-3.5 text-xs transition ${
          highValue
            ? 'border-heritage-brass/40 bg-heritage-brass/10 text-heritage-brassDark'
            : 'border-heritage-sand bg-white/60 text-heritage-brownLight'
        }`}
      >
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This invoice totals <strong>{formatCurrency(totals.total)}</strong>.{' '}
          {highValue ? (
            <>
              Because it’s <strong>{formatCurrency(HIGH_VALUE_THRESHOLD)}</strong> or more, the ATO
              requires the buyer to be identified by name or ABN.
            </>
          ) : (
            <>
              Under {formatCurrency(HIGH_VALUE_THRESHOLD)}, the buyer’s details are optional — but
              recommended so your client can match the payment.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
