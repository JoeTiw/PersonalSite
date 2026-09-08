import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { prefersReducedMotion } from '../lib/scene-state'

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Rounded-corner mask, an idle breathing wave, a pointer ripple with a little chromatic split, and a glare.
const fragment = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uMouse;
  uniform vec2 uTexScale;
  uniform float uTime;
  uniform float uHover;
  uniform float uStrength;
  uniform float uIdle;

  float rrect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float sd = rrect(p, vec2(1.0), 0.08);
    if (sd > 0.0) discard;
    float aa = 1.0 - smoothstep(-0.012, 0.0, sd);

    vec2 uv = vUv;
    uv += vec2(sin(uv.y * 5.0 + uTime * 0.8), cos(uv.x * 4.0 + uTime * 0.7)) * 0.0035 * uIdle;

    vec2 dir = uv - uMouse;
    float d = length(dir);
    float ripple = sin(d * 38.0 - uTime * 7.0) * exp(-d * 5.5) * uStrength * 0.022;
    uv += normalize(dir + 1e-4) * ripple;

    vec2 tuv = (uv - 0.5) * uTexScale + 0.5;
    float shift = uStrength * 0.007;
    vec3 col;
    col.r = texture2D(uTex, tuv + vec2(shift, 0.0)).r;
    col.g = texture2D(uTex, tuv).g;
    col.b = texture2D(uTex, tuv - vec2(shift, 0.0)).b;

    float glare = pow(max(0.0, 1.0 - length(vUv - uMouse) * 1.6), 3.0) * 0.2 * uHover;
    col += glare;
    col *= 0.94 + 0.06 * (1.0 - length(p) * 0.5);

    gl_FragColor = vec4(col, aa);
    #include <colorspace_fragment>
  }
`

type SharedState = { px: number; py: number; hover: number; kick: number }

function Plane({ src, state }: { src: string; state: SharedState }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const { viewport } = useThree()
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  const reduced = useMemo(() => prefersReducedMotion(), [])

  useEffect(() => {
    let alive = true
    new THREE.TextureLoader().load(src, (t) => {
      if (!alive) { t.dispose(); return }
      t.colorSpace = THREE.SRGBColorSpace
      t.minFilter = THREE.LinearFilter
      t.anisotropy = 4
      setTex(t)
    })
    return () => { alive = false }
  }, [src])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        uniforms: {
          uTex: { value: null },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uTexScale: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uHover: { value: 0 },
          uStrength: { value: 0 },
          uIdle: { value: reduced ? 0 : 1 },
        },
      }),
    [reduced],
  )
  useEffect(() => () => material.dispose(), [material])

  // Plane fills most of the canvas, leaving room to tilt without clipping.
  const h = viewport.height * 0.9
  const w = h * 0.8

  useEffect(() => {
    if (!tex) return
    material.uniforms.uTex.value = tex
    const img = tex.image as { width: number; height: number }
    const texAspect = img.width / img.height
    const planeAspect = 0.8
    // cover-fit: scale uv so the image covers the plane
    const s = material.uniforms.uTexScale.value as THREE.Vector2
    if (texAspect > planeAspect) s.set(planeAspect / texAspect, 1)
    else s.set(1, texAspect / planeAspect)
  }, [tex, material])

  const smooth = useRef({ x: 0, y: 0, hover: 0, strength: 0, mx: 0.5, my: 0.5 })

  useFrame((s, dt) => {
    const u = material.uniforms
    const t = s.clock.elapsedTime
    const sm = smooth.current
    const k = 1 - Math.exp(-dt * 6)
    sm.x += (state.px - sm.x) * k
    sm.y += (state.py - sm.y) * k
    sm.hover += (state.hover - sm.hover) * k
    sm.mx += ((state.px + 1) / 2 - sm.mx) * k
    sm.my += ((1 - state.py) / 2 - sm.my) * k
    // ripple energy: pointer motion kicks it up, it decays on its own
    sm.strength += state.kick
    state.kick = 0
    sm.strength = Math.min(1, sm.strength) * Math.exp(-dt * 2.2)

    u.uTime.value = t
    u.uHover.value = sm.hover
    u.uStrength.value = reduced ? 0 : sm.strength
    ;(u.uMouse.value as THREE.Vector2).set(sm.mx, sm.my)

    const idle = reduced ? 0 : (1 - sm.hover) * 0.06
    const m = mesh.current
    m.rotation.y = sm.x * 0.28 + Math.sin(t * 0.5) * idle
    m.rotation.x = -sm.y * 0.22 + Math.cos(t * 0.4) * idle
    m.position.z = sm.hover * 0.08
  })

  return (
    <mesh ref={mesh} material={material}>
      <planeGeometry args={[w, h, 1, 1]} />
    </mesh>
  )
}

type Props = { src: string; caption: string }

/** The portrait as a tilting, rippling WebGL card. Renders only while on screen. */
export default function Portrait({ src, caption }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const chip = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)
  const state = useRef<SharedState>({ px: 0, py: 0, hover: 0, kick: 0 }).current

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    let lastX = 0, lastY = 0
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      state.px = Math.max(-1, Math.min(1, nx))
      state.py = Math.max(-1, Math.min(1, ny))
      state.hover = 1
      const v = Math.hypot(e.clientX - lastX, e.clientY - lastY)
      lastX = e.clientX; lastY = e.clientY
      state.kick += Math.min(0.25, v * 0.012)
      if (chip.current) chip.current.style.transform = `translate(${state.px * -8}px, ${state.py * -8}px)`
    }
    const enter = (e: PointerEvent) => { lastX = e.clientX; lastY = e.clientY; state.hover = 1 }
    const leave = () => {
      state.hover = 0
      state.px = 0
      state.py = 0
      if (chip.current) chip.current.style.transform = ''
    }
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('pointerup', leave)
    el.addEventListener('pointercancel', leave)
    return () => {
      io.disconnect()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('pointerup', leave)
      el.removeEventListener('pointercancel', leave)
    }
  }, [state])

  return (
    <div className="portrait" ref={wrap}>
      <Canvas
        dpr={[1, 2]}
        frameloop={active ? 'always' : 'never'}
        camera={{ position: [0, 0, 3], fov: 30, near: 0.1, far: 10 }}
        gl={{ antialias: true, alpha: true, stencil: false, powerPreference: 'high-performance' }}
      >
        <Plane src={src} state={state} />
      </Canvas>
      <figcaption className="mono portrait-chip" ref={chip}>{caption}</figcaption>
    </div>
  )
}
