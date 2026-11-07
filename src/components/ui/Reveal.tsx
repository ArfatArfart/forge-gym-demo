import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE } from '../../lib/motion'

type Props = { children: ReactNode; className?: string; delay?: number; y?: number }

/** Scroll reveal (B7): rise 32px and fade in once, on the base curve. */
export function Reveal({ children, className, delay = 0, y = 32 }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}
