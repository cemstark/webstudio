"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  detectBaselineExperienceProfile,
  detectExperienceInputMode,
  detectExperienceProfile,
  rememberSceneActivation,
  rememberSceneFailure,
  sceneActivatedThisSession,
  type ExperienceInputMode,
  type ExperienceProfile,
} from "@/lib/webgl";
import { robotMotion } from "@/lib/motion";

export function useExperienceProfile() {
  const [profile, setProfile] = useState<ExperienceProfile>("none");
  const [inputMode, setInputMode] = useState<ExperienceInputMode>("touch");
  /** True when the scene could run but is waiting for the visitor to ask for it. */
  const [awaitingActivation, setAwaitingActivation] = useState(false);
  /**
   * True once the capability check has run. Until then `profile` and `awaitingActivation`
   * are still their initial values, so nothing downstream can tell "no scene offered"
   * apart from "not decided yet".
   */
  const [ready, setReady] = useState(false);
  const activateRef = useRef<() => void>(() => {});

  const disableExperience = useCallback(() => {
    rememberSceneFailure();
    setAwaitingActivation(false);
    setProfile("none");
  }, []);

  const activateScene = useCallback(() => activateRef.current(), []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const hover = window.matchMedia("(hover: hover)");
    let activationStarted = false;

    const updateBaseline = () => {
      const baseline = detectBaselineExperienceProfile();
      if (baseline !== "candidate") {
        window.performance.mark(`cem:experience-profile-${baseline}`);
        setAwaitingActivation(false);
        setProfile(baseline);
        return;
      }
      // On touch devices the robot stays a poster until it is asked for: a phone should not
      // spend its battery and data on a WebGL scene the visitor never requested. Reading the
      // input mode here keeps the offer in sync when the baseline changes later on.
      if (activationStarted || detectExperienceInputMode() !== "touch") return;
      // Asking once is enough — a visitor who already said yes this session gets the scene.
      if (sceneActivatedThisSession()) activate();
      else setAwaitingActivation(true);
    };
    const activate = () => {
      if (activationStarted || detectBaselineExperienceProfile() !== "candidate") return;
      activationStarted = true;
      if (detectExperienceInputMode() === "touch") rememberSceneActivation();
      setAwaitingActivation(false);
      const nextProfile = detectExperienceProfile();
      window.performance.mark(`cem:experience-profile-${nextProfile}`);
      setProfile(nextProfile);
    };
    const activateFromIntent = () => {
      if (!activationStarted) window.performance.mark("cem:experience-intent");
      activate();
    };
    // Called unconditionally below, so it also marks the whole decision as settled. React
    // batches it with whatever updateBaseline just set, so both land in one render.
    const updateInputMode = () => {
      setInputMode(detectExperienceInputMode());
      setReady(true);
    };
    const intentEvents = ["pointerdown", "touchstart", "wheel"] as const;

    activateRef.current = activate;
    updateBaseline();
    updateInputMode();
    reducedMotion.addEventListener("change", updateBaseline);
    coarsePointer.addEventListener("change", updateInputMode);
    hover.addEventListener("change", updateInputMode);

    const stopWatchingMedia = () => {
      reducedMotion.removeEventListener("change", updateBaseline);
      coarsePointer.removeEventListener("change", updateInputMode);
      hover.removeEventListener("change", updateInputMode);
    };

    // A touch visitor activates the scene from the poster button, so nothing is preloaded here.
    if (detectExperienceInputMode() === "touch") return stopWatchingMedia;

    intentEvents.forEach((eventName) => window.addEventListener(eventName, activateFromIntent, { once: true, passive: true }));
    let idleHandle: number | null = null;
    const idleDelayHandle = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleHandle = window.requestIdleCallback(activate, { timeout: robotMotion.idleLoadTimeout });
      } else {
        activate();
      }
    }, robotMotion.idleLoadDelay);

    return () => {
      stopWatchingMedia();
      intentEvents.forEach((eventName) => window.removeEventListener(eventName, activateFromIntent));
      window.clearTimeout(idleDelayHandle);
      if (idleHandle !== null && "cancelIdleCallback" in window) window.cancelIdleCallback(idleHandle);
    };
  }, []);

  return { activateScene, awaitingActivation, disableExperience, inputMode, profile, ready } as const;
}
