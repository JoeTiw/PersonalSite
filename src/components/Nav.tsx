import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger, gsap, scrollToTarget } from '../lib/scroll'

const links = [
  { href: '#story', label: 'Story' },
  { href: '#neo', label: 'Neo Office' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  const bar = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => {
        gsap.set(bar.current, { scaleX: self.progress })
        const past = self.scroll() > 120
        setHidden(past && self.direction === 1)
      },
    })
    return () => st.kill()
  }, [])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    scrollToTarget(href, href === '#top' ? 0 : -8)
  }

  return (
    <header className={`nav${hidden ? ' is-hidden' : ''}`}>
      <a className="nav-name" href="#top" onClick={(e) => go(e, '#top')} data-cursor="link">
        Bhupin <span>Tiwari</span>
      </a>
      <nav className="nav-links" aria-label="Sections">
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)} data-cursor="link">
            {l.label}
          </a>
        ))}
      </nav>
      <div className="nav-progress" ref={bar} aria-hidden="true" />
    </header>
  )
}
