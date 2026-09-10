import { useEffect, useRef } from 'react'
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
 * Hovering pauses it with a mouse; holding a finger on it pauses it on touch.
 */
export function Story() {
  const win = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = win.current
    if (!el) return
    // Only spend frames on the drift while the section is on screen.
    const io = new IntersectionObserver(
      ([e]) => el.classList.toggle('is-onscreen', e.isIntersecting),
      { rootMargin: '10% 0px' },
    )
    io.observe(el)

    const hold = () => el.classList.add('is-held')
    const release = () => el.classList.remove('is-held')
    el.addEventListener('pointerdown', hold, { passive: true })
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave'] as const) {
      el.addEventListener(ev, release, { passive: true })
    }
    return () => {
      io.disconnect()
      el.removeEventListener('pointerdown', hold)
      for (const ev of ['pointerup', 'pointercancel', 'pointerleave'] as const) {
        el.removeEventListener(ev, release)
      }
    }
  }, [])

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

        <div className="story-window" ref={win}>
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
