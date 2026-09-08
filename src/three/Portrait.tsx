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

type SharedState = { px: number; py: number; hover: number; kick: number; strength: number; card: THREE.Mesh | null }

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

  // The card takes the upper part of the canvas; the toy holding it lives underneath.
  const h = viewport.height * 0.7
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
    state.strength = sm.strength

    u.uTime.value = t
    u.uHover.value = sm.hover
    u.uStrength.value = reduced ? 0 : sm.strength
    ;(u.uMouse.value as THREE.Vector2).set(sm.mx, sm.my)

    const idle = reduced ? 0 : (1 - sm.hover) * 0.06
    const m = mesh.current
    m.rotation.y = sm.x * 0.28 + Math.sin(t * 0.5) * idle
    m.rotation.x = -sm.y * 0.22 + Math.cos(t * 0.4) * idle
    m.position.z = sm.hover * 0.08
    m.position.y = 0.2
    state.card = m
  })

  return (
    <mesh ref={mesh} material={material}>
      <planeGeometry args={[w, h, 1, 1]} />
      <mesh name="handL" position={[-w * 0.36, -h / 2 + 0.035, 0.03]}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      <mesh name="handR" position={[w * 0.36, -h / 2 + 0.035, 0.03]}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
    </mesh>
  )
}

const SKIN = '#f0c6a3'
const HAIR = '#1f1a17'
const SHIRT = '#2141b8'
const PANTS = '#2b2c33'
const SHOE = '#141519'
const CHEEK = '#f2a1a1'
const UP = new THREE.Vector3(0, 1, 0)
const tmpA = new THREE.Vector3()
const tmpB = new THREE.Vector3()
const tmpD = new THREE.Vector3()
const tmpQ = new THREE.Quaternion()

/** Stretches a unit cylinder between two world points. */
function stretch(limb: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3) {
  tmpD.subVectors(to, from)
  const len = Math.max(0.001, tmpD.length())
  limb.position.copy(from).addScaledVector(tmpD, 0.5)
  limb.quaternion.copy(tmpQ.setFromUnitVectors(UP, tmpD.normalize()))
  limb.scale.set(1, len, 1)
}

