export type ExperienceProfile = "full" | "lite" | "none";
export type BaselineExperienceProfile = ExperienceProfile | "candidate";
export type ExperienceInputMode = "touch" | "pointer";

export const SPLINE_SESSION_FAILURE_KEY = "cemwebstudio:spline-failed";

type NavigatorWithHints = Navigator & {
  connection?: { effectiveType?: string; saveData?: boolean };
  deviceMemory?: number;
};

/**
 * Single source of truth for the reduced-motion preference. The experience profile,
 * the reveal observer and the scroll animation layer all read it from here so they
 * can never disagree about whether motion is allowed.
 */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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
    const requestedProfile = new URLSearchParams(window.location.search).get("qa-experience");
    return localHost && (requestedProfile === "full" || requestedProfile === "lite") ? requestedProfile : null;
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

type WebGLCapability = "hardware" | "software" | "none";

function detectWebGLCapability(): WebGLCapability {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true })
      ?? canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });

    if (!context) return "none";
    const rendererInfo = context.getExtension("WEBGL_debug_renderer_info");
    const renderer = rendererInfo
      ? String(context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL))
      : "";
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software renderer/i.test(renderer) ? "software" : "hardware";
  } catch {
    return "none";
  }
}

export function canCreateWebGLContext() {
  return detectWebGLCapability() !== "none";
}

export function detectBaselineExperienceProfile(): BaselineExperienceProfile {
  const hints = navigator as NavigatorWithHints;
  const qaOverride = localQaProfileOverride();

  if (prefersReducedMotion() || hints.connection?.saveData || sceneFailedThisSession()) return "none";
  if (qaOverride === "lite") return "lite";
  // Keep the full QA path on the same intent/idle scheduler as production.
  // The override selects the renderer tier, not an artificially eager load.
  if (qaOverride === "full") return "candidate";

  const conservativeHardware = typeof hints.deviceMemory === "number" && hints.deviceMemory < 4;
  const criticallyLowConcurrency = typeof hints.hardwareConcurrency === "number" && hints.hardwareConcurrency <= 2;
  const criticallySlowNetwork = ["slow-2g", "2g"].includes(hints.connection?.effectiveType ?? "");

  return conservativeHardware || criticallyLowConcurrency || criticallySlowNetwork ? "lite" : "candidate";
}

export function detectExperienceProfile(): ExperienceProfile {
  const baseline = detectBaselineExperienceProfile();
  if (baseline !== "candidate") return baseline;
  if (localQaProfileOverride() === "full") return "full";
  const capability = detectWebGLCapability();
  if (capability === "none") return "none";
  if (capability === "software" && !window.__CEM_SPLINE_TEST_MOCK__) return "lite";
  return "full";
}

export function detectExperienceInputMode(): ExperienceInputMode {
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  return coarsePointer || !canHover ? "touch" : "pointer";
}
