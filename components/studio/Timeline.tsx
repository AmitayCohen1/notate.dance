"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { Score } from "@/lib/studio";

export interface TimelineHandle {
  setPlayhead: (t: number) => void;
}

const LEFT = 132;
const ROW_H = 52;
const TOP = 32;

/**
 * Dancers × beats. Diamonds are keyframes; the empty track scrubs the
 * playhead. Kept deliberately close to the sequence editor of the
 * original software.
 */
const Timeline = forwardRef<
  TimelineHandle,
  {
    score: Score;
    selD: number;
    selK: number;
    tRef: React.RefObject<number>;
    onSelect: (d: number, k: number) => void;
    onSelectDancer: (d: number) => void;
    onScrub: (beat: number) => void;
    /** Lay the track out to this pixel width when known. */
    width?: number;
  }
>(function Timeline({ score, selD, selK, tRef, onSelect, onSelectDancer, onScrub, width }, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const playheadRef = useRef<SVGLineElement>(null);
  const scrubbing = useRef(false);

  const T = score.length;
  const avail = width && width > 420 ? width - 32 : 900;
  const colW = Math.max(22, (avail - LEFT - 24) / T);
  const W = LEFT + T * colW + 24;
  const H = TOP + score.dancers.length * ROW_H + 26;
  const gridBottom = TOP + score.dancers.length * ROW_H;

  useImperativeHandle(ref, () => ({
    setPlayhead(t: number) {
      const px = LEFT + Math.min(t, T) * colW;
      const ph = playheadRef.current;
      if (ph) {
        ph.setAttribute("x1", String(px));
        ph.setAttribute("x2", String(px));
      }
    },
  }));

  const beatFromEvent = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    const sx = (e.clientX - r.left) * (W / r.width);
    return Math.max(0, Math.min(T, (sx - LEFT) / colW));
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      style={{ maxWidth: "none" }}
      onPointerDown={(e) => {
        if ((e.target as SVGElement).dataset.scrub !== "1") return;
        scrubbing.current = true;
        (e.target as SVGElement).setPointerCapture?.(e.pointerId);
        const b = beatFromEvent(e);
        if (b !== null) onScrub(b);
      }}
      onPointerMove={(e) => {
        if (!scrubbing.current) return;
        const b = beatFromEvent(e);
        if (b !== null) onScrub(b);
      }}
      onPointerUp={() => {
        scrubbing.current = false;
      }}
      onPointerCancel={() => {
        scrubbing.current = false;
      }}
    >
      {/* beat grid */}
      {Array.from({ length: T + 1 }, (_, b) => {
        const x = LEFT + b * colW;
        const major = b % 4 === 0;
        return (
          <g key={`b${b}`}>
            <line
              x1={x}
              y1={TOP - 8}
              x2={x}
              y2={gridBottom}
              style={{ stroke: "var(--n-line)", strokeWidth: major ? 1.2 : 0.5 }}
            />
            {major && (
              <text x={x} y={TOP - 14} textAnchor="middle" className="font-mono" fontSize={12} fill="var(--n-faint)">
                {b}
              </text>
            )}
          </g>
        );
      })}

      {/* dancer rows */}
      {score.dancers.map((d, di) => {
        const y = TOP + di * ROW_H + ROW_H / 2;
        return (
          <g key={di}>
            <rect
              x={0}
              y={TOP + di * ROW_H}
              width={LEFT - 10}
              height={ROW_H}
              fill={di === selD ? "var(--n-brand-soft)" : "transparent"}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectDancer(di)}
            />
            <text
              x={LEFT - 18}
              y={y + 4}
              textAnchor="end"
              fontSize={13}
              fill={di === selD ? "var(--n-ink)" : "var(--n-soft)"}
              fontFamily="var(--font-geist)"
              style={{ cursor: "pointer" }}
              onClick={() => onSelectDancer(di)}
            >
              {d.name}
            </text>
            <line x1={LEFT} y1={y} x2={LEFT + T * colW} y2={y} style={{ stroke: "var(--n-line)" }} />
          </g>
        );
      })}

      {/* playhead */}
      <line
        ref={playheadRef}
        x1={LEFT + Math.min(tRef.current, T) * colW}
        y1={TOP - 8}
        x2={LEFT + Math.min(tRef.current, T) * colW}
        y2={gridBottom}
        style={{ stroke: "var(--n-signal)", strokeWidth: 1.8 }}
      />

      {/* scrub surface, below the keyframes in stacking order */}
      <rect
        data-scrub="1"
        x={LEFT}
        y={0}
        width={T * colW}
        height={H}
        fill="transparent"
        style={{ cursor: "col-resize" }}
      />

      {/* keyframes, drawn last so they stay clickable */}
      {score.dancers.map((d, di) =>
        d.keys.map((k, ki) => {
          const x = LEFT + k.beat * colW;
          const y = TOP + di * ROW_H + ROW_H / 2;
          const sel = di === selD && ki === selK;
          return (
            <g key={`${di}-${ki}`} className={`kf ${sel ? "sel" : ""}`} onClick={() => onSelect(di, ki)}>
              <path
                className="kf-shape"
                d={`M${x},${y - 9} L${x + 9},${y} L${x},${y + 9} L${x - 9},${y} Z`}
                fill={sel ? "var(--n-brand)" : "var(--n-card)"}
                style={{ stroke: sel ? "var(--n-brand)" : "var(--n-ink)", strokeWidth: 1.7 }}
              />
              <text x={x} y={y + 24} textAnchor="middle" className="font-mono" fontSize={10.5} fill="var(--n-faint)">
                {k.beat}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
});

export default Timeline;
