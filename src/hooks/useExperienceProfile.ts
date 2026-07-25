"use client";

import { useEffect, useState } from "react";
import { detectBaselineExperienceProfile, detectExperienceProfile, type ExperienceProfile } from "@/lib/webgl";
import { robotMotion } from "@/lib/motion";

export function useExperienceProfile() {
  const [profile, setProfile] = useState<ExperienceProfile>("none");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const wideViewport = window.matchMedia("(min-width: 900px)");
    const updateBaseline = () => {
      const baseline = detectBaselineExperienceProfile();
      setProfile(baseline === "candidate" ? "lite" : baseline);
    };
    const activate = () => {
      if (detectBaselineExperienceProfile() === "candidate") setProfile(detectExperienceProfile());
    };
    const intentEvents = ["pointermove", "pointerdown", "touchstart", "wheel"] as const;

    updateBaseline();
    reducedMotion.addEventListener("change", updateBaseline);
    finePointer.addEventListener("change", updateBaseline);
    wideViewport.addEventListener("change", updateBaseline);
    intentEvents.forEach((eventName) => window.addEventListener(eventName, activate, { once: true, passive: true }));
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
      finePointer.removeEventListener("change", updateBaseline);
      wideViewport.removeEventListener("change", updateBaseline);
      intentEvents.forEach((eventName) => window.removeEventListener(eventName, activate));
      window.clearTimeout(idleDelayHandle);
      if (idleHandle !== null && "cancelIdleCallback" in window) window.cancelIdleCallback(idleHandle);
    };
  }, []);

  return { profile, setProfile } as const;
}
