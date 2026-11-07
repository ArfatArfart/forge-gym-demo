import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Barbell, Clock, User } from '@phosphor-icons/react'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'
import { ActionButton } from './ui/Button'
import { EASE } from '../lib/motion'
import { scrollToId } from '../lib/lenis'
import { DAYS, DAY_NAMES, SCHEDULE, classKey, coachName, dayIndex, formatTime, spotsLabel, type GymClass } from '../lib/data'

export const PREFILL_EVENT = 'forge:prefill'

function book(day: number, cls: GymClass) {
  window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: classKey(day, cls) }))
  scrollToId('book')
}

/** Dates for the current Monday based week. */
function weekDates() {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayIndex(now))
  return DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.getDate()
  })
}

function Spots({ spots }: { spots: number }) {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className={`h-3 w-1 rounded-full ${i < 10 - spots ? 'bg-white/50' : 'bg-white/10'}`} />
      ))}
    </span>
  )
}

export function Schedule() {
  const today = dayIndex(new Date())
  const [day, setDay] = useState(today)
  const dates = weekDates()
  const rail = useRef<HTMLDivElement>(null)
  const classes = SCHEDULE[day]

  // Keep the selected day chip in view on phones.
  useEffect(() => {
    const chip = document.getElementById(`tab-${day}`)
    const r = rail.current
    if (!chip || !r || r.scrollWidth <= r.clientWidth) return
    r.scrollTo({ left: chip.offsetLeft - r.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' })
  }, [day])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (day + (e.key === 'ArrowRight' ? 1 : 6)) % 7
    setDay(next)
    document.getElementById(`tab-${next}`)?.focus()
  }

  return (
    <section id="schedule" aria-labelledby="schedule-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeader
          titleId="schedule-title"
          eyebrow="Schedule"
          title="This week on the floor"
          lead="Pick a class for your free trial. Tap Book trial and we fill in the form for you."
        />

        <Reveal className="mt-10 md:mt-12">
          {/* Day picker: swipeable rail on phones, full row on desktop */}
          <div
            ref={rail}
            role="tablist"
            aria-label="Day of the week"
            onKeyDown={onKeyDown}
            className="rail -mx-4 gap-2 px-4 md:mx-0 md:grid md:grid-cols-7 md:px-0"
          >
            {DAYS.map((d, i) => {
              const selected = i === day
              return (
                <button
                  key={d}
                  id={`tab-${i}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="schedule-panel"
                  aria-label={`${DAY_NAMES[i]}${i === today ? ', today' : ''}, ${SCHEDULE[i].length} classes`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setDay(i)}
                  className={`relative flex w-16 flex-col items-center gap-1 rounded-2xl py-3 transition-colors duration-300 ease-forge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt md:w-auto ${
                    selected ? 'text-ink' : 'bg-coal text-muted hover:bg-iron hover:text-white'
                  }`}
                >
                  {selected && (
                    <motion.span layoutId="day-pill" className="absolute inset-0 rounded-2xl bg-volt" transition={{ duration: 0.5, ease: EASE }} />
                  )}
                  <span className="caption-3 relative uppercase tracking-widest">{d}</span>
                  <span className="heading-6 relative font-mono">{dates[i]}</span>
                  <span className={`relative size-1 rounded-full ${i === today ? (selected ? 'bg-ink' : 'bg-volt') : 'bg-transparent'}`} aria-hidden="true" />
                </button>
              )
            })}
          </div>

          <div id="schedule-panel" role="tabpanel" aria-labelledby={`tab-${day}`} className="mt-4 min-h-72">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {classes.length === 0 ? (
                  <EmptyDay onShowMonday={() => setDay(0)} />
                ) : (
                  <ul className="grid gap-2 md:gap-3">
                    {classes.map((cls) => (
                      <ClassRow key={cls.time} day={day} cls={cls} />
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="caption-2 mt-4 text-dim">
            {DAY_NAMES[day]} · Times are Pacific · Open gym runs alongside every class
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function ClassRow({ day, cls }: { day: number; cls: GymClass }) {
  const full = cls.spots === 0
  const [time, ampm] = formatTime(cls.time).split(' ')
  return (
    <li className="grid grid-cols-[72px_1fr] gap-4 rounded-3xl border border-white/10 bg-coal p-4 transition-colors duration-300 ease-forge hover:border-white/20 md:grid-cols-[120px_1fr_200px_auto] md:items-center md:gap-6 md:px-6">
      <span className="flex flex-col">
        <span className="heading-5 font-mono text-white">{time}</span>
        <span className="caption-4 font-mono uppercase text-dim">{ampm}</span>
      </span>
      <span className="flex min-w-0 flex-col gap-2">
        <span className="flex flex-wrap items-center gap-2">
          <span className="title-2 text-white">{cls.name}</span>
          <span className={`caption-3 rounded-full px-2 py-0.5 ${cls.level === 'Beginner friendly' ? 'bg-volt text-ink' : 'bg-white/10 text-muted'}`}>
            {cls.level}
          </span>
        </span>
        <span className="caption-2 flex items-center gap-4 text-muted">
          <span className="inline-flex items-center gap-1">
            <User size={14} aria-hidden="true" /> Coach {coachName(cls.coach)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} aria-hidden="true" /> {cls.duration} min
          </span>
        </span>
        {/* Phones: availability and action share the second row */}
        <span className="mt-2 flex items-center justify-between gap-4 md:hidden">
          <span className="flex items-center gap-2">
            <Spots spots={cls.spots} />
            <span className={`caption-1 whitespace-nowrap ${full ? "text-dim" : cls.spots <= 2 ? "text-volt" : "text-muted"}`}>{spotsLabel(cls.spots)}</span>
          </span>
          <BookButton day={day} cls={cls} />
        </span>
      </span>
      <span className="hidden items-center gap-2 md:flex">
        <Spots spots={cls.spots} />
        <span className={`caption-1 whitespace-nowrap ${full ? "text-dim" : cls.spots <= 2 ? "text-volt" : "text-muted"}`}>{spotsLabel(cls.spots)}</span>
      </span>
      <span className="hidden md:block">
        <BookButton day={day} cls={cls} />
      </span>
    </li>
  )
}

function BookButton({ day, cls }: { day: number; cls: GymClass }) {
  const full = cls.spots === 0
  return (
    <ActionButton
      variant={full ? 'secondary' : 'light'}
      size="sm"
      disabled={full}
      onClick={() => book(day, cls)}
      aria-label={full ? `${cls.name} at ${formatTime(cls.time)} is full` : `Book ${cls.name} at ${formatTime(cls.time)} as your free trial`}
    >
      {full ? 'Full' : 'Book trial'}
    </ActionButton>
  )
}

function EmptyDay({ onShowMonday }: { onShowMonday: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-coal px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-volt text-ink">
        <Barbell size={24} weight="bold" aria-hidden="true" />
      </span>
      <h3 className="heading-6 mt-6 text-white">No coached classes on Sunday</h3>
      <p className="body-6 mt-2 max-w-sm text-muted">
        Open gym runs from 8:00 am to 2:00 pm. Members train their own program, and a coach is on the floor to answer
        questions.
      </p>
      <ActionButton variant="light" size="sm" className="mt-6" onClick={onShowMonday}>
        See Monday classes
      </ActionButton>
    </div>
  )
}
