import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react'

type Variant = 'primary' | 'secondary' | 'light' | 'dark' | 'ghost'
type Size = 'md' | 'sm'

const base =
  'group relative shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 ' +
  'transition-[background-color,color,transform,opacity] duration-300 ease-forge ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:ring-offset-ink ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40'

const variants: Record<Variant, string> = {
  primary: 'bg-volt text-ink hover:bg-volt-soft hover:-translate-y-0.5',
  secondary: 'bg-white/10 text-white backdrop-blur-md hover:bg-white/15 hover:-translate-y-0.5',
  light: 'bg-white text-ink hover:bg-white/90 hover:-translate-y-0.5',
  dark: 'bg-ink text-white hover:bg-ink/85 hover:-translate-y-0.5',
  ghost: 'text-white hover:bg-white/10',
}

// Main buttons keep the 8px / 12px padding (B2); md also guarantees a 48px touch target on phones.
const sizes: Record<Size, string> = { md: 'button-md min-h-12 md:min-h-10', sm: 'button-sm min-h-10 md:min-h-9' }

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  // Display lives here so a caller passing "hidden md:inline-flex" is not overridden by the base.
  const display = /(^|\s)hidden(\s|$)/.test(extra) ? '' : 'inline-flex'
  return `${base} ${display} ${variants[variant]} ${sizes[size]} ${extra}`
}

function Arrow({ size }: { size: Size }) {
  return (
    <ArrowRight
      size={size === 'md' ? 18 : 16}
      weight="bold"
      aria-hidden="true"
      className="transition-transform duration-300 ease-forge group-hover:translate-x-0.5"
    />
  )
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant
  size?: Size
  arrow?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', arrow = false, className = '', children, ...rest }: LinkProps) {
  return (
    <a className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow && <Arrow size={size} />}
    </a>
  )
}

type ActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  arrow?: boolean
  children: ReactNode
}

export function ActionButton({ variant = 'primary', size = 'md', arrow = false, className = '', children, type = 'button', ...rest }: ActionProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow && <Arrow size={size} />}
    </button>
  )
}
