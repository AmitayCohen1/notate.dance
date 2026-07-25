/* ============================================================
   Studio — the score model.

   A reconstruction of the ideas in LifeForms / DanceForms. Every
   segment of the figure is an ABSOLUTE direction (azimuth,
   elevation) in body-local space — the Eshkol-Wachman abstraction —
   so the stage and the notations are spellings of one another.

   Body-local space: x = dancer's right, y = up, z = dancer's forward.
   ============================================================ */

import { D2R, type Vec3, dirToAzEl, lerp, lerpAngle, nlerp, rotY, smooth, vec } from "./geometry";

export type BoneId =
  | "torso" | "head"
  | "ruarm" | "rfarm" | "luarm" | "lfarm"
  | "rthigh" | "rshin" | "lthigh" | "lshin";

export interface Bone {
  id: BoneId;
  label: string;
  len: number;
}

export const BONES: Bone[] = [
  { id: "torso", label: "Torso", len: 0.44 },
  { id: "head", label: "Head", len: 0.15 },
  { id: "ruarm", label: "R upper arm", len: 0.27 },
  { id: "rfarm", label: "R forearm", len: 0.25 },
  { id: "luarm", label: "L upper arm", len: 0.27 },
  { id: "lfarm", label: "L forearm", len: 0.25 },
  { id: "rthigh", label: "R thigh", len: 0.42 },
  { id: "rshin", label: "R shin", len: 0.4 },
  { id: "lthigh", label: "L thigh", len: 0.42 },
  { id: "lshin", label: "L shin", len: 0.4 },
];

export const BONE = Object.fromEntries(BONES.map((b) => [b.id, b])) as Record<BoneId, Bone>;

/** An (azimuth, elevation) pair in degrees. */
export type AzEl = [number, number];

export interface Pose {
  hipY: number;
  x: number;
  z: number;
  facing: number;
  bones: Record<BoneId, AzEl>;
}

export interface Keyframe {
  beat: number;
  pose: Pose;
}

export interface Dancer {
  name: string;
  keys: Keyframe[];
}

export interface Score {
  tempo: number;
  length: number;
  dancers: Dancer[];
}

export const STAND: Pose = {
  hipY: 0.98,
  x: 0,
  z: 0,
  facing: 0,
  bones: {
    torso: [0, 86],
    head: [0, 76],
    ruarm: [16, -74],
    rfarm: [10, -84],
    luarm: [-16, -74],
    lfarm: [-10, -84],
    rthigh: [5, -86],
    rshin: [2, -89],
    lthigh: [-5, -86],
    lshin: [-2, -89],
  },
};

export function clonePose(p: Pose): Pose {
  return { ...p, bones: Object.fromEntries(Object.entries(p.bones).map(([k, v]) => [k, [...v]])) as Pose["bones"] };
}

function mkPose(over: { hipY?: number; bones?: Partial<Record<BoneId, AzEl>> }): Pose {
  const p = clonePose(STAND);
  if (over.hipY !== undefined) p.hipY = over.hipY;
  if (over.bones) for (const k of Object.keys(over.bones) as BoneId[]) p.bones[k] = [...over.bones[k]!];
  return p;
}

