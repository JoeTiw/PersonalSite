import { Suspense, lazy, useLayoutEffect, useRef, useState } from 'react'
import { ScrollTrigger, gsap } from '../lib/scroll'
import { sceneState } from '../lib/scene-state'
import { aviation, site } from '../data/content'
import { Fade, Reveal } from './Reveal'

const FlightScene = lazy(() => import('../three/FlightScene'))

/** The aviation chapter: a boarding pass on the left, a 777 climbing across the section as you scroll. */
export function Aviation() {
  const section = useRef<HTMLElement>(null)
  const sky = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    const common = {
      trigger: section.current,
      onToggle: (self: ScrollTrigger) => setActive(self.isActive),
      onUpdate: (self: ScrollTrigger) => {
        sceneState.flightProgress = self.progress
      },
    }
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const st = ScrollTrigger.create({ ...common, pin: true, start: 'top top', end: '+=140%', anticipatePin: 1 })
      return () => st.kill()
    })
    mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
      const st = ScrollTrigger.create({ ...common, trigger: sky.current, start: 'top 90%', end: 'bottom 10%' })
      return () => st.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="aviation" id="aviation" ref={section}>
      <div className="aviation-sky" aria-hidden="true" ref={sky}>
        <Suspense fallback={null}>
          <FlightScene active={active} />
        </Suspense>
      </div>
      <div className="container aviation-inner">
        <div className="aviation-copy">
          <Fade as="p" className="eyebrow">The other love</Fade>
          <Reveal as="h2">Wheels <em>up.</em></Reveal>
          <Fade as="p" className="measure" delay={0.1}>
            Before there was code, there were airplanes. I grew up looking up. The Boeing 777 is still my favourite machine
            anyone has ever built, and a window seat on one is the best office I know. Appleton International is a short drive
            from my desk, which is either a blessing or a distraction.
          </Fade>
        </div>
        <Fade className="pass" delay={0.2}>
          <div className="pass-main">
            <div className="pass-head">
              <span className="pass-brand">NG <b>Neogen Air</b></span>
              <span className="mono">Boarding pass</span>
            </div>
            <div className="pass-route">
              <div><span className="pass-code">{aviation.from.code}</span><span className="mono">{aviation.from.name}</span></div>
              <span className="pass-arrow" aria-hidden="true"><i /></span>
              <div><span className="pass-code">{aviation.to.code}</span><span className="mono">{aviation.to.name}</span></div>
            </div>
            <div className="pass-grid">
              <div className="pass-field"><span className="k">Passenger</span><span className="v">{aviation.passenger}</span></div>
              <div className="pass-field"><span className="k">Flight</span><span className="v">{aviation.flight}</span></div>
              <div className="pass-field"><span className="k">Aircraft</span><span className="v">{aviation.aircraft}</span></div>
              <div className="pass-field"><span className="k">Seat</span><span className="v">{aviation.seat} · window</span></div>
              <div className="pass-field"><span className="k">Gate</span><span className="v">{aviation.gate}</span></div>
              <div className="pass-field"><span className="k">Status</span><span className="v is-accent">{aviation.status}</span></div>
            </div>
          </div>
          <div className="pass-stub">
            <span className="mono">{aviation.flight} · {aviation.seat}</span>
            <span className="pass-barcode" aria-hidden="true" />
            <span className="mono">{site.name}</span>
          </div>
        </Fade>
      </div>
    </section>
  )
}
