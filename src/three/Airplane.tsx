import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneState } from '../lib/scene-state'

const WHITE = '#f3f2ee'
const GREY = '#d6d5cf'
const GRAPHITE = '#2b2c33'
const DARK = '#15161b'
const ACCENT = '#2141b8'

/** Wing planform in (chord x, span y); extruded thin and rotated flat. `sign` mirrors it. */
function wingShape(sign: 1 | -1, rootLE: number, rootChord: number, span: number, sweep: number, tipChord: number) {
  const s = new THREE.Shape()
  s.moveTo(rootLE, 0)
  s.lineTo(rootLE - rootChord, 0)
  s.lineTo(rootLE - sweep - tipChord, sign * span)
  s.lineTo(rootLE - sweep, sign * span)
  s.closePath()
  return s
}

const extrude = { depth: 0.06, bevelEnabled: false }

function Wing({ sign, y, dihedral, ...rest }: { sign: 1 | -1; y: number; dihedral: number; rootLE: number; rootChord: number; span: number; sweep: number; tipChord: number; color: string }) {
  const geo = useMemo(
    () => new THREE.ExtrudeGeometry(wingShape(sign, rest.rootLE, rest.rootChord, rest.span, rest.sweep, rest.tipChord), extrude),
    [sign, rest.rootLE, rest.rootChord, rest.span, rest.sweep, rest.tipChord],
  )
  return (
    <group rotation={[sign * dihedral, 0, 0]} position={[0, y, 0]}>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={rest.color} roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  )
}

function Engine({ z }: { z: number }) {
  return (
    <group position={[-0.25, -0.27, z]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.125, 0.11, 0.6, 24]} />
        <meshStandardMaterial color={GRAPHITE} roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0.31, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 24]} />
        <meshStandardMaterial color={DARK} roughness={0.9} />
      </mesh>
      <mesh position={[0.05, 0.16, 0]}>
        <boxGeometry args={[0.3, 0.14, 0.05]} />
        <meshStandardMaterial color={GREY} roughness={0.6} />
      </mesh>
    </group>
  )
}

const finShape = (() => {
  const s = new THREE.Shape()
  s.moveTo(-1.1, 0.12)
  s.lineTo(-1.85, 0.12)
  s.lineTo(-2.05, 0.8)
  s.lineTo(-1.72, 0.8)
  s.closePath()
  return s
})()

const TRAIL = 46
const dummy = new THREE.Object3D()
const p0 = new THREE.Vector3()
const p1 = new THREE.Vector3()
const p2 = new THREE.Vector3()
const tmp = new THREE.Vector3()
const tan = new THREE.Vector3()

function bezier(t: number, out: THREE.Vector3) {
  const u = 1 - t
  return out.set(
    u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    0,
  )
}

type Props = { mobile: boolean }

