import { useInvoice } from '../context/InvoiceContext.jsx'

export default function Header() {
  const { reset } = useInvoice()

  return (
    <header className="border-b border-heritage-sand/70 bg-heritage-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-heritage-forest font-serif text-lg font-semibold text-heritage-brass">
            H
          </span>
          <div>
            <p className="font-serif text-lg font-semibold leading-tight text-heritage-forest">
              Heritage
            </p>
            <p className="text-[11px] leading-tight text-heritage-brownLight">
              Australian invoices, done right
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Start a new invoice? This clears the current one.')) reset()
          }}
          className="btn-ghost text-xs"
        >
          New invoice
        </button>
      </div>
    </header>
  )
}
