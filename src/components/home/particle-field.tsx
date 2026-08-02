"use client";

import { useRef } from "react";
import type { Points as ThreePoints } from "three";
import { useFrame } from "@react-three/fiber";
import { PALETTE } from "./config";

/**
 * Ambient star / particle field behind the composition. ~350 dots at low
 * opacity, slowly rotating. Adds depth without pulling focus.
 *
 * Positions are seeded once at module load (deterministic per-refresh via
 * `Math.random` is fine — the eye won't spot a pattern).
 */
const COUNT = 350;
const POSITIONS = (() => {
  const arr = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 12 + Math.random() * 6;
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = 2 + Math.random() * 6 - 3;
    arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  return arr;
})();

export function ParticleField() {
  const ref = useRef<ThreePoints>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[POSITIONS, 3]}
          count={COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        color={PALETTE.cream}
        transparent
        opacity={0.55}
      />
    </points>
  );
}
