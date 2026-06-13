import Header from './components/Header.jsx'
import Wizard from './components/wizard/Wizard.jsx'
import InvoicePreview from './components/invoice/InvoicePreview.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8 max-w-2xl">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-heritage-forest sm:text-4xl">
            Compliant Australian invoices, in minutes.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-heritage-brownLight sm:text-base">
            Built for first-time contractors. Describe the job, and the wizard drafts an
            ATO-compliant invoice — with plain-English guidance at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form column */}
          <div className="order-2 lg:order-1">
            <Wizard />
          </div>

          {/* Live preview column */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 px-1">
                <span className="h-2 w-2 rounded-full bg-heritage-emerald" />
                <span className="text-xs font-semibold uppercase tracking-wide text-heritage-brownLight">
                  Live preview
                </span>
                <span className="text-xs text-heritage-brownLight/70">
                  · click any field to edit
                </span>
              </div>
              <InvoicePreview />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 border-t border-heritage-sand/70 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-heritage-brownLight sm:px-6">
          Heritage helps you produce ATO-compliant invoices. It is not a substitute for professional
          tax advice. Your data stays in your browser.
        </div>
      </footer>
    </div>
  )
}
