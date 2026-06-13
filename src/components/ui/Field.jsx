import { useId } from 'react'
import Tooltip from './Tooltip.jsx'

/**
 * A labelled input with an optional educational tooltip, currency prefix, and
 * inline validation hint. Renders a textarea when `as="textarea"`.
 */
export default function Field({
  label,
  tooltip,
  value,
  onChange,
  type = 'text',
  as = 'input',
  placeholder,
  prefix,
  hint,
  hintTone = 'error',
  required = false,
  inputMode,
  rows = 3,
  autoComplete,
}) {
  const id = useId()
  const control = as === 'textarea' ? 'textarea' : 'input'

  const toneClass =
    hintTone === 'error'
      ? 'text-red-700'
      : hintTone === 'warning'
        ? 'text-heritage-brassDark'
        : 'text-heritage-brownLight'

  const commonProps = {
    id,
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
    placeholder,
    className: `field-input ${prefix ? 'pl-7' : ''} ${
      hint && hintTone === 'error' ? 'border-red-400 focus:border-red-500' : ''
    }`,
    'aria-invalid': hint && hintTone === 'error' ? true : undefined,
  }

  return (
    <div>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && <span className="text-heritage-brass">*</span>}
          {tooltip && <Tooltip content={tooltip} label={`About ${label}`} />}
        </label>
      )}

      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-heritage-brownLight">
            {prefix}
          </span>
        )}
        {control === 'textarea' ? (
          <textarea {...commonProps} rows={rows} />
        ) : (
          <input
            {...commonProps}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
          />
        )}
      </div>

      {hint && <p className={`mt-1.5 text-xs ${toneClass}`}>{hint}</p>}
    </div>
  )
}
