import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { prefersReducedMotion } from './scene-state'

gsap.registerPlugin(ScrollTrigger, SplitText)

let lenis: Lenis | null = null

/** Starts Lenis smooth scrolling and wires it into GSAP's ticker so ScrollTrigger stays in sync. */
export function initSmoothScroll(): Lenis | null {
  if (lenis) return lenis
  if (prefersReducedMotion()) return null

  lenis = new Lenis({
    lerp: 0.12,
    smoothWheel: true,
    syncTouch: false,
  })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function destroySmoothScroll() {
  lenis?.destroy()
  lenis = null
}

export function getLenis() {
  return lenis
}

/** Scrolls to an element or selector, through Lenis when available. */
export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) })
    return
  }
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export { gsap, ScrollTrigger, SplitText }
