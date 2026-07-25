import { DirKey, Level, labanSymbol } from "@/lib/notation";

/** A 45° hatch fill pattern, referenced by url(#id) for "high"-level symbols. */
export function HatchPattern({ id }: { id: string }) {
  return (
    <pattern id={id} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1={0} y1={0} x2={0} y2={6} style={{ stroke: "var(--n-ink)", strokeWidth: 1.4 }} />
    </pattern>
  );
}

/** One Labanotation direction symbol: outline + level shading (+ centre dot for middle). */
export function LabanGlyph({
  dir,
  level,
  x,
  y,
  w,
  h,
  mirror,
  hatchId,
  plainFill = "var(--n-card)",
  strokeW = 1.5,
  dotR = 2.4,
}: {
  dir: DirKey;
  level: Level;
  x: number;
  y: number;
  w: number;
  h: number;
  mirror: boolean;
  hatchId: string;
  plainFill?: string;
  strokeW?: number;
  dotR?: number;
}) {
  const { d, shade } = labanSymbol(dir, level, x, y, w, h, mirror);
  const fill = shade === "solid" ? "var(--n-ink)" : shade === "hatch" ? `url(#${hatchId})` : plainFill;
  return (
    <>
      <path d={d} fill={fill} style={{ stroke: "var(--n-ink)", strokeWidth: strokeW }} strokeLinejoin="miter" />
      {shade === "plain" && <circle cx={x + w / 2} cy={y + h / 2} r={dotR} fill="var(--n-ink)" />}
    </>
  );
}
