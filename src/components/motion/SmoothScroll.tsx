"use client";

import { useLenis } from "@/lib/animation/useLenis";

/** Mounts the site-wide smooth scroll so every route shares the same scrolling feel. */
export function SmoothScroll() {
  useLenis();
  return null;
}
