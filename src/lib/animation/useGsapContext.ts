"use client";

import { useEffect, type RefObject } from "react";
import type { MotionRuntime } from "./runtime";
import { withMotionRuntime } from "./runtime";
import { prefersReducedMotion } from "@/lib/webgl";

type ScopedSetup = (runtime: MotionRuntime, scope: HTMLElement) => void;

/**
 * Runs `setup` inside a `gsap.context()` scoped to `scopeRef`.
 *
 * Every tween and ScrollTrigger created in there is reverted on unmount, which returns
 * the DOM to its authored state and leaves no orphaned scroll listeners behind.
 * Under `prefers-reduced-motion` the setup never runs, so elements keep the static
 * appearance the stylesheet gives them.
 *
 * `resetKey` re-runs the setup when the scope element survives but its contents are
 * replaced — a client-side route change keeps `<main>` and swaps everything inside it.
 */
export function useGsapContext(scopeRef: RefObject<HTMLElement | null>, setup: ScopedSetup, resetKey?: string) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReducedMotion()) return;

    return withMotionRuntime((runtime) => {
      const context = runtime.gsap.context(() => setup(runtime, scope), scope);
      // Layout settles after fonts and images land; recompute so triggers sit correctly.
      const refresh = window.requestAnimationFrame(() => runtime.ScrollTrigger.refresh());
      return () => {
        window.cancelAnimationFrame(refresh);
        context.revert();
      };
    });
    // `setup` is expected to be a stable module-level function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeRef, resetKey]);
}
