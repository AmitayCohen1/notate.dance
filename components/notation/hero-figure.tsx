"use client";

import { useEffect, useRef } from "react";
import { cssVar, prefersReducedMotion, useThemeTick } from "@/lib/canvas";
import { type Vec3, dirToAzEl, nlerp, smooth, vec } from "@/lib/geometry";
import { labanOf } from "@/lib/notation";
import { useCopy } from "@/components/locale-provider";
import {
  BONES,
  type Pose,
  PRESETS,
  clonePose,
  ewOfBone,
  project,
  skeleton,
} from "@/lib/studio";

/** The stances the figure travels through, by name in PRESETS. */
const SEQUENCE = ["Stand", "Reach", "Second", "Attitude", "Arabesque", "Jump", "Tilt", "Plié", "Lunge"];
const TRAVEL = 1.15; // seconds moving between stances
const SETTLE = 0.75; // seconds held on the stance, so the eye can read it
const STEP = TRAVEL + SETTLE;
const TRAIL = 34; // wrist-path samples kept
const GHOSTS = 3;

function poseFrom(name: string): Pose {
  return clonePose((PRESETS.find((p) => p.name === name) ?? PRESETS[0]).pose);
}

/** Interpolate two stances the way the studio does: per-segment, on the sphere. */
function blend(a: Pose, b: Pose, u: number): Pose {
  const p = clonePose(a);
  p.hipY = a.hipY + (b.hipY - a.hipY) * u;
  for (const bone of BONES) {
    p.bones[bone.id] = dirToAzEl(nlerp(vec(...a.bones[bone.id]), vec(...b.bones[bone.id]), u));
  }
  return p;
}

/**
 * The hero's moving figure: one wireframe dancer travelling through a
 * sequence of stances on an orbiting stage, trailing its own wrist path,
 * with the numbers each notation would record printed live beside it.
 *
 * It is the whole site in one image — a body reduced to directions.
 */
export default function HeroFigure({
  className = "",
  onReadout,
}: {
  className?: string;
  /** Called a few times a second with the right arm, as each notation would write it. */
  onReadout?: (r: { ew: string; laban: string }) => void;
}) {
  const t = useCopy();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeTick = useThemeTick();
  const readoutRef = useRef(onReadout);
  readoutRef.current = onReadout;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const reduced = prefersReducedMotion();
    const poses = SEQUENCE.map(poseFrom);
    const trail: Vec3[] = [];
    const ghosts: Pose[] = [];
    let raf = 0;
    let t0: number | null = null;
    let frame = 0;

    const draw = (elapsed: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = cv.clientWidth || 480;
      const h = cv.clientHeight || 420;
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (cv.width !== pw || cv.height !== ph) {
        cv.width = pw;
        cv.height = ph;
      }
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const ink = cssVar("--n-ink");
      const soft = cssVar("--n-soft");
      const faint = cssVar("--n-faint");
      const brand = cssVar("--n-brand");

      // where in the sequence we are
      const total = poses.length * STEP;
      const local = ((elapsed % total) + total) % total;
      const i = Math.floor(local / STEP);
      const u = smooth(Math.min(1, (local % STEP) / TRAVEL));
      const pose = blend(poses[i], poses[(i + 1) % poses.length], u);
      pose.x = 0;
      pose.z = 0;
      pose.facing = 0;

      const cam = { yaw: reduced ? 26 : 20 + Math.sin(elapsed * 0.18) * 26, pitch: 14, dist: 3.2 };
      // project into the real box, then drop the whole scene a little so the
      // figure sits on the lower third with headroom above it
      const raw = project(cam, w, h);
      const shift = -h * 0.02;
      const P = (v: Vec3) => {
        const p = raw(v);
        return p ? { ...p, y: p.y + shift } : null;
      };
      const sk = skeleton(pose);

      const line = (a: Vec3, b: Vec3) => {
        const pa = P(a);
        const pb = P(b);
        if (!pa || !pb) return;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      };

      // floor: a few rings, so the figure has ground without a grid shouting
      ctx.lineWidth = 1;
      ctx.strokeStyle = faint;
      for (const r of [0.7, 1.35]) {
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        let started = false;
        for (let s = 0; s <= 64; s++) {
          const a = (s / 64) * Math.PI * 2;
          const pt = P({ x: Math.cos(a) * r, y: 0, z: Math.sin(a) * r });
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
      }
      ctx.globalAlpha = 1;

      const drawFigure = (p: Pose, colour: string, width: number, alpha: number) => {
        const s = skeleton(p);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = colour;
        ctx.fillStyle = colour;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (const [, a, b] of s.seg) line(a, b);
        const hc = P(s.headC);
        if (hc) {
          ctx.beginPath();
          ctx.arc(hc.x, hc.y, Math.max(3, (0.1 * Math.min(w, h) * 1.15) / hc.d), 0, 7);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      };

      // ghosts of where the body just was
      ghosts.forEach((g, gi) => drawFigure(g, faint, 1.1, 0.07 + (gi / ghosts.length) * 0.13));

      // the wrist's path through space
      if (trail.length > 1) {
        ctx.lineCap = "round";
        for (let s = 1; s < trail.length; s++) {
          const pa = P(trail[s - 1]);
          const pb = P(trail[s]);
          if (!pa || !pb) continue;
          ctx.globalAlpha = (s / trail.length) * 0.85;
          ctx.strokeStyle = brand;
          ctx.lineWidth = 1 + (s / trail.length) * 2.2;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      drawFigure(pose, ink, 2.6, 1);

      // joints, and the wrist the trail belongs to
      ctx.fillStyle = soft;
      for (const j of sk.joints) {
        const pj = P(j);
        if (pj) {
          ctx.beginPath();
          ctx.arc(pj.x, pj.y, 2.4, 0, 7);
          ctx.fill();
        }
      }
      const pw2 = P(sk.named.rwrist);
      if (pw2) {
        ctx.fillStyle = brand;
        ctx.beginPath();
        ctx.arc(pw2.x, pw2.y, 4.2, 0, 7);
        ctx.fill();
      }

      // sample the trail and the ghosts on a slower clock than the frame rate
      if (!reduced) {
        frame++;
        if (frame % 2 === 0) {
          trail.push(sk.named.rwrist);
          if (trail.length > TRAIL) trail.shift();
        }
        if (frame % 22 === 0) {
          ghosts.push(clonePose(pose));
          if (ghosts.length > GHOSTS) ghosts.shift();
        }
      }

      // hand the same movement to React as numbers, at a readable rate
      if (readoutRef.current && frame % 9 === 0) {
        const ew = ewOfBone(pose, "ruarm");
        const q = labanOf(vec(...pose.bones.ruarm));
        readoutRef.current({ ew: `${ew.v.toFixed(1)} / ${ew.h.toFixed(1)}`, laban: `${t.dirs[q.dir]} · ${t.levels[q.level]}` });
      }
    };

    if (reduced) {
      frame = 8; // let the single draw emit one readout
      draw(STEP * 4.5);
      const onResize = () => draw(STEP * 4.5);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const tick = (ts: number) => {
      if (t0 === null) t0 = ts;
      draw((ts - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [themeTick, t]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="block size-full" aria-hidden="true" />
    </div>
  );
}
