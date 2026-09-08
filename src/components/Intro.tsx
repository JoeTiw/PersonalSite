import { useEffect, useRef, useState } from 'react'
import { getLenis, gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/scene-state'

const TOTAL = 3.25 // seconds of flight before the curtain lifts
const TOUCHDOWN = 2.15

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3)

type Palette = { paper: string; ink: string; rule: string; accent: string; dark: boolean }
const GRAPHITE = '#2b2c33'
const GREY = '#cfcec7'
const WHITE = '#fbfaf7'

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement)
  const tok = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
  return {
    paper: tok('--paper', '#f4f3ef'),
    ink: tok('--ink', '#141519'),
    rule: tok('--rule', '#d7d6ce'),
    accent: tok('--accent', '#2141b8'),
    dark: document.documentElement.dataset.theme === 'dark',
  }
}

/** Draws the 777 side-on in unit space: nose at x = -0.5, tail at x = 0.5, y down. */
function drawPlane(ctx: CanvasRenderingContext2D, gear: number, beaconOn: boolean, pal: Palette) {
  const lw = 0.006
  const INK = pal.dark ? '#0b0c10' : '#141519'
  // fin and stabiliser sit behind the fuselage
  ctx.fillStyle = pal.accent
  ctx.beginPath(); ctx.moveTo(0.29, -0.07); ctx.lineTo(0.44, -0.3); ctx.lineTo(0.52, -0.3); ctx.lineTo(0.5, -0.07); ctx.closePath(); ctx.fill()
  ctx.fillStyle = GREY
  ctx.beginPath(); ctx.moveTo(0.4, -0.06); ctx.lineTo(0.57, -0.11); ctx.lineTo(0.59, -0.085); ctx.lineTo(0.5, -0.055); ctx.closePath(); ctx.fill()

  // gear (drawn before the body so the struts appear to come out of it)
  if (gear > 0) {
    ctx.strokeStyle = GRAPHITE
    ctx.lineWidth = 0.014
    ctx.lineCap = 'round'
    const nose = 0.14 * gear
    const main = 0.095 * gear
    ctx.beginPath(); ctx.moveTo(-0.33, 0.06); ctx.lineTo(-0.33, 0.06 + nose); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0.02, 0.1); ctx.lineTo(0.02, 0.1 + main); ctx.stroke()
    ctx.fillStyle = INK
    ctx.beginPath(); ctx.arc(-0.33, 0.06 + nose, 0.02 * gear, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(0.0, 0.1 + main, 0.027 * gear, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(0.045, 0.1 + main, 0.027 * gear, 0, Math.PI * 2); ctx.fill()
  }

  // fuselage
  const body = () => {
    ctx.beginPath()
    ctx.moveTo(-0.5, 0)
    ctx.quadraticCurveTo(-0.5, -0.075, -0.4, -0.075)
    ctx.lineTo(0.3, -0.075)
    ctx.quadraticCurveTo(0.44, -0.075, 0.5, -0.06)
    ctx.lineTo(0.5, -0.025)
    ctx.quadraticCurveTo(0.36, 0.04, 0.16, 0.075)
    ctx.lineTo(-0.4, 0.075)
    ctx.quadraticCurveTo(-0.5, 0.075, -0.5, 0)
    ctx.closePath()
  }
  body(); ctx.fillStyle = WHITE; ctx.fill()
  ctx.save(); body(); ctx.clip()
  ctx.fillStyle = GRAPHITE; ctx.fillRect(-0.6, 0.038, 1.2, 0.1)
  ctx.restore()
  body(); ctx.strokeStyle = GRAPHITE; ctx.lineWidth = lw; ctx.stroke()

  // windows and cockpit
  ctx.fillStyle = INK
  ctx.beginPath(); ctx.roundRect(-0.35, -0.046, 0.6, 0.02, 0.01); ctx.fill()
  ctx.beginPath(); ctx.moveTo(-0.465, -0.03); ctx.lineTo(-0.39, -0.062); ctx.lineTo(-0.36, -0.062); ctx.lineTo(-0.42, -0.028); ctx.closePath(); ctx.fill()

  // wing and engine (foreshortened, this side)
  ctx.fillStyle = GREY
  ctx.beginPath(); ctx.moveTo(-0.12, 0.02); ctx.lineTo(0.3, 0.095); ctx.lineTo(0.34, 0.075); ctx.lineTo(-0.04, -0.002); ctx.closePath(); ctx.fill()
  ctx.strokeStyle = GRAPHITE; ctx.lineWidth = lw * 0.7; ctx.stroke()
  ctx.fillStyle = GRAPHITE
  ctx.beginPath(); ctx.roundRect(-0.21, 0.06, 0.23, 0.095, 0.035); ctx.fill()
  ctx.fillStyle = INK
  ctx.beginPath(); ctx.ellipse(-0.205, 0.107, 0.014, 0.046, 0, 0, Math.PI * 2); ctx.fill()

  // beacon
  ctx.fillStyle = beaconOn ? '#ff3b30' : '#7a2a26'
  ctx.beginPath(); ctx.arc(0.04, -0.082, 0.011, 0, Math.PI * 2); ctx.fill()
}

function shouldPlay() {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion()) return false
  if (window.location.hash) return false
  return true
}

