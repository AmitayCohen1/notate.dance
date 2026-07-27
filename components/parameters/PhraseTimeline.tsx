"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { LIMBS, Mode, PhraseEvent, limbLabel, starts, totalBeats } from "./model";
import { useCopy } from "@/components/locale-provider";

export interface PlayheadHandle {
  setPlayhead: (t: number) => void;
}

const LEFT = 132;
const COL_W = 64;
const ROW_H = 58;
const TOP = 38;

const PhraseTimeline = forwardRef<
  PlayheadHandle,
  { phrase: PhraseEvent[]; mode: Mode; selected: number; onSelect: (i: number) => void; tRef: React.RefObject<number> }
>(function PhraseTimeline({ phrase, mode, selected, onSelect, tRef }, ref) {
  const t = useCopy();
  const st = starts(phrase);
  const T = totalBeats(phrase);
  const W = LEFT + T * COL_W + 20;
  const H = TOP + LIMBS.length * ROW_H + 26;
  const playheadRef = useRef<SVGLineElement>(null);
  const initialPx = LEFT + Math.min(tRef.current, T) * COL_W;

  useImperativeHandle(ref, () => ({
    setPlayhead(t: number) {
      const px = LEFT + Math.min(t, T) * COL_W;
      const ph = playheadRef.current;
      if (ph) {
        ph.setAttribute("x1", String(px));
        ph.setAttribute("x2", String(px));
      }
    },
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: "none" }}>
      {/* beat gridlines */}
      {Array.from({ length: T + 1 }, (_, b) => {
        const x = LEFT + b * COL_W;
        return (
          <g key={`b${b}`}>
            <line x1={x} y1={TOP - 6} x2={x} y2={TOP + LIMBS.length * ROW_H} style={{ stroke: "var(--n-line)" }} />
            <text x={x} y={TOP - 12} textAnchor="middle" className="font-mono" fontSize={13} fill="var(--n-faint)">
              {b}
            </text>
          </g>
        );
      })}
      {/* channel rows */}
      {LIMBS.map((l, r) => {
        const y = TOP + r * ROW_H + ROW_H / 2;
        return (
          <g key={l.id}>
            <text
              x={LEFT - 10}
              y={y + 3.5}
              textAnchor="end"
              fontSize={13}
              fill="var(--n-soft)"
              fontFamily="var(--font-geist), var(--font-heebo)"
              style={{ letterSpacing: ".08em" }}
            >
              {limbLabel(t, l.id, mode).toUpperCase()}
            </text>
            <line x1={LEFT} y1={y} x2={LEFT + T * COL_W} y2={y} style={{ stroke: "var(--n-line)", strokeWidth: 1 }} />
          </g>
        );
      })}
      {/* events */}
      {phrase.map((ev, i) => {
        const r = LIMBS.findIndex((l) => l.id === ev.limb);
        const y = TOP + r * ROW_H + ROW_H / 2;
        const x = LEFT + st[i] * COL_W;
        const x2 = LEFT + (st[i] + ev.beats) * COL_W;
        const sel = i === selected;
        return (
          <g key={i} className={`kf ${sel ? "sel" : ""}`} onClick={() => onSelect(i)}>
            <line
              x1={x}
              y1={y}
              x2={x2}
              y2={y}
              style={{ stroke: sel ? "var(--n-brand)" : "var(--n-ink)", strokeWidth: ev.weight === "strong" ? 3 : 1.8 }}
              strokeDasharray={ev.time === "sudden" ? "2 3" : undefined}
            />
            <path
              className="kf-shape"
              d={`M${x},${y - 7} L${x + 7},${y} L${x},${y + 7} L${x - 7},${y} Z`}
              fill={sel ? "var(--n-brand)" : "var(--n-paper)"}
              style={{ stroke: sel ? "var(--n-brand)" : "var(--n-ink)", strokeWidth: 1.6 }}
            />
            <text x={x} y={y + 21} textAnchor="middle" className="font-mono" fontSize={12.3} fill="var(--n-faint)">
              e{i + 1}
            </text>
          </g>
        );
      })}
      {/* playhead */}
      <line
        ref={playheadRef}
        x1={initialPx}
        y1={TOP - 6}
        x2={initialPx}
        y2={TOP + LIMBS.length * ROW_H}
        style={{ stroke: "var(--n-signal)", strokeWidth: 1.6 }}
      />
    </svg>
  );
});

export default PhraseTimeline;
