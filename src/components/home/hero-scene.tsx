"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { Vector3 } from "three";
import gsap from "gsap";
import { GeometricForms } from "./geometric-forms";
import { Hotspot } from "./hotspot";
import { ParticleField } from "./particle-field";
import { HOTSPOTS, PALETTE } from "./config";

/**
 * The R3F canvas. Camera does a subtle sine bob at idle (no full orbit —
 * that spun the labeled hotspots out of view). GSAP tweens on hotspot
 * focus and lerps back to the resting position on release.
 */
export default function HeroScene({
  focusId,
  onSelect,
  onReady,
}: {
  focusId: string | null;
  onSelect: (id: string) => void;
  onReady?: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 2.8, 9], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      style={{ background: PALETTE.ink }}
      shadows={false}
      onCreated={() => onReady?.()}
    >
      <fog attach="fog" args={[PALETTE.ink, 10, 26]} />
      <ambientLight intensity={0.55} color={PALETTE.cream} />
      <directionalLight
        position={[5, 8, 3]}
        intensity={1.15}
        color={PALETTE.cream}
      />
      <directionalLight
        position={[-4, 4, -6]}
        intensity={0.9}
        color={PALETTE.orange}
      />
      <pointLight
        position={[0, -1.5, 0]}
        intensity={0.4}
        color={PALETTE.orange}
        distance={14}
      />
      <ParticleField />
      <GeometricForms />
      {HOTSPOTS.map((h, i) => (
        <Hotspot key={h.id} data={h} index={i} onSelect={onSelect} />
      ))}
      <CameraRig focusId={focusId} />
    </Canvas>
  );
}

/**
 * Camera rig. Two modes:
 *   - focusId is null → gentle sine bob around the rest position. Hotspot
 *     labels stay legible instead of orbiting behind the centerpiece.
 *   - focusId matches a hotspot → GSAP tween to a viewing offset and hold.
 */
function CameraRig({ focusId }: { focusId: string | null }) {
  const { camera } = useThree();
  const lookTargetRef = useRef(new Vector3(0, 1.1, 0));
  const restRef = useRef(new Vector3(0, 2.8, 9));
  const resumingRef = useRef(false);

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    if (focusId) {
      const hs = HOTSPOTS.find((h) => h.id === focusId);
      if (!hs) return;
      const [x, y, z] = hs.position;
      const target = new Vector3(x * 0.35, y + 1.4, z * 0.5 + 3.6);
      gsap.to(cam.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 1.1,
        ease: "power3.inOut",
      });
      gsap.to(lookTargetRef.current, {
        x,
        y,
        z,
        duration: 1.1,
        ease: "power3.inOut",
      });
    } else {
      gsap.to(lookTargetRef.current, {
        x: 0,
        y: 1.1,
        z: 0,
        duration: 0.8,
        ease: "power2.out",
      });
      resumingRef.current = true;
    }
  }, [camera, focusId]);

  useFrame(({ clock }) => {
    if (!focusId) {
      const t = clock.elapsedTime;
      // Gentle bob + slight lateral sway around the rest pose.
      const targetX = restRef.current.x + Math.sin(t * 0.25) * 0.35;
      const targetY = restRef.current.y + Math.sin(t * 0.4) * 0.18;
      const targetZ = restRef.current.z;
      if (resumingRef.current) {
        camera.position.lerp(new Vector3(targetX, targetY, targetZ), 0.08);
        if (
          camera.position.distanceTo(new Vector3(targetX, targetY, targetZ)) <
          0.05
        ) {
          resumingRef.current = false;
        }
      } else {
        camera.position.set(targetX, targetY, targetZ);
      }
    }
    camera.lookAt(lookTargetRef.current);
  });

  return null;
}
