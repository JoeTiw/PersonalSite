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
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * 0.35)
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
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
