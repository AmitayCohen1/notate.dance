/* ============================================================
   Shared geometry — the common spatial vocabulary of the site.
   Body-local space: x = dancer's right, y = up, z = dancer's forward.
   Every direction is a unit vector; angles are (azimuth, elevation).
   ============================================================ */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const D2R = Math.PI / 180;

/** Unit vector from azimuth (around y, 0 = forward) and elevation (0 = level). */
export function vec(az: number, el: number): Vec3 {
  const a = az * D2R;
  const e = el * D2R;
  return { x: Math.sin(a) * Math.cos(e), y: Math.sin(e), z: Math.cos(a) * Math.cos(e) };
}

/** Rotate a vector about the vertical axis by `deg` degrees. */
export function rotY(v: Vec3, deg: number): Vec3 {
  const r = deg * D2R;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}

/** Normalized linear interpolation between two direction vectors. */
export function nlerp(a: Vec3, b: Vec3, u: number): Vec3 {
  const x = a.x + (b.x - a.x) * u;
  const y = a.y + (b.y - a.y) * u;
  const z = a.z + (b.z - a.z) * u;
  const m = Math.hypot(x, y, z) || 1;
  return { x: x / m, y: y / m, z: z / m };
}

export function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u;
}

/** Interpolate an angle in degrees along the shortest arc. */
export function lerpAngle(a: number, b: number, u: number): number {
  const d = ((b - a) % 360 + 540) % 360 - 180;
  return a + d * u;
}

/** Smoothstep easing. */
export function smooth(u: number): number {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
}

/** Unit direction vector → [azimuth°, elevation°]. */
export function dirToAzEl(v: Vec3): [number, number] {
  return [
    Math.atan2(v.x, v.z) / D2R,
    Math.asin(Math.max(-1, Math.min(1, v.y))) / D2R,
  ];
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}
