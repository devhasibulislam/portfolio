"use client";

import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { PALETTE, type Hotspot as HotspotData } from "./config";

/**
 * Labeled hotspot: a small emissive dot anchors it in 3D space, but the
 * clickable target is a big DOM pill with the number + label always
 * visible. Reads immediately as "click me" — no mystery orbs.
 */
export function Hotspot({
  data,
  index,
  onSelect,
}: {
  data: HotspotData;
  index: number;
  onSelect: (id: string) => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(t * 1.4 + index) * 0.05;
    }
  });

  const num = String(index + 1).padStart(2, "0");

  return (
    <group position={data.position}>
      {/* Anchor dot — a tiny orange spark that locates the hotspot in 3D
          without competing with the DOM pill above it. */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial
          color={PALETTE.orange}
          emissive={PALETTE.orange}
          emissiveIntensity={hovered ? 3.5 : 2.2}
          toneMapped={false}
        />
      </mesh>
      {/* DOM pill — always-visible label, real click target. */}
      <Html
        position={[0, 0.35, 0]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "auto" }}
      >
        <button
          type="button"
          onClick={() => onSelect(data.id)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={`Open ${data.label}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px 8px 10px",
            borderRadius: 999,
            fontFamily:
              "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: 0.2,
            color: hovered ? PALETTE.orange : PALETTE.cream,
            background: `${PALETTE.ink}cc`,
            border: `1px solid ${
              hovered ? PALETTE.orange : `${PALETTE.cream}22`
            }`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            cursor: "pointer",
            transition:
              "color 200ms ease, border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
            transform: hovered ? "translateY(-2px)" : "none",
            whiteSpace: "nowrap",
            boxShadow: hovered
              ? `0 10px 26px -8px ${PALETTE.orange}66`
              : "0 4px 12px -6px rgba(0,0,0,0.55)",
          }}
        >
          <span
            style={{
              fontFamily:
                "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
              fontSize: 11,
              color: PALETTE.orange,
              letterSpacing: 0.4,
            }}
          >
            {num}
          </span>
          <span>{data.label}</span>
          <span aria-hidden style={{ fontSize: 14, opacity: 0.7 }}>
            →
          </span>
        </button>
      </Html>
    </group>
  );
}
