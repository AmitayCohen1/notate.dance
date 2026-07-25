"use client";

import { useEffect, useRef } from "react";
import { Vec3, nlerp } from "@/lib/geometry";
import { cssVar, prefersReducedMotion, sizeCanvas, useThemeTick } from "@/lib/canvas";
import { LIMB, Mode, PhraseEvent, REST, ewOf, limbLabel, vecOf } from "./model";

export default function SphereCanvas({
  phrase,
  mode,
  selected,
}: {
  phrase: PhraseEvent[];
  mode: Mode;
  selected: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0.5);
  const props = useRef({ phrase, mode, selected });
  props.current = { phrase, mode, selected };
  const themeTick = useThemeTick();

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const reduced = prefersReducedMotion();
    let raf = 0;

    const draw = () => {
      const { ctx, w, h } = sizeCanvas(cv);
      const { phrase, mode, selected } = props.current;
      const ink = cssVar("--n-ink");
      const soft = cssVar("--n-soft");
      const faint = cssVar("--n-faint");
      const acc = cssVar("--n-brand");
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2 + 4;
      const R = Math.min(w, h) / 2 - 38;
      const rot = angleRef.current;
      const rotP = (v: Vec3) => ({
        x: v.x * Math.cos(rot) + v.z * Math.sin(rot),
        y: v.y,
        z: -v.x * Math.sin(rot) + v.z * Math.cos(rot),
      });
      const P = (v: Vec3) => {
        const r = rotP(v);
        return { x: cx + r.x * R, y: cy - r.y * R, z: r.z };
      };
      const poly = (pts: { x: number; y: number; z: number }[], front: boolean) => {
        ctx.beginPath();
        let started = false;
        for (const p of pts) {
          if ((p.z >= 0) !== front) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      };

      ctx.strokeStyle = soft;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 7);
      ctx.stroke();

      const paths: { x: number; y: number; z: number }[][] = [];
      for (let m = 0; m < 8; m++) {
        const pts = [];
        const az = (m * 45 * Math.PI) / 180;
        for (let s = 0; s <= 48; s++) {
          const el = -Math.PI / 2 + (s / 48) * Math.PI;
          pts.push(P({ x: Math.sin(az) * Math.cos(el), y: Math.sin(el), z: Math.cos(az) * Math.cos(el) }));
        }
        paths.push(pts);
      }
      for (const elv of [-45, 0, 45]) {
        const pts = [];
        const el = (elv * Math.PI) / 180;
        for (let s = 0; s <= 64; s++) {
          const az = (s / 64) * 2 * Math.PI;
          pts.push(P({ x: Math.sin(az) * Math.cos(el), y: Math.sin(el), z: Math.cos(az) * Math.cos(el) }));
        }
        paths.push(pts);
      }
      ctx.strokeStyle = faint;
      ctx.lineWidth = 0.8;
      for (const p of paths) poly(p, false);
      ctx.strokeStyle = soft;
      ctx.lineWidth = 1;
      for (const p of paths) poly(p, true);

      const ev = phrase[selected];
      if (ev) {
        let prev = REST;
        for (let i = 0; i < selected; i++) if (phrase[i].limb === ev.limb) prev = vecOf(phrase[i]);
        const target = vecOf(ev);
        ctx.strokeStyle = acc;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let s = 0; s <= 32; s++) {
          const p = P(nlerp(prev, target, s / 32));
          if (s) ctx.lineTo(p.x, p.y);
          else ctx.moveTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        const p = P(target);
        ctx.strokeStyle = acc;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.fillStyle = acc;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, 7);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, 7);
        ctx.fill();
        const co = ewOf(ev);
        ctx.fillStyle = ink;
        ctx.font = "12px Menlo, monospace";
        ctx.fillText(`(${co.v} / ${co.h})`, p.x + 9, p.y + 4);
        ctx.fillStyle = faint;
        ctx.font = "10px Menlo, monospace";
        const lab =
          mode === "abstract"
            ? `unit vector on S² · event e${selected + 1}`
            : `${limbLabel(ev.limb, mode).toLowerCase()} from the ${LIMB[ev.limb].joint} · event e${selected + 1}`;
        ctx.fillText(lab, 14, h - 12);
      }
    };

    const loop = () => {
      angleRef.current += 0.0035;
      draw();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      draw();
      const onResize = () => draw();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    } else {
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }
    // reduced-motion path repaints when the selected event, mode, or theme changes
  }, [phrase, mode, selected, themeTick]);

  return <canvas ref={canvasRef} height={300} />;
}
