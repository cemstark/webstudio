"use client";

import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import { useExperienceProfile } from "@/hooks/useExperienceProfile";
import styles from "./experience.module.css";

type SignatureSceneProps = {
  active: boolean;
  onContextLost: () => void;
};

export function ExperienceShell() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { profile, setProfile } = useExperienceProfile();
  const [Scene, setScene] = useState<ComponentType<SignatureSceneProps> | null>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (profile !== "full" || Scene) return;
    let cancelled = false;
    void import("./SignatureCanvas").then((module) => {
      if (!cancelled) setScene(() => module.SignatureCanvas);
    }).catch(() => setProfile("none"));

    return () => {
      cancelled = true;
    };
  }, [profile, Scene, setProfile]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let inViewport = true;
    let pageVisible = document.visibilityState === "visible";
    const sync = () => setActive(inViewport && pageVisible);
    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry?.isIntersecting ?? false;
      sync();
    }, { rootMargin: "100px" });
    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      sync();
    };

    observer.observe(root);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.experienceLayer} data-experience-profile={profile} aria-hidden="true">
      <div className={styles.poster}>
        <span className={`${styles.orbit} ${styles.orbitOne}`} />
        <span className={`${styles.orbit} ${styles.orbitTwo}`} />
        <span className={`${styles.orbit} ${styles.orbitThree}`} />
        <span className={`${styles.orbit} ${styles.orbitFour}`} />
      </div>
      {profile === "full" && Scene ? (
        <Scene active={active} onContextLost={() => setProfile("none")} />
      ) : null}
    </div>
  );
}