/** Reusable named stances — the "stance palette" of the original software. */
export const PRESETS: { name: string; pose: Pose }[] = [
  { name: "Stand", pose: mkPose({}) },
  {
    name: "Reach",
    pose: mkPose({
      bones: { torso: [0, 89], head: [0, 84], ruarm: [24, 52], rfarm: [14, 78], luarm: [-24, 52], lfarm: [-14, 78] },
    }),
  },
  {
    name: "Second",
    pose: mkPose({
      bones: {
        ruarm: [86, 8], rfarm: [95, -2], luarm: [-86, 8], lfarm: [-95, -2],
        rthigh: [22, -78], rshin: [18, -87], lthigh: [-22, -78], lshin: [-18, -87],
      },
    }),
  },
  {
    name: "Plié",
    pose: mkPose({
      hipY: 0.74,
      bones: {
        rthigh: [58, -48], rshin: [42, -82], lthigh: [-58, -48], lshin: [-42, -82],
        ruarm: [40, -30], rfarm: [15, -10], luarm: [-40, -30], lfarm: [-15, -10],
      },
    }),
  },
  {
    name: "Arabesque",
    pose: mkPose({
      bones: {
        torso: [0, 52], head: [0, 62], rthigh: [2, -87], rshin: [0, -89],
        lthigh: [180, -12], lshin: [180, -16], ruarm: [12, 14], rfarm: [8, 18],
        luarm: [-130, -18], lfarm: [-140, -24],
      },
    }),
  },
  {
    name: "Attitude",
    pose: mkPose({
      bones: {
        lthigh: [-150, -32], lshin: [-120, -72], ruarm: [55, 38], rfarm: [5, 62],
        luarm: [-88, 4], lfarm: [-96, -6], torso: [8, 84],
      },
    }),
  },
  {
    name: "Curl",
    pose: mkPose({
      hipY: 0.82,
      bones: {
        torso: [0, 38], head: [0, -4], ruarm: [35, -38], rfarm: [-30, -46],
        luarm: [-35, -38], lfarm: [30, -46], rthigh: [25, -62], rshin: [18, -84],
        lthigh: [-25, -62], lshin: [-18, -84],
      },
    }),
  },
  {
    name: "Lunge",
    pose: mkPose({
      hipY: 0.8,
      bones: {
        rthigh: [28, -38], rshin: [22, -80], lthigh: [-176, -50], lshin: [-178, -64],
        torso: [0, 74], ruarm: [20, 30], rfarm: [12, 44], luarm: [-160, -30], lfarm: [-168, -36],
      },
    }),
  },
  {
    name: "Jump",
    pose: mkPose({
      hipY: 1.16,
      bones: {
        rthigh: [14, -42], rshin: [10, -82], lthigh: [-14, -42], lshin: [-10, -82],
        ruarm: [30, 58], rfarm: [18, 84], luarm: [-30, 58], lfarm: [-18, 84], head: [0, 84],
      },
    }),
  },
  {
    name: "Tilt",
    pose: mkPose({
      bones: {
        torso: [88, 58], head: [85, 44], luarm: [-30, 48], lfarm: [-20, 70],
        ruarm: [100, -24], rfarm: [105, -30], rthigh: [8, -86], lthigh: [-30, -72], lshin: [-24, -86],
      },
    }),
  },
];

/* ---------- score ---------- */

export const STORE_KEY = "danceforms-score-v2";

function at(preset: number, over: Partial<Pose>): Pose {
  return Object.assign(clonePose(PRESETS[preset].pose), over);
}

export function demoScore(): Score {
  return {
    tempo: 100,
    length: 32,
    dancers: [
      {
        name: "Dancer 1",
        keys: [
          { beat: 0, pose: at(0, { x: -1.3, z: 0.9, facing: 20 }) },
          { beat: 6, pose: at(1, { x: -0.7, z: 0.2, facing: 0 }) },
          { beat: 12, pose: at(9, { x: 0.1, z: -0.5, facing: -30 }) },
          { beat: 20, pose: at(4, { x: 1.1, z: -1.1, facing: -90 }) },
          { beat: 28, pose: at(6, { x: 1.4, z: 0.3, facing: -160 }) },
        ],
      },
      {
        name: "Dancer 2",
        keys: [
          { beat: 0, pose: at(3, { x: 1.2, z: 1.2, facing: -15 }) },
          { beat: 8, pose: at(2, { x: 0.5, z: 0.6, facing: 10 }) },
          { beat: 16, pose: at(7, { x: -0.6, z: 0.1, facing: 70 }) },
          { beat: 24, pose: at(8, { x: -1.2, z: -0.9, facing: 120 }) },
          { beat: 30, pose: at(0, { x: -1.5, z: -1.4, facing: 160 }) },
        ],
      },
    ],
  };
}

export function validScore(s: unknown): s is Score {
  const c = s as Score | null;
  return !!(
    c &&
    Array.isArray(c.dancers) &&
    c.dancers.length >= 1 &&
    typeof c.length === "number" &&
    c.dancers.every((d) => Array.isArray(d.keys) && d.keys.length > 0 && d.keys.every((k) => k.pose?.bones))
  );
}

export function loadScore(): Score {
  if (typeof window === "undefined") return demoScore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (validScore(parsed)) return parsed;
  } catch {
    /* corrupt or unavailable storage — fall through to the demo */
  }
  return demoScore();
}

/* ---------- interpolation ---------- */

/** The full pose of a dancer at beat t, interpolated between keyframes. */
export function poseAt(d: Dancer, t: number): Pose {
  const ks = d.keys;
  if (!ks.length) return clonePose(STAND);
  if (t <= ks[0].beat) return clonePose(ks[0].pose);
  if (t >= ks[ks.length - 1].beat) return clonePose(ks[ks.length - 1].pose);
  let i = 0;
  while (i < ks.length - 1 && ks[i + 1].beat <= t) i++;
  const A = ks[i];
  const B = ks[i + 1];
  const u = smooth((t - A.beat) / Math.max(1e-6, B.beat - A.beat));
  const p = clonePose(A.pose);
  p.hipY = lerp(A.pose.hipY, B.pose.hipY, u);
  p.x = lerp(A.pose.x, B.pose.x, u);
  p.z = lerp(A.pose.z, B.pose.z, u);
  p.facing = lerpAngle(A.pose.facing, B.pose.facing, u);
  for (const b of BONES) {
    const va = vec(...A.pose.bones[b.id]);
    const vb = vec(...B.pose.bones[b.id]);
    p.bones[b.id] = dirToAzEl(nlerp(va, vb, u));
  }
  return p;
}

