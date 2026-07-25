"use client";

import { LIMBS, Mode, PhraseEvent, ewOf, limbLabel, starts, totalBeats } from "./model";

const ROW_H = 58;
const LEFT = 132;
const COL_W = 58;
const TOP = 38;

export default function EWView({
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
  const st = starts(phrase);
  const T = totalBeats(phrase);
  const W = LEFT + T * COL_W + 16;
  const H = TOP + LIMBS.length * ROW_H + 30;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: "none" }}>
      {/* time gridlines */}
      {Array.from({ length: T + 1 }, (_, b) => {
        const x = LEFT + b * COL_W;
        return (
          <g key={`c${b}`}>
            <line x1={x} y1={TOP} x2={x} y2={TOP + LIMBS.length * ROW_H} style={{ stroke: "var(--n-line)" }} />
            {b < T && (
              <text x={x + COL_W / 2} y={TOP - 9} textAnchor="middle" className="font-mono" fontSize={13} fill="var(--n-faint)">
                {b}
              </text>
            )}
          </g>
        );
      })}
      {/* rows */}
      {LIMBS.map((l, r) => {
        const y = TOP + r * ROW_H;
        return (
          <g key={l.id}>
            <line x1={LEFT - 104} y1={y} x2={LEFT + T * COL_W} y2={y} style={{ stroke: "var(--n-line)" }} />
            <text
              x={LEFT - 10}
              y={y + ROW_H / 2 + 3.5}
              textAnchor="end"
              fontSize={13}
              fill="var(--n-soft)"
              fontFamily="var(--font-geist)"
              style={{ letterSpacing: ".08em" }}
            >
              {limbLabel(l.id, mode).toUpperCase()}
            </text>
          </g>
        );
      })}
      <line x1={LEFT - 104} y1={TOP + LIMBS.length * ROW_H} x2={LEFT + T * COL_W} y2={TOP + LIMBS.length * ROW_H} style={{ stroke: "var(--n-line)" }} />
      {/* events */}
      {phrase.map((ev, i) => {
        const r = LIMBS.findIndex((l) => l.id === ev.limb);
        const x = LEFT + st[i] * COL_W;
        const y = TOP + r * ROW_H;
        const c = ewOf(ev);
        const sel = i === selected;
        return (
          <g key={i} className={`kf ${sel ? "sel" : ""}`} onClick={() => onSelect(i)}>
            <rect
              x={x + 2}
              y={y + 3}
              width={ev.beats * COL_W - 4}
              height={ROW_H - 6}
              className="kf-shape"
              fill={sel ? "var(--n-brand-soft)" : "transparent"}
              style={{ stroke: sel ? "var(--n-brand)" : "var(--n-ink)", strokeWidth: 1.3 }}
            />
            <text x={x + COL_W / 2} y={y + ROW_H / 2 - 5} textAnchor="middle" className="font-mono" fontSize={16.9} fill="var(--n-ink)">
              {c.v}
            </text>
            <line x1={x + COL_W / 2 - 11} y1={y + ROW_H / 2 + 2} x2={x + COL_W / 2 + 11} y2={y + ROW_H / 2 + 2} style={{ stroke: "var(--n-soft)", strokeWidth: 1 }} />
            <text x={x + COL_W / 2} y={y + ROW_H / 2 + 20} textAnchor="middle" className="font-mono" fontSize={16.9} fill="var(--n-ink)">
              {c.h}
            </text>
            {ev.beats > 1 && (
              <line x1={x + COL_W} y1={y + ROW_H / 2} x2={x + ev.beats * COL_W - 8} y2={y + ROW_H / 2} style={{ stroke: "var(--n-soft)", strokeWidth: 1.2 }} strokeDasharray="4 3" />
            )}
          </g>
        );
      })}
      <text x={LEFT} y={H - 4} className="font-mono" fontSize={13} fill="var(--n-faint)">
        cells: vertical / horizontal · 45° units
      </text>
    </svg>
  );
}
