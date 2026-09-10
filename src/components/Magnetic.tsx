import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../lib/scroll'
import { scrollToTarget } from '../lib/scroll'

type Props = {
  href: string
  children: ReactNode
  primary?: boolean
  className?: string
}

/** A pill button that leans toward the pointer and snaps back when it leaves. */
export function Magnetic({ href, children, primary, className = '' }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(pointer: fine)').matches) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    let cx = 0
    let cy = 0
    const measure = () => {
      // Subtract the pull already applied, so we anchor to where the button rests.
      const gx = Number(gsap.getProperty(el, 'x')) || 0
      const gy = Number(gsap.getProperty(el, 'y')) || 0
      const r = el.getBoundingClientRect()
      cx = r.left + r.width / 2 - gx
      cy = r.top + r.height / 2 - gy
    }
    const enter = () => measure()
    const move = (e: MouseEvent) => {
      xTo((e.clientX - cx) * 0.35)
      yTo((e.clientY - cy) * 0.35)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])

  const internal = href.startsWith('#')
  return (
    <a
      ref={ref}
      href={href}
      className={`btn${primary ? ' is-primary' : ''} ${className}`.trim()}
      data-cursor="link"
      onClick={internal ? (e) => { e.preventDefault(); scrollToTarget(href) } : undefined}
      target={internal || href.startsWith('mailto:') ? undefined : '_blank'}
      rel={internal ? undefined : 'noreferrer'}
    >
      <span>{children}</span>
    </a>
  )
}
