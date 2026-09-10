import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'

/**
 * A ring that trails the pointer and swells over anything interactive.
 *
 * The wrapper is positioned by GSAP and carries no CSS transition, so nothing
 * re-smooths the values GSAP already tweened. The inner ring owns the scale and
 * colour changes, which keeps those transitions off the transform GSAP is writing.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(pointer: fine)').matches) return

    const opts = { duration: 0.18, ease: 'power2.out' } as const
    const xTo = gsap.quickTo(el, 'x', opts)
    const yTo = gsap.quickTo(el, 'y', opts)

    let shown = false
    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      if (!shown) {
        // First move: jump straight there so the ring never flies in from the corner.
        gsap.set(el, { x: e.clientX, y: e.clientY })
        el.classList.add('is-visible')
        shown = true
      }
    }
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest('[data-cursor], a, button')
      el.classList.toggle('is-active', !!t)
    }
    const leave = () => {
      el.classList.remove('is-visible')
      shown = false
    }
    const down = () => el.classList.add('is-down')
    const up = () => el.classList.remove('is-down')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <i />
    </div>
  )
}
