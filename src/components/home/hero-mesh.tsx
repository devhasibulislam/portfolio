"use client";

import { useRef } from "react";
import type { Mesh, Group } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PALETTE } from "./config";

/**
 * Hero mesh — one procedural sculpture drifting behind the type. This is
 * the entire Three.js footprint for the home page: a single Icosahedron
 * with a small Torus orbiting it, both on brand-orange emissive materials
 * over the ink base.
 *
 * PROJECT_CONTEXT §16 — Three.js should whisper, not shout. Deliberately
 * no scene traversal, no hotspots, no camera choreography (see the retired
 * `hero-scene.tsx`). Just gentle Y-axis rotation on both meshes so the
 * page feels alive without becoming a demo.
 *
 * Client-only bundle: this file is imported through `next/dynamic({ ssr:
 * false })` from `hero.tsx` so R3F never lands on visitors whose device
 * won't render it (capability probe in `@/lib/capabilities`).
 */

function DriftingCore() {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const satRef = useRef<Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      // Whole cluster drifts up-and-down with a slow sine — feels weightless.
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.15;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.12;
      coreRef.current.rotation.x += delta * 0.045;
    }
    if (satRef.current) {
      // Small torus orbits the core on the XZ plane at a fixed radius.
      const t = clock.elapsedTime * 0.4;
      satRef.current.position.x = Math.cos(t) * 2.6;
      satRef.current.position.z = Math.sin(t) * 2.6;
      satRef.current.position.y = Math.sin(t * 1.4) * 0.2;
      satRef.current.rotation.x = t * 0.6;
      satRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.55, 1]} />
        <meshStandardMaterial
          color="#3a4762"
          metalness={0.55}
          roughness={0.28}
          flatShading
        />
      </mesh>
      <mesh ref={satRef} position={[2.6, 0, 0]}>
        <torusGeometry args={[0.32, 0.09, 12, 32]} />
        <meshStandardMaterial
          color={PALETTE.orange}
          emissive={PALETTE.orange}
          emissiveIntensity={0.85}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export default function HeroMesh() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 6.4], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      shadows={false}
    >
      <ambientLight intensity={0.55} color={PALETTE.cream} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.15}
        color={PALETTE.cream}
      />
      <directionalLight
        position={[-4, 3, -6]}
        intensity={0.95}
        color={PALETTE.orange}
      />
      <pointLight
        position={[0, -2, 0]}
        intensity={0.5}
        color={PALETTE.orange}
        distance={12}
      />
      <DriftingCore />
    </Canvas>
  );
}
