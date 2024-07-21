import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
import Lottie from 'lottie-react';
import programmerAnimation from './assets/programmer.json'
import flying from './assets/flying.json'
import Slider from './Slider';

const Model = () => {
  const { scene } = useGLTF('/space/scene.gltf');
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.roughness = 0.4;
        child.material.metalness = 0.3;
        child.material.emissiveIntensity = 1.5;
      }
    });
  }, [scene]);
  return <primitive object={scene} scale={[2, 2, 2]} />;
};

const HomePage = () => {
  const bind = useDrag(({ down, movement: [mx] }) => {
    
  });

  const textAnimation = useSpring({
    from: { 
      opacity: 0, 
      transform: 'translateY(-50px) scale(0.8) rotateX(-90deg)', 
      color: 'inherit'
    },
    to: { 
      opacity: 1, 
      transform: 'translateY(0px) scale(1) rotateX(0deg)', 
      color: 'inherit'
    },
    config: { tension: 220, friction: 12 },
    delay: 500,
  });

  const isMobile = window.innerWidth < 600;


  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', margin: 0 }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Canvas camera={{ position: [5, 0, 10], fov: window.innerWidth < 600 ? 75 : 60 }} style={{backgroundColor:'black'}}>
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <Suspense fallback={null}>
            <Model />
          </Suspense>
          <OrbitControls />
          <Environment preset="sunset" />
          <EffectComposer>
            <Bloom luminanceThreshold={0.3} luminanceSmoothing={1.0} height={200} blendFunction={BlendFunction.ADD} />
            {window.innerWidth > 600 && <Noise opacity={0.1} />}
            <Vignette eskil={false} offset={0.2} darkness={0.5} />
          </EffectComposer>
        </Canvas>
      </div>
      <div style={{ flex: isMobile ? 'none' : 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'inherit', color: 'inherit', position: 'relative', height: isMobile ? '50vh' : '100vh', paddingTop: '0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10px', textAlign: 'center', zIndex: 2 }}>
          <animated.h1 style={{ ...textAnimation, marginTop: '1px', fontWeight: 'bold', fontSize: isMobile ? '2rem' : '3rem' }}>HI, I AM</animated.h1>
          <Slider>Slide Me</Slider>
        </div>
        <Lottie style={{ width: isMobile ? '200px' : '500px', height: isMobile ? '400px' : '900px', position: 'absolute', top: 0, right: 0, marginTop: '10px' }} animationData={flying} />
      </div>
    </div>
  );
};

export default HomePage;
