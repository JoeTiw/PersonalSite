import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { ScrollTrigger, destroySmoothScroll, initSmoothScroll } from './lib/scroll'
import { prefersReducedMotion, sceneState } from './lib/scene-state'
import { Intro } from './components/Intro'
import { Nav } from './components/Nav'
import { Cursor } from './components/Cursor'
import { Hero } from './components/Hero'
import { Now } from './components/Now'
import { Story } from './components/Story'
import { Work } from './components/Work'
import { Aviation } from './components/Aviation'
import { Photos } from './components/Photos'
import { Contact } from './components/Contact'

const Scene = lazy(() => import('./three/Scene'))

export default function App() {
  const [arrived, setArrived] = useState(false)
  const onArrive = useCallback(() => setArrived(true), [])

  useEffect(() => {
    sceneState.reducedMotion = prefersReducedMotion()
    const lenis = initSmoothScroll()
    if (document.documentElement.classList.contains('is-intro')) lenis?.stop()

    // The workstation lives behind the hero and drifts away as it scrolls out.
    const heroTrigger = ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        sceneState.heroProgress = self.progress
      },
    })

    // Pinned sections are created by child effects in DOM order, but any pin created after a
    // sibling below it would shift that sibling's measurements. Sort so refresh walks the page top-down.
    const refresh = () => {
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    }
    refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      heroTrigger.kill()
      window.removeEventListener('load', refresh)
      destroySmoothScroll()
    }
  }, [])

  return (
    <>
      <Intro onDone={onArrive} />
      <Cursor />
      <Nav />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <main className="content" id="top">
        <Hero ready={arrived} />
        <Now />
        <Story />
        <Work />
        <Aviation />
        <Photos />
        <Contact />
      </main>
    </>
  )
}
