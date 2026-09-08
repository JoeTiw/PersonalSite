import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { projects } from '../data/content'
import { Fade, Reveal } from './Reveal'

/** Six sticky cards that stack; each earlier card shrinks a little as the next one slides over it. */
export function Work() {
  const list = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 641px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = Array.from(list.current?.querySelectorAll<HTMLElement>('.card') ?? [])
      const tweens = cards.slice(0, -1).map((card, i) =>
        gsap.to(card, {
          scale: 0.94 - i * 0.008,
          opacity: 0.55,
          ease: 'none',
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom',
            end: 'top 15%',
            scrub: true,
          },
        }),
      )
      return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill() })
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="section-pad" id="work" data-chapter="04 · Earlier work">
      <div className="container">
        <div className="section-head">
          <Fade as="p" className="eyebrow">Earlier work</Fade>
          <Reveal as="h2">Before Neogen, <em>the projects that taught me.</em></Reveal>
        </div>
        <Fade as="p" className="measure" delay={0.1}>
          <span style={{ display: 'block', marginTop: 18 }}>
            Student-era, all of it, and all still on GitHub. They are here because every one of them is a habit I still use.
          </span>
        </Fade>
        <div className="cards" ref={list}>
          {projects.map((p, i) => (
            <a
              key={p.name}
              className="card"
              href={p.url}
              target="_blank"
              rel="noreferrer"
              style={{ top: `calc(var(--nav-h) + 4vh + ${i * 12}px)` }}
              data-cursor="link"
            >
              <span className="card-index">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div className="card-meta mono"><span>{p.year}</span><span>{p.stack}</span></div>
                <h3>{p.name}</h3>
                <p>{p.blurb}</p>
              </div>
              <span className="card-link"><i /> GitHub</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
