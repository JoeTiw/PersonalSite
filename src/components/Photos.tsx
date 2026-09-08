import { useLayoutEffect, useRef } from 'react'
import { ScrollTrigger, gsap } from '../lib/scroll'
import { photos } from '../data/content'
import { Fade, Reveal } from './Reveal'

/** A pinned horizontal gallery on desktop; a native snap-scroll strip on phones. */
export function Photos() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

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
          end: () => `+=${distance() + window.innerHeight * 0.3}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
      const imgs = Array.from(track.current?.querySelectorAll<HTMLImageElement>('img') ?? [])
      const parallax = imgs.map((img) =>
        gsap.fromTo(img, { xPercent: -6 }, {
          xPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: section.current, start: 'top top', end: () => `+=${distance() + window.innerHeight * 0.3}`, scrub: true },
        }),
      )
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        parallax.forEach((p) => { p.scrollTrigger?.kill(); p.kill() })
      }
    })
    ScrollTrigger.refresh()
    return () => mm.revert()
  }, [])

  return (
    <section className="photos" id="photos" ref={section}>
      <div className="photos-inner">
        <div className="container section-head">
          <Fade as="p" className="eyebrow">Off the clock</Fade>
          <Reveal as="h2">I never got good at this. <em>I still do it.</em></Reveal>
        </div>
        <div className="photos-track" ref={track}>
          {photos.map((p) => (
            <figure className="photo" key={p.src}>
              <div className="photo-frame">
                <img src={p.src} alt={p.title} width={p.w} height={p.h} loading="lazy" decoding="async" />
              </div>
              <figcaption className="mono"><b>{p.title}</b><span>{p.caption}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
