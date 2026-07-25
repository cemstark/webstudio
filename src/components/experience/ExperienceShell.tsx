"use client";

import type { ComponentType } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RobotStage } from "@/content/experience";
import { useExperienceProfile } from "@/hooks/useExperienceProfile";
import { robotMotion } from "@/lib/motion";
import { RobotFallback } from "./RobotFallback";
import { RobotStoryController } from "./RobotStoryController";
import styles from "./experience.module.css";

type RobotSceneProps = {
  active: boolean;
  onError: () => void;
  onReady: () => void;
};

const activeSceneStages = new Set<RobotStage>([
  "hero",
  "service-web",
  "service-seo",
  "service-mobile",
  "service-commerce",
  "final",
]);

export function ExperienceShell() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { disableExperience, inputMode, profile } = useExperienceProfile();
  const [Scene, setScene] = useState<ComponentType<RobotSceneProps> | null>(null);
  const [sceneStatus, setSceneStatus] = useState<"poster" | "loading" | "ready" | "failed">("poster");
  const [stage, setStage] = useState<RobotStage>("hero");
  const [pageVisible, setPageVisible] = useState(true);

  const failScene = useCallback(() => {
    setSceneStatus("failed");
    disableExperience();
  }, [disableExperience]);
  const handleSceneReady = useCallback(() => setSceneStatus("ready"), []);

  const handleStageChange = useCallback((nextStage: RobotStage) => setStage(nextStage), []);

  useEffect(() => {
    if (profile !== "full" || Scene) return;
    let cancelled = false;
    void import("./SplineRobotScene").then((module) => {
      if (!cancelled) {
        setSceneStatus("loading");
        setScene(() => module.SplineRobotScene);
      }
    }).catch(failScene);

    return () => {
      cancelled = true;
    };
  }, [profile, Scene, failScene]);

  useEffect(() => {
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (profile !== "full" || sceneStatus === "ready" || sceneStatus === "failed") return;
    const timeout = window.setTimeout(failScene, robotMotion.sceneLoadTimeout);
    return () => window.clearTimeout(timeout);
  }, [profile, sceneStatus, failScene]);

  const active = pageVisible && activeSceneStages.has(stage);

  return (
    <div
      ref={rootRef}
      className={styles.experienceLayer}
      data-experience-profile={profile}
      data-input-mode={inputMode}
      data-robot-stage="hero"
      data-scene-status={sceneStatus}
      aria-hidden="true"
    >
      <RobotStoryController hostRef={rootRef} onStageChange={handleStageChange} />
      <div className={styles.robotViewport}>
        <RobotFallback />
        {profile === "full" && Scene ? (
          <Scene
            active={active}
            onError={failScene}
            onReady={handleSceneReady}
          />
        ) : null}
      </div>
    </div>
  );
}
