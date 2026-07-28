import { motion } from "@/lib/motion";

/**
 * Motion vocabulary shared by every scroll animation.
 *
 * Durations and curves come from `@/lib/motion` so the GSAP layer, the CSS reveal
 * layer and the route transition all speak the same language. Nothing here invents
 * a new constant.
 */

/** Samples the same cubic-bezier curve the stylesheets use, as a GSAP ease function. */
function cubicBezierEase(x1: number, y1: number, x2: number, y2: number) {
  const curve = (a: number, b: number, t: number) => {
    const inverse = 1 - t;
    return 3 * inverse * inverse * t * a + 3 * inverse * t * t * b + t * t * t;
  };

  return (progress: number) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    // Newton's method converges quickly here because both curves are monotonic in x.
    let t = progress;
    for (let iteration = 0; iteration < 8; iteration += 1) {
      const x = curve(x1, x2, t) - progress;
      if (Math.abs(x) < 1e-5) break;
      const derivative = 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
      if (Math.abs(derivative) < 1e-6) break;
      t -= x / derivative;
    }
    return curve(y1, y2, t);
  };
}

export const ease = {
  standard: cubicBezierEase(0.2, 0.8, 0.2, 1),
  expressive: cubicBezierEase(0.16, 1, 0.3, 1),
} as const;

/** Seconds, because GSAP counts in seconds while `motion.duration` counts in milliseconds. */
export const duration = {
  quick: motion.duration.quick / 1000,
  base: motion.duration.base / 1000,
  slow: motion.duration.slow / 1000,
} as const;

export const stagger = { tight: 0.06, loose: 0.08 } as const;

/** Travel budgets. Mobile keeps parallax barely perceptible so reading stays comfortable. */
export const parallax = { desktopPx: 40, mobilePx: 24 } as const;

export const revealFrom = { opacity: 0, y: 32 } as const;
export const revealTo = { opacity: 1, y: 0, duration: duration.base, ease: ease.expressive } as const;

/** A heading line rides up from behind its own `overflow: hidden` mask. */
export const maskedLineFrom = { yPercent: 100 } as const;
export const maskedLineTo = { yPercent: 0, duration: duration.slow, ease: ease.expressive } as const;

export const scrollTriggerDefaults = { start: "top 82%", once: true } as const;
