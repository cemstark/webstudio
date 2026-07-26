"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (targets.length === 0) return;

    document.documentElement.classList.add("motionReady");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-visible", "true");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motionReady");
    };
  }, [pathname]);

  return null;
}
