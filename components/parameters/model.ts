/* ============================================================
   Parameters page — the shared data structure.
   A single phrase of events { channel, direction, level, duration,
   dynamic } drives every rendering on the page.
   ============================================================ */

import { Vec3, nlerp, clamp } from "@/lib/geometry";
import { DIRS, LEVELS, DirKey, Level } from "@/lib/notation";

export type LimbId = "RA" | "LA" | "RL" | "LL";
export type Dynamic = "sustained" | "sudden";
export type Weight = "light" | "strong";

export interface Limb {
  id: LimbId;
  body: string;
  abs: string;
  joint: "shoulder" | "hip";
  side: 1 | -1;
}

export interface PhraseEvent {
  limb: LimbId;
  dir: DirKey;
  level: Level;
  beats: number;
  time: Dynamic;
  weight: Weight;
}

export const LIMBS: Limb[] = [
  { id: "RA", body: "Right arm", abs: "Channel 1", joint: "shoulder", side: 1 },
  { id: "LA", body: "Left arm", abs: "Channel 2", joint: "shoulder", side: -1 },
  { id: "RL", body: "Right leg", abs: "Channel 3", joint: "hip", side: 1 },
  { id: "LL", body: "Left leg", abs: "Channel 4", joint: "hip", side: -1 },
];

export const LIMB: Record<LimbId, Limb> = Object.fromEntries(LIMBS.map((l) => [l.id, l])) as Record<LimbId, Limb>;

export const INITIAL_PHRASE: PhraseEvent[] = [
  { limb: "RA", dir: "forward", level: "middle", beats: 2, time: "sustained", weight: "light" },
  { limb: "LL", dir: "left", level: "low", beats: 1, time: "sudden", weight: "strong" },
  { limb: "LA", dir: "lf", level: "high", beats: 2, time: "sustained", weight: "light" },
  { limb: "RL", dir: "back", level: "middle", beats: 1, time: "sudden", weight: "strong" },
  { limb: "RA", dir: "place", level: "high", beats: 2, time: "sustained", weight: "strong" },
];

/* ---------- geometry of an event target ---------- */

export function vecOf(ev: PhraseEvent): Vec3 {
  if (ev.dir === "place") {
    return ev.level === "high" ? { x: 0, y: 1, z: 0 } : { x: 0, y: -1, z: 0 };
  }
  const az = (DIRS[ev.dir].az as number) * (Math.PI / 180);
  const el = LEVELS[ev.level].el * (Math.PI / 180);
  return { x: Math.sin(az) * Math.cos(el), y: Math.sin(el), z: Math.cos(az) * Math.cos(el) };
}

export function ewOf(ev: PhraseEvent): { v: number; h: number } {
  if (ev.dir === "place") return { v: ev.level === "high" ? 4 : 0, h: 0 };
  const v = { low: 1, middle: 2, high: 3 }[ev.level];
  return { v, h: (DIRS[ev.dir].az as number) / 45 };
}

export function depthOf(ev: PhraseEvent): "front" | "level" | "behind" {
  const z = vecOf(ev).z;
  if (z > 0.35) return "front";
  if (z < -0.35) return "behind";
  return "level";
}

export function starts(phrase: PhraseEvent[]): number[] {
  let t = 0;
  return phrase.map((ev) => {
    const s = t;
    t += ev.beats;
    return s;
  });
}

export function totalBeats(phrase: PhraseEvent[]): number {
  return phrase.reduce((a, e) => a + e.beats, 0);
}

export function ease(ev: PhraseEvent, u: number): number {
  const c = clamp(u, 0, 1);
  if (ev.time === "sudden") {
    const k = Math.min(1, c / 0.28);
    return k * k * (3 - 2 * k);
  }
  return c * c * (3 - 2 * c);
}

export const REST: Vec3 = { x: 0, y: -1, z: 0 };

/** Interpolated pose (unit vector) of one limb at playhead time t (beats). */
export function poseAt(phrase: PhraseEvent[], limbId: LimbId, t: number): Vec3 {
  const st = starts(phrase);
  let cur = REST;
  for (let i = 0; i < phrase.length; i++) {
    const ev = phrase[i];
    if (ev.limb !== limbId) continue;
    const s = st[i];
    const e = s + ev.beats;
    const target = vecOf(ev);
    if (t < s) return cur;
    if (t < e) return nlerp(cur, target, ease(ev, (t - s) / ev.beats));
    cur = target;
  }
  return cur;
}

export function limbLabel(id: LimbId, mode: Mode): string {
  return mode === "abstract" ? LIMB[id].abs : LIMB[id].body;
}

export type Mode = "embodied" | "abstract";

/* ---------- chip descriptions (embodied vs abstracted) ---------- */

export type ChipSet = { key: string; body: string; abs: string }[];

export const CHIPSETS: Record<string, ChipSet> = {
  lifeforms: [
    { key: "Snapshot", body: "a pose held at one beat", abs: "(channel, time) → pose" },
    { key: "Body part", body: "the arm or leg that moves", abs: "channel number k ∈ {1…4}" },
    { key: "Time", body: "beats, left to right", abs: "t ∈ [0, T]" },
    { key: "In between", body: "how it travels between snapshots", abs: "easing e(t)" },
    { key: "Chance", body: "dice choose what happens next", abs: "uniform sample of the space" },
  ],
  laban: [
    { key: "Direction", body: "the shape of the symbol", abs: "one of 26 rays from the centre" },
    { key: "Height", body: "how the symbol is filled in", abs: "angle θ ∈ {−45°, 0°, +45°}" },
    { key: "Length", body: "how tall the symbol is", abs: "interval length Δt" },
    { key: "Body part", body: "which column it sits in", abs: "channel index k" },
    { key: "Quality", body: "extra signs for effort", abs: "shape and gain of e(t)" },
  ],
  benesh: [
    { key: "Position", body: "where the hand or foot appears", abs: "point (x, y) in a flat frame" },
    { key: "Depth", body: "| in front · — level · • behind", abs: "z ∈ {+1, 0, −1}" },
    { key: "The five lines", body: "head, shoulders, waist, knees, floor", abs: "rulings of the frame" },
    { key: "Rhythm", body: "dots above each frame", abs: "frame duration Δt" },
    { key: "Frame", body: "one drawing per moment", abs: "a sample of the path" },
  ],
  ew: [
    { key: "How high", body: "0 straight down → 4 straight up", abs: "v ∈ {0…4}" },
    { key: "Which way round", body: "45° at a time around the body", abs: "h ∈ {0…7}" },
    { key: "Limb", body: "a straight stick on a ball joint", abs: "radius of a sphere" },
    { key: "Time unit", body: "one column of the table", abs: "tick of a discrete clock" },
    { key: "Kind of move", body: "flat, cone-shaped, or a twist", abs: "class of path on the sphere" },
  ],
};
