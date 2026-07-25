"use client";

import type { Application } from "@splinetool/runtime";
import Spline from "@splinetool/react-spline";
import { Component, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { SPLINE_ROBOT_SCENE_URL } from "@/content/experience";
import styles from "./experience.module.css";

type SplineRobotSceneProps = {
  active: boolean;
  onError: () => void;
  onReady: () => void;
};

class SplineErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SplineRobotScene({ active, onError, onReady }: SplineRobotSceneProps) {
  const applicationRef = useRef<Application | null>(null);

  useEffect(() => {
    const application = applicationRef.current;
    if (!application) return;
    if (active) application.play();
    else application.stop();
  }, [active]);

  const handleLoad = (application: Application) => {
    applicationRef.current = application;
    if (!active) application.stop();
    onReady();
  };

  return (
    <SplineErrorBoundary onError={onError}>
      <Spline
        className={styles.splineMount}
        data-spline-scene="robot-guide"
        scene={SPLINE_ROBOT_SCENE_URL}
        renderOnDemand
        onLoad={handleLoad}
      />
    </SplineErrorBoundary>
  );
}
