"use client";

import type { Application } from "@splinetool/runtime";
import Spline from "@splinetool/react-spline";
import { Component, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { SPLINE_ROBOT_SCENE_URL } from "@/content/experience";
import styles from "./experience.module.css";

declare global {
  interface Window {
    __CEM_SPLINE_TEST_MOCK__?: boolean;
  }
}

type SplineRobotSceneProps = {
  active: boolean;
  onError: () => void;
  onReady: () => void;
};

function reportLocalSplineInventory(application: Application) {
  const isLocalQa = ["127.0.0.1", "localhost"].includes(window.location.hostname)
    && new URLSearchParams(window.location.search).has("qa-spline-inventory");
  if (!isLocalQa) return;

  const splineEvents = application.getSplineEvents();
  window.dispatchEvent(new CustomEvent("cem:spline-inventory", {
    detail: {
      objects: application.getAllObjects().map(({ name, uuid, visible }) => ({ name, uuid, visible })),
      variables: application.getVariables(),
      events: Object.entries(splineEvents).flatMap(([event, targets]) => (
        Object.keys(targets).map((target) => ({ event, target }))
      )),
    },
  }));
}

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

function DeterministicSplineTestScene({ onError, onReady }: Pick<SplineRobotSceneProps, "onError" | "onReady">) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    const canvas = canvasRef.current;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas?.addEventListener("webglcontextlost", handleContextLoss);
    void fetch(SPLINE_ROBOT_SCENE_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Mock scene response failed");
        onReady();
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) onError();
      });
    return () => {
      controller.abort();
      canvas?.removeEventListener("webglcontextlost", handleContextLoss);
    };
  }, [onError, onReady]);

  return <div className={styles.splineMount} data-spline-scene="robot-guide"><canvas ref={canvasRef} /></div>;
}

export function SplineRobotScene({ active, onError, onReady }: SplineRobotSceneProps) {
  if (window.__CEM_SPLINE_TEST_MOCK__) {
    return <DeterministicSplineTestScene onError={onError} onReady={onReady} />;
  }

  return <RuntimeSplineRobotScene active={active} onError={onError} onReady={onReady} />;
}

function RuntimeSplineRobotScene({ active, onError, onReady }: SplineRobotSceneProps) {
  const applicationRef = useRef<Application | null>(null);
  const contextLossCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextLossHandlerRef = useRef<((event: Event) => void) | null>(null);
  const handleContextLoss = useCallback((event: Event) => {
    event.preventDefault();
    onError();
  }, [onError]);

  useEffect(() => {
    window.performance.mark("cem:spline-mount");
  }, []);

  useEffect(() => {
    const application = applicationRef.current;
    if (!application) return;
    if (active) application.play();
    else application.stop();
  }, [active]);

  useEffect(() => {
    return () => {
      const canvas = contextLossCanvasRef.current;
      const handler = contextLossHandlerRef.current;
      if (canvas && handler) canvas.removeEventListener("webglcontextlost", handler);
      applicationRef.current?.stop();
      contextLossCanvasRef.current = null;
      contextLossHandlerRef.current = null;
      applicationRef.current = null;
    };
  }, []);

  const handleLoad = (application: Application) => {
    const previousCanvas = contextLossCanvasRef.current;
    const previousHandler = contextLossHandlerRef.current;
    if (previousCanvas && previousHandler) {
      previousCanvas.removeEventListener("webglcontextlost", previousHandler);
    }
    applicationRef.current = application;
    contextLossCanvasRef.current = application.canvas;
    contextLossHandlerRef.current = handleContextLoss;
    application.canvas.addEventListener("webglcontextlost", handleContextLoss, { once: true });
    if (!active) application.stop();
    reportLocalSplineInventory(application);
    window.performance.mark("cem:spline-onload");
    onReady();
  };

  return (
    <SplineErrorBoundary onError={onError}>
      <Spline
        className={styles.splineMount}
        data-spline-scene="robot-guide"
        data-spline-active={active ? "true" : "false"}
        scene={SPLINE_ROBOT_SCENE_URL}
        renderOnDemand
        onLoad={handleLoad}
      />
    </SplineErrorBoundary>
  );
}
