export const motion = {
  duration: {
    quick: 180,
    base: 420,
    slow: 760,
    intro: 820,
  },
  easing: {
    standard: "cubic-bezier(.2,.8,.2,1)",
    expressive: "cubic-bezier(.16,1,.3,1)",
  },
} as const;

export const robotMotion = {
  stageAnchor: 0.52,
  idleLoadDelay: 12000,
  idleLoadTimeout: 1800,
  sceneLoadTimeout: 12000,
} as const;