/** A small toy figure standing under the card, arms up, holding its bottom corners. */
function Holder({ state }: { state: SharedState }) {
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Mesh>(null!)
  const armR = useRef<THREE.Mesh>(null!)
  const eyeL = useRef<THREE.Mesh>(null!)
  const eyeR = useRef<THREE.Mesh>(null!)
  const smile = useRef<THREE.Mesh>(null!)
  const oh = useRef<THREE.Mesh>(null!)
  const blink = useRef({ next: 2.5, until: 0 })
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const feetY = -0.79
  const shoulderY = feetY + 0.34

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const card = state.card
    const g = body.current
    // lean into the tilt to keep balance, and breathe
    const lean = card ? card.rotation.y * 0.35 : 0
    g.rotation.z += (lean - g.rotation.z) * (1 - Math.exp(-dt * 5))
    const breathe = reduced ? 1 : 1 + Math.sin(t * 1.6) * 0.012
    g.scale.set(1, breathe, 1)

    // arms reach the hands, which ride on the card
    if (card) {
      const hl = card.getObjectByName('handL')
      const hr = card.getObjectByName('handR')
      if (hl && hr) {
        // hands live on the card; bring them into this group's space so the arms meet them exactly
        root.current.worldToLocal(hl.getWorldPosition(tmpA))
        stretch(armL.current, tmpB.set(-0.095, shoulderY - 0.02, 0), tmpA)
        root.current.worldToLocal(hr.getWorldPosition(tmpA))
        stretch(armR.current, tmpB.set(0.095, shoulderY - 0.02, 0), tmpA)
      }
    }

    // face: eyes track the pointer, blink now and then, gasp when the picture ripples
    const wow = state.strength > 0.18 ? 1 : 0
    const ex = state.px * 0.008
    const ey = state.py * -0.006 + 0.004 * state.hover
    eyeL.current.position.x = -0.036 + ex
    eyeR.current.position.x = 0.036 + ex
    eyeL.current.position.y = eyeR.current.position.y = 0.012 + ey
    const eyeScale = 1 + wow * 0.35
    let blinkScale = 1
    if (!reduced) {
      if (t > blink.current.next) { blink.current.until = t + 0.12; blink.current.next = t + 2.4 + Math.random() * 3 }
      if (t < blink.current.until) blinkScale = 0.1
    }
    eyeL.current.scale.set(eyeScale, eyeScale * blinkScale, eyeScale)
    eyeR.current.scale.set(eyeScale, eyeScale * blinkScale, eyeScale)
    smile.current.visible = !wow
    oh.current.visible = !!wow
    head.current.rotation.z = -lean * 0.6
    head.current.position.y = shoulderY + 0.135 + (wow ? 0.01 : 0)
  })

  return (
    <group ref={root} position={[0, 0, 0.2]}>
      <group ref={body}>
        {/* legs and shoes */}
        <mesh position={[-0.05, feetY + 0.075, 0]}>
          <capsuleGeometry args={[0.028, 0.09, 6, 12]} />
          <meshStandardMaterial color={PANTS} roughness={0.8} />
        </mesh>
        <mesh position={[0.05, feetY + 0.075, 0]}>
          <capsuleGeometry args={[0.028, 0.09, 6, 12]} />
          <meshStandardMaterial color={PANTS} roughness={0.8} />
        </mesh>
        <mesh position={[-0.05, feetY + 0.015, 0.015]}>
          <sphereGeometry args={[0.034, 14, 10]} />
          <meshStandardMaterial color={SHOE} roughness={0.6} />
        </mesh>
        <mesh position={[0.05, feetY + 0.015, 0.015]}>
          <sphereGeometry args={[0.034, 14, 10]} />
          <meshStandardMaterial color={SHOE} roughness={0.6} />
        </mesh>
        {/* torso */}
        <mesh position={[0, feetY + 0.23, 0]}>
          <capsuleGeometry args={[0.085, 0.12, 8, 16]} />
          <meshStandardMaterial color={SHIRT} roughness={0.75} />
        </mesh>
        {/* head */}
        <group ref={head} position={[0, shoulderY + 0.135, 0]}>
          <mesh>
            <sphereGeometry args={[0.1, 24, 18]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.012, -0.01]} rotation={[-0.35, 0, 0]}>
            <sphereGeometry args={[0.105, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color={HAIR} roughness={0.9} />
          </mesh>
          <mesh ref={eyeL} position={[-0.036, 0.012, 0.09]}>
            <sphereGeometry args={[0.013, 12, 10]} />
            <meshStandardMaterial color={SHOE} roughness={0.4} />
          </mesh>
          <mesh ref={eyeR} position={[0.036, 0.012, 0.09]}>
            <sphereGeometry args={[0.013, 12, 10]} />
            <meshStandardMaterial color={SHOE} roughness={0.4} />
          </mesh>
          <mesh position={[-0.06, -0.015, 0.078]}>
            <sphereGeometry args={[0.014, 10, 8]} />
            <meshStandardMaterial color={CHEEK} roughness={1} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.06, -0.015, 0.078]}>
            <sphereGeometry args={[0.014, 10, 8]} />
            <meshStandardMaterial color={CHEEK} roughness={1} transparent opacity={0.7} />
          </mesh>
          <mesh ref={smile} position={[0, -0.03, 0.094]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.024, 0.005, 8, 16, Math.PI]} />
            <meshStandardMaterial color={SHOE} roughness={0.6} />
          </mesh>
          <mesh ref={oh} position={[0, -0.034, 0.094]} visible={false}>
            <torusGeometry args={[0.013, 0.006, 8, 16]} />
            <meshStandardMaterial color={SHOE} roughness={0.6} />
          </mesh>
        </group>
      </group>
      {/* arms are placed in world space each frame */}
      <mesh ref={armL}>
        <cylinderGeometry args={[0.024, 0.026, 1, 10]} />
        <meshStandardMaterial color={SHIRT} roughness={0.75} />
      </mesh>
      <mesh ref={armR}>
        <cylinderGeometry args={[0.024, 0.026, 1, 10]} />
        <meshStandardMaterial color={SHIRT} roughness={0.75} />
      </mesh>
    </group>
  )
}

type Props = { src: string; caption: string }

/** The portrait as a tilting, rippling WebGL card. Renders only while on screen. */
export default function Portrait({ src, caption }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const chip = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)
  const state = useRef<SharedState>({ px: 0, py: 0, hover: 0, kick: 0, strength: 0, card: null }).current

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
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 4]} intensity={1.6} />
        <directionalLight position={[-3, 1, 2]} intensity={0.5} color="#dfe6ff" />
        <Plane src={src} state={state} />
        <Holder state={state} />
      </Canvas>
      <figcaption className="mono portrait-chip" ref={chip}>{caption}</figcaption>
    </div>
  )
}
