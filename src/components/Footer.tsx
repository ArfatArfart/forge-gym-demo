import { Logo } from './ui/Logo'
import { GYM, HOURS } from '../lib/data'
import { asset } from '../lib/asset'

const link =
  'body-6 rounded text-muted transition-colors duration-300 ease-forge hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember'

export function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="body-6 mt-4 max-w-xs text-muted">
            A coached strength and conditioning gym on Portland's east side. Small classes, real programs, measurable
            progress.
          </p>
        </div>

        <div>
          <h2 className="title-4 font-mono uppercase tracking-widest text-dim">Visit</h2>
          <address className="body-6 mt-4 flex flex-col gap-1 not-italic text-muted">
            <span className="text-white">{GYM.street}</span>
            <span>{GYM.city}</span>
            <a href="tel:+15035550148" className={`${link} mt-2 self-start`}>
              {GYM.phone}
            </a>
            <a href={`mailto:${GYM.email}`} className={`${link} self-start`}>
              {GYM.email}
            </a>
          </address>
        </div>

        <div>
          <h2 className="title-4 font-mono uppercase tracking-widest text-dim">Open gym hours</h2>
          <dl className="mt-4 flex flex-col gap-2">
            {HOURS.map((h) => (
              <div key={h.day} className="flex justify-between gap-4 md:max-w-64">
                <dt className="body-6 text-white">{h.day}</dt>
                <dd className="body-6 font-mono text-muted">{h.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <nav aria-label="Footer">
          <h2 className="title-4 font-mono uppercase tracking-widest text-dim">Explore</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {[
              ['Programs', '#programs'],
              ['Schedule', '#schedule'],
              ['Coaches', '#coaches'],
              ['Pricing', '#pricing'],
              ['FAQ', '#faq'],
              ['Book a trial', '#book'],
            ].map(([label, href]) => (
              <li key={href}>
                <a href={href} className={link}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-8 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="caption-5 text-dim">
          © {new Date().getFullYear()} Forge Athletic Club. Demo concept: names, prices and reviews are fictional. Photos
          from Unsplash.
        </p>
        <ul className="flex gap-6">
          <li>
            <a href={asset('privacy.html')} className={`${link} caption-2`}>
              Privacy policy
            </a>
          </li>
          <li>
            <a href={asset('terms.html')} className={`${link} caption-2`}>
              Terms of service
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
