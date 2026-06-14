import { lazy, Suspense } from 'react'
import { useInvoice } from '../../context/InvoiceContext.jsx'
import { documentTitle, SOURCES } from '../../lib/compliance.js'
import { formatCurrency } from '../../lib/format.js'
import ValidationSummary from './ValidationSummary.jsx'
import { PrinterIcon, DownloadIcon } from '../ui/Icons.jsx'

// Lazy-load the PDF machinery (@react-pdf/renderer); it's heavy and only
// needed once the user reaches the export step.
const DownloadButton = lazy(() => import('../invoice/DownloadButton.jsx'))

export default function ReviewStep() {
  const { state, totals, validation } = useInvoice()
  const title = documentTitle(state.gstRegistered)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-heritage-sand bg-white/60 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-heritage-brownLight">Ready to issue</p>
          <p className="font-serif text-lg text-heritage-forest">
            {title} · {formatCurrency(totals.total)}
          </p>
        </div>
        <span className="rounded-full bg-heritage-forest px-3 py-1 font-serif text-sm font-semibold text-heritage-cream">
          {title}
        </span>
      </div>

      <div>
        <h3 className="mb-3 font-serif text-base text-heritage-forest">Compliance check</h3>
        <ValidationSummary validation={validation} />
        {!validation.isExportable && (
          <p className="mt-3 text-xs text-red-700">
            Resolve the items marked in red before exporting. They’re required for a valid invoice.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Suspense
            fallback={
              <button type="button" disabled className="btn-primary w-full">
                <DownloadIcon className="h-4 w-4" /> Preparing export…
              </button>
            }
          >
            <DownloadButton state={state} disabled={!validation.isExportable} />
          </Suspense>
        </div>
        <button type="button" onClick={() => window.print()} className="btn-secondary flex-1">
          <PrinterIcon className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      <details className="rounded-xl border border-heritage-sand bg-white/50 p-4 text-sm">
        <summary className="cursor-pointer font-medium text-heritage-forest">
          How we check compliance
        </summary>
        <p className="mt-2 text-xs leading-relaxed text-heritage-brownLight">
          These guardrails follow current Australian Taxation Office and business.gov.au guidance.
          This tool helps you produce a compliant document but isn’t a substitute for professional
          tax advice.
        </p>
        <ul className="mt-2 space-y-1">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-heritage-emerald underline decoration-heritage-sage underline-offset-2 hover:text-heritage-emeraldDark"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
