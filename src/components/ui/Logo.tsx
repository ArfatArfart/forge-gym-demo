export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M10.5 16V11a5.5 5.5 0 0 1 11 0v5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M9.6 27.5A9 9 0 1 1 22.4 27.5Z" fill="currentColor" />
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className="size-6 text-ember" />
      <span className="title-3 tracking-tight text-white">Forge</span>
      {!compact && <span className="caption-4 hidden font-mono uppercase tracking-widest text-muted lg:inline">Athletic club</span>}
    </span>
  )
}
