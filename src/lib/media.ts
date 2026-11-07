import { useEffect, useState } from 'react'
import { asset } from './asset'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const on = () => setMatches(mql.matches)
    on()
    mql.addEventListener('change', on)
    return () => mql.removeEventListener('change', on)
  }, [query])
  return matches
}

/** Phones get the 9:16 cut, everything else the 16:9 cut. */
export function useVideoCut() {
  return useMediaQuery('(max-width: 767px)') ? 'tall' : 'wide'
}

/** Users on data saver get posters only. */
export function prefersSaveData() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return !!c?.saveData
}

export const videoSrc = (name: string, cut: 'tall' | 'wide') => asset(`video/${name}-${cut}.mp4`)
export const posterSrc = (name: string, cut: 'tall' | 'wide') => asset(`video/${name}-${cut}.jpg`)
