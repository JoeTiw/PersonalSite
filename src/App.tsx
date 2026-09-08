import { Suspense, lazy, useEffect } from 'react'
import { ScrollTrigger, destroySmoothScroll, initSmoothScroll } from './lib/scroll'
import { FORMATIONS, prefersReducedMotion, sceneState } from './lib/scene-state'
import { Nav } from './components/Nav'
import { Cursor } from './components/Cursor'
import { Hero } from './components/Hero'
import { Now } from './components/Now'
import { Story } from './components/Story'
import { NeoOffice } from './components/NeoOffice'
import { Work } from './components/Work'
import { Craft } from './components/Craft'
import { Photos } from './components/Photos'
import { Contact } from './components/Contact'

const Scene = lazy(() => import('./three/Scene'))

export default function App() {
  useEffect(() => {
    sceneState.reducedMotion = prefersReducedMotion()
    initSmoothScroll()

    // Each chapter drives the 3D field: formation = chapter index + progress through it.
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-formation]'))
    const triggers = sections.map((el) => {
      const idx = FORMATIONS.indexOf(el.dataset.formation as (typeof FORMATIONS)[number])
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 65%',
        end: 'bottom 65%',
        onUpdate: (self) => {
          sceneState.formation = idx + Math.max(0, (self.progress - 0.62) / 0.38)
        },
      })
    })

    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      triggers.forEach((t) => t.kill())
      window.removeEventListener('load', refresh)
      destroySmoothScroll()
    }
  }, [])

  return (
    <>
      <Cursor />
      <Nav />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <main className="content" id="top">
        <Hero />
        <Now />
        <Story />
        <NeoOffice />
        <Work />
        <Craft />
        <Photos />
        <Contact />
      </main>
    </>
  )
}
