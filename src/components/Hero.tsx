import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/scene-state'
import { site } from '../data/content'
import { Magnetic } from './Magnetic'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.from('.hero-title .line span', { yPercent: 110, duration: 1.4, stagger: 0.12 }, 0.2)
        .from('.hero .eyebrow', { y: 16, opacity: 0, duration: 0.9 }, 0.6)
        .from('.hero-lede', { y: 22, opacity: 0, duration: 1 }, 0.85)
        .from('.hero-actions .btn', { y: 18, opacity: 0, duration: 0.8, stagger: 0.08 }, 1.0)
        .from('.hero-aside > *', { y: 14, opacity: 0, duration: 0.8, stagger: 0.08 }, 1.1)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" data-formation="hero" ref={root}>
      <div className="container">
        <p className="eyebrow">
          <b>{site.role}</b> &nbsp;·&nbsp; {site.location}
        </p>
        <h1 className="hero-title" aria-label="Bhupin Tiwari">
          <span className="line"><span>Bhupin</span></span>
          <span className="line"><span>Tiwari</span></span>
        </h1>
        <div className="hero-grid">
          <div>
            <p className="lede hero-lede">
              I build software for small businesses that never had a software team. Right now that means Neo Office, the
              back office my brother and I are building for gas stations and convenience stores.
            </p>
            <div className="hero-actions">
              <Magnetic href="#story" primary>Read the story</Magnetic>
              <Magnetic href={`mailto:${site.email}`}>Say hello</Magnetic>
            </div>
          </div>
          <div className="hero-aside">
            <span className="mono">Co-founded with {site.brother}</span>
            <span className="mono">Neo Office · neogentechs.com</span>
            <span className="hero-scroll mono"><i /> Scroll</span>
          </div>
        </div>
      </div>
    </section>
  )
}
