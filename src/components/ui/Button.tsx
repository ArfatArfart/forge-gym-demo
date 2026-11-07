import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'sm'

const base =
  'group relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 ' +
  'transition-[background-color,color,transform,opacity] duration-300 ease-forge ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-ink ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40'

const variants: Record<Variant, string> = {
  primary: 'bg-ember text-ink hover:bg-ember-soft hover:-translate-y-0.5',
  secondary: 'bg-white/10 text-white hover:bg-white/15 hover:-translate-y-0.5',
  ghost: 'text-white hover:bg-white/10',
}

const sizes: Record<Size, string> = { md: 'button-md', sm: 'button-sm' }

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
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
