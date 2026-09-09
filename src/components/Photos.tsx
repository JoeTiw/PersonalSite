import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/scene-state'
import { photos } from '../data/content'
import { useIsMobile } from '../lib/useMedia'
import { Fade, Reveal } from './Reveal'

const AUTO_SPEED = 7 // degrees per second when nobody is touching it

/** The photos stand on a ring in 3D. It turns on its own; drag or swipe to spin it, and it keeps its momentum. */
export function Photos() {
  const stage = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const mobile = useIsMobile()
  const [index, setIndex] = useState(0)
  const [touched, setTouched] = useState(false)
  const n = photos.length
  const step = 360 / n

  useEffect(() => {
    const st = stage.current
    const el = ring.current
    if (!st || !el) return
    const cards = Array.from(el.children) as HTMLElement[]
    const reduced = prefersReducedMotion()
    let rot = 0
    let vel = reduced ? 0 : AUTO_SPEED
    let dragging = false
    let hover = false
    let visible = false
    let raf = 0
    let last = performance.now()
    let lastX = 0
    let lastT = 0
    let lastIdx = -1
    let R = 0

    const layout = () => {
      const w = cards[0].offsetWidth
      R = Math.round((n * (w + (mobile ? 30 : 60))) / (2 * Math.PI))
      cards.forEach((c, i) => { c.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)` })
    }
    layout()
    window.addEventListener('resize', layout)

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!dragging) {
        const target = reduced || (hover && !mobile) ? 0 : AUTO_SPEED
        vel += (target - vel) * (1 - Math.exp(-dt * 1.4))
        rot += vel * dt
      }
      el.style.transform = `rotateX(-7deg) rotateY(${rot}deg)`

      // brightness by depth, and which card is closest to the front
      let best = 0
      let bestD = Infinity
      cards.forEach((c, i) => {
        const a = (((i * step + rot) % 360) + 360) % 360
        const d = Math.min(a, 360 - a)
        c.style.opacity = String(1 - (d / 180) * 0.6)
        c.style.zIndex = String(Math.round(180 - d))
        if (d < bestD) { bestD = d; best = i }
      })
      if (best !== lastIdx) { lastIdx = best; setIndex(best) }
      if (visible) raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) { last = performance.now(); raf = requestAnimationFrame(tick) }
    }, { threshold: 0.05 })
    io.observe(st)

    const down = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastT = performance.now()
      st.setPointerCapture(e.pointerId)
      setTouched(true)
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const now = performance.now()
      const dx = e.clientX - lastX
      const dt = Math.max(8, now - lastT) / 1000
      rot += dx * 0.28
      vel = (dx * 0.28) / dt
      lastX = e.clientX
      lastT = now
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      vel = Math.max(-260, Math.min(260, vel))
    }
    const enter = () => { hover = true }
    const leave = () => { hover = false }
    st.addEventListener('pointerdown', down)
    st.addEventListener('pointermove', move)
    st.addEventListener('pointerup', up)
    st.addEventListener('pointercancel', up)
    st.addEventListener('pointerenter', enter)
    st.addEventListener('pointerleave', leave)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', layout)
      st.removeEventListener('pointerdown', down)
      st.removeEventListener('pointermove', move)
      st.removeEventListener('pointerup', up)
      st.removeEventListener('pointercancel', up)
      st.removeEventListener('pointerenter', enter)
      st.removeEventListener('pointerleave', leave)
    }
  }, [mobile, n, step])

  const current = photos[index]

  return (
    <section className="photos" id="photos" data-chapter="06 · Off the clock">
      <div className="container">
        <div className="section-head">
          <Fade as="p" className="eyebrow">Off the clock</Fade>
          <Reveal as="h2">I never got good at this. <em>I still do it.</em></Reveal>
        </div>
      </div>
      <div className="photos-stage" ref={stage} aria-label="Photo carousel, drag to rotate">
        <div className="photos-ring" ref={ring}>
          {photos.map((p) => (
            <figure className="ring-card" key={p.src}>
              <img src={p.src} alt={p.title} width={p.w} height={p.h} loading="lazy" decoding="async" draggable={false} />
              <figcaption className="mono">{p.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="container photos-bar">
        <p className="photos-caption">
          <b>{current.title}</b>
          <span>{current.caption}</span>
        </p>
        <span className={`spin-hint mono${touched ? ' is-done' : ''}`} aria-hidden="true"><i /> {mobile ? 'Swipe to spin' : 'Drag to spin'}</span>
        <span className="mono photos-count" aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
      </div>
    </section>
  )
}
