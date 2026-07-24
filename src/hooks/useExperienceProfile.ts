"use client";

import { useEffect, useState } from "react";
import { detectBaselineExperienceProfile, detectExperienceProfile, type ExperienceProfile } from "@/lib/webgl";

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
    const intentEvents = ["pointerdown", "touchstart", "wheel"] as const;

    updateBaseline();
    reducedMotion.addEventListener("change", updateBaseline);
    finePointer.addEventListener("change", updateBaseline);
    wideViewport.addEventListener("change", updateBaseline);
    intentEvents.forEach((eventName) => window.addEventListener(eventName, activate, { once: true, passive: true }));
    const timeoutHandle = window.setTimeout(activate, 60_000);

    return () => {
      reducedMotion.removeEventListener("change", updateBaseline);
      finePointer.removeEventListener("change", updateBaseline);
      wideViewport.removeEventListener("change", updateBaseline);
      intentEvents.forEach((eventName) => window.removeEventListener(eventName, activate));
      window.clearTimeout(timeoutHandle);
    };
  }, []);

  return { profile, setProfile } as const;
}
