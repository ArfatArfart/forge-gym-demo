import { useEffect, useId, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, CaretDown, CheckCircle, Clock, CreditCard, Clipboard, WarningCircle } from '@phosphor-icons/react'
import { EASE } from '../lib/motion'
import { asset } from '../lib/asset'
import { DAYS, SCHEDULE, classKey, classLabel, coachName } from '../lib/data'
import { PREFILL_EVENT } from './Schedule'
import { Reveal } from './ui/Reveal'
import { buttonClass } from './ui/Button'

const EXPERIENCE = ['New to lifting', 'Some experience', 'Lift regularly'] as const

const OPTIONS = SCHEDULE.flatMap((classes, day) =>
  classes.filter((c) => c.spots > 0).map((c) => ({ value: classKey(day, c), label: classLabel(day, c), coach: c.coach })),
)

type Fields = { name: string; email: string; phone: string; slot: string; experience: string }
type Errors = Partial<Record<keyof Fields, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Enter your full name.'
  if (!f.email.trim()) e.email = 'Enter your email so we can send the class details.'
  else if (!EMAIL.test(f.email.trim())) e.email = 'That email looks incomplete. Use a format like name@example.com.'
  if (f.phone.trim() && f.phone.replace(/\D/g, '').length < 10) e.phone = 'Phone numbers need at least 10 digits, or leave it blank.'
  if (!f.experience) e.experience = 'Choose the option closest to your training history.'
  return e
}

const inputBase =
  'body-3 w-full rounded-xl border bg-ink px-4 py-3 text-white placeholder:text-dim transition-colors duration-300 ease-forge ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ember disabled:opacity-50'

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="caption-2 mt-2 flex items-center gap-1 text-ember"
          role="alert"
        >
          <WarningCircle size={14} weight="bold" aria-hidden="true" />
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

