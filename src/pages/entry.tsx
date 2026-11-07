import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { motion } from 'motion/react'
import { ArrowLeft } from '@phosphor-icons/react'
import '../index.css'
import { Logo } from '../components/ui/Logo'
import { buttonClass } from '../components/ui/Button'
import { EASE } from '../lib/motion'
import { GYM } from '../lib/data'

const home = import.meta.env.BASE_URL

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100svh] flex-col bg-ink">
      <a
        href="#main"
        className="button-sm fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-volt px-3 py-2 text-ink transition-transform duration-300 ease-forge focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav aria-label="Main" className="flex w-full max-w-md items-center justify-between gap-2 rounded-full border border-white/10 bg-coal/95 p-2 md:bg-coal/70 md:backdrop-blur-xl">
          <a href={home} className="rounded-full px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt" aria-label="Forge Athletic Club home">
            <Logo compact />
          </a>
          <a href={home} className={buttonClass('secondary', 'sm')}>
            <ArrowLeft size={16} weight="bold" aria-hidden="true" />
            Back to home
          </a>
        </nav>
      </header>
      <main id="main" className="flex flex-1 flex-col">{children}</main>
      <footer className="mx-auto w-full max-w-3xl px-4 pb-8 md:px-8">
        <p className="caption-5 text-dim">
          © {new Date().getFullYear()} Forge Athletic Club · {GYM.street}, {GYM.city}
        </p>
      </footer>
    </div>
  )
}

function Legal({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string }[] }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-24 pt-32 md:px-8">
      <p className="caption-3 font-mono uppercase tracking-widest text-volt">Legal</p>
      <h1 className="heading-3 md:heading-2 mt-4">
        <span className="text-hero">{title}</span>
      </h1>
      <p className="caption-2 mt-4 font-mono text-dim">Last updated {updated}</p>
      <div className="mt-12 flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="heading-6 text-white">{s.h}</h2>
            <p className="body-3 mt-2 text-muted">{s.p}</p>
          </section>
        ))}
      </div>
      <p className="body-6 mt-12 rounded-2xl border border-white/10 bg-coal p-4 text-muted">
        This is a demo website for a fictional gym. Replace this page with your own policy before going live.
      </p>
    </article>
  )
}

const PRIVACY = [
  { h: 'What we collect', p: 'When you book a trial class we collect your name, email, phone number if you give it, your chosen class and your training experience. We use it only to arrange your class and follow up about it.' },
  { h: 'How we use it', p: 'Coaches use your details to prepare your assessment. We send you class reminders and, if you become a member, your program updates. We never sell your data.' },
  { h: 'Cookies', p: 'This site does not use advertising or analytics cookies. Fonts are loaded from Google Fonts, which may log your IP address as part of serving the files.' },
  { h: 'Your rights', p: `You can ask to see, correct or delete your data at any time by emailing ${GYM.email}. We reply within 30 days.` },
]

const TERMS = [
  { h: 'Free trial class', p: 'One free trial class per person. You must be 16 or older, or 14 to 15 with a parent present. You will be asked to sign a short health questionnaire and waiver before training.' },
  { h: 'Memberships', p: 'Memberships are billed monthly and run month to month. Cancel with 30 days notice in writing. Freezes of up to two months per year are free.' },
  { h: 'Refunds', p: 'If you cancel within your first 30 days as a member, we refund your first month in full. After that, payments already made are not refundable.' },
  { h: 'Gym rules', p: 'Follow coach instructions, return equipment after use and wear closed shoes on the training floor. We may end a membership for unsafe or abusive behaviour.' },
]

function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-4 pb-24 pt-32 md:px-8">
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="heading-1 font-mono text-steel"
        aria-hidden="true"
      >
        404
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        className="heading-3 md:heading-2 mt-6"
      >
        <span className="text-hero">This page is not on the program</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className="body-7 mt-6 max-w-md text-muted"
      >
        The link may be old or mistyped. The schedule, coaches and free trial booking are all on the homepage.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
        className="mt-8 flex flex-wrap gap-4"
      >
        <a href={home} className={buttonClass('primary', 'md')}>
          Back to the homepage
        </a>
        <a href={`${home}#schedule`} className={buttonClass('secondary', 'md')}>
          See this week's classes
        </a>
      </motion.div>
    </div>
  )
}

const root = document.getElementById('root')!
const page = root.dataset.page

createRoot(root).render(
  <StrictMode>
    <Shell>
      {page === 'privacy' && <Legal title="Privacy policy" updated="November 2, 2026" sections={PRIVACY} />}
      {page === 'terms' && <Legal title="Terms of service" updated="November 2, 2026" sections={TERMS} />}
      {page === '404' && <NotFound />}
    </Shell>
  </StrictMode>,
)