/* ---------- skeleton ---------- */

export type Segment = [string, Vec3, Vec3];

export interface Skeleton {
  seg: Segment[];
  headC: Vec3;
  joints: Vec3[];
  named: Record<string, Vec3>;
}

/** World-space points of the figure for one pose. */
export function skeleton(p: Pose): Skeleton {
  const W = (v: Vec3) => rotY(v, p.facing);
  const add = (a: Vec3, v: Vec3, s: number): Vec3 => ({ x: a.x + v.x * s, y: a.y + v.y * s, z: a.z + v.z * s });

  const root: Vec3 = { x: p.x, y: p.hipY, z: p.z };
  const torsoDir = W(vec(...p.bones.torso));
  const chest = add(root, torsoDir, BONE.torso.len);
  const rsh = add(chest, W({ x: 1, y: 0, z: 0 }), 0.19);
  const lsh = add(chest, W({ x: -1, y: 0, z: 0 }), 0.19);
  const rhip = add(root, W({ x: 1, y: 0, z: 0 }), 0.11);
  const lhip = add(root, W({ x: -1, y: 0, z: 0 }), 0.11);

  const headDir = W(vec(...p.bones.head));
  const relbow = add(rsh, W(vec(...p.bones.ruarm)), BONE.ruarm.len);
  const rwrist = add(relbow, W(vec(...p.bones.rfarm)), BONE.rfarm.len);
  const lelbow = add(lsh, W(vec(...p.bones.luarm)), BONE.luarm.len);
  const lwrist = add(lelbow, W(vec(...p.bones.lfarm)), BONE.lfarm.len);
  const rknee = add(rhip, W(vec(...p.bones.rthigh)), BONE.rthigh.len);
  const rankle = add(rknee, W(vec(...p.bones.rshin)), BONE.rshin.len);
  const lknee = add(lhip, W(vec(...p.bones.lthigh)), BONE.lthigh.len);
  const lankle = add(lknee, W(vec(...p.bones.lshin)), BONE.lshin.len);

  const seg: Segment[] = [
    ["torso", root, chest],
    ["clav", rsh, lsh],
    ["pelvis", rhip, lhip],
    ["ruarm", rsh, relbow],
    ["rfarm", relbow, rwrist],
    ["luarm", lsh, lelbow],
    ["lfarm", lelbow, lwrist],
    ["rthigh", rhip, rknee],
    ["rshin", rknee, rankle],
    ["lthigh", lhip, lknee],
    ["lshin", lknee, lankle],
  ];

  return {
    seg,
    headC: add(chest, headDir, BONE.head.len + 0.085),
    joints: [chest, relbow, lelbow, rknee, lknee, rwrist, lwrist, rankle, lankle],
    named: { root, chest, rsh, lsh, rhip, lhip, relbow, lelbow, rwrist, lwrist, rknee, lknee, rankle, lankle },
  };
}

/* ---------- composite limbs (what the notations speak about) ---------- */

export type LimbSetId = "larm" | "lleg" | "rleg" | "rarm" | "body" | "head";

export const LIMBSETS: Record<LimbSetId, { label: string; segs: BoneId[] }> = {
  larm: { label: "L arm", segs: ["luarm", "lfarm"] },
  lleg: { label: "L leg", segs: ["lthigh", "lshin"] },
  rleg: { label: "R leg", segs: ["rthigh", "rshin"] },
  rarm: { label: "R arm", segs: ["ruarm", "rfarm"] },
  body: { label: "Body", segs: ["torso"] },
  head: { label: "Head", segs: ["head"] },
};

/** The overall direction of a composite limb — its segments, summed. */
export function limbVec(pose: Pose, id: LimbSetId): Vec3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const sid of LIMBSETS[id].segs) {
    const v = vec(...pose.bones[sid]);
    const L = BONE[sid].len;
    x += v.x * L;
    y += v.y * L;
    z += v.z * L;
  }
  const m = Math.hypot(x, y, z) || 1;
  return { x: x / m, y: y / m, z: z / m };
}

