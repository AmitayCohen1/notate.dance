"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cssVar, useThemeTick } from "@/lib/canvas";
import type { Vec3 } from "@/lib/geometry";
import { type Camera, type Pose, type Score, poseAt, project, skeleton } from "@/lib/studio";

export interface StageHandle {
  redraw: () => void;
}

/**
 * The studio window: up to four wireframe figures on a 6-metre floor,
 * their floor paths, ghost frames of the adjacent keyframes, and an
 * orbitable camera. Drag to orbit, scroll to zoom.
 */
const StageCanvas = forwardRef<
  StageHandle,
  {
    score: Score;
    selD: number;
    selK: number;
    tRef: React.RefObject<number>;
    camRef: React.RefObject<Camera>;
    ghosts: boolean;
    paths: boolean;
  }
>(function StageCanvas({ score, selD, selK, tRef, camRef, ghosts, paths }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const props = useRef({ score, selD, selK, ghosts, paths });
  props.current = { score, selD, selK, ghosts, paths };
  const themeTick = useThemeTick();

  /** Size the backing store to the element's own box, at device pixels. */
  const draw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth || 600;
    const h = cv.clientHeight || 400;
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (cv.width !== pw || cv.height !== ph) {
      cv.width = pw;
      cv.height = ph;
    }
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { score, selD, selK, ghosts, paths } = props.current;
    const cam = camRef.current;
    const ink = cssVar("--n-ink");
    const soft = cssVar("--n-soft");
    const faint = cssVar("--n-faint");
    const brand = cssVar("--n-brand");
    const signal = cssVar("--n-signal");

    ctx.clearRect(0, 0, w, h);
    const P = project(cam, w, h);
    const line = (a: Vec3, b: Vec3) => {
      const pa = P(a);
      const pb = P(b);
      if (!pa || !pb) return;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    };

    // floor grid, 3 m half-extent
    ctx.lineWidth = 1;
    ctx.strokeStyle = faint;
    ctx.globalAlpha = 0.55;
    for (let i = -3; i <= 3; i++) {
      line({ x: i, y: 0, z: -3 }, { x: i, y: 0, z: 3 });
      line({ x: -3, y: 0, z: i }, { x: 3, y: 0, z: i });
    }
    ctx.globalAlpha = 1;

    // downstage edge
    ctx.strokeStyle = soft;
    ctx.lineWidth = 1.4;
    line({ x: -3, y: 0, z: 3 }, { x: 3, y: 0, z: 3 });
    const pf = P({ x: 0, y: 0, z: 3.3 });
    if (pf) {
      ctx.fillStyle = faint;
      ctx.font = "12px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText("audience", pf.x, pf.y);
      ctx.textAlign = "left";
    }

    // floor paths + keyframe spots
    if (paths) {
      score.dancers.forEach((d, di) => {
        if (d.keys.length < 2) return;
        ctx.strokeStyle = di === selD ? brand : faint;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        let started = false;
        for (let s = 0; s <= 60; s++) {
          const p = poseAt(d, (s / 60) * score.length);
          const pt = P({ x: p.x, y: 0.012, z: p.z });
          if (!pt) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(pt.x, pt.y);
            started = true;
          } else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        d.keys.forEach((k, ki) => {
          const pt = P({ x: k.pose.x, y: 0.012, z: k.pose.z });
          if (!pt) return;
          ctx.fillStyle = di === selD && ki === selK ? signal : di === selD ? brand : faint;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.2, 0, 7);
          ctx.fill();
        });
      });
    }

    const drawFigure = (pose: Pose, color: string, width: number, alpha: number) => {
      const sk = skeleton(pose);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const [, a, b] of sk.seg) line(a, b);
      const hc = P(sk.headC);
      if (hc) {
        ctx.beginPath();
        ctx.arc(hc.x, hc.y, Math.max(2, (0.085 * Math.min(w, h) * 1.15) / hc.d), 0, 7);
        ctx.stroke();
      }
      for (const j of sk.joints) {
        const pj = P(j);
        if (pj) {
          ctx.beginPath();
          ctx.arc(pj.x, pj.y, width * 0.85, 0, 7);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    // ghost frames: the keyframes either side of the playhead
    const selDancer = score.dancers[selD];
    if (ghosts && selDancer) {
      const ks = selDancer.keys;
      let i = 0;
      while (i < ks.length - 1 && ks[i + 1].beat <= tRef.current) i++;
      for (const k of [ks[i], ks[i + 1]].filter(Boolean)) drawFigure(k.pose, faint, 1.5, 0.5);
    }

    // the dancers themselves
    score.dancers.forEach((d, di) => {
      drawFigure(poseAt(d, tRef.current), di === selD ? brand : ink, di === selD ? 2.8 : 2.3, 1);
    });

    if (readoutRef.current) {
      readoutRef.current.textContent = `yaw ${Math.round(cam.yaw)}° · pitch ${Math.round(cam.pitch)}° · ${cam.dist.toFixed(1)} m`;
    }
  };

  useImperativeHandle(ref, () => ({ redraw: draw }));

  // repaint when the score, selection, toggles or theme change
  useEffect(draw, [score, selD, selK, ghosts, paths, themeTick]);

  // follow the container, not just the window
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(cv);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // orbit + zoom
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let dragging = false;
    let lx = 0;
    let ly = 0;

    const down = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      cv.style.cursor = "grabbing";
      cv.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const cam = camRef.current;
      cam.yaw += (e.clientX - lx) * 0.45;
      cam.pitch = Math.max(-4, Math.min(82, cam.pitch + (e.clientY - ly) * 0.3));
      lx = e.clientX;
      ly = e.clientY;
      draw();
    };
    const up = () => {
      dragging = false;
      cv.style.cursor = "grab";
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = camRef.current;
      cam.dist = Math.max(3.2, Math.min(12, cam.dist + e.deltaY * 0.01));
      draw();
    };

    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", wheel, { passive: false });
    return () => {
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
      cv.removeEventListener("wheel", wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="block size-full cursor-grab touch-none" />
      <span
        ref={readoutRef}
        className="text-muted-foreground pointer-events-none absolute right-3 bottom-2 font-mono text-xs"
      />
    </div>
  );
});

export default StageCanvas;
