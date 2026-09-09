import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger, gsap, scrollToTarget } from '../lib/scroll'
import { useTheme } from '../lib/theme'

const links = [
  { href: '#story', label: 'Story' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  const bar = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)
  const [theme, toggleTheme] = useTheme()

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
      <div className="nav-right">
        <nav className="nav-links" aria-label="Sections">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)} data-cursor="link">
              {l.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          data-cursor="link"
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </button>
      </div>
      <div className="nav-progress" ref={bar} aria-hidden="true" />
    </header>
  )
}
