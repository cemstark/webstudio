"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { sceneOrder, sceneTargets, type SceneId } from "@/lib/motion";
import styles from "./experience.module.css";

type SceneMix = { from: SceneId; to: SceneId; amount: number };

const pieceColors = ["#2D62FF", "#F3F5FF", "#272B35", "#AFC1FF"] as const;

function dampAngle(current: number, target: number, delta: number) {
  return THREE.MathUtils.damp(current, target, 4.5, delta);
}

function SignatureObject({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pieces = useRef<Array<THREE.Mesh | null>>([]);
  const mix = useRef<SceneMix>({ from: "hero", to: "hero", amount: 0 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewportCenter = window.scrollY + window.innerHeight * 0.5;
      const anchors = sceneOrder.flatMap((id) => {
        const element = document.querySelector<HTMLElement>(`[data-experience-stage="${id}"]`);
        if (!element) return [];
        const rect = element.getBoundingClientRect();
        return [{ id, center: window.scrollY + rect.top + rect.height * 0.5 }];
      });

      if (anchors.length === 0 || viewportCenter <= anchors[0].center) {
        mix.current = { from: "hero", to: "hero", amount: 0 };
        return;
      }

      const last = anchors.at(-1);
      if (last && viewportCenter >= last.center) {
        mix.current = { from: last.id, to: last.id, amount: 0 };
        return;
      }

      for (let index = 0; index < anchors.length - 1; index += 1) {
        const from = anchors[index];
        const to = anchors[index + 1];
        if (viewportCenter < from.center || viewportCenter > to.center) continue;
        const amount = (viewportCenter - from.center) / Math.max(1, to.center - from.center);
        mix.current = { from: from.id, to: to.id, amount };
        break;
      }
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (!active || !group.current) return;
    const { from, to, amount } = mix.current;

    pieces.current.forEach((piece, index) => {
      if (!piece) return;
      const start = sceneTargets[from][index];
      const end = sceneTargets[to][index];
      const targetX = THREE.MathUtils.lerp(start[0], end[0], amount);
      const targetY = THREE.MathUtils.lerp(start[1], end[1], amount);
      const targetZ = THREE.MathUtils.lerp(start[2], end[2], amount);
      const portalTurn = from === "projects" || to === "projects" ? Math.PI * 0.5 : 0;

      piece.position.x = THREE.MathUtils.damp(piece.position.x, targetX, 4.5, delta);
      piece.position.y = THREE.MathUtils.damp(piece.position.y, targetY, 4.5, delta);
      piece.position.z = THREE.MathUtils.damp(piece.position.z, targetZ, 4.5, delta);
      piece.rotation.x = dampAngle(piece.rotation.x, (index % 2 ? -0.3 : 0.32) + pointer.y * 0.08, delta);
      piece.rotation.y = dampAngle(piece.rotation.y, index * 0.62 + portalTurn + pointer.x * 0.12, delta);
      piece.rotation.z = dampAngle(piece.rotation.z, index % 2 ? Math.PI : 0, delta);
    });

    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.1, 3, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.y * -0.08, 3, delta);
    group.current.position.y = Math.sin(clock.elapsedTime * 0.45) * 0.035;
  });

  return (
    <group ref={group} scale={1.05}>
      {pieceColors.map((color, index) => (
        <mesh
          key={color}
          ref={(mesh) => { pieces.current[index] = mesh; }}
          position={sceneTargets.hero[index]}
          rotation={[index % 2 ? -0.3 : 0.32, index * 0.62, index % 2 ? Math.PI : 0]}
        >
          <torusGeometry args={[0.82, 0.105, 12, 72, Math.PI * 1.46]} />
          <meshStandardMaterial color={color} metalness={index === 1 ? 0.82 : 0.48} roughness={index === 1 ? 0.18 : 0.3} />
        </mesh>
      ))}
    </group>
  );
}

class WebGLErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SignatureCanvas({ active, onContextLost }: { active: boolean; onContextLost: () => void }) {
  return (
    <WebGLErrorBoundary onError={onContextLost}>
      <Canvas
        className={styles.canvas}
        camera={{ position: [0, 0, 5.4], fov: 42 }}
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
        }}
      >
        <ambientLight intensity={1.7} />
        <directionalLight position={[3, 4, 5]} intensity={4.2} color="#ffffff" />
        <directionalLight position={[-4, -2, 2]} intensity={2.4} color="#2D62FF" />
        <SignatureObject active={active} />
      </Canvas>
    </WebGLErrorBoundary>
  );
}
