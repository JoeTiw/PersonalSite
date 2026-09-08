import { useEffect, useRef, useState } from 'react'
import { getLenis, gsap } from '../lib/scroll'
import { prefersReducedMotion } from '../lib/scene-state'

const TOTAL = 3.05 // seconds of flight before the curtain lifts
const TOUCHDOWN = 2.15

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3)

const PAPER = '#f4f3ef'
const INK = '#141519'
const GRAPHITE = '#2b2c33'
const GREY = '#cfcec7'
const ACCENT = '#2141b8'
const WHITE = '#fbfaf7'

/** Draws the 777 side-on in unit space: nose at x = -0.5, tail at x = 0.5, y down. */
function drawPlane(ctx: CanvasRenderingContext2D, gear: number, beaconOn: boolean) {
  const lw = 0.006
  // fin and stabiliser sit behind the fuselage
  ctx.fillStyle = ACCENT
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

    const t0 = performance.now()
    let raf = 0

    const finish = (fast = false) => {
      if (finished.current) return
      finished.current = true
      cancelAnimationFrame(raf)
      html.classList.remove('is-intro')
      getLenis()?.start()
      doneRef.current()
      gsap.to(el, {
        yPercent: -100,
        duration: fast ? 0.55 : 0.8,
        ease: 'power4.inOut',
        onComplete: () => setActive(false),
      })
    }

    const draw = () => {
      const e = (performance.now() - t0) / 1000
      const mobile = W < 768
      const S = mobile ? W * 0.66 : Math.min(W * 0.42, 560)
      const runwayY = mobile ? H * 0.58 : H * 0.64
      const gearH = S * 0.222
      const tdX = mobile ? W * 0.66 : W * 0.6

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = PAPER
      ctx.fillRect(0, 0, W, H)

      // runway draws in from the left, with touchdown-zone ticks
      const run = outCubic(clamp01(e / 0.55))
      ctx.strokeStyle = INK
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, runwayY + 0.5); ctx.lineTo(W * run, runwayY + 0.5); ctx.stroke()
      ctx.fillStyle = GREY
      for (let k = 0; k < 4; k++) {
        const x = tdX - 40 - k * 52
        if (x < W * run) { ctx.fillRect(x, runwayY + 6, 3, 14); ctx.fillRect(x + 8, runwayY + 6, 3, 14) }
      }

      // flight state
      let x: number, y: number, pitch: number, gear: number, spd: number, agl: number
      if (e < TOUCHDOWN) {
        const u = clamp01((e - 0.15) / (TOUCHDOWN - 0.15))
        const path = 1 - Math.pow(1 - u, 1.25)
        x = lerp(W * 1.12, tdX, path)
        const height = (mobile ? H * 0.38 : H * 0.46) * Math.pow(1 - u, 1.7)
        y = runwayY - gearH - height
        pitch = lerp(-0.05, 0.11, smooth(0.62, 1, u))
        gear = smooth(0.22, 0.5, u)
        spd = Math.round(lerp(142, 131, u))
        agl = Math.round(height / (mobile ? H * 0.38 : H * 0.46) * 420)
      } else {
        const v = clamp01((e - TOUCHDOWN) / (TOTAL - TOUCHDOWN))
        const roll = outCubic(v)
        x = lerp(tdX, mobile ? W * 0.42 : W * 0.24, roll)
        y = runwayY - gearH
        pitch = 0.11 * (1 - smooth(0, 0.45, v))
        gear = 1
        spd = Math.round(131 * (1 - roll))
        agl = 0
      }

      // shadow on the runway
      const aglN = clamp01((runwayY - gearH - y) / (H * 0.5))
      ctx.fillStyle = `rgba(20,21,25,${0.16 * (1 - aglN * 0.85)})`
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
          ctx.fillStyle = `rgba(150,150,145,${a})`
          ctx.beginPath(); ctx.arc(wx + age * 70 + i * 9 + wob, runwayY - 2 - age * 26 - i * 1.2, r, 0, Math.PI * 2); ctx.fill()
        }
      }

      // the aircraft
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(pitch)
      ctx.scale(S, S)
      drawPlane(ctx, gear, (e * 3) % 1 < 0.25)
      ctx.restore()

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
