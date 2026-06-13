// Lightweight inline icon set (no external dependency). Each accepts a
// className for sizing/colour and inherits `currentColor`.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
}

const Svg = ({ children, className }) => (
  <svg {...base} className={className} aria-hidden="true">
    {children}
  </svg>
)

export const InfoIcon = ({ className }) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
)

export const CheckIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
)

export const PlusIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const TrashIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
)

export const DownloadIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </Svg>
)

export const PrinterIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M6 9V3h12v6" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v7H6z" />
  </Svg>
)

export const SparklesIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
    <path d="M5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16Z" />
  </Svg>
)

export const ArrowRightIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
)

export const ArrowLeftIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
)

export const AlertIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </Svg>
)

export const ShieldIcon = ({ className }) => (
  <Svg className={className}>
    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
)
