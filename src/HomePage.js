import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { MeshStandardMaterial } from 'three';

const Model = () => {
  const { scene } = useGLTF('/source/random/export.gltf'); // Path to your model
  const [diffuseTexture, emissionTexture] = useTexture([
    '/textures/landmak.png',  // Diffuse texture for more detailed appearance
    '/textures/emission.png',  // Emission texture for glowing effect
  ]);

  // Apply lava-like material properties
  const material = useMemo(() => new MeshStandardMaterial({
    map: diffuseTexture,
    emissiveMap: emissionTexture,
    emissive: 'yellow', // Change emissive color to yellow
    emissiveIntensity: 12.5,
    roughness: 0.4,
    metalness: 0.3,
  }), [diffuseTexture, emissionTexture]);

  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = material;
    }
  });

  return <primitive object={scene} scale={[2, 2, 2]} />;
};

const HomePage = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}> {/* Ensure Canvas takes full screen */}
      <Canvas camera={{ position: [0, 0, 10] }}> {/* Adjust camera position */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls />
        <Environment preset="sunset" />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            height={300}
            blendFunction={BlendFunction.ADD}
          />
          <Noise opacity={0.1} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default HomePage;
