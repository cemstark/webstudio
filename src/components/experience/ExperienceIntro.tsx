"use client";

import { useEffect, useRef } from "react";
import styles from "./experience.module.css";

const sessionKey = "cemwebstudio:intro-seen";

export function ExperienceIntro() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData || window.sessionStorage.getItem(sessionKey)) return;

    const overlay = overlayRef.current;
    window.sessionStorage.setItem(sessionKey, "true");
    overlay?.classList.add(styles.introPlaying);
    const timer = window.setTimeout(() => overlay?.classList.remove(styles.introPlaying), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div ref={overlayRef} className={styles.intro} aria-hidden="true">
      <span>cem<span>webstudio</span></span>
      <i />
    </div>
  );
}
