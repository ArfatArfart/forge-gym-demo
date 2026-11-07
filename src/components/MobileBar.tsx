import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { WhatsappLogo } from '@phosphor-icons/react'
import { Button } from './ui/Button'
import { EASE } from '../lib/motion'
import { whatsappLink } from '../lib/data'

/**
 * Thumb zone booking bar for phones. Appears when the visitor reaches the booking section at
 * the bottom of the page and stays docked to the end (the footer pads itself to clear it).
 */
export function MobileBar() {
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const book = document.getElementById('book')
    if (!book) return
    // Visible while the booking section is on screen or already scrolled past (footer).
    const io = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting || e.boundingClientRect.top < 0))
    io.observe(book)
    return () => io.disconnect()
  }, [])

  const show = atEnd

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