export function FinalCta() {
  return (
    <section id="book" aria-labelledby="book-title" className="relative scroll-mt-24 overflow-hidden bg-ink py-16 md:py-24">
      <img
        src={asset('images/final.webp')}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover opacity-60 grayscale"
        aria-hidden="true"
      />
      <span className="absolute inset-0 bg-ink/75" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal>
          <p className="caption-3 font-mono uppercase tracking-widest text-ember">Free trial class</p>
          <h2 id="book-title" className="heading-3 md:heading-1 mt-4 max-w-[680px]">
            <span className="text-hero">
              Your first class <br />
              is on us
            </span>
          </h2>
          <p className="body-3 md:body-7 mt-6 max-w-md text-muted">
            Book a class, meet your coach and lift with the group. If it is not for you, you have lost nothing but an
            hour.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {[
              { icon: CreditCard, text: 'No card needed, no sales pitch' },
              { icon: Clock, text: 'A full 45 to 90 minute coached class' },
              { icon: Clipboard, text: 'Free 30 minute movement assessment' },
            ].map(({ icon: I, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-ember">
                  <I size={16} weight="bold" aria-hidden="true" />
                </span>
                <span className="body-2 text-white">{text}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <BookingForm />
        </Reveal>
      </div>
    </section>
  )
}

function BookingForm() {
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`
  const empty: Fields = { name: '', email: '', phone: '', slot: '', experience: '' }
  const [fields, setFields] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [highlight, setHighlight] = useState(false)

  useEffect(() => {
    const onPrefill = (e: Event) => {
      const value = (e as CustomEvent<string>).detail
      setFields((f) => ({ ...f, slot: value }))
      setStatus((s) => (s === 'success' ? 'idle' : s))
      setHighlight(true)
      window.setTimeout(() => setHighlight(false), 1600)
    }
    window.addEventListener(PREFILL_EVENT, onPrefill)
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill)
  }, [])

  const set = (k: keyof Fields, v: string) => {
    const next = { ...fields, [k]: v }
    setFields(next)
    if (touched[k]) setErrors(validate(next))
  }
  const blur = (k: keyof Fields) => {
    setTouched((t) => ({ ...t, [k]: true }))
    setErrors(validate(fields))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate(fields)
    setErrors(errs)
    setTouched({ name: true, email: true, phone: true, experience: true })
    if (Object.keys(errs).length) {
      const first = (['name', 'email', 'phone', 'experience'] as const).find((k) => errs[k])
      if (first) document.getElementById(id(first))?.focus()
      return
    }
    setStatus('loading')
    // Demo only: no network request. Wire this to your booking backend or a form service.
    window.setTimeout(() => setStatus('success'), 1400)
  }

  const chosen = OPTIONS.find((o) => o.value === fields.slot)
  const firstName = fields.name.trim().split(' ')[0]
  const loading = status === 'loading'

  return (
    <div className="rounded-3xl border border-white/10 bg-coal/90 p-6 backdrop-blur-xl md:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col items-start py-8"
            role="status"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-ember text-ink">
              <CheckCircle size={24} weight="bold" aria-hidden="true" />
            </span>
            <h3 className="heading-5 mt-6 text-white">Trial booked for {firstName}</h3>
            <p className="body-3 mt-2 text-muted">
              {chosen ? (
                <>
                  You are in <span className="text-white">{chosen.label}</span>. Coach {coachName(chosen.coach)} will meet you at
                  the front desk 10 minutes early.
                </>
              ) : (
                <>A coach will call you within one working day to pick a class that suits your week.</>
              )}{' '}
              The details are on their way to <span className="text-white">{fields.email.trim()}</span>.
            </p>
            <button
              type="button"
              onClick={() => {
                setFields(empty)
                setErrors({})
                setTouched({})
                setStatus('idle')
              }}
              className={buttonClass('secondary', 'sm', 'mt-8')}
            >
              Book for someone else
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            aria-describedby={id('note')}
          >
            <fieldset disabled={loading} className="flex flex-col gap-6">
              <legend className="sr-only">Book your free trial class</legend>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor={id('name')} className="title-4 text-white">
                    Full name
                  </label>
                  <input
                    id={id('name')}
                    autoComplete="name"
                    value={fields.name}
                    onChange={(e) => set('name', e.target.value)}
                    onBlur={() => blur('name')}
                    aria-invalid={!!errors.name && touched.name}
                    aria-describedby={errors.name && touched.name ? id('name-err') : undefined}
                    placeholder="Jordan Ellis"
                    className={`${inputBase} mt-2 ${errors.name && touched.name ? 'border-ember' : 'border-white/10 hover:border-white/20'}`}
                  />
                  <FieldError id={id('name-err')} msg={touched.name ? errors.name : undefined} />
                </div>
                <div>
                  <label htmlFor={id('email')} className="title-4 text-white">
                    Email
                  </label>
                  <input
                    id={id('email')}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={fields.email}
                    onChange={(e) => set('email', e.target.value)}
                    onBlur={() => blur('email')}
                    aria-invalid={!!errors.email && touched.email}
                    aria-describedby={errors.email && touched.email ? id('email-err') : undefined}
                    placeholder="jordan@example.com"
                    className={`${inputBase} mt-2 ${errors.email && touched.email ? 'border-ember' : 'border-white/10 hover:border-white/20'}`}
                  />
                  <FieldError id={id('email-err')} msg={touched.email ? errors.email : undefined} />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor={id('phone')} className="title-4 text-white">
                    Phone <span className="caption-5 text-dim">optional</span>
                  </label>
                  <input
                    id={id('phone')}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={fields.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    onBlur={() => blur('phone')}
                    aria-invalid={!!errors.phone && touched.phone}
                    aria-describedby={errors.phone && touched.phone ? id('phone-err') : undefined}
                    placeholder="(503) 555 0199"
                    className={`${inputBase} mt-2 ${errors.phone && touched.phone ? 'border-ember' : 'border-white/10 hover:border-white/20'}`}
                  />
                  <FieldError id={id('phone-err')} msg={touched.phone ? errors.phone : undefined} />
                </div>
                <div>
                  <label htmlFor={id('slot')} className="title-4 text-white">
                    Class
                  </label>
                  <div className="relative mt-2">
                  <CaretDown size={16} weight="bold" aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                  <select
                    id={id('slot')}
                    value={fields.slot}
                    onChange={(e) => set('slot', e.target.value)}
                    className={`${inputBase} appearance-none pr-12 ${highlight ? 'border-ember' : 'border-white/10 hover:border-white/20'}`}
                  >
                    <option value="">Any class, call me</option>
                    {DAYS.map((d) => {
                      const opts = OPTIONS.filter((o) => o.value.startsWith(d))
                      if (!opts.length) return null
                      return (
                        <optgroup key={d} label={d}>
                          {opts.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </optgroup>
                      )
                    })}
                  </select>
                  </div>
                </div>
              </div>

              <div role="radiogroup" aria-labelledby={id('exp-label')} aria-describedby={errors.experience && touched.experience ? id('exp-err') : undefined}>
                <p id={id('exp-label')} className="title-4 text-white">
                  Training experience
                </p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {EXPERIENCE.map((x, i) => {
                    const checked = fields.experience === x
                    return (
                      <label
                        key={x}
                        className={`caption-1 flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-center transition-colors duration-300 ease-forge has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember ${
                          checked ? 'border-ember bg-ember/10 text-white' : 'border-white/10 bg-ink text-muted hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name={id('experience')}
                          id={i === 0 ? id('experience') : undefined}
                          value={x}
                          checked={checked}
                          onChange={() => {
                            setTouched((t) => ({ ...t, experience: true }))
                            set('experience', x)
                            setErrors(validate({ ...fields, experience: x }))
                          }}
                          className="sr-only"
                        />
                        {x}
                      </label>
                    )
                  })}
                </div>
                <FieldError id={id('exp-err')} msg={touched.experience ? errors.experience : undefined} />
              </div>

              <button type="submit" className={buttonClass('primary', 'md', 'w-full')} aria-busy={loading}>
                {loading ? (
                  <span className="flex items-center gap-3">
                    Booking your class
                    <span className="relative h-1 w-12 overflow-hidden rounded-full bg-ink/20" aria-hidden="true">
                      <motion.span
                        className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-ink"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1, ease: EASE, repeat: Infinity }}
                      />
                    </span>
                  </span>
                ) : (
                  <>
                    Book your free trial class
                    <ArrowRight size={18} weight="bold" aria-hidden="true" className="transition-transform duration-300 ease-forge group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
              <p id={id('note')} className="caption-5 -mt-2 text-center text-dim">
                Demo form. Nothing is sent and no data leaves your browser.
              </p>
            </fieldset>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
