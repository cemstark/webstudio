"use client";

import { useRef } from "react";
import { useGsapContext } from "@/lib/animation/useGsapContext";
import type { MotionRuntime } from "@/lib/animation/runtime";
import { duration, ease, parallax, revealFrom, revealTo, scrollTriggerDefaults, stagger } from "@/lib/animation/presets";

const MOBILE_QUERY = "(max-width: 47.99rem)";

/**
 * Scroll choreography for the homepage.
 *
 * Deliberately disjoint from MotionObserver: nothing here selects `[data-reveal]`, so the
 * two systems never animate the same element. Everything animates transform and opacity
 * only, so no step can trigger layout.
 */
function setupHomeMotion({ gsap, ScrollTrigger }: MotionRuntime, scope: HTMLElement) {
  const isMobile = window.matchMedia(MOBILE_QUERY).matches;

  // Showcase cards drift at slightly different speeds so the grid reads as depth, not tiles.
  const travel = isMobile ? parallax.mobilePx : parallax.desktopPx;
  for (const card of scope.querySelectorAll<HTMLElement>("[data-parallax]")) {
    const factor = Number(card.dataset.parallax) || 1;
    gsap.fromTo(
      card,
      { y: travel * factor },
      {
        y: -travel * factor,
        ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  }

  // Card groups enter together but not in lockstep.
  for (const group of new Set([...scope.querySelectorAll<HTMLElement>("[data-stagger]")].map((card) => card.parentElement))) {
    if (!group) continue;
    gsap.fromTo(
      group.querySelectorAll("[data-stagger]"),
      revealFrom,
      { ...revealTo, stagger: stagger.tight, scrollTrigger: { trigger: group, ...scrollTriggerDefaults } },
    );
  }

  // Heading lines ride up from behind their own mask.
  for (const heading of scope.querySelectorAll<HTMLElement>("[data-mask-lines]")) {
    gsap.fromTo(
      heading.querySelectorAll(":scope > span > span"),
      { yPercent: 100 },
      {
        yPercent: 0,
        duration: duration.slow,
        ease: ease.expressive,
        stagger: stagger.loose,
        scrollTrigger: { trigger: heading, ...scrollTriggerDefaults },
      },
    );
  }

  // The process line fills as the reader moves through the steps.
  for (const line of scope.querySelectorAll<HTMLElement>("[data-progress-line]")) {
    const bar = line.querySelector(":scope > span");
    if (!bar) continue;
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: line, start: "top 78%", end: "bottom 65%", scrub: true },
      },
    );
  }

  ScrollTrigger.refresh();
}

export function HomeMotion() {
  const scopeRef = useRef<HTMLElement | null>(null);

  useGsapContext(scopeRef, setupHomeMotion);

  // The scope must be the page wrapper so the selectors can reach every section.
  // A callback ref resolves it during render, before useGsapContext's effect runs.
  return <div ref={(node) => { scopeRef.current = node?.parentElement ?? null; }} hidden />;
}
