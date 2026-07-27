"use client";

import { Vec3 } from "@/lib/geometry";
import { HatchPattern, LabanGlyph } from "@/components/notation/glyphs";
import { LIMB, LIMBS, Mode, PhraseEvent, limbShort, starts, totalBeats, vecOf } from "./model";
import { useCopy } from "@/components/locale-provider";

export default function LabanView({
  phrase,
  mode,
  selected,
  onSelect,
}: {
  phrase: PhraseEvent[];
  mode: Mode;
  selected: number;
  onSelect: (i: number) => void;
}) {
  const t = useCopy();
  const st = starts(phrase);
  const T = totalBeats(phrase);

  if (mode === "embodied") {
    const beatH = 52;
    const top = 34;
    const bottom = 68;
    const H = T * beatH + top + bottom;
    const colW = 56;
    const gap = 10;
    const cx = 300;
    const colX: Record<string, number> = {
      LA: cx - 2 * colW - gap - 14,
      LL: cx - colW - 14,
      RL: cx + 14,
      RA: cx + colW + gap + 14,
    };
    const barL = cx - 2.5 * colW - gap - 20;
    const barR = cx + 2.5 * colW + gap + 20;

    return (
      <svg viewBox={`0 0 600 ${H}`} width={600} height={H} style={{ maxWidth: "100%" }}>
        <defs>
          <HatchPattern id="labanHz" />
        </defs>
        {/* centre double line */}
        <line x1={cx - 3} y1={top - 14} x2={cx - 3} y2={H - bottom + 14} style={{ stroke: "var(--n-ink)", strokeWidth: 1.6 }} />
        <line x1={cx + 3} y1={top - 14} x2={cx + 3} y2={H - bottom + 14} style={{ stroke: "var(--n-ink)", strokeWidth: 1.6 }} />
        {/* start double bar */}
        <line x1={barL} y1={H - bottom + 6} x2={barR} y2={H - bottom + 6} style={{ stroke: "var(--n-ink)", strokeWidth: 1.4 }} />
        <line x1={barL} y1={H - bottom + 11} x2={barR} y2={H - bottom + 11} style={{ stroke: "var(--n-ink)", strokeWidth: 1.4 }} />
        {/* beat ticks */}
        {Array.from({ length: T + 1 }, (_, b) => {
          const y = H - bottom - b * beatH;
          return (
            <g key={`t${b}`}>
              <line x1={barL} y1={y} x2={cx - 2.5 * colW - gap - 6} y2={y} style={{ stroke: "var(--n-line)", strokeWidth: 1 }} />
              <text x={cx - 2.5 * colW - gap - 26} y={y + 4} textAnchor="end" className="font-mono" fontSize={13} fill="var(--n-faint)">
                {b}
              </text>
            </g>
          );
        })}
        {/* column labels (staggered) */}
        {LIMBS.map((l) => {
          const isArm = l.joint === "shoulder";
          return (
            <text
              key={l.id}
              x={colX[l.id] + colW / 2 - 9}
              y={H - (isArm ? 14 : 34)}
              textAnchor="middle"
              fontSize={13}
              style={{ letterSpacing: ".08em" }}
              fill="var(--n-soft)"
              fontFamily="var(--font-geist), var(--font-heebo)"
            >
              {limbShort(t, l.id, mode)}
            </text>
          );
        })}
        {/* symbols */}
        {phrase.map((ev, i) => {
          const x = colX[ev.limb] + (colW - 28) / 2 - 9;
          const y1 = H - bottom - st[i] * beatH;
          const y0 = H - bottom - (st[i] + ev.beats) * beatH;
          const sel = i === selected;
          return (
            <g
              key={i}
              className={`kf ${sel ? "sel" : ""}`}
              onClick={() => onSelect(i)}
              style={sel ? { filter: "drop-shadow(0 0 3px var(--n-brand))" } : undefined}
            >
              <LabanGlyph dir={ev.dir} level={ev.level} x={x} y={y0 + 3} w={28} h={y1 - y0 - 6} mirror={LIMB[ev.limb].side < 0} hatchId="labanHz" plainFill="var(--n-paper)" />
              {sel && (
                <rect x={x - 5} y={y0} width={38} height={y1 - y0} fill="none" style={{ stroke: "var(--n-brand)", strokeWidth: 1.2 }} strokeDasharray="3 3" />
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  // ---------- abstract: kinesphere lattice + interval band ----------
  const W = 600;
  const H = 360;
  const cx = 210;
  const cy = 168;
  const L = 104;
  const P = (v: Vec3) => ({ x: cx + v.x * L + v.z * 0.52 * L, y: cy - v.y * L - v.z * 0.3 * L });

  const rays: Vec3[] = [];
  for (const xs of [-1, 0, 1])
    for (const ys of [-1, 0, 1])
      for (const zs of [-1, 0, 1]) {
        if (!xs && !ys && !zs) continue;
        const m = Math.hypot(xs, ys, zs);
        rays.push({ x: xs / m, y: ys / m, z: zs / m });
      }

  const bx = 430;
  const T2 = T;
  const bh = 210;
  const by = 64;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: "100%" }}>
      <defs>
        <HatchPattern id="labanHz" />
      </defs>
      {/* 26-ray lattice */}
      {rays.map((r, i) => {
        const p = P(r);
        return (
          <g key={`r${i}`}>
            <line x1={cx} y1={cy} x2={p.x} y2={p.y} style={{ stroke: "var(--n-line)", strokeWidth: 1 }} />
            <circle cx={p.x} cy={p.y} r={2} fill="var(--n-faint)" />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill="var(--n-ink)" />
      {/* active vectors */}
      {phrase.map((ev, i) => {
        const p = P(vecOf(ev));
        const sel = i === selected;
        const wgt = ev.weight === "strong" ? 3.4 : 2;
        return (
          <g key={`v${i}`} className={`kf ${sel ? "sel" : ""}`} onClick={() => onSelect(i)}>
            <line x1={cx} y1={cy} x2={p.x} y2={p.y} className="kf-shape" style={{ stroke: sel ? "var(--n-brand)" : "var(--n-ink)", strokeWidth: wgt }} />
            <circle cx={p.x} cy={p.y} r={sel ? 6 : 4.5} className="kf-shape" fill={sel ? "var(--n-brand)" : "var(--n-ink)"} style={{ stroke: "var(--n-paper)", strokeWidth: 1.5 }} />
            <text x={p.x + 9} y={p.y + 4} className="font-mono" fontSize={14.3} fill="var(--n-soft)">
              e{i + 1}
            </text>
          </g>
        );
      })}
      <text x={cx} y={cy + L + 52} textAnchor="middle" className="font-mono" fontSize={14.3} fill="var(--n-faint)">
        {t.scores.kinesphere}
      </text>
      {/* interval band */}
      <line x1={bx} y1={by} x2={bx} y2={by + bh} style={{ stroke: "var(--n-ink)", strokeWidth: 1.4 }} />
      {Array.from({ length: T2 + 1 }, (_, b) => {
        const y = by + bh - (b / T2) * bh;
        return (
          <g key={`ib${b}`}>
            <line x1={bx - 4} y1={y} x2={bx + 4} y2={y} style={{ stroke: "var(--n-line)" }} />
            <text x={bx - 10} y={y + 3.5} textAnchor="end" className="font-mono" fontSize={13} fill="var(--n-faint)">
              {b}
            </text>
          </g>
        );
      })}
      {phrase.map((ev, i) => {
        const s = st[i];
        const y1 = by + bh - (s / T2) * bh;
        const y0 = by + bh - ((s + ev.beats) / T2) * bh;
        const sel = i === selected;
        return (
          <g key={`ir${i}`} className={`kf ${sel ? "sel" : ""}`} onClick={() => onSelect(i)}>
            <rect x={bx + 16 + i * 4} y={y0} width={10} height={y1 - y0} className="kf-shape" fill={sel ? "var(--n-brand)" : "var(--n-soft)"} opacity={sel ? 1 : 0.75} />
          </g>
        );
      })}
      <text x={bx + 40} y={by + bh + 30} textAnchor="middle" className="font-mono" fontSize={14.3} fill="var(--n-faint)">
        {t.scores.intervals}
      </text>
    </svg>
  );
}
