import { useEffect } from 'react'
import Lenis from 'lenis'
import { MotionConfig } from 'motion/react'
import { setLenis } from './lib/lenis'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Stats } from './components/Stats'
import { RepSection } from './components/RepSection'
import { TaglineReveal } from './components/TaglineReveal'
import { Programs } from './components/Programs'
import { HowItWorks } from './components/HowItWorks'
import { Schedule } from './components/Schedule'
import { MobileBar } from './components/MobileBar'
import { Coaches } from './components/Coaches'
import { Testimonials } from './components/Testimonials'
import { Pricing } from './components/Pricing'
import { Faq } from './components/Faq'
import { FinalCta } from './components/FinalCta'
import { Footer } from './components/Footer'

export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: { offset: -16 } })
    setLenis(lenis)
    return () => {
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="button-sm fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-volt px-3 py-2 text-ink transition-transform duration-300 ease-forge focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Stats />
        <RepSection />
        <Programs />
        <TaglineReveal />
        <HowItWorks />
        <Schedule />
        <Coaches />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileBar />
    </MotionConfig>
  )
}
