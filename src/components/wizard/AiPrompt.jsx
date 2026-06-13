import { useState } from 'react'
import { useInvoice } from '../../context/InvoiceContext.jsx'
import { parsePrompt } from '../../lib/api.js'
import { tooltips } from '../../data/tooltips.js'
import Tooltip from '../ui/Tooltip.jsx'
import { SparklesIcon, ArrowRightIcon } from '../ui/Icons.jsx'

const EXAMPLES = [
  '40 hours of web development at $90/hr for Acme Pty Ltd',
  '3 days of design consulting at $600/day for a client',
  'Built a website, fixed price $4,500',
]

export default function AiPrompt({ onApplied }) {
  const { applyParse } = useInvoice()
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState({ state: 'idle' }) // idle | loading | done | error

  async function run(text) {
    const value = (text ?? prompt).trim()
    if (!value) return
    setStatus({ state: 'loading' })
    try {
      const { data, source } = await parsePrompt(value)
      applyParse(data)
      setStatus({ state: 'done', source })
      onApplied?.()
    } catch (err) {
      setStatus({ state: 'error', message: err.message })
    }
  }

  const loading = status.state === 'loading'

  return (
    <section className="rounded-xl2 border border-heritage-emerald/25 bg-gradient-to-br from-heritage-forest to-heritage-emeraldDark p-6 text-heritage-cream shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-heritage-brass" />
        <h2 className="font-serif text-lg text-heritage-cream">Start with the AI wizard</h2>
        <Tooltip content={tooltips.aiPrompt} label="About the AI wizard" />
      </div>
      <p className="mb-4 text-sm text-heritage-sageLight">
        Describe the job in plain English. The assistant drafts your invoice — you review every
        detail before exporting.
      </p>

      <div className="rounded-xl border border-white/15 bg-white/10 p-1.5 backdrop-blur">
        {/* CSS-only auto-grow: the invisible mirror sets the row height, the
            textarea stretches to fill it. Caps at max-h, then scrolls. */}
        <div className="grid max-h-64 overflow-y-auto">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run()
            }}
            rows={1}
            placeholder="e.g. 40 hours of web development at $90/hr for Acme Pty Ltd"
            className="col-start-1 row-start-1 min-h-[5rem] w-full resize-none overflow-hidden bg-transparent px-3 py-2 text-sm leading-relaxed text-white placeholder:text-white/50 focus:outline-none"
          />
          <div
            aria-hidden="true"
            className="invisible col-start-1 row-start-1 min-h-[5rem] w-full whitespace-pre-wrap break-words px-3 py-2 text-sm leading-relaxed"
          >
            {prompt + ' '}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-2 pb-1">
          <span className="text-[11px] text-white/45">⌘/Ctrl + Enter</span>
          <button
            type="button"
            onClick={() => run()}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-heritage-brass px-4 py-2 text-sm font-semibold text-heritage-ink transition hover:bg-heritage-brassDark hover:text-white disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner /> Drafting…
              </>
            ) : (
              <>
                Generate <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setPrompt(ex)
              run(ex)
            }}
            disabled={loading}
            className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70 transition hover:border-heritage-brass hover:text-white disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      {status.state === 'done' && (
        <p className="mt-3 text-xs text-heritage-sageLight">
          {status.source === 'ai'
            ? '✓ Draft created. Review the details below — nothing is final until you export.'
            : '✓ Draft created with basic parsing (AI service offline). Please review carefully.'}
        </p>
      )}
      {status.state === 'error' && (
        <p className="mt-3 text-xs text-red-200">Couldn’t parse that — try rephrasing, or fill the form manually. ({status.message})</p>
      )}
    </section>
  )
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-heritage-ink/30 border-t-heritage-ink" />
  )
}
