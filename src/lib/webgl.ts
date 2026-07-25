export type ExperienceProfile = "full" | "lite" | "none";
export type BaselineExperienceProfile = ExperienceProfile | "candidate";
export type ExperienceInputMode = "touch" | "pointer";

export const SPLINE_SESSION_FAILURE_KEY = "cemwebstudio:spline-failed";

type NavigatorWithHints = Navigator & {
  connection?: { effectiveType?: string; saveData?: boolean };
  deviceMemory?: number;
};

function sceneFailedThisSession() {
  try {
    return window.sessionStorage.getItem(SPLINE_SESSION_FAILURE_KEY) === "1";
  } catch {
    return false;
  }
}

function localQaProfileOverride(): ExperienceProfile | null {
  try {
    const localHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);
    return localHost && new URLSearchParams(window.location.search).get("qa-experience") === "lite" ? "lite" : null;
  } catch {
    return null;
  }
}

export function rememberSceneFailure() {
  try {
    window.sessionStorage.setItem(SPLINE_SESSION_FAILURE_KEY, "1");
  } catch {
    // Storage can be unavailable in strict privacy contexts. The in-memory
    // profile still falls back for the current page lifecycle.
  }
}

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
  const qaOverride = localQaProfileOverride();

  if (reducedMotion || hints.connection?.saveData || sceneFailedThisSession()) return "none";
  if (qaOverride) return qaOverride;

  const conservativeHardware = typeof hints.deviceMemory === "number" && hints.deviceMemory < 4;
  const criticallyLowConcurrency = typeof hints.hardwareConcurrency === "number" && hints.hardwareConcurrency <= 2;
  const criticallySlowNetwork = ["slow-2g", "2g"].includes(hints.connection?.effectiveType ?? "");

  return conservativeHardware || criticallyLowConcurrency || criticallySlowNetwork ? "lite" : "candidate";
}

export function detectExperienceProfile(): ExperienceProfile {
  const baseline = detectBaselineExperienceProfile();
  if (baseline !== "candidate") return baseline;
  return canCreateWebGLContext() ? "full" : "none";
}

export function detectExperienceInputMode(): ExperienceInputMode {
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  return coarsePointer || !canHover ? "touch" : "pointer";
}
