import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'

/** A lagging ring that follows the pointer and swells over anything marked data-cursor. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(pointer: fine)').matches) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })

    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      el.classList.add('is-visible')
    }
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest('[data-cursor], a, button')
      el.classList.toggle('is-active', !!t)
    }
    const leave = () => el.classList.remove('is-visible')
    const down = () => el.classList.add('is-down')
    const up = () => el.classList.remove('is-down')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [])

  return <div className="cursor" ref={ref} aria-hidden="true" />
}
