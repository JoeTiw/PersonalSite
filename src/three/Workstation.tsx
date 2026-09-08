import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { CodeScreen } from './CodeScreen'
import { sceneState } from '../lib/scene-state'

const GRAPHITE = '#1b1c21'
const GRAPHITE_2 = '#2b2c33'
const SHELL = '#e9e8e2'
const KEY = '#f4f3ef'
const ACCENT = '#2141b8'

const KEY_ROWS = [14, 14, 13, 12]
const KEY_PITCH = 0.165
const KEY_SIZE = 0.14

type Props = { mobile: boolean }

/** A monitor, keyboard, mouse and mug built from primitives. The screen types code; the keys answer. */
export function Workstation({ mobile }: Props) {
  const rig = useRef<THREE.Group>(null!)
  const keys = useRef<THREE.InstancedMesh>(null!)
  const screen = useMemo(() => new CodeScreen(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const rot = useRef({ x: 0, y: 0 })

  // Key layout: four staggered rows plus a space bar handled as its own mesh.
  const keyPositions = useMemo(() => {
    const out: [number, number][] = []
    KEY_ROWS.forEach((n, r) => {
      const width = (n - 1) * KEY_PITCH
      for (let c = 0; c < n; c++) out.push([-width / 2 + c * KEY_PITCH, -0.27 + r * KEY_PITCH])
    })
    return out
  }, [])
  const pressed = useRef<Float32Array>(new Float32Array(keyPositions.length))

  useEffect(() => {
    keyPositions.forEach(([x, z], i) => {
      dummy.position.set(x, 0.05, z)
      dummy.updateMatrix()
      keys.current.setMatrixAt(i, dummy.matrix)
    })
    keys.current.instanceMatrix.needsUpdate = true
    return () => screen.dispose()
  }, [keyPositions, dummy, screen])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const reduced = sceneState.reducedMotion
    if (!reduced) screen.update(t)

    // Keys: a random key dips when a character lands, then eases back.
    const p = pressed.current
    if (screen.keyPressed) p[Math.floor(Math.random() * p.length)] = 1
    let any = false
    for (let i = 0; i < p.length; i++) {
      if (p[i] <= 0) continue
      any = true
      p[i] = Math.max(0, p[i] - dt * 6)
      const [x, z] = keyPositions[i]
      dummy.position.set(x, 0.05 - Math.sin(p[i] * Math.PI) * 0.03, z)
      dummy.updateMatrix()
      keys.current.setMatrixAt(i, dummy.matrix)
    }
    if (any) keys.current.instanceMatrix.needsUpdate = true

    // Pointer tilt, scroll drift, and viewport placement.
    const { width, height } = state.viewport
    const hp = sceneState.heroProgress
    const px = reduced ? 0 : sceneState.pointer.x
    const py = reduced ? 0 : sceneState.pointer.y
    rot.current.y = THREE.MathUtils.damp(rot.current.y, -0.42 + px * 0.22, 3, dt)
    rot.current.x = THREE.MathUtils.damp(rot.current.x, py * 0.08, 3, dt)
    const g = rig.current
    // Phones: small, in the open space above the title. Desktop: right of the title, a little above centre.
    const scale = mobile ? Math.min(0.46, width / 5.2) : Math.min(1, height / 5.6, width / 9)
    g.scale.setScalar(scale * (1 - hp * 0.25))
    g.rotation.set(rot.current.x + hp * 0.5, rot.current.y + hp * 0.6, 0)
    g.position.set(
      mobile ? 0 : width * 0.22,
      (mobile ? height * 0.27 : height * 0.05) - hp * height * 0.9,
      0,
    )
  })

  return (
    <group ref={rig}>
      <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.35} floatingRange={[-0.08, 0.08]}>
        <group position={[0, -0.75, 0]}>
          {/* monitor */}
          <group position={[0, 1.55, 0]}>
            <RoundedBox args={[3.3, 1.95, 0.09]} radius={0.04} smoothness={4}>
              <meshStandardMaterial color={GRAPHITE} roughness={0.5} metalness={0.15} />
            </RoundedBox>
            <mesh position={[0, 0, 0.047]}>
              <planeGeometry args={[3.12, 1.77]} />
              <meshBasicMaterial map={screen.texture} toneMapped={false} />
            </mesh>
            <mesh position={[0, -0.9, 0.047]}>
              <planeGeometry args={[0.16, 0.03]} />
              <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.6} />
            </mesh>
            {/* rear panel */}
            <RoundedBox args={[2.2, 1.2, 0.12]} radius={0.04} smoothness={3} position={[0, 0, -0.09]}>
              <meshStandardMaterial color={GRAPHITE_2} roughness={0.6} />
            </RoundedBox>
          </group>
          {/* stand */}
          <RoundedBox args={[0.22, 0.75, 0.16]} radius={0.03} smoothness={3} position={[0, 0.4, -0.12]}>
            <meshStandardMaterial color={GRAPHITE_2} roughness={0.55} />
          </RoundedBox>
          <RoundedBox args={[1.5, 0.06, 0.95]} radius={0.03} smoothness={3} position={[0, 0.03, -0.05]}>
            <meshStandardMaterial color={GRAPHITE} roughness={0.5} metalness={0.2} />
          </RoundedBox>

          {/* keyboard */}
          <group position={[0.1, 0.02, 1.35]} rotation={[-0.08, 0, 0]}>
            <RoundedBox args={[2.6, 0.09, 0.85]} radius={0.03} smoothness={3}>
              <meshStandardMaterial color={SHELL} roughness={0.7} />
            </RoundedBox>
            <instancedMesh ref={keys} args={[undefined, undefined, keyPositions.length]}>
              <boxGeometry args={[KEY_SIZE, 0.05, KEY_SIZE]} />
              <meshStandardMaterial color={KEY} roughness={0.75} />
            </instancedMesh>
            <mesh position={[0, 0.05, 0.4]}>
              <boxGeometry args={[0.95, 0.05, KEY_SIZE]} />
              <meshStandardMaterial color={KEY} roughness={0.75} />
            </mesh>
          </group>

          {/* mouse */}
          <RoundedBox args={[0.34, 0.13, 0.56]} radius={0.06} smoothness={4} position={[1.85, 0.06, 1.35]} rotation={[0, -0.25, 0]}>
            <meshStandardMaterial color={GRAPHITE_2} roughness={0.5} />
          </RoundedBox>

          {/* mug */}
          <group position={[-1.95, 0, 1.05]}>
            <mesh position={[0, 0.19, 0]}>
              <cylinderGeometry args={[0.17, 0.15, 0.38, 32]} />
              <meshStandardMaterial color={SHELL} roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.375, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.15, 32]} />
              <meshStandardMaterial color="#3b2a1e" roughness={0.3} />
            </mesh>
            <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.1, 0.028, 12, 24]} />
              <meshStandardMaterial color={SHELL} roughness={0.55} />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  )
}
