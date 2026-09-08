import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ScrollTrigger, gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/scene-state'
import { photos } from '../data/content'
import { useIsMobile } from '../lib/useMedia'
import { Fade, Reveal } from './Reveal'

/** A pinned horizontal gallery on desktop; a swipeable 3D coverflow strip on phones. */
export function Photos() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const mobile = useIsMobile()
  const [index, setIndex] = useState(0)
  const [swiped, setSwiped] = useState(false)

  // Desktop: pin the section and scrub the strip sideways.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => (track.current?.scrollWidth ?? 0) - window.innerWidth
      const end = () => `+=${distance() + window.innerHeight * 0.3}`
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { trigger: section.current, pin: true, scrub: true, start: 'top top', end, invalidateOnRefresh: true, anticipatePin: 1 },
      })
      const imgs = Array.from(track.current?.querySelectorAll<HTMLImageElement>('img') ?? [])
      const parallax = imgs.map((img) =>
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top top', end, scrub: true } }),
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

  // Phones: native swipe drives a coverflow transform per card, plus a one-time peek nudge.
  useEffect(() => {
    const el = track.current
    if (!mobile || !el) return
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.photo'))
    const reduced = prefersReducedMotion()
    let raf = 0
    let nudged = false

    const update = () => {
      raf = 0
      const centre = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let bestDist = Infinity
      cards.forEach((card, i) => {
        const d = (card.offsetLeft + card.offsetWidth / 2 - centre) / el.clientWidth
        const a = Math.max(-1, Math.min(1, d))
        if (!reduced) {
          card.style.transform = `perspective(900px) rotateY(${-a * 26}deg) translateZ(${-Math.abs(a) * 60}px) scale(${1 - Math.abs(a) * 0.08})`
          card.style.opacity = String(1 - Math.abs(a) * 0.3)
        }
        if (Math.abs(d) < bestDist) { bestDist = Math.abs(d); best = i }
      })
      setIndex(best)
      if (el.scrollLeft > 60) setSwiped(true)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    el.addEventListener('scroll', onScroll, { passive: true })

    // First time the strip is on screen, nudge it so the swipe is discoverable.
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || nudged || reduced) return
      nudged = true
      io.disconnect()
      window.setTimeout(() => {
        if (el.scrollLeft > 0) return
        el.scrollTo({ left: 56, behavior: 'smooth' })
        window.setTimeout(() => { if (el.scrollLeft <= 60) el.scrollTo({ left: 0, behavior: 'smooth' }) }, 650)
      }, 700)
    }, { threshold: 0.6 })
    io.observe(el)

    return () => {
      el.removeEventListener('scroll', onScroll)
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
      cards.forEach((c) => { c.style.transform = ''; c.style.opacity = '' })
    }
  }, [mobile])

  const goTo = (i: number) => {
    const el = track.current
    const card = el?.querySelectorAll<HTMLElement>('.photo')[i]
    if (!el || !card) return
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' })
  }

  return (
    <section className="photos" id="photos" ref={section}>
      <div className="photos-inner">
        <div className="container"><div className="section-head">
          <Fade as="p" className="eyebrow">Off the clock</Fade>
          <Reveal as="h2">I never got good at this. <em>I still do it.</em></Reveal>
        </div></div>
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
        {mobile && (
          <div className="photos-bar">
            <div className="photos-dots" role="tablist" aria-label="Photos">
              {photos.map((p, i) => (
                <button key={p.src} type="button" role="tab" aria-selected={i === index} aria-label={p.title} className={i === index ? 'on' : ''} onClick={() => goTo(i)} />
              ))}
            </div>
            <span className={`swipe-hint mono${swiped ? ' is-done' : ''}`} aria-hidden="true"><i /> Swipe</span>
            <span className="mono photos-count" aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
          </div>
        )}
      </div>
    </section>
  )
}
