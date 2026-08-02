"use client";

import { useRef } from "react";
import type { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { PALETTE } from "./config";

/**
 * Procedural GeometricForms — a central low-poly sculpture with a small
 * orange satellite orbiting it. Fewer, larger, better-composed than a busy
 * quartet. Ground plane fades into fog so the edge reads as horizon.
 */

function Centerpiece() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.12;
    ref.current.rotation.x += delta * 0.04;
  });
  return (
    <mesh ref={ref} position={[0, 1.1, 0]}>
      <icosahedronGeometry args={[1.6, 1]} />
      <meshStandardMaterial
        color="#3a4762"
        metalness={0.45}
        roughness={0.32}
        flatShading
      />
    </mesh>
  );
}

function Satellite() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.006;
    ref.current.rotation.x += 0.003;
    const t = clock.elapsedTime * 0.25;
    ref.current.position.x = Math.cos(t) * 3.8;
    ref.current.position.z = Math.sin(t) * 3.8;
    ref.current.position.y = 1.1 + Math.sin(t * 1.3) * 0.25;
  });
  return (
    <mesh ref={ref} position={[3.8, 1.1, 0]}>
      <octahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial
        color={PALETTE.orange}
        emissive={PALETTE.orange}
        emissiveIntensity={0.7}
        metalness={0.5}
        roughness={0.3}
        flatShading
      />
    </mesh>
  );
}

export function GeometricForms() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial
          color={PALETTE.ink}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      <Centerpiece />
      <Satellite />
    </>
  );
}
