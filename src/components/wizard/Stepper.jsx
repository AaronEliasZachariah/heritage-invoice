import { CheckIcon } from '../ui/Icons.jsx'

/** Horizontal step indicator. Completed steps are clickable to jump back. */
export default function Stepper({ steps, current, onSelect, maxReached }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        const reachable = i <= maxReached
        return (
          <li key={step.key} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onSelect(i)}
              className={`flex w-full items-center gap-2.5 rounded-full px-2 py-1.5 text-left transition ${
                reachable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              } ${active ? 'bg-white/70 shadow-sm' : 'hover:bg-white/40'}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                  done
                    ? 'bg-heritage-emerald text-white'
                    : active
                      ? 'bg-heritage-forest text-white'
                      : 'border border-heritage-sand bg-white text-heritage-brownLight'
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`hidden text-xs font-semibold sm:block ${
                  active ? 'text-heritage-forest' : 'text-heritage-brownLight'
                }`}
              >
                {step.label}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
