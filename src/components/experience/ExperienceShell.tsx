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

/** Stages where the robot is actually on screen; elsewhere the scene stops rendering. */
const activeSceneStages = new Set<RobotStage>(["hero", "services", "final"]);

export function ExperienceShell() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { activateScene, awaitingActivation, disableExperience, inputMode, profile } = useExperienceProfile();
  const [Scene, setScene] = useState<ComponentType<RobotSceneProps> | null>(null);
  const [sceneStatus, setSceneStatus] = useState<"poster" | "loading" | "ready" | "failed">("poster");
  const [stage, setStage] = useState<RobotStage>("hero");
  const [pageVisible, setPageVisible] = useState(true);

  const failScene = useCallback(() => {
    window.performance.mark("cem:spline-failed");
    setSceneStatus("failed");
    disableExperience();
  }, [disableExperience]);
  const handleSceneReady = useCallback(() => {
    window.performance.mark("cem:spline-ready");
    setSceneStatus("ready");
  }, []);

  const handleStageChange = useCallback((nextStage: RobotStage) => setStage(nextStage), []);

  useEffect(() => {
    if (profile !== "full" || Scene) return;
    let cancelled = false;
    window.performance.mark("cem:spline-import-start");
    window.queueMicrotask(() => {
      if (!cancelled) setSceneStatus("loading");
    });
    void import("./SplineRobotScene").then((module) => {
      if (!cancelled) {
        window.performance.mark("cem:spline-import-end");
        setScene(() => module.SplineRobotScene);
      }
    }).catch(() => {
      if (!cancelled) failScene();
    });

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
    <>
      <div
        ref={rootRef}
        className={styles.experienceLayer}
        data-experience-profile={profile}
        data-input-mode={inputMode}
        data-robot-stage="hero"
        data-scene-status={sceneStatus}
      >
        <RobotStoryController hostRef={rootRef} onStageChange={handleStageChange} />
        <div className={styles.robotViewport} aria-hidden="true">
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
      {/*
        * A sibling of the layer, not a child: the layer sits at z-index 2 and the page copy
        * at 3, so a button nested inside it can never be reached by a tap no matter how high
        * its own z-index goes.
        */}
      {awaitingActivation && stage === "hero" ? (
        <button type="button" className={styles.activateScene} onClick={activateScene}>
          3D&apos;yi başlat
        </button>
      ) : null}
    </>
  );
}
