/* ============================================================
   Shared notation vocabulary — direction tables and the symbol
   geometry common to the Parameters and Studio pages.
   ============================================================ */

import { Vec3, vec, dirToAzEl } from "./geometry";

/** The nine Labanotation direction "shapes" used on this site. */
export type DirKey =
  | "place" | "forward" | "rf" | "right" | "rb" | "back" | "lb" | "left" | "lf";

export type Level = "low" | "middle" | "high";

export interface DirInfo {
  az: number | null;
  label: string;
  arrow: string;
}

export const DIRS: Record<DirKey, DirInfo> = {
  place:   { az: null, label: "place",         arrow: "●" },
  forward: { az: 0,    label: "forward",       arrow: "↑" },
  rf:      { az: 45,   label: "right-forward", arrow: "↗" },
  right:   { az: 90,   label: "right",         arrow: "→" },
  rb:      { az: 135,  label: "right-back",    arrow: "↘" },
  back:    { az: 180,  label: "back",          arrow: "↓" },
  lb:      { az: 225,  label: "left-back",     arrow: "↙" },
  left:    { az: 270,  label: "left",          arrow: "←" },
  lf:      { az: 315,  label: "left-forward",  arrow: "↖" },
};

export const LEVELS: Record<Level, { el: number; label: string }> = {
  low:    { el: -45, label: "low" },
  middle: { el: 0,   label: "middle" },
  high:   { el: 45,  label: "high" },
};

/** The eight non-central directions, in azimuth order (Studio quantization). */
export const DIR8: DirKey[] = ["forward", "rf", "right", "rb", "back", "lb", "left", "lf"];

export const DIR_ARROW: Record<string, string> = {
  forward: "↑", rf: "↗", right: "→", rb: "↘",
  back: "↓", lb: "↙", left: "←", lf: "↖", place: "●",
};

/** Rose ordering used by both inspectors (3×3 grid, place at centre). */
export const ROSE_ORDER: DirKey[] = ["lf", "forward", "rf", "left", "place", "right", "lb", "back", "rb"];

/* ---------- Labanotation symbol geometry ---------- */

export type Shade = "solid" | "hatch" | "plain";

export interface LabanSymbol {
  /** SVG path `d` for the symbol outline. */
  d: string;
  /** How the interior is filled: solid (low), hatched (high), or plain+dot (middle). */
  shade: Shade;
}

/**
 * Build the outline for a Labanotation direction symbol inside the box
 * (x, y, w, h) with y at the top. Left-limb symbols set `mirror` so the
 * direction notch flips, matching the staff column convention.
 */
export function labanSymbol(
  dir: DirKey,
  level: Level,
  x: number,
  y: number,
  w: number,
  h: number,
  mirror: boolean,
): LabanSymbol {
  const nw = w * 0.5;
  const nh = Math.min(h * 0.35, 14);
  let d: string;
  switch (dir) {
    case "place":
      d = `M${x},${y} h${w} v${h} h${-w} Z`;
      break;
    case "forward":
      d = mirror
        ? `M${x},${y + nh} h${nw} v${-nh} h${w - nw} v${h} h${-w} Z`
        : `M${x},${y} h${nw} v${nh} h${w - nw} v${h - nh} h${-w} Z`;
      break;
    case "back":
      d = mirror
        ? `M${x},${y} h${w} v${h} h${-(w - nw)} v${-nh} h${-nw} Z`
        : `M${x},${y} h${w} v${h - nh} h${-(w - nw)} v${nh} h${-nw} Z`;
      break;
    case "right":
      d = `M${x},${y} h${w * 0.55} L${x + w},${y + h / 2} L${x + w * 0.55},${y + h} h${-w * 0.55} Z`;
      break;
    case "left":
      d = `M${x + w * 0.45},${y} h${w * 0.55} v${h} h${-w * 0.55} L${x},${y + h / 2} Z`;
      break;
    case "rf":
      d = `M${x},${y + nh} L${x + w * 0.55},${y + nh} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`;
      break;
    case "lf":
      d = `M${x},${y} L${x + w * 0.45},${y + nh} L${x + w},${y + nh} L${x + w},${y + h} L${x},${y + h} Z`;
      break;
    case "rb":
      d = `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x + w * 0.55},${y + h - nh} L${x},${y + h - nh} Z`;
      break;
    case "lb":
      d = `M${x},${y} L${x + w},${y} L${x + w},${y + h - nh} L${x + w * 0.45},${y + h - nh} L${x},${y + h} Z`;
      break;
    default:
      d = `M${x},${y} h${w} v${h} h${-w} Z`;
  }
  const shade: Shade = level === "low" ? "solid" : level === "high" ? "hatch" : "plain";
  return { d, shade };
}

/** Quantize a direction vector to the nearest Laban shape + level (Studio). */
export function labanOf(v: Vec3): { dir: DirKey; level: Level } {
  const [az, el] = dirToAzEl(v);
  if (el > 67.5) return { dir: "place", level: "high" };
  if (el < -67.5) return { dir: "place", level: "low" };
  const idx = ((Math.round(az / 45) % 8) + 8) % 8;
  return { dir: DIR8[idx], level: el > 22.5 ? "high" : el < -22.5 ? "low" : "middle" };
}

/** Inverse of labanOf — a quantized shape back to a unit vector. */
export function labanToVec(q: { dir: DirKey; level: Level }): Vec3 {
  if (q.dir === "place") return q.level === "high" ? { x: 0, y: 1, z: 0 } : { x: 0, y: -1, z: 0 };
  const el = { low: -45, middle: 0, high: 45 }[q.level];
  return vec(DIR8.indexOf(q.dir) * 45, el);
}

/** Benesh depth qualifier from a direction's sagittal (z) component. */
export function beneshDepthOf(v: Vec3): "front" | "level" | "behind" {
  return v.z > 0.3 ? "front" : v.z < -0.3 ? "behind" : "level";
}

export const DEPTH_GLYPH: Record<string, string> = { front: "|", level: "—", behind: "•" };

/** Eshkol-Wachman coordinates from an (az, el) segment direction. */
export function ewCoord(az: number, el: number): { v: number; h: number } {
  return { v: (el + 90) / 45, h: (((az % 360) + 360) % 360) / 45 };
}
