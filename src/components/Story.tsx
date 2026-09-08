import { useLayoutEffect, useRef } from 'react'
import { ScrollTrigger, gsap } from '../lib/scroll'
import { story } from '../data/content'
import { Fade, Reveal } from './Reveal'

/** The founder story as a pinned, horizontally scrubbed timeline. Stacks vertically on phones. */
export function Story() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => (track.current?.scrollWidth ?? 0) - window.innerWidth
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          pin: true,
          scrub: true,
          start: 'top top',
          end: () => `+=${distance() + window.innerHeight * 0.4}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
        },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })
    ScrollTrigger.refresh()
    return () => mm.revert()
  }, [])

  return (
    <section className="story" id="story" ref={section} data-chapter="02 · The founder story">
      <div className="story-inner">
        <div className="container"><div className="section-head">
          <Fade as="p" className="eyebrow">The founder story</Fade>
          <Reveal as="h2">Two brothers, <em>one company.</em></Reveal>
        </div></div>
        <div className="story-track" ref={track}>
          {story.map((c, i) => (
            <article className="chapter" key={c.label}>
              <div className="chapter-label">
                <span className="mono" style={{ color: 'var(--accent)' }}>{c.label}</span>
                <span className="mono">{String(i + 1).padStart(2, '0')} / {String(story.length).padStart(2, '0')}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
        <div className="story-progress" aria-hidden="true"><i ref={bar} /></div>
      </div>
    </section>
  )
}
