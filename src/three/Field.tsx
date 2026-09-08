import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildFormations } from './formations'
import { FORMATIONS, sceneState } from '../lib/scene-state'

const INK = new THREE.Color('#33343c')
const INK_SOFT = new THREE.Color('#9092a0')
const ACCENT = new THREE.Color('#2141b8')

// Every formation is an instanced attribute; the vertex shader blends between neighbours
// by uF (chapter index + fraction), so the CPU does no per-particle work at all.
const vertex = /* glsl */ `
  attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3;
  attribute vec3 p4; attribute vec3 p5; attribute vec3 p6; attribute vec3 p7;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uF;
  uniform float uTime;
  uniform float uWobble;
  uniform float uSize;
  varying vec3 vColor;
  varying vec3 vNormal;

  float wgt(float k) { return smoothstep(0.0, 1.0, 1.0 - clamp(abs(uF - k), 0.0, 1.0)); }
  mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

  void main() {
    vec3 p = p0 * wgt(0.0) + p1 * wgt(1.0) + p2 * wgt(2.0) + p3 * wgt(3.0)
           + p4 * wgt(4.0) + p5 * wgt(5.0) + p6 * wgt(6.0) + p7 * wgt(7.0);
    float fr = fract(uF);
    p *= 1.0 + sin(fr * 3.14159) * 0.35;
    float ph = aSeed * 6.2832;
    p += vec3(sin(uTime * 0.7 + ph), cos(uTime * 0.55 + ph * 1.3), sin(uTime * 0.62 + ph * 0.7)) * uWobble;
    float s = (0.8 + aSeed * 0.6 + sin(uTime * 1.4 + ph) * 0.18) * uSize;
    mat3 r = rotY(ph + uTime * 0.15) * rotX(ph * 2.0);
    vec3 local = r * position * s;
    vNormal = normalMatrix * (r * normal);
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p + local, 1.0);
  }
`

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying vec3 vNormal;
  void main() {
    vec3 n = normalize(vNormal);
    float d = max(dot(n, normalize(vec3(0.4, 0.8, 0.6))), 0.0);
    float hemi = 0.5 + 0.5 * n.y;
    vec3 c = vColor * (0.5 + 0.3 * hemi + 0.35 * d);
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`

type Props = { count: number; mobile: boolean }

/** An instanced field of small polyhedra that morphs between one formation per chapter, entirely on the GPU. */
export function Field({ count, mobile }: Props) {
  const group = useRef<THREE.Group>(null!)
  const current = useRef(0)
  const rot = useRef({ x: 0, y: 0 })

  const { mesh, material } = useMemo(() => {
    const forms = buildFormations(count, 0)
    const base = new THREE.IcosahedronGeometry(0.03, 0)
    const geo = new THREE.InstancedBufferGeometry()
    geo.index = base.index
    geo.setAttribute('position', base.attributes.position)
    geo.setAttribute('normal', base.attributes.normal)
    geo.instanceCount = count
    forms.forEach((arr, k) => geo.setAttribute(`p${k}`, new THREE.InstancedBufferAttribute(arr, 3)))

    const seeds = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = Math.random()
      seeds[i] = r
      const c = r < 0.07 ? ACCENT : r < 0.55 ? INK_SOFT : INK
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3))

    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uF: { value: 0 },
        uTime: { value: 0 },
        uWobble: { value: 0.035 },
        uSize: { value: 1 },
      },
    })
    const mesh = new THREE.Mesh(geo, material)
    mesh.frustumCulled = false
    return { mesh, material }
  }, [count])

  useEffect(() => () => {
    mesh.geometry.dispose()
    material.dispose()
  }, [mesh, material])

  useFrame((state, dt) => {
    const reduced = sceneState.reducedMotion
    const target = THREE.MathUtils.clamp(sceneState.formation, 0, FORMATIONS.length - 1)
    current.current = reduced ? target : THREE.MathUtils.damp(current.current, target, 2.6, dt)
    material.uniforms.uF.value = current.current
    material.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime
    material.uniforms.uWobble.value = reduced ? 0 : 0.035

    // Keep the field in the right 45% of the viewport on desktop and centred on phones.
    const { width, height } = state.viewport
    const g = group.current
    const scale = mobile ? Math.min(0.7, height / 6) : Math.min(1, height / 5.4)
    g.scale.setScalar(scale)
    g.position.x = mobile ? 0 : width * 0.24
    g.position.y = mobile ? height * 0.12 : 0

    const px = reduced ? 0 : sceneState.pointer.x
    const py = reduced ? 0 : sceneState.pointer.y
    const idle = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.18) * 0.1
    rot.current.y = THREE.MathUtils.damp(rot.current.y, px * 0.28 + idle, 2, dt)
    rot.current.x = THREE.MathUtils.damp(rot.current.x, -py * 0.18, 2, dt)
    g.rotation.set(rot.current.x, rot.current.y, 0)
  })

  return (
    <group ref={group}>
      <primitive object={mesh} />
    </group>
  )
}
