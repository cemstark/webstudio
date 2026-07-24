export type ExperienceProfile = "full" | "lite" | "none";
export type BaselineExperienceProfile = ExperienceProfile | "candidate";

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

export function canCreateWebGLContext() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true })
      ?? canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });

    if (!context) return false;
    const extension = context.getExtension("WEBGL_lose_context");
    extension?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectBaselineExperienceProfile(): BaselineExperienceProfile {
  const hints = navigator as NavigatorWithHints;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || hints.connection?.saveData) return "none";

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const wideViewport = window.matchMedia("(min-width: 900px)").matches;
  const conservativeHardware = typeof hints.deviceMemory === "number" && hints.deviceMemory < 4;

  return finePointer && wideViewport && !conservativeHardware ? "candidate" : "lite";
}

export function detectExperienceProfile(): ExperienceProfile {
  const baseline = detectBaselineExperienceProfile();
  if (baseline !== "candidate") return baseline;
  return canCreateWebGLContext() ? "full" : "none";
}
