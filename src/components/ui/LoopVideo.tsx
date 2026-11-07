import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { posterSrc, prefersSaveData, useVideoCut, videoSrc } from '../../lib/media'

type Props = { name: string; className?: string; label?: string }

/**
 * Muted background loop that only downloads and plays while it is on screen.
 * Falls back to its poster for reduced motion and data saver.
 */
export function LoopVideo({ name, className = '', label }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const cut = useVideoCut()
  const reduced = useReducedMotion()

  useEffect(() => {
    const v = ref.current
    if (!v || reduced || prefersSaveData()) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload !== 'auto') v.preload = 'auto'
          v.play().catch(() => {})
        } else v.pause()
      },
      { rootMargin: '120px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduced, cut])

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
