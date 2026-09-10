import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Airplane } from './Airplane'
import { useIsMobile } from '../lib/useMedia'
import { useTheme } from '../lib/theme'
import { useNearViewport } from '../lib/useNearViewport'

type Props = { active: boolean }

/** Canvas that fills the aviation chapter. Renders only while the chapter is on screen. */
export default function FlightScene({ active }: Props) {
  const mobile = useIsMobile()
  const [theme] = useTheme()
  const dark = theme === 'dark'
  const [host, setHost] = useState<Element | null>(null)
  useEffect(() => setHost(document.querySelector('#aviation')), [])
  const near = useNearViewport(host)
  if (!near) return null
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 9], fov: 34, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
    >
      <hemisphereLight args={[dark ? '#dfe6ff' : '#ffffff', dark ? '#1a1b21' : '#c9c8c0', dark ? 1.4 : 1.1]} />
      <directionalLight position={[5, 8, 6]} intensity={1.7} />
      <directionalLight position={[-6, -2, 3]} intensity={0.45} color="#dfe6ff" />
      <Airplane mobile={mobile} dark={dark} />
    </Canvas>
  )
}
