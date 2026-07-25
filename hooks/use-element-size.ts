"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Measures an element so canvases and SVG scores can be laid out to the
 * space they actually have, rather than to a fixed design width.
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1 ? prev : { width, height },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, ...size };
}
