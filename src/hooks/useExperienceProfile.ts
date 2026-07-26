"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectBaselineExperienceProfile,
  detectExperienceInputMode,
  detectExperienceProfile,
  rememberSceneFailure,
  type ExperienceInputMode,
  type ExperienceProfile,
} from "@/lib/webgl";
import { robotMotion } from "@/lib/motion";

export function useExperienceProfile() {
  const [profile, setProfile] = useState<ExperienceProfile>("none");
  const [inputMode, setInputMode] = useState<ExperienceInputMode>("touch");

  const disableExperience = useCallback(() => {
    rememberSceneFailure();
    setProfile("none");
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const hover = window.matchMedia("(hover: hover)");
    let activationStarted = false;

    const updateBaseline = () => {
      const baseline = detectBaselineExperienceProfile();
      if (baseline !== "candidate") {
        window.performance.mark(`cem:experience-profile-${baseline}`);
        setProfile(baseline);
      }
    };
    const activate = () => {
      if (activationStarted || detectBaselineExperienceProfile() !== "candidate") return;
      activationStarted = true;
      const nextProfile = detectExperienceProfile();
      window.performance.mark(`cem:experience-profile-${nextProfile}`);
      setProfile(nextProfile);
    };
    const activateFromIntent = () => {
      if (!activationStarted) window.performance.mark("cem:experience-intent");
      activate();
    };
    const updateInputMode = () => setInputMode(detectExperienceInputMode());
    const intentEvents = ["pointerdown", "touchstart", "wheel"] as const;

    updateBaseline();
    updateInputMode();
    reducedMotion.addEventListener("change", updateBaseline);
    coarsePointer.addEventListener("change", updateInputMode);
    hover.addEventListener("change", updateInputMode);
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
      reducedMotion.removeEventListener("change", updateBaseline);
      coarsePointer.removeEventListener("change", updateInputMode);
      hover.removeEventListener("change", updateInputMode);
      intentEvents.forEach((eventName) => window.removeEventListener(eventName, activateFromIntent));
      window.clearTimeout(idleDelayHandle);
      if (idleHandle !== null && "cancelIdleCallback" in window) window.cancelIdleCallback(idleHandle);
    };
  }, []);

  return { disableExperience, inputMode, profile } as const;
}
