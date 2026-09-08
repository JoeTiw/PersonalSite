import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'theme'
const EVENT = 'themechange'

export const systemTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'dark' || v === 'light' ? v : null
  } catch {
    return null
  }
}

export function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  const stamped = document.documentElement.dataset.theme
  if (stamped === 'dark' || stamped === 'light') return stamped
  return storedTheme() ?? systemTheme()
}

/** Stamps the theme on <html>, updates the browser chrome colour, and (optionally) remembers it. */
export function applyTheme(theme: Theme, persist = true) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121317' : '#f4f3ef')
  if (persist) {
    try { localStorage.setItem(KEY, theme) } catch { /* private mode */ }
  }
  window.dispatchEvent(new CustomEvent<Theme>(EVENT, { detail: theme }))
}

/** Current theme plus a toggle. Follows the OS until the visitor picks one themselves. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(currentTheme)
  useEffect(() => {
    const onChange = (e: Event) => setTheme((e as CustomEvent<Theme>).detail)
    window.addEventListener(EVENT, onChange)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystem = () => { if (!storedTheme()) applyTheme(mq.matches ? 'dark' : 'light', false) }
    mq.addEventListener('change', onSystem)
    return () => {
      window.removeEventListener(EVENT, onChange)
      mq.removeEventListener('change', onSystem)
    }
  }, [])
  const toggle = useCallback(() => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'), [])
  return [theme, toggle]
}
