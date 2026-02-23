interface BarcodeScanIconProps {
  className?: string
}

/** Barcode/scanner icon for Scan product button. */
export function BarcodeScanIcon({ className = 'w-5 h-5' }: BarcodeScanIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M3 7V5a2 2 0 012-2h2" />
      <path d="M17 3h2a2 2 0 012 2v2" />
      <path d="M21 17v2a2 2 0 01-2 2h-2" />
      <path d="M7 21H5a2 2 0 01-2-2v-2" />
      <path d="M7 12h10" />
      <path d="M7 8h2v8H7z" />
      <path d="M11 8h2v8h-2z" />
      <path d="M15 8h2v8h-2z" />
    </svg>
  )
}
