import { createElement, useLayoutEffect, useRef, type JSX, type ReactNode } from 'react'
import { SplitText, gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/scene-state'

type Props = {
  as?: keyof JSX.IntrinsicElements
  className?: string
  children: ReactNode
  /** Seconds to wait before playing, for things that play on load rather than on scroll. */
  delay?: number
  /** Play immediately on mount instead of when scrolled into view. */
  immediate?: boolean
}

/** Splits text into masked lines and slides them up when the element scrolls into view. */
export function Reveal({ as: Tag = 'div', className, children, delay = 0, immediate = false }: Props) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let split: SplitText | undefined
    let cancelled = false
    document.fonts.ready.then(() => {
      if (cancelled) return
      split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: 'power4.out',
            stagger: 0.09,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 88%', once: true },
          }),
      })
    })
    return () => {
      cancelled = true
      split?.revert()
    }
  }, [delay, immediate])

  return createElement(Tag, { ref, className }, children)
}

/** A lighter fade-up for paragraphs and small blocks. */
export function Fade({ as: Tag = 'div', className, children, delay = 0 }: Omit<Props, 'immediate'>) {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          window.setTimeout(() => el.classList.add('is-in'), delay * 1000)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay])
  return createElement(Tag, { ref, className, 'data-reveal': '' }, children)
}