/** Straighten a composite limb along one direction (what a notation edit means). */
export function setLimbVec(pose: Pose, id: LimbSetId, v: Vec3): void {
  const ae = dirToAzEl(v);
  for (const sid of LIMBSETS[id].segs) pose.bones[sid] = [...ae];
}

export function limbLen(id: LimbSetId): number {
  return LIMBSETS[id].segs.reduce((a, s) => a + BONE[s].len, 0);
}

/** Eshkol-Wachman coordinates of one segment, in 45° units. */
export function ewOfBone(pose: Pose, id: BoneId): { v: number; h: number } {
  const [az, el] = pose.bones[id];
  return { v: (el + 90) / 45, h: (((az % 360) + 360) % 360) / 45 };
}

/* ---------- chance operations ---------- */

export const HEXAGRAMS = "䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿";

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export function randomHexagram(): string {
  return HEXAGRAMS[Math.floor(Math.random() * 64)];
}

/** A stance the machine proposes and a trained body would not volunteer. */
export function randomPose(): Pose {
  const p = clonePose(STAND);
  p.hipY = rnd(0.68, 1.14);
  p.bones.torso = [rnd(-60, 60), rnd(35, 90)];
  p.bones.head = [rnd(-70, 70), rnd(20, 88)];
  for (const id of ["ruarm", "luarm"] as BoneId[]) p.bones[id] = [rnd(-180, 180), rnd(-85, 85)];
  for (const id of ["rfarm", "lfarm"] as BoneId[]) p.bones[id] = [rnd(-180, 180), rnd(-88, 88)];
  for (const id of ["rthigh", "lthigh"] as BoneId[]) p.bones[id] = [rnd(-180, 180), rnd(-90, 5)];
  for (const id of ["rshin", "lshin"] as BoneId[]) p.bones[id] = [rnd(-90, 90), rnd(-90, -30)];
  return p;
}

export function randomPhrase(length: number): Keyframe[] {
  const n = 3 + Math.floor(Math.random() * 4);
  const beats = [0];
  while (beats.length < n) {
    const b = Math.round(rnd(1, length));
    if (!beats.includes(b)) beats.push(b);
  }
  beats.sort((a, b) => a - b);
  return beats.map((b) => {
    const src =
      Math.random() < 0.5 ? clonePose(PRESETS[Math.floor(Math.random() * PRESETS.length)].pose) : randomPose();
    return { beat: b, pose: Object.assign(src, { x: rnd(-2, 2), z: rnd(-2, 2), facing: Math.round(rnd(-180, 180)) }) };
  });
}

export function randomPlace(): Pick<Pose, "x" | "z" | "facing"> {
  return { x: rnd(-2.2, 2.2), z: rnd(-2.2, 2.2), facing: Math.round(rnd(-180, 180)) };
}

/** Swap left and right, and reflect every azimuth. */
export function mirrorPose(p: Pose): void {
  const b = p.bones;
  const sw = (a: BoneId, c: BoneId) => {
    const t = b[a];
    b[a] = b[c];
    b[c] = t;
  };
  sw("ruarm", "luarm");
  sw("rfarm", "lfarm");
  sw("rthigh", "lthigh");
  sw("rshin", "lshin");
  for (const id of BONES.map((x) => x.id)) b[id] = [-b[id][0], b[id][1]];
}

/* ---------- camera ---------- */

export interface Camera {
  yaw: number;
  pitch: number;
  dist: number;
}

export const CAM_PRESETS: Record<string, Camera> = {
  perspective: { yaw: 28, pitch: 22, dist: 6.2 },
  front: { yaw: 0, pitch: 6, dist: 6 },
  side: { yaw: 90, pitch: 6, dist: 6 },
  plan: { yaw: 0, pitch: 78, dist: 6.5 },
};

/** Perspective projection for the stage, or null when behind the camera. */
export function project(cam: Camera, w: number, h: number) {
  const target = { x: 0, y: 0.85, z: 0 };
  const cy = Math.cos(-cam.yaw * D2R);
  const sy = Math.sin(-cam.yaw * D2R);
  // positive pitch looks *down* at the floor
  const cp = Math.cos(cam.pitch * D2R);
  const sp = Math.sin(cam.pitch * D2R);
  const f = Math.min(w, h) * 1.15;
  return (p: Vec3): { x: number; y: number; d: number } | null => {
    const x = p.x - target.x;
    const y = p.y - target.y;
    const z = p.z - target.z;
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    const depth = cam.dist - z2;
    if (depth < 0.25) return null;
    return { x: w / 2 + (f * x1) / depth, y: h / 2 - (f * y2) / depth, d: depth };
  };
}
