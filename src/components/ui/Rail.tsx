import { Children, useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  label: string
  /** Grid columns from md up, e.g. 'md:grid-cols-3'. */
  grid?: string
  /** Width of each card on phones. */
  itemWidth?: string
  /** Index to show first on phones. */
  start?: number
}

/**
 * Swipeable snap rail on phones with position dots, a plain grid from md up.
 * Native scroll keeps the swipe physics the user already knows.
 */
export function Rail({ children, label, grid = 'md:grid-cols-3', itemWidth = 'w-[84%]', start = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const items = Children.toArray(children)
  const [active, setActive] = useState(start)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (start > 0 && el.scrollWidth > el.clientWidth) {
      const child = el.children[start] as HTMLElement | undefined
      if (child) el.scrollLeft = child.offsetLeft - 16
    }
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const kids = [...el.children] as HTMLElement[]
        const mid = el.scrollLeft + el.clientWidth / 2
        let best = 0
        let dist = Infinity
        kids.forEach((k, i) => {
          const d = Math.abs(k.offsetLeft + k.clientWidth / 2 - mid)
          if (d < dist) {
            dist = d
            best = i
          }
        })
        setActive(best)
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [start])

  const goTo = (i: number) => {
    const el = ref.current
    const child = el?.children[i] as HTMLElement | undefined
    if (el && child) el.scrollTo({ left: child.offsetLeft - 16, behavior: 'smooth' })
  }

  return (
    <div>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={`rail -mx-4 scroll-px-4 gap-4 px-4 pb-2 focus-visible:outline-none md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0 md:pb-0 ${grid}`}
      >
        {items.map((child, i) => (
          <div key={i} className={`${itemWidth} md:w-auto`}>
            {child}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2 md:hidden" aria-hidden="true">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-[background-color,opacity] duration-300 ease-forge ${i === active ? 'w-6 bg-volt' : 'w-1.5 bg-white/25'}`}
          />
        ))}
      </div>
    </div>
  )
}
