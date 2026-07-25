"use client";

import { useEffect, useState } from "react";

/** Read a CSS custom property off :root (used to keep canvases theme-aware). */
export function cssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Size a canvas for the current device pixel ratio without compounding on
 * repeated calls, and return a context pre-scaled to CSS pixels.
 */
export function sizeCanvas(cv: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; w: number; h: number } {
  const dpr = window.devicePixelRatio || 1;
  if (!cv.dataset.designH) {
    cv.dataset.designH = cv.getAttribute("height") || "300";
    cv.style.height = cv.dataset.designH + "px";
  }
  const h = +cv.dataset.designH;
  const w = cv.clientWidth || 600;
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (cv.width !== pw || cv.height !== ph) {
    cv.width = pw;
    cv.height = ph;
  }
  const ctx = cv.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Returns a counter that increments whenever the effective colour theme
 * changes — either the OS scheme or an explicit data-theme override. Include
 * it in a canvas draw effect's deps so the canvas repaints with fresh colours.
 */
export function useThemeTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", bump);
    const obs = new MutationObserver(bump);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => {
      mq.removeEventListener("change", bump);
      obs.disconnect();
    };
  }, []);
  return tick;
}
