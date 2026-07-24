"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function RouteTransition() {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const overlay = overlayRef.current;
    overlay?.classList.remove("isActive");
    const frame = window.requestAnimationFrame(() => overlay?.classList.add("isActive"));
    const timer = window.setTimeout(() => overlay?.classList.remove("isActive"), 650);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return <div ref={overlayRef} className="routeTransition" aria-hidden="true" />;
}
