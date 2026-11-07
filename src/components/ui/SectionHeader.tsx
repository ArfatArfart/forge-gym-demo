import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

type Props = { eyebrow: string; title: ReactNode; lead?: ReactNode; center?: boolean; titleId?: string }

export function SectionHeader({ eyebrow, title, lead, center = false, titleId }: Props) {
  return (
    <Reveal className={center ? 'mx-auto flex max-w-[680px] flex-col items-center text-center' : 'max-w-[680px]'}>
      <p className="caption-3 font-mono uppercase tracking-widest text-volt">{eyebrow}</p>
      <h2 id={titleId} className="heading-4 md:heading-2 mt-4 text-white">
        {title}
      </h2>
      {lead && <p className="body-3 md:body-7 mt-6 text-muted">{lead}</p>}
    </Reveal>
  )
}
