import { principles, tools } from '../data/content'
import { Fade, Reveal } from './Reveal'

export function Craft() {
  const loop = [...tools, ...tools]
  return (
    <section className="section-pad" id="craft" data-chapter="05 · How I work">
      <div className="container">
        <div className="section-head">
          <Fade as="p" className="eyebrow">How I work</Fade>
          <Reveal as="h2">Small team, <em>whole stack.</em></Reveal>
        </div>
        <div className="principles">
          {principles.map((p, i) => (
            <Fade key={p.title} className="principle" delay={i * 0.1}>
              <span className="mono" style={{ color: 'var(--accent)' }}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </Fade>
          ))}
        </div>
      </div>
      <div className="marquee" aria-label="Tools I use">
        <div className="marquee-track">
          {loop.map((t, i) => (
            <span key={`${t}-${i}`} aria-hidden={i >= tools.length}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
