"use client";

import { Canvas } from "@react-three/fiber";
import { ParticleField } from "@/components/home/particle-field";
import { PALETTE } from "@/components/home/config";

/**
 * Real-WebGL ambient star field. Same `ParticleField` used behind the
 * hero, minus the camera rig, hotspots, and geometry. Fixed to the
 * viewport so page content scrolls above it.
 */
export default function AmbientStarsCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 2.8, 9], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      style={{ background: PALETTE.ink }}
      shadows={false}
    >
      <fog attach="fog" args={[PALETTE.ink, 10, 26]} />
      <ambientLight intensity={0.55} color={PALETTE.cream} />
      <ParticleField />
    </Canvas>
  );
}