type Props = { onDone: () => void }

/** A four-second arrival: the 777 lands on a runway that becomes the hero baseline, then the curtain lifts. */
export function Intro({ onDone }: Props) {
  const [active, setActive] = useState(shouldPlay)
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const speed = useRef<HTMLSpanElement>(null)
  const alt = useRef<HTMLSpanElement>(null)
  const msg = useRef<HTMLParagraphElement>(null)
  const greeted = useRef(false)
  const finished = useRef(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (!active) {
      doneRef.current()
      return
    }
    const el = root.current!
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const html = document.documentElement
    html.classList.add('is-intro')
    window.scrollTo(0, 0)

    let W = 0, H = 0, dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const pal = readPalette()
    const t0 = performance.now()
    let raf = 0

    const finish = (fast = false) => {
      if (finished.current) return
      finished.current = true
      cancelAnimationFrame(raf)
      html.classList.remove('is-intro')
      getLenis()?.start()
      doneRef.current()
      const k = fast ? 0.7 : 1
      const chrome = el.querySelectorAll('.intro-hud, .intro-skip, .intro-msg')
      const page = document.querySelector<HTMLElement>('.content')
      const nav = document.querySelector<HTMLElement>('.nav')
      const tl = gsap.timeline({ onComplete: () => setActive(false) })
      tl.to(chrome, { opacity: 0, duration: 0.25 * k, ease: 'power2.out' }, 0)
        .to(cv, { opacity: 0, duration: 0.5 * k, ease: 'power2.in' }, 0.1 * k)
        .fromTo(el, { borderRadius: '0 0 0 0' }, { borderRadius: '0 0 50% 50% / 0 0 14vh 14vh', duration: 0.45 * k, ease: 'power2.out' }, 0.15 * k)
        .to(el, { borderRadius: '0 0 50% 50% / 0 0 0vh 0vh', duration: 0.5 * k, ease: 'power2.in' }, 0.6 * k)
        .to(el, { yPercent: -100, duration: 1.0 * k, ease: 'power3.inOut' }, 0.15 * k)
      if (page) tl.fromTo(page, { y: '9vh' }, { y: 0, duration: 1.0 * k, ease: 'power3.inOut', clearProps: 'transform' }, 0.15 * k)
      if (nav) tl.fromTo(nav, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 * k, ease: 'power3.out', clearProps: 'opacity,transform' }, 0.75 * k)
    }

    const draw = () => {
      const e = (performance.now() - t0) / 1000
      const mobile = W < 768
      const S = mobile ? W * 0.66 : Math.min(W * 0.42, 560)
      const runwayY = mobile ? H * 0.58 : H * 0.64
      const gearH = S * 0.222

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = pal.paper
      ctx.fillRect(0, 0, W, H)

      const x0 = W * 1.18
      const xEnd = mobile ? W * 0.38 : W * 0.3
      const tdP = TOUCHDOWN / TOTAL
      const tdX = lerp(x0, xEnd, 1 - Math.pow(1 - tdP, 1.8))

      // runway draws in from the left, with touchdown-zone ticks
      const run = outCubic(clamp01(e / 0.55))
      ctx.strokeStyle = pal.ink
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, runwayY + 0.5); ctx.lineTo(W * run, runwayY + 0.5); ctx.stroke()
      ctx.fillStyle = pal.rule
      for (let k = 0; k < 4; k++) {
        const x = tdX - 40 - k * 52
        if (x < W * run) { ctx.fillRect(x, runwayY + 6, 3, 14); ctx.fillRect(x + 8, runwayY + 6, 3, 14) }
      }

      // flight state: one continuous easing for x so nothing jumps at touchdown
      const p = clamp01(e / TOTAL)
      const glide = 1 - Math.pow(1 - p, 1.8)
      const x = lerp(x0, xEnd, glide)
      const H0 = mobile ? H * 0.36 : H * 0.44
      let y: number, pitch: number, gear: number, spd: number, agl: number
      if (e < TOUCHDOWN) {
        const u = clamp01((e - 0.1) / (TOUCHDOWN - 0.1))
        const height = H0 * Math.pow(1 - u, 1.75)
        const bob = Math.sin(e * 4.2) * 3 * (1 - u)
        y = runwayY - gearH - height + bob
        pitch = lerp(-0.045, 0.1, smooth(0.6, 1, u)) + Math.sin(e * 2.6) * 0.008 * (1 - u)
        gear = smooth(0.2, 0.5, u)
        spd = Math.round(lerp(142, 131, u))
        agl = Math.round((height / H0) * 420)
      } else {
        const t = e - TOUCHDOWN
        const v = clamp01(t / (TOTAL - TOUCHDOWN))
        const squash = Math.sin(Math.PI * clamp01(t / 0.4)) * 5 * (1 - clamp01(t / 0.4))
        y = runwayY - gearH + squash
        pitch = 0.1 * (1 - smooth(0, 0.55, v)) - 0.012 * Math.sin(Math.PI * clamp01(t / 0.6))
        gear = 1
        spd = Math.round(131 * Math.pow(1 - v, 1.4))
        agl = 0
      }

      // shadow on the runway
      const aglN = clamp01((runwayY - gearH - y) / (H * 0.5))
      ctx.fillStyle = `${pal.dark ? 'rgba(0,0,0,' : 'rgba(20,21,25,'}${(pal.dark ? 0.45 : 0.16) * (1 - aglN * 0.85)})`
      ctx.beginPath(); ctx.ellipse(x, runwayY + 2, S * 0.42 * (1 - aglN * 0.4), 4 + 4 * (1 - aglN), 0, 0, Math.PI * 2); ctx.fill()

      // touchdown smoke: small puffs off the main wheels, drifting back and up
      if (e >= TOUCHDOWN) {
        const wx = tdX + S * 0.02
        for (let i = 0; i < 14; i++) {
          const age = e - TOUCHDOWN - i * 0.03
          if (age <= 0 || age > 0.9) continue
          const a = Math.max(0, 0.26 * (1 - age / 0.85))
          const r = 2 + age * 26 * (S / 420) + i * 0.6
          const wob = Math.sin(i * 1.7) * 6
          ctx.fillStyle = `${pal.dark ? 'rgba(200,200,205,' : 'rgba(150,150,145,'}${a})`
          ctx.beginPath(); ctx.arc(wx + age * 70 + i * 9 + wob, runwayY - 2 - age * 26 - i * 1.2, r, 0, Math.PI * 2); ctx.fill()
        }
      }

      // the aircraft
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(pitch)
      ctx.scale(S, S)
      drawPlane(ctx, gear, (e * 3) % 1 < 0.25, pal)
      ctx.restore()

      // the greeting lands a beat after the wheels do
      if (e >= TOUCHDOWN + 0.12 && !greeted.current && msg.current) {
        greeted.current = true
        gsap.fromTo(msg.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' })
      }

      if (speed.current) speed.current.textContent = `${String(spd).padStart(3, '0')} KT`
      if (alt.current) alt.current.textContent = `${String(agl).padStart(3, '0')} FT`

      if (e >= TOTAL) finish()
      else raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    const skip = () => finish(true)
    const onKey = (ev: KeyboardEvent) => { if (!ev.metaKey && !ev.ctrlKey) skip() }
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('touchmove', skip, { passive: true })
    window.addEventListener('keydown', onKey)
    el.addEventListener('pointerdown', skip)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchmove', skip)
      window.removeEventListener('keydown', onKey)
      el.removeEventListener('pointerdown', skip)
      html.classList.remove('is-intro')
    }
  }, [active])

  if (!active) return null
  return (
    <div className="intro" ref={root} role="presentation">
      <canvas ref={canvas} aria-hidden="true" />
      <p className="intro-msg" ref={msg}>
        You’ve landed <em>successfully</em> on Bhupin’s website.
      </p>
      <div className="intro-hud mono" aria-hidden="true">
        <span className="intro-hud-k">ATW · RWY 03 · CLEARED TO LAND</span>
        <span className="intro-hud-v"><span ref={speed}>142 KT</span> · <span ref={alt}>420 FT</span></span>
      </div>
      <button type="button" className="intro-skip mono" onClick={() => finishFromButton(root)}>
        Skip <i />
      </button>
    </div>
  )
}

/** The button sits inside the overlay, so its pointerdown already triggers the skip; this keeps keyboard users covered. */
function finishFromButton(root: React.RefObject<HTMLDivElement | null>) {
  root.current?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
}
