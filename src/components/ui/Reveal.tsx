import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE } from '../../lib/motion'

type Props = { children: ReactNode; className?: string; delay?: number; y?: number }

/** Scroll reveal (B7): rise 32px and fade in once, on the base curve. */
const phone = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export function Reveal({ children, className, delay = 0, y = 32 }: Props) {
  // Phones: a shorter rise and quicker settle read as smoother under a thumb flick.
  const rise = phone ? Math.min(y, 16) : y
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: rise }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: phone ? '0px 0px -6% 0px' : '0px 0px -12% 0px' }}
      transition={{ duration: phone ? 0.5 : 0.7, ease: EASE, delay: phone ? delay * 0.6 : delay }}
    >
      {children}
    </motion.div>
  )
}
