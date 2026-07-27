/* ============================================================
   Parameters page — the shared data structure.
   A single phrase of events { channel, direction, level, duration,
   dynamic } drives every rendering on the page.
   ============================================================ */

import { Vec3, nlerp, clamp } from "@/lib/geometry";
import { DIRS, LEVELS, DirKey, Level } from "@/lib/notation";
import type { Copy } from "@/lib/copy";

export type LimbId = "RA" | "LA" | "RL" | "LL";
export type Dynamic = "sustained" | "sudden";
export type Weight = "light" | "strong";

export interface Limb {
  id: LimbId;
  /** Position in the abstract reading: "Channel 1" is channel index 1. */
  channel: number;
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
  { id: "RA", channel: 1, joint: "shoulder", side: 1 },
  { id: "LA", channel: 2, joint: "shoulder", side: -1 },
  { id: "RL", channel: 3, joint: "hip", side: 1 },
  { id: "LL", channel: 4, joint: "hip", side: -1 },
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

export type Mode = "embodied" | "abstract";

/** "Right arm" or "Channel 1", in the language of the page. */
export function limbLabel(t: Copy, id: LimbId, mode: Mode): string {
  return mode === "abstract" ? t.limbs.channel(LIMB[id].channel) : t.limbs[id];
}

/** The same, shortened to fit a score's row gutter. */
export function limbShort(t: Copy, id: LimbId, mode: Mode): string {
  return mode === "abstract" ? `k${LIMB[id].channel}` : t.limbsShort[id];
}

export type ChipSet = { key: string; body: string; abs: string }[];
