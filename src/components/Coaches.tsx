import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'
import { Rail } from './ui/Rail'
import { COACHES } from '../lib/data'
import { asset } from '../lib/asset'

export function Coaches() {
  return (
    <section id="coaches" aria-labelledby="coaches-title" className="scroll-mt-24 bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeader
          titleId="coaches-title"
          eyebrow="Coaches"
          title={
            <>
              Coached by people <br />
              <span className="text-muted">who still lift.</span>
            </>
          }
          lead="Three full time coaches, all certified, all still training and competing. You will know them by name within a month."
        />

        <Reveal className="mt-10 md:mt-16">
          <Rail label="Coaches">
            {COACHES.map((c) => (
              <article key={c.id} className="group relative aspect-[4/5] overflow-hidden rounded-4xl bg-coal">
                <img
                  src={asset(`images/${c.image}`)}
                  alt={c.alt}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover grayscale transition-transform duration-700 ease-forge group-hover:scale-[1.04]"
                />
                <span className="absolute inset-0 bg-ink/20" aria-hidden="true" />
                <span className="caption-3 absolute left-4 top-4 rounded-full bg-volt px-3 py-1 font-mono uppercase tracking-widest text-ink">
                  {c.lift.label} · {c.lift.value}
                </span>
                {/* Card radius 32 with a 16px inset gives the panel 16 (B3). */}
                <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-ink/70 p-4 backdrop-blur-xl">
                  <h3 className="title-1 text-white">{c.name}</h3>
                  <p className="body-6 text-muted">{c.role}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {c.credentials.map((cred) => (
                      <li key={cred} className="caption-4 rounded-full bg-white/10 px-3 py-1 text-white/80">
                        {cred}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </Rail>
        </Reveal>
      </div>
    </section>
  )
}
