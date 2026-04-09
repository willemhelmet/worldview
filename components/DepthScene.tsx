"use client";

import { useRef, useMemo } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";

interface DepthSceneProps {
  imageDataUrl: string;
  depthDataUrl: string;
}

export default function DepthScene({ imageDataUrl, depthDataUrl }: DepthSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const colorTexture = useLoader(TextureLoader, imageDataUrl);
  const depthTexture = useLoader(TextureLoader, depthDataUrl);

  // Aspect ratio based on texture image
  const aspectRatio = useMemo(() => {
    if (colorTexture.image) {
      return colorTexture.image.width / colorTexture.image.height;
    }
    return 16 / 9;
  }, [colorTexture]);

  const geometry = useMemo(() => {
    const width = 4 * aspectRatio;
    const height = 4;
    return new THREE.PlaneGeometry(width, height, 256, 256);
  }, [aspectRatio]);

  // Subtle auto-rotation for hero feel
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.07) * 0.02 - 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />

      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          map={colorTexture}
          displacementMap={depthTexture}
          displacementScale={0.6}
          displacementBias={-0.2}
        />
      </mesh>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={12}
        maxPolarAngle={Math.PI * 0.75}
      />
    </>
  );
}
