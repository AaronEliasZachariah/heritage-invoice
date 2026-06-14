import { AlertIcon, CheckIcon, InfoIcon } from '../ui/Icons.jsx'

/** Renders the compliance findings grouped by severity. */
export default function ValidationSummary({ validation }) {
  const { errors, warnings, findings } = validation
  const infos = findings.filter((f) => f.severity === 'info')

  if (findings.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-heritage-emerald/30 bg-heritage-emerald/10 p-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-heritage-emerald text-white">
          <CheckIcon className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium text-heritage-forest">
          Looks compliant. Every required ATO field is present. You’re ready to export.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {errors.map((f) => (
        <Row key={f.id} tone="error" icon={<AlertIcon className="h-4 w-4" />} message={f.message} />
      ))}
      {warnings.map((f) => (
        <Row key={f.id} tone="warning" icon={<AlertIcon className="h-4 w-4" />} message={f.message} />
      ))}
      {infos.map((f) => (
        <Row key={f.id} tone="info" icon={<InfoIcon className="h-4 w-4" />} message={f.message} />
      ))}
    </div>
  )
}

function Row({ tone, icon, message }) {
  const styles = {
    error: 'border-red-300 bg-red-50 text-red-800',
    warning: 'border-heritage-brass/40 bg-heritage-brass/10 text-heritage-brassDark',
    info: 'border-heritage-sand bg-white/70 text-heritage-brownLight',
  }[tone]
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm ${styles}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{message}</span>
    </div>
  )
}
