// Demo content for Forge Athletic Club. Every name, number and review is fictional.

export const GYM = {
  name: 'Forge Athletic Club',
  street: '418 Foundry Street',
  city: 'Portland, OR 97214',
  phone: '(503) 555 0148',
  email: 'coaches@forgeathletic.club',
  rating: 4.9,
  reviews: 312,
  members: 312,
}

export type Level = 'All levels' | 'Beginner friendly' | 'Intermediate'
export type CoachId = 'marcus' | 'dana' | 'lena'

export type GymClass = {
  time: string // 24h "HH:MM"
  duration: number // minutes
  name: string
  coach: CoachId
  level: Level
  spots: number // spots left out of 10, 0 = full
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

const c = (time: string, duration: number, name: string, coach: CoachId, level: Level, spots: number): GymClass => ({
  time, duration, name, coach, level, spots,
})

export const SCHEDULE: GymClass[][] = [
  [
    c('06:00', 60, 'Strength', 'marcus', 'All levels', 3),
    c('07:15', 45, 'Conditioning', 'lena', 'All levels', 6),
    c('12:10', 45, 'Lunch strength', 'dana', 'All levels', 4),
    c('17:30', 60, 'Strength', 'marcus', 'All levels', 0),
    c('18:45', 60, 'Foundations', 'lena', 'Beginner friendly', 5),
    c('19:50', 75, 'Barbell club', 'dana', 'Intermediate', 2),
  ],
  [
    c('06:00', 45, 'Conditioning', 'lena', 'All levels', 7),
    c('07:15', 60, 'Strength', 'marcus', 'All levels', 2),
    c('12:10', 45, 'Conditioning', 'lena', 'All levels', 8),
    c('17:30', 75, 'Barbell club', 'dana', 'Intermediate', 1),
    c('18:45', 60, 'Strength', 'marcus', 'All levels', 4),
  ],
  [
    c('06:00', 60, 'Strength', 'marcus', 'All levels', 5),
    c('07:15', 45, 'Conditioning', 'lena', 'All levels', 3),
    c('12:10', 45, 'Lunch strength', 'dana', 'All levels', 6),
    c('17:30', 60, 'Strength', 'marcus', 'All levels', 2),
    c('18:45', 60, 'Foundations', 'lena', 'Beginner friendly', 4),
    c('19:50', 75, 'Barbell club', 'dana', 'Intermediate', 0),
  ],
  [
    c('06:00', 45, 'Conditioning', 'lena', 'All levels', 4),
    c('07:15', 60, 'Strength', 'marcus', 'All levels', 6),
    c('12:10', 45, 'Conditioning', 'lena', 'All levels', 7),
    c('17:30', 75, 'Barbell club', 'dana', 'Intermediate', 3),
    c('18:45', 60, 'Strength', 'marcus', 'All levels', 1),
  ],
  [
    c('06:00', 60, 'Strength', 'marcus', 'All levels', 4),
    c('07:15', 45, 'Conditioning', 'lena', 'All levels', 5),
    c('12:10', 45, 'Lunch strength', 'dana', 'All levels', 8),
    c('17:00', 45, 'Team conditioning', 'lena', 'All levels', 6),
  ],
  [
    c('08:00', 60, 'Foundations', 'lena', 'Beginner friendly', 3),
    c('09:15', 45, 'Team conditioning', 'lena', 'All levels', 2),
    c('10:30', 90, 'Barbell club', 'dana', 'Intermediate', 5),
  ],
  [],
]

export const CLASSES_PER_WEEK = SCHEDULE.reduce((n, d) => n + d.length, 0)

export function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh}:${String(m).padStart(2, '0')} ${suffix}`
}

export function spotsLabel(spots: number) {
  if (spots === 0) return 'Full'
  return spots === 1 ? '1 spot left' : `${spots} spots left`
}

/** Monday based index for a Date. */
export function dayIndex(d: Date) {
  return (d.getDay() + 6) % 7
}

export function classKey(day: number, cls: GymClass) {
  return `${DAYS[day]} ${cls.time} ${cls.name}`
}

export function classLabel(day: number, cls: GymClass) {
  return `${DAYS[day]} ${formatTime(cls.time)} · ${cls.name}`
}

export function nextClass(now = new Date()) {
  const today = dayIndex(now)
  const minutes = now.getHours() * 60 + now.getMinutes()
  for (let offset = 0; offset < 8; offset++) {
    const day = (today + offset) % 7
    for (const cls of SCHEDULE[day]) {
      const [h, m] = cls.time.split(':').map(Number)
      if (offset === 0 && h * 60 + m <= minutes) continue
      if (cls.spots === 0) continue
      return { day, cls, when: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : DAY_NAMES[day] }
    }
  }
  return null
}

export type Coach = {
  id: CoachId
  name: string
  first: string
  role: string
  credentials: string[]
  lift: { label: string; value: string }
  image: string
  alt: string
}

export const COACHES: Coach[] = [
  {
    id: 'marcus',
    name: 'Marcus Oyelaran',
    first: 'Marcus',
    role: 'Head coach, strength',
    credentials: ['NSCA CSCS', '11 years coaching'],
    lift: { label: 'Best deadlift', value: '262.5 kg' },
    image: 'coach-marcus.webp',
    alt: 'Marcus doing a strict pull up on the rig, photographed from behind in black and white',
  },
  {
    id: 'dana',
    name: 'Dana Kowalczyk',
    first: 'Dana',
    role: 'Olympic lifting lead',
    credentials: ['USAW Level 2', 'Former national competitor'],
    lift: { label: 'Best clean and jerk', value: '97 kg' },
    image: 'coach-dana.webp',
    alt: 'Dana holding a loaded barbell overhead in front of a squat rack and brick wall',
  },
  {
    id: 'lena',
    name: 'Lena Fischer',
    first: 'Lena',
    role: 'Conditioning and Foundations',
    credentials: ['NASM CPT', 'Precision Nutrition L1'],
    lift: { label: 'Best 2 km row', value: '7:21.4' },
    image: 'coach-lena.webp',
    alt: 'Lena with a barbell across her back, ready to squat, in black and white',
  },
]

export const coachName = (id: CoachId) => COACHES.find((c) => c.id === id)!.first

export const TESTIMONIALS = [
  {
    metric: '+35 kg',
    metricLabel: 'on her deadlift in 7 months',
    quote:
      'I spent two years doing random workouts from my phone. Seven months of Marcus writing my blocks and I pulled 137.5 kg. I check the app the way other people check the stock market.',
    name: 'Priya Raman',
    meta: 'Software engineer, member since March 2025',
  },
  {
    metric: '1st',
    metricLabel: 'strict pull up, at 41',
    quote:
      'Lena broke it down into band work, negatives and holds. Eleven weeks later I did one in front of the whole 6 am class. They cheered louder than I did.',
    name: 'Tom Brennan',
    meta: 'High school teacher, member since June 2025',
  },
  {
    metric: '1.25×',
    metricLabel: 'bodyweight back squat',
    quote:
      'I came in with a cranky lower back and a lot of fear about barbells. Foundations taught me to brace properly. I squat twice a week now and my back has never felt better.',
    name: 'Aisha Mbeki',
    meta: 'Nurse practitioner, member since October 2024',
  },
]

export const PLANS = [
  {
    name: 'Foundations',
    price: 139,
    blurb: 'For building the habit with two coached sessions a week.',
    features: ['2 coached classes per week', 'Open gym access', 'Forge app with lift tracking', 'Movement assessment'],
    featured: false,
  },
  {
    name: 'Unlimited',
    price: 189,
    blurb: 'For people who want to train most days and follow the full program.',
    features: [
      'Unlimited coached classes',
      'Open gym access',
      'Forge app with lift tracking',
      'Quarterly reassessment and testing day',
      'Bring a friend free, twice a month',
    ],
    featured: true,
  },
  {
    name: 'Coached 1:1',
    price: 349,
    blurb: 'For specific goals, competition prep, or coming back from injury.',
    features: [
      '4 private sessions per month',
      'Unlimited coached classes',
      'Program written for you, updated weekly',
      'Video form review in the app',
    ],
    featured: false,
  },
]

export const FAQS = [
  {
    q: 'I have never lifted a barbell. Is this for me?',
    a: 'Yes. About half our members started with no lifting background. Your first weeks run through Foundations, where a coach teaches the squat, hinge, press and pull with light loads before you join regular classes.',
  },
  {
    q: 'How big are the classes?',
    a: 'Every class is capped at 10 athletes with one coach. That is small enough for your coach to watch every working set and adjust your weights on the spot.',
  },
  {
    q: 'Do I have to sign a contract?',
    a: 'No. Memberships are month to month. You can cancel with 30 days notice by email or at the front desk, and you can freeze for up to two months a year at no cost.',
  },
  {
    q: 'What should I bring to my free class?',
    a: 'Comfortable clothes, flat soled shoes and a water bottle. We have chalk, belts, towels and lockers. Arrive 10 minutes early so your coach can show you around.',
  },
  {
    q: 'I have an old injury. Can I still train?',
    a: 'Usually, yes. Tell us about it in your assessment and your coach will scale or swap movements. For recent injuries we ask for a quick note from your physio or doctor first.',
  },
  {
    q: 'I can only train before work. Will that work?',
    a: 'Our 6:00 am and 7:15 am classes run every weekday, and open gym starts at 5:30 am. Plenty of members only ever train early.',
  },
  {
    q: 'How do you track progress?',
    a: 'Every set you log in the Forge app is stored against your program. Coaches review your numbers weekly, and we run a testing day at the end of each 12 week block.',
  },
  {
    q: 'Is there parking?',
    a: 'Yes. There are 22 free spots behind the building on Foundry Street, a covered bike rack by the entrance, and the 15 bus stops one block away.',
  },
]

/** Demo WhatsApp number (fictional 555 line). Replace with the gym's real number. */
export const WHATSAPP = {
  number: '15035550148',
  message: 'Hi Forge, I would like to book a free trial class.',
}
export const whatsappLink = (text = WHATSAPP.message) =>
  `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(text)}`

export type ProgramId = 'strength' | 'conditioning' | 'barbell' | 'foundations'

export type Program = {
  id: ProgramId
  name: string
  video: string // base name in /public/video, without -wide/-tall
  promise: string
  body: string
  duration: string
  level: Level
  coach: CoachId
  intensity: number // 1 to 5
  times: string
}

export const PROGRAMS: Program[] = [
  {
    id: 'strength',
    name: 'Strength',
    video: 'strength',
    promise: 'Squat, press and pull more every block.',
    body: 'The core of Forge. Heavy compound lifts in planned 12 week blocks, with a coach adjusting your weights on every working set.',
    duration: '60 min',
    level: 'All levels',
    coach: 'marcus',
    intensity: 4,
    times: 'Weekdays at 6:00 am, 7:15 am and 6:45 pm',
  },
  {
    id: 'conditioning',
    name: 'Conditioning',
    video: 'conditioning',
    promise: 'Build an engine without losing your strength.',
    body: 'Short, hard intervals on ropes, sleds, rowers and bikes. Scaled to you, so a first timer and a marathoner share the same floor.',
    duration: '45 min',
    level: 'All levels',
    coach: 'lena',
    intensity: 5,
    times: 'Weekdays at 6:00 am and 7:15 am, Saturday 9:15 am',
  },
  {
    id: 'barbell',
    name: 'Barbell club',
    video: 'barbell',
    promise: 'Learn the snatch and the clean and jerk properly.',
    body: 'Olympic lifting technique with Dana, a former national competitor. Small groups, video feedback and a testing day every block.',
    duration: '75 min',
    level: 'Intermediate',
    coach: 'dana',
    intensity: 4,
    times: 'Monday, Tuesday, Wednesday and Thursday evenings, Saturday 10:30 am',
  },
  {
    id: 'foundations',
    name: 'Foundations',
    video: 'foundations',
    promise: 'Never lifted before? Start here.',
    body: 'Four weeks on the squat, hinge, press and pull with light loads and lots of coaching. You graduate into regular classes with confidence.',
    duration: '60 min',
    level: 'Beginner friendly',
    coach: 'lena',
    intensity: 2,
    times: 'Monday and Wednesday at 6:45 pm, Saturday 8:00 am',
  },
]

export const HOURS = [
  { day: 'Mon to Fri', open: 5.5, close: 22, label: '5:30 am to 10:00 pm' },
  { day: 'Saturday', open: 7, close: 18, label: '7:00 am to 6:00 pm' },
  { day: 'Sunday', open: 8, close: 14, label: '8:00 am to 2:00 pm' },
]
