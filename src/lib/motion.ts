export const motion = {
  duration: {
    quick: 180,
    base: 420,
    slow: 760,
    intro: 1000,
  },
  easing: {
    standard: "cubic-bezier(.2,.8,.2,1)",
    expressive: "cubic-bezier(.16,1,.3,1)",
  },
} as const;

export const sceneOrder = ["hero", "manifesto", "services", "projects", "pricing", "final"] as const;

export type SceneId = (typeof sceneOrder)[number];

export const sceneTargets: Record<SceneId, readonly [number, number, number][]> = {
  hero: [
    [-0.86, 0.32, 0.05],
    [0.86, 0.32, -0.08],
    [-0.56, -0.62, 0.1],
    [0.58, -0.62, -0.05],
  ],
  manifesto: [
    [-1.1, 0.45, -0.15],
    [1.12, 0.36, 0.05],
    [-0.72, -0.66, 0.2],
    [0.72, -0.58, -0.1],
  ],
  services: [
    [-1.45, 0.82, 0],
    [1.45, 0.82, -0.1],
    [-1.45, -0.82, 0.15],
    [1.45, -0.82, 0],
  ],
  projects: [
    [-1.4, 0.92, 0],
    [1.4, 0.92, 0],
    [-1.4, -0.92, 0],
    [1.4, -0.92, 0],
  ],
  pricing: [
    [-1.12, 0.56, -0.25],
    [1.12, 0.56, -0.1],
    [-0.94, -0.58, 0.05],
    [0.94, -0.58, 0.1],
  ],
  final: [
    [-0.78, 0.28, 0.05],
    [0.78, 0.28, -0.08],
    [-0.52, -0.55, 0.1],
    [0.54, -0.55, -0.05],
  ],
};
