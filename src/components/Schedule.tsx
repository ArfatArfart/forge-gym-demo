import { useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Barbell } from '@phosphor-icons/react'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'
import { ActionButton } from './ui/Button'
import { EASE } from '../lib/motion'
import { scrollToId } from '../lib/lenis'
import {
  DAYS,
  DAY_NAMES,
  SCHEDULE,
  classKey,
  coachName,
  dayIndex,
  formatTime,
  spotsLabel,
  type GymClass,
} from '../lib/data'

export const PREFILL_EVENT = 'forge:prefill'

function book(day: number, cls: GymClass) {
  window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: classKey(day, cls) }))
  scrollToId('book')
}

function Spots({ spots }: { spots: number }) {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className={`h-3 w-1 rounded-full ${i < 10 - spots ? 'bg-white/40' : 'bg-white/10'}`} />
      ))}
    </span>
  )
}

export function Schedule() {
  const today = dayIndex(new Date())
  const [day, setDay] = useState(today)
  const classes = SCHEDULE[day]

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
          lead="Pick a class for your free trial. Every session lasts 45 to 90 minutes and starts with a coached warm up."
        />

        <Reveal className="mt-12 md:mt-16">
          <div className="rounded-3xl border border-white/10 bg-coal p-2">
            {/* Day tabs */}
            <div
              role="tablist"
              aria-label="Day of the week"
              onKeyDown={onKeyDown}
              className="grid grid-cols-7 gap-1 rounded-2xl bg-ink p-1"
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
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setDay(i)}
                    className={`relative rounded-xl py-2 transition-colors duration-300 ease-forge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember ${
                      selected ? 'text-ink' : 'text-muted hover:text-white'
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="day-pill"
                        className="absolute inset-0 rounded-xl bg-white"
                        transition={{ duration: 0.5, ease: EASE }}
                      />
                    )}
                    <span className="title-4 relative flex flex-col items-center sm:flex-row sm:justify-center sm:gap-2">
                      {d}
                      {i === today && (
                        <span className={`caption-5 font-mono ${selected ? 'text-ink/60' : 'text-ember'}`}>Today</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>

            <div id="schedule-panel" role="tabpanel" aria-labelledby={`tab-${day}`} className="min-h-96 p-2 md:p-4">
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
                    <ul className="flex flex-col">
                      <li className="caption-4 hidden grid-cols-[120px_1fr_160px_160px_120px] items-center gap-4 px-4 pb-2 font-mono uppercase tracking-widest text-dim md:grid">
                        <span>Time</span>
                        <span>Class</span>
                        <span>Coach</span>
                        <span>Availability</span>
                        <span className="sr-only">Action</span>
                      </li>
                      {classes.map((cls) => (
                        <ClassRow key={cls.time} day={day} cls={cls} />
                      ))}
                    </ul>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <p className="caption-2 mt-4 text-dim">
            Showing {DAY_NAMES[day]}. Times are Pacific. Open gym runs alongside every class.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function ClassRow({ day, cls }: { day: number; cls: GymClass }) {
  const full = cls.spots === 0
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-4 transition-colors duration-300 ease-forge hover:bg-white/5 md:grid-cols-[120px_1fr_160px_160px_120px] md:gap-4">
      <span className="title-3 order-1 col-span-2 font-mono text-white md:order-none md:col-span-1">
        {formatTime(cls.time)}
        <span className="caption-5 block text-dim">{cls.duration} min</span>
      </span>
      <span className="order-2 md:order-none">
        <span className="title-2 block text-white">{cls.name}</span>
        <span className={`caption-4 ${cls.level === 'Beginner friendly' ? 'text-ember' : 'text-muted'}`}>{cls.level}</span>
      </span>
      <span className="body-6 order-4 text-muted md:order-none">Coach {coachName(cls.coach)}</span>
      <span className="order-5 flex items-center gap-2 md:order-none">
        <Spots spots={cls.spots} />
        <span className={`caption-2 ${full ? 'text-dim' : cls.spots <= 2 ? 'text-ember' : 'text-muted'}`}>{spotsLabel(cls.spots)}</span>
      </span>
      <span className="order-3 justify-self-end md:order-none">
        <ActionButton
          variant="secondary"
          size="sm"
          disabled={full}
          onClick={() => book(day, cls)}
          aria-label={full ? `${cls.name} at ${formatTime(cls.time)} is full` : `Book ${cls.name} at ${formatTime(cls.time)} as your free trial`}
        >
          {full ? 'Full' : 'Book trial'}
        </ActionButton>
      </span>
    </li>
  )
}

function EmptyDay({ onShowMonday }: { onShowMonday: () => void }) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white/5 text-ember">
        <Barbell size={24} weight="duotone" aria-hidden="true" />
      </span>
      <h3 className="heading-6 mt-6 text-white">No coached classes on Sunday</h3>
      <p className="body-6 mt-2 max-w-sm text-muted">
        Open gym runs from 8:00 am to 2:00 pm. Members train their own program, and a coach is on the floor to answer
        questions.
      </p>
      <ActionButton variant="secondary" size="sm" className="mt-6" onClick={onShowMonday}>
        See Monday classes
      </ActionButton>
    </div>
  )
}
