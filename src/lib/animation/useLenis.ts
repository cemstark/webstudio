"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/lib/webgl";
import { withMotionRuntime } from "./runtime";

/**
 * Installs the site-wide smooth scroll.
 *
 * Lenis only adds momentum; it never takes the scroll away from the reader, never snaps
 * to a section and never blocks a wheel or touch gesture. Under `prefers-reduced-motion`
 * it is not created at all, so the browser's native scrolling stays exactly as it was.
 */
export function useLenis() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    return withMotionRuntime(({ gsap, ScrollTrigger, Lenis }) => {
      const lenis = new Lenis({
        // Native scrolling remains the fallback for anything Lenis does not own.
        autoRaf: false,
        duration: 1.05,
        touchMultiplier: 1.6,
        wheelMultiplier: 1,
      });

      // One clock for both libraries: GSAP drives Lenis, Lenis reports back to ScrollTrigger.
      const advance = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(advance);
      gsap.ticker.lagSmoothing(0);
      document.documentElement.dataset.lenis = "on";

      return () => {
        gsap.ticker.remove(advance);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
        delete document.documentElement.dataset.lenis;
      };
    });
  }, []);

  // A route change replaces the whole document flow, so trigger positions and the
  // scroll position both have to be recomputed for the new page.
  useEffect(() => {
    if (prefersReducedMotion()) return;

    return withMotionRuntime(({ ScrollTrigger }) => {
      const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => window.cancelAnimationFrame(frame);
    });
  }, [pathname]);
}
