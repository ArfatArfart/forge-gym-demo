/** Brand mark: a volt tile with a heavy F cut from two bars. */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#d4ff3a" />
      <path d="M10 8h13v4.5h-8v3.5h6.5v4.5H15V24h-5Z" fill="#000" />
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className="size-7" />
      <span className="title-2 tracking-tight text-white">Forge</span>
      {!compact && <span className="caption-4 hidden font-mono uppercase tracking-widest text-muted lg:inline">Athletic club</span>}
    </span>
  )
}

/** Giant FORGE wordmark. A brand graphic sized by its container, not a text style. */
export function Wordmark({ className = '', outline = false }: { className?: string; outline?: boolean }) {
  return (
    <svg viewBox="0 0 1000 200" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <text
        x="0"
        y="186"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="Manrope, sans-serif"
        fontWeight="700"
        fontSize="252"
        fill={outline ? 'none' : 'currentColor'}
        stroke={outline ? 'currentColor' : 'none'}
        strokeWidth={outline ? 2 : 0}
      >
        FORGE
      </text>
    </svg>
  )
}
