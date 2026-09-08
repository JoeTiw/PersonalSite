import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ScrollTrigger } from '../lib/scroll'
import { neoSteps, site } from '../data/content'
import { screens } from './NeoScreens'
import { Fade, Reveal } from './Reveal'

/** Sticky product frame on one side, steps on the other; the screen follows the step in view. */
export function NeoOffice() {
  const [active, setActive] = useState(0)
  const stepsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = Array.from(stepsRef.current?.querySelectorAll<HTMLElement>('.neo-step') ?? [])
    const triggers = els.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(i),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  const Screen = screens[neoSteps[active].key]

  return (
    <section className="section-pad" id="neo" data-chapter="03 · Neo Office">
      <div className="container neo-grid">
        <div className="neo-steps" ref={stepsRef}>
          <header>
            <Fade as="p" className="eyebrow">Neo Office · what we build</Fade>
            <Reveal as="h2">A back office that <em>follows the change.</em></Reveal>
            <Fade as="p" className="measure">
              A gas station runs on a register nobody wants to touch. Neo Office reads from it, sends changes back to it, and
              puts the whole store in one place: from the office, from home, or from a phone.
            </Fade>
          </header>
          {neoSteps.map((s, i) => (
            <div className={`neo-step${i === active ? ' is-active' : ''}`} key={s.key}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
        <div className="neo-stage">
          <div className="neo-device" aria-label="Neo Office screens">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={neoSteps[active].key}
                initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'absolute', inset: 0 }}
              >
                <Screen />
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="neo-caption mono">
            <span>Example data, not a real store.</span>
            <a href={site.company} target="_blank" rel="noreferrer" data-cursor="link">See Neo Office ↗</a>
          </p>
        </div>
      </div>
    </section>
  )
}
