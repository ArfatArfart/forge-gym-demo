import { useCallback, useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { posterSrc, prefersSaveData, useVideoCut, videoSrc } from '../../lib/media'

type Props = {
  name: string
  className?: string
  label?: string
  /** Lets a parent keep only one of several on-screen loops playing (phones decode one at a time well). */
  active?: boolean
  /** Force a cut instead of following the screen (a landscape frame on a phone, for example). */
  cut?: 'tall' | 'wide'
}

/**
 * Muted background loop that only downloads and plays while it is on screen and active.
 * Falls back to its poster for reduced motion and data saver.
 */
export function LoopVideo({ name, className = '', label, active = true, cut: forced }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const inView = useRef(false)
  const screenCut = useVideoCut()
  const cut = forced ?? screenCut
  const reduced = useReducedMotion()

  const sync = useCallback(() => {
    const v = ref.current
    if (!v) return
    if (inView.current && active && !reduced && !prefersSaveData()) {
      if (v.preload !== 'auto') v.preload = 'auto'
      v.play().catch(() => {})
    } else v.pause()
  }, [active, reduced])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting
        sync()
      },
      { rootMargin: '120px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [sync, cut])

  useEffect(sync, [sync])

  return (
    <video
      ref={ref}
      key={cut}
      className={className}
      src={videoSrc(name, cut)}
      poster={posterSrc(name, cut)}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
