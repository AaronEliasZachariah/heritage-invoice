import { PDFDownloadLink } from '@react-pdf/renderer'
import InvoiceDocument from './InvoiceDocument.jsx'
import { documentTitle } from '../../lib/compliance.js'
import { DownloadIcon } from '../ui/Icons.jsx'

/** One-click PDF generation + download. Disabled until the invoice is exportable. */
export default function DownloadButton({ state, disabled }) {
  const title = documentTitle(state.gstRegistered).replace(/\s+/g, '-')
  const number = (state.meta.invoiceNumber || 'invoice').replace(/[^\w-]/g, '')
  const fileName = `${title}-${number}.pdf`

  if (disabled) {
    return (
      <button type="button" disabled className="btn-primary w-full">
        <DownloadIcon className="h-4 w-4" /> Download PDF
      </button>
    )
  }

  return (
    <PDFDownloadLink
      document={<InvoiceDocument state={state} />}
      fileName={fileName}
      className="btn-primary w-full"
    >
      {({ loading, error }) => (
        <>
          <DownloadIcon className="h-4 w-4" />
          {error ? 'PDF error — retry' : loading ? 'Preparing PDF…' : 'Download PDF'}
        </>
      )}
    </PDFDownloadLink>
  )
}
