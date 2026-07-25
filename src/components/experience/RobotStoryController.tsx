"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { robotStages, type RobotStage } from "@/content/experience";
import { robotMotion } from "@/lib/motion";

type RobotStoryControllerProps = {
  hostRef: RefObject<HTMLDivElement | null>;
  onStageChange: (stage: RobotStage) => void;
};

export function RobotStoryController({ hostRef, onStageChange }: RobotStoryControllerProps) {
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const sections = robotStages.flatMap((stage) => {
      const element = document.querySelector<HTMLElement>(
        `[data-robot-stage="${stage}"]:not([data-experience-profile])`,
      );
      return element ? [{ stage, element }] : [];
    });
    if (!sections.length) return;

    let frame = 0;
    let currentStage: RobotStage = "hero";
    let previousScrollY = window.scrollY;

    const update = () => {
      frame = 0;
      const anchor = window.innerHeight * robotMotion.stageAnchor;
      let active = sections[0];

      for (const section of sections) {
        const rect = section.element.getBoundingClientRect();
        if (rect.top <= anchor) active = section;
        if (rect.top <= anchor && rect.bottom > anchor) break;
      }

      const rect = active.element.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (anchor - rect.top) / Math.max(1, rect.height)));
      host.style.setProperty("--robot-stage-progress", progress.toFixed(4));
      host.dataset.scrollDirection = window.scrollY >= previousScrollY ? "forward" : "backward";
      previousScrollY = window.scrollY;

      if (active.stage !== currentStage) {
        currentStage = active.stage;
        host.dataset.robotStage = currentStage;
        onStageChange(currentStage);
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const resizeObserver = new ResizeObserver(schedule);
    sections.forEach(({ element }) => resizeObserver.observe(element));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [hostRef, onStageChange]);

  return null;
}
