import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { WhatsappLogo } from '@phosphor-icons/react'
import { Logo } from './ui/Logo'
import { Button } from './ui/Button'
import { whatsappLink } from '../lib/data'
import { EASE } from '../lib/motion'
import { getLenis } from '../lib/lenis'
import { useActiveSection } from '../lib/useActiveSection'

const LINKS = [
  { id: 'programs', label: 'Programs' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'coaches', label: 'Coaches' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
]
const IDS = LINKS.map((l) => l.id)

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:ring-offset-ink'

export function Nav() {
  const active = useActiveSection(IDS)
  const solid = useSolidNav()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const lenis = getLenis()
    if (open) {
      lenis?.stop()
      document.documentElement.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onResize = () => window.innerWidth >= 768 && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <motion.nav
          aria-label="Main"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          className={`flex w-full max-w-md items-center justify-between gap-2 rounded-full border border-white/10 p-2 transition-colors md:backdrop-blur-xl duration-500 ease-forge md:w-auto md:max-w-none md:justify-start ${solid ? "bg-ink/95 md:bg-ink/90" : "bg-coal/95 md:bg-coal/70"}`}
        >
          <a href="#top" aria-label="Forge Athletic Club, back to top" className={`rounded-full px-3 py-2 ${focusRing}`}>
            <Logo />
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const isActive = active === l.id
              return (
                <li key={l.id} className="relative">
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  )}
                  <a
                    href={`#${l.id}`}
                    aria-current={isActive ? 'location' : undefined}
                    className={`title-4 relative block rounded-full px-3 py-2 transition-colors duration-300 ease-forge ${focusRing} ${
                      isActive ? 'text-white' : 'text-muted hover:text-white'
                    }`}
                  >
                    {l.label}
                  </a>
                </li>
              )
            })}
          </ul>

          <Button href="#book" size="sm" className="ml-auto hidden md:ml-2 md:inline-flex">
            Book free trial
          </Button>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={`relative flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 ease-forge hover:bg-white/15 active:scale-[0.98] md:hidden ${focusRing}`}
          >
            <span
              className={`absolute h-0.5 w-4 rounded-full bg-white transition-transform duration-500 ease-forge ${
                open ? 'rotate-45' : '-translate-y-1'
              }`}
            />
            <span
              className={`absolute h-0.5 w-4 rounded-full bg-white transition-transform duration-500 ease-forge ${
                open ? '-rotate-45' : 'translate-y-1'
              }`}
            />
          </button>
        </motion.nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col bg-ink/[0.97] px-6 pb-12 pt-32 md:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-1 flex-col">
              <ul className="flex flex-col gap-2">
                {LINKS.map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: Math.min(0.08 + i * 0.06, 0.4) }}
                  >
                    <a
                      href={`#${l.id}`}
                      onClick={() => setOpen(false)}
                      aria-current={active === l.id ? 'location' : undefined}
                      className={`heading-3 flex items-center justify-between rounded-2xl py-2 ${focusRing} ${
                        active === l.id ? 'text-white' : 'text-muted'
                      }`}
                    >
                      {l.label}
                      {active === l.id && <span className="size-2 rounded-full bg-volt" aria-hidden="true" />}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                className="mt-auto flex flex-col gap-4"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
              >
                <Button href="#book" arrow onClick={() => setOpen(false)} className="w-full">
                  Book your free trial class
                </Button>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-md flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white transition-colors duration-300 ease-forge hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  <WhatsappLogo size={20} weight="fill" className="text-[#25d366]" aria-hidden="true" />
                  Message us on WhatsApp
                </a>
                <p className="caption-2 text-center text-muted">418 Foundry Street, Portland</p>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** True while a section marked data-nav-tone="solid" (the volt band) sits under the nav. */
function useSolidNav() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const els = document.querySelectorAll('[data-nav-tone="solid"]')
    if (!els.length) return
    const io = new IntersectionObserver((entries) => setSolid(entries.some((e) => e.isIntersecting)), {
      rootMargin: '0px 0px -90% 0px',
    })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return solid
}
