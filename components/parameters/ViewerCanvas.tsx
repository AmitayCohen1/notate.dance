"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cssVar, sizeCanvas, useThemeTick } from "@/lib/canvas";
import { LIMBS, Mode, PhraseEvent, poseAt, starts, totalBeats, vecOf } from "./model";

export interface ViewerHandle {
  redraw: () => void;
}

const ViewerCanvas = forwardRef<
  ViewerHandle,
  { phrase: PhraseEvent[]; mode: Mode; selected: number; tRef: React.RefObject<number> }
>(function ViewerCanvas({ phrase, mode, selected, tRef }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const props = useRef({ phrase, mode, selected });
  props.current = { phrase, mode, selected };
  const themeTick = useThemeTick();

  const draw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const { ctx, w, h } = sizeCanvas(cv);
    const { phrase, mode, selected } = props.current;
    const t = tRef.current;
    const ink = cssVar("--n-ink");
    const soft = cssVar("--n-soft");
    const faint = cssVar("--n-faint");
    const acc = cssVar("--n-brand");
    const sig = cssVar("--n-signal");
    ctx.clearRect(0, 0, w, h);

    if (mode === "embodied") {
      const cx = w / 2;
      const floorY = h - 40;
      ctx.strokeStyle = faint;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 110, floorY);
      ctx.lineTo(cx + 110, floorY);
      ctx.stroke();
      const scale = 80;
      const hipY = floorY - scale * 1.15;
      const shY = hipY - scale * 0.95;
      const headY = shY - scale * 0.36;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, shY);
      ctx.lineTo(cx, hipY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - scale * 0.34, shY);
      ctx.lineTo(cx + scale * 0.34, shY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, headY, scale * 0.2, 0, 7);
      ctx.stroke();
      const st = starts(phrase);
      for (const l of LIMBS) {
        const isArm = l.joint === "shoulder";
        const jx = cx - l.side * (isArm ? scale * 0.34 : scale * 0.17);
        const jy = isArm ? shY : hipY;
        const len = isArm ? scale * 0.92 : scale * 1.12;
        const v = poseAt(phrase, l.id, t);
        const px = jx - v.x * len;
        const py = jy - v.y * len;
        let active = false;
        phrase.forEach((ev, i) => {
          if (ev.limb === l.id && t >= st[i] && t < st[i] + ev.beats) active = true;
        });
        ctx.strokeStyle = active ? acc : ink;
        ctx.lineWidth = active ? 3 : 2.4;
        ctx.beginPath();
        ctx.moveTo(jx, jy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.fillStyle = active ? acc : soft;
        ctx.beginPath();
        ctx.arc(px, py, 3.4 + (2.2 * Math.max(0, v.z * -1 + 1)) / 2, 0, 7);
        ctx.fill();
        if (v.z > 0.3) {
          ctx.strokeStyle = faint;
          ctx.beginPath();
          ctx.arc(px, py, 7.5, 0, 7);
          ctx.stroke();
        }
      }
      ctx.fillStyle = faint;
      ctx.font = "10px Menlo, monospace";
      ctx.fillText("front view · ring = limb reaching forward", 14, h - 12);
    } else {
      const T = totalBeats(phrase);
      const padL = 64;
      const padR = 16;
      const padT = 18;
      const rowH = (h - padT - 30) / LIMBS.length;
      ctx.font = "10px Menlo, monospace";
      LIMBS.forEach((l, r) => {
        const y0 = padT + r * rowH;
        const midY = y0 + rowH / 2;
        const amp = rowH * 0.36;
        ctx.strokeStyle = faint;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, midY);
        ctx.lineTo(w - padR, midY);
        ctx.stroke();
        ctx.fillStyle = soft;
        ctx.fillText("k=" + (r + 1), 14, midY + 3);
        ctx.fillText("θ", padL - 18, y0 + 10);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        const N = 140;
        for (let s = 0; s <= N; s++) {
          const tt = (s / N) * T;
          const v = poseAt(phrase, l.id, tt);
          const el = Math.asin(Math.max(-1, Math.min(1, v.y)));
          const x = padL + (w - padL - padR) * (tt / T);
          const y = midY - (el / (Math.PI / 2)) * amp;
          if (s) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.stroke();
        const st = starts(phrase);
        phrase.forEach((ev, i) => {
          if (ev.limb !== l.id) return;
          const tt = st[i] + ev.beats;
          const v = vecOf(ev);
          const el = Math.asin(Math.max(-1, Math.min(1, v.y)));
          const x = padL + (w - padL - padR) * (Math.min(tt, T) / T);
          const y = midY - (el / (Math.PI / 2)) * amp;
          ctx.fillStyle = i === selected ? acc : ink;
          ctx.beginPath();
          ctx.arc(x, y, i === selected ? 4.5 : 3.2, 0, 7);
          ctx.fill();
        });
      });
      const px = padL + (w - padL - padR) * (Math.min(t, T) / T);
      ctx.strokeStyle = sig;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(px, padT - 6);
      ctx.lineTo(px, h - 26);
      ctx.stroke();
      ctx.fillStyle = faint;
      ctx.fillText("elevation θ ∈ [−90°, +90°] · step targets, eased", 14, h - 8);
    }
  };

  useImperativeHandle(ref, () => ({ redraw: draw }));

  // repaint on state or theme change
  useEffect(draw, [phrase, mode, selected, themeTick]);
  // repaint on resize
  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} height={300} />;
});

export default ViewerCanvas;
