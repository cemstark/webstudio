import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import type LenisType from "lenis";

export type MotionRuntime = {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  Lenis: typeof LenisType;
};

let runtimePromise: Promise<MotionRuntime> | null = null;

/**
 * Loads GSAP, ScrollTrigger and Lenis on demand.
 *
 * They are deliberately kept out of the first-load bundle: scroll motion is not on the
 * critical rendering path, and the homepage's initial JavaScript budget is tight enough
 * that a static import would spend it on code nobody needs before the first scroll.
 * The promise is cached so every consumer shares one instance of each.
 */
export function loadMotionRuntime(): Promise<MotionRuntime> {
  runtimePromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")])
    .then(([gsapModule, scrollTriggerModule, lenisModule]) => {
      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollTriggerModule;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger, Lenis: lenisModule.default };
    });
  return runtimePromise;
}

/**
 * Runs `callback` once the runtime is ready, unless the caller unmounted first.
 * Returns the teardown that cancels the pending load and disposes whatever the
 * callback created.
 */
export function withMotionRuntime(callback: (runtime: MotionRuntime) => (() => void) | void) {
  let cancelled = false;
  let cleanup: (() => void) | void;

  void loadMotionRuntime().then((runtime) => {
    if (cancelled) return;
    cleanup = callback(runtime);
  });

  return () => {
    cancelled = true;
    cleanup?.();
  };
}
