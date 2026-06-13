import { InfoIcon } from './Icons.jsx'

/**
 * A small, non-intrusive info affordance. Hover or focus the icon to reveal a
 * popover explaining why a field matters. Accessible: the trigger is a button,
 * and the popover is described via aria.
 */
export default function Tooltip({ content, label = 'More information' }) {
  if (!content) return null
  const { title, body } = typeof content === 'string' ? { body: content } : content

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-heritage-sage transition hover:text-heritage-emerald focus-visible:text-heritage-emerald"
      >
        <InfoIcon className="h-4 w-4" />
      </button>

      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 translate-y-1
          rounded-xl border border-heritage-sand bg-white p-3.5 text-left opacity-0 shadow-lift transition
          duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0
          group-focus-within:opacity-100"
      >
        {title && (
          <span className="mb-1 block font-serif text-sm font-semibold text-heritage-forest">
            {title}
          </span>
        )}
        <span className="block text-xs leading-relaxed text-heritage-brownLight">{body}</span>
        <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-heritage-sand bg-white" />
      </span>
    </span>
  )
}
