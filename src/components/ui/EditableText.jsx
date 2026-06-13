import { useRef } from 'react'

/**
 * Click-to-edit inline text. Renders a formatted value when idle and the raw
 * value while editing; commits on blur or Enter (Escape cancels). Uncontrolled
 * by design — it never changes its own DOM mid-edit, so the caret stays put.
 *
 * Props:
 *  - value      current stored value
 *  - onCommit   (next) => void, called on blur/Enter
 *  - placeholder shown (muted) when empty
 *  - multiline  allow Enter to insert newlines instead of committing
 *  - format     (value) => string for the idle display (e.g. currency)
 *  - toRaw      (value) => string shown when editing (default String(value))
 *  - parse      (rawString) => stored value (default: the trimmed string)
 */
export default function EditableText({
  value,
  onCommit,
  placeholder = '',
  multiline = false,
  format,
  toRaw,
  parse,
  ariaLabel,
  className = '',
}) {
  const ref = useRef(null)
  const hasValue = value != null && String(value).trim() !== ''
  const display = hasValue ? (format ? format(value) : String(value)) : placeholder
  const rawValue = () => (hasValue ? (toRaw ? toRaw(value) : String(value)) : '')

  const showRaw = (el) => {
    el.textContent = rawValue()
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }

  return (
    <span
      ref={ref}
      role="textbox"
      tabIndex={0}
      aria-label={ariaLabel || placeholder}
      contentEditable
      suppressContentEditableWarning
      data-empty={!hasValue}
      onFocus={(e) => showRaw(e.currentTarget)}
      onBlur={(e) => {
        const raw = e.currentTarget.textContent ?? ''
        const next = parse ? parse(raw) : raw.trim()
        onCommit(next)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !multiline) {
          e.preventDefault()
          e.currentTarget.blur()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          e.currentTarget.textContent = rawValue()
          e.currentTarget.blur()
        }
      }}
      className={`editable -mx-0.5 cursor-text rounded-sm px-0.5 outline-none transition hover:bg-heritage-brass/10 focus:bg-heritage-brass/15 focus:ring-1 focus:ring-heritage-brass/40 ${
        !hasValue ? 'italic text-heritage-brownLight/40' : ''
      } ${className}`}
    >
      {display}
    </span>
  )
}
