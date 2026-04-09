"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import DepthScene from "./DepthScene";

interface WorldViewerProps {
  imageDataUrl: string;
  depthDataUrl: string;
}

export default function WorldViewer({ imageDataUrl, depthDataUrl }: WorldViewerProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#050508" }}
    >
      <Suspense
        fallback={
          <mesh>
            <planeGeometry args={[4, 3]} />
            <meshBasicMaterial color="#111115" />
          </mesh>
        }
      >
        <DepthScene imageDataUrl={imageDataUrl} depthDataUrl={depthDataUrl} />
      </Suspense>
    </Canvas>
  );
}