/** A twin-engine airliner that flies a curved climb across the viewport as the chapter scrolls. */
export function Airplane({ mobile }: Props) {
  const rig = useRef<THREE.Group>(null!)
  const beacon = useRef<THREE.Mesh>(null!)
  const strobeL = useRef<THREE.Mesh>(null!)
  const strobeR = useRef<THREE.Mesh>(null!)
  const trail = useRef<THREE.InstancedMesh>(null!)
  const smooth = useRef(0)
  const finGeo = useMemo(() => new THREE.ExtrudeGeometry(finShape, { depth: 0.05, bevelEnabled: false }), [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const { width: W, height: H } = state.viewport
    const target = sceneState.flightProgress
    smooth.current = sceneState.reducedMotion ? target : THREE.MathUtils.damp(smooth.current, target, 4, dt)
    const p = THREE.MathUtils.clamp(smooth.current, 0, 1)

    // Flight path: low on the left, climbing out top-right.
    if (mobile) {
      p0.set(-W * 0.62, -H * 0.3, 0)
      p1.set(W * 0.05, -H * 0.2, 0)
      p2.set(W * 0.7, H * 0.42, 0)
    } else {
      p0.set(-W * 0.3, -H * 0.5, 0)
      p1.set(W * 0.22, -H * 0.3, 0)
      p2.set(W * 0.58, H * 0.6, 0)
    }
    const scale = mobile ? Math.min(0.55, W / 6) : Math.min(1, W / 12, H / 6)

    bezier(p, tmp)
    bezier(Math.min(1, p + 0.01), tan).sub(tmp).normalize()
    const g = rig.current
    g.position.copy(tmp)
    g.scale.setScalar(scale)
    const pitch = Math.atan2(tan.y, tan.x)
    const bank = Math.sin(p * Math.PI) * 0.55
    const yaw = -0.5 + Math.sin(p * Math.PI) * 0.25
    g.rotation.set(bank * 0.8, yaw, pitch, 'ZYX')
    g.position.y += Math.sin(t * 1.3) * 0.03 * scale

    // Lights: red beacon slow, white strobes double-flash.
    const b = beacon.current.material as THREE.MeshStandardMaterial
    b.emissiveIntensity = (t * 1.2) % 1 < 0.15 ? 6 : 0.2
    const s = (t * 1.5) % 1
    const strobe = s < 0.05 || (s > 0.12 && s < 0.17) ? 8 : 0
    ;(strobeL.current.material as THREE.MeshStandardMaterial).emissiveIntensity = strobe
    ;(strobeR.current.material as THREE.MeshStandardMaterial).emissiveIntensity = strobe

    // Contrails: two rows of puffs behind the engines, older ones wider.
    const m = trail.current
    for (let i = 0; i < TRAIL; i++) {
      const side = i % 2 === 0 ? 1 : -1
      const k = Math.floor(i / 2)
      const tp = p - 0.012 - k * 0.018
      if (tp <= 0) {
        dummy.scale.setScalar(0)
      } else {
        bezier(tp, dummy.position)
        dummy.position.z = side * 0.75 * scale * Math.cos(yaw)
        dummy.position.y -= 0.27 * scale
        const age = k / (TRAIL / 2)
        dummy.scale.setScalar(scale * (0.03 + age * 0.075))
      }
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <group ref={rig}>
        {/* fuselage */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 2.3, 28]} />
          <meshStandardMaterial color={WHITE} roughness={0.4} metalness={0.05} />
        </mesh>
        <mesh position={[1.15, 0, 0]} scale={[1.9, 1, 1]}>
          <sphereGeometry args={[0.22, 28, 20]} />
          <meshStandardMaterial color={WHITE} roughness={0.4} metalness={0.05} />
        </mesh>
        <mesh position={[-1.68, 0.06, 0]} rotation={[0, 0, Math.PI / 2 + 0.12]}>
          <coneGeometry args={[0.22, 1.1, 28]} />
          <meshStandardMaterial color={WHITE} roughness={0.4} metalness={0.05} />
        </mesh>
        {/* window band and cockpit */}
        <mesh position={[0.05, 0.06, 0]}>
          <boxGeometry args={[2.1, 0.035, 0.452]} />
          <meshStandardMaterial color={DARK} roughness={0.6} />
        </mesh>
        <mesh position={[1.22, 0.08, 0]}>
          <boxGeometry args={[0.22, 0.07, 0.4]} />
          <meshStandardMaterial color={DARK} roughness={0.5} />
        </mesh>
        {/* belly and cheatline in graphite */}
        <mesh position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 2.2, 28]} />
          <meshStandardMaterial color={GRAPHITE} roughness={0.5} />
        </mesh>
        {/* wings */}
        <Wing sign={1} y={-0.1} dihedral={0.09} rootLE={0.4} rootChord={0.95} span={1.85} sweep={0.75} tipChord={0.28} color={GREY} />
        <Wing sign={-1} y={-0.1} dihedral={0.09} rootLE={0.4} rootChord={0.95} span={1.85} sweep={0.75} tipChord={0.28} color={GREY} />
        {/* stabilizers */}
        <Wing sign={1} y={0.14} dihedral={0.12} rootLE={-1.35} rootChord={0.45} span={0.7} sweep={0.32} tipChord={0.18} color={GREY} />
        <Wing sign={-1} y={0.14} dihedral={0.12} rootLE={-1.35} rootChord={0.45} span={0.7} sweep={0.32} tipChord={0.18} color={GREY} />
        <mesh geometry={finGeo} position={[0, 0, -0.025]}>
          <meshStandardMaterial color={ACCENT} roughness={0.45} />
        </mesh>
        <Engine z={0.78} />
        <Engine z={-0.78} />
        {/* lights */}
        <mesh ref={beacon} position={[-0.3, 0.24, 0]}>
          <sphereGeometry args={[0.03, 10, 8]} />
          <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={0.2} />
        </mesh>
        <mesh ref={strobeL} position={[-0.35, -0.02, 1.85]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0} />
        </mesh>
        <mesh ref={strobeR} position={[-0.35, -0.02, -1.85]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0} />
        </mesh>
      </group>
      <instancedMesh ref={trail} args={[undefined, undefined, TRAIL]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.38} roughness={1} depthWrite={false} />
      </instancedMesh>
    </>
  )
}
