import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Field } from './Field'
import { sceneState } from '../lib/scene-state'
import { useIsMobile } from '../lib/useMedia'

/** Full-viewport, fixed canvas that sits behind the page content. */
export default function Scene() {
  const mobile = useIsMobile()
  const count = mobile ? 900 : 2200

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      sceneState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7.6], fov: 38, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
      >
        <Field count={count} mobile={mobile} />
      </Canvas>
    </div>
  )
}
