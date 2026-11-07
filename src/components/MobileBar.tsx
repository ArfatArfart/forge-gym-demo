import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { WhatsappLogo } from '@phosphor-icons/react'
import { Button } from './ui/Button'
import { EASE } from '../lib/motion'
import { whatsappLink } from '../lib/data'

/**
 * Thumb zone booking bar for phones. Appears once the hero CTA has scrolled away
 * and hides again while the booking form itself is on screen.
 */
export function MobileBar() {
  const [pastHero, setPastHero] = useState(false)
  const [atForm, setAtForm] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    const form = document.getElementById('book')
    const ios: IntersectionObserver[] = []
    if (hero) {
      const io = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting), { rootMargin: '-40% 0px 0px 0px' })
      io.observe(hero)
      ios.push(io)
    }
    if (form) {
      const io = new IntersectionObserver(([e]) => setAtForm(e.isIntersecting), { threshold: 0.15 })
      io.observe(form)
      ios.push(io)
    }
    return () => ios.forEach((io) => io.disconnect())
  }, [])

  const show = pastHero && !atForm

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden"
        >
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-coal/[0.97] p-2">
            <Button href="#book" arrow className="flex-1">
              Book free trial
            </Button>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message Forge on WhatsApp"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white transition-transform duration-300 ease-forge active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
            >
              <WhatsappLogo size={24} weight="fill" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
