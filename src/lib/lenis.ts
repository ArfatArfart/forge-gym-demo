import type Lenis from 'lenis'

let instance: Lenis | null = null
export const setLenis = (l: Lenis | null) => { instance = l }
export const getLenis = () => instance

/** Scroll to an in page anchor, smooth when Lenis is running. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(el, { offset: -16 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
