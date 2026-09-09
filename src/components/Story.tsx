import { story, site } from '../data/content'
import { Fade, Reveal } from './Reveal'
import { Magnetic } from './Magnetic'

/** The founder story: a sticky heading beside a scrolling stack of chapter cards. */
export function Story() {
  return (
    <section className="story section-pad" id="story" data-chapter="02 · The founder story">
      <div className="container story-grid">
        <div className="story-aside">
          <Fade as="p" className="pill">The founder story</Fade>
          <Reveal as="h2">Two brothers, <em>one company.</em></Reveal>
          <Fade as="p" className="story-lede" delay={0.1}>
            How a habit of taking things apart turned into a company, and then into software running in real stores.
          </Fade>
          <Fade delay={0.2}>
            <Magnetic href={site.company}>Visit Neogen ↗</Magnetic>
          </Fade>
        </div>

        <ol className="story-cards">
          {story.map((c, i) => (
            <li className="story-card" key={c.label}>
              <div className="story-card-head">
                <span className="story-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="story-label mono">{c.label}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <div className="story-steps" aria-hidden="true">
                {story.map((s, k) => (
                  <i key={s.label} className={k === i ? 'on' : ''} />
                ))}
                <span className="mono">{String(i + 1).padStart(2, '0')} / {String(story.length).padStart(2, '0')}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
