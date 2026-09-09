import { story, site } from '../data/content'
import { Fade, Reveal } from './Reveal'
import { Magnetic } from './Magnetic'

type CardProps = { chapter: (typeof story)[number]; index: number }

function StoryCard({ chapter, index }: CardProps) {
  return (
    <li className="story-card">
      <div className="story-card-head">
        <span className="story-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className="story-label mono">{chapter.label}</span>
      </div>
      <h3>{chapter.title}</h3>
      <p>{chapter.body}</p>
      <div className="story-steps" aria-hidden="true">
        {story.map((s, k) => (
          <i key={s.label} className={k === index ? 'on' : ''} />
        ))}
        <span className="mono">{String(index + 1).padStart(2, '0')} / {String(story.length).padStart(2, '0')}</span>
      </div>
    </li>
  )
}

/**
 * The founder story: a sticky heading beside a column of chapter cards that drift
 * slowly through a masked window, dissolving into the fade at both ends.
 * Phones get the same cards as a plain stack, since there is no hover to pause a drift.
 */
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

        <div className="story-window">
          <ol className="story-track">
            {story.map((c, i) => (
              <StoryCard key={c.label} chapter={c} index={i} />
            ))}
          </ol>
          {/* A second pass of the same cards keeps the drift seamless; hidden from assistive tech. */}
          <ol className="story-track is-clone" aria-hidden="true">
            {story.map((c, i) => (
              <StoryCard key={c.label} chapter={c} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
