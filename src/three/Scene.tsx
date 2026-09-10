import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { Workstation } from './Workstation'
import { ScrollTrigger } from '../lib/scroll'
import { sceneState } from '../lib/scene-state'
import { useIsMobile } from '../lib/useMedia'
import { useTheme } from '../lib/theme'
import { useNearViewport } from '../lib/useNearViewport'

/** Fixed canvas behind the hero. Stops rendering once the hero has scrolled away. */
export default function Scene() {
  const mobile = useIsMobile()
  const [theme] = useTheme()
  const dark = theme === 'dark'
  const [active, setActive] = useState(true)
  const [hero, setHero] = useState<Element | null>(null)
  const near = useNearViewport(hero)

  useEffect(() => {
    setHero(document.querySelector('.hero'))
    const onMove = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      sceneState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const st = ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onLeave: () => setActive(false),
      onEnterBack: () => setActive(true),
    })
    return () => {
      window.removeEventListener('pointermove', onMove)
      st.kill()
    }
  }, [])

  return (
    <div className={`scene${active ? '' : ' is-hidden'}`} aria-hidden="true">
      {near && (
      <Canvas
        dpr={[1, 1.5]}
        frameloop={active ? 'always' : 'never'}
        camera={{ position: [0, 1.6, 8.4], fov: 30, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
        onCreated={({ camera }) => camera.lookAt(0, 0.4, 0)}
      >
        <hemisphereLight args={[dark ? '#e4e7f2' : '#ffffff', dark ? '#1a1b21' : '#d3d1c8', dark ? 1.3 : 1.0]} />
        <directionalLight position={[4, 7, 5]} intensity={dark ? 2.0 : 1.6} />
        <directionalLight position={[-5, 3, -2]} intensity={0.5} color="#dfe6ff" />
        <pointLight position={[0.6, 0.9, 1.6]} intensity={2.2} distance={5} color="#8aa2ff" />
        <Workstation mobile={mobile} dark={dark} />
        <ContactShadows position={[mobile ? 0 : 2.0, mobile ? 0.6 : -1.2, 0]} opacity={dark ? 0.6 : 0.3} color={dark ? '#000000' : '#141519'} scale={mobile ? 5 : 12} blur={2.6} far={4} frames={1} />
      </Canvas>
      )}
    </div>
  )
}
