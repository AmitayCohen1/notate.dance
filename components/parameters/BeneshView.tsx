"use client";

import { clamp } from "@/lib/geometry";
import { LIMB, LIMBS, Mode, PhraseEvent, depthOf, limbLabel, vecOf } from "./model";
import { useCopy } from "@/components/locale-provider";

const FW = 168;
const H = 234;
const TOP = 52;
const STAVE_H = 132;
const NAMES = ["top of head", "shoulders", "waist", "knees", "floor"];

export default function BeneshView({
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
  const abs = mode === "abstract";
  const lines = [0, 0.25, 0.5, 0.75, 1].map((u) => TOP + u * STAVE_H);
  const [headY, shoulderY, waistY, kneeY, floorY] = lines;
  const W = phrase.length * FW + 118;

  return (
    <svg viewBox={`0 0 ${W} ${H + 36}`} width={W} height={H + 36} style={{ maxWidth: "none" }}>
      {/* stave lines */}
      {lines.map((y, li) => (
        <g key={`s${li}`}>
          <line x1={10} y1={y} x2={phrase.length * FW + 10} y2={y} style={{ stroke: "var(--n-ink)", strokeWidth: 1.1 }} />
          <text
            x={phrase.length * FW + 16}
            y={y + 3.5}
            fontSize={12.3}
            fill="var(--n-faint)"
            fontFamily="var(--font-geist), var(--font-heebo)"
            style={{ letterSpacing: ".06em" }}
          >
            {abs ? "y=" + (1 - li * 0.25).toFixed(2) : NAMES[li].toUpperCase()}
          </text>
        </g>
      ))}
      {phrase.map((ev, i) => {
        const x0 = 10 + i * FW;
        const cxF = x0 + FW / 2;
        const v = vecOf(ev);
        const isArm = ev.limb === "RA" || ev.limb === "LA";
        const jointY = isArm ? shoulderY : waistY + 4;
        const jx = cxF + LIMB[ev.limb].side * (isArm ? 17 : 8);
        const reach = isArm ? 40 : 62;
        const ex = clamp(jx + v.x * reach, x0 + 10, x0 + FW - 10);
        const eyv = clamp(jointY - v.y * reach, headY - 16, floorY - 2);
        const depth = depthOf(ev);
        const sel = i === selected;
        const signCol = sel ? "var(--n-brand)" : "var(--n-ink)";

        const rhythm = Array.from({ length: ev.beats }, (_, b) => (
          <circle key={b} cx={cxF - ((ev.beats - 1) * 7) / 2 + b * 14} cy={TOP - 22} r={3} fill="var(--n-soft)" />
        ));

        return (
          <g key={i}>
            {/* bar line + rhythm (non-interactive) */}
            <line
              x1={x0 + FW}
              y1={lines[0]}
              x2={x0 + FW}
              y2={lines[4]}
              style={{ stroke: "var(--n-ink)", strokeWidth: i === phrase.length - 1 ? 2 : 1 }}
            />
            {rhythm}
            <text x={cxF} y={TOP - 32} textAnchor="middle" className="font-mono" fontSize={13} fill="var(--n-faint)">
              {ev.beats} beat{ev.beats > 1 ? "s" : ""}
            </text>
            {/* interactive frame content */}
            <g className={`kf ${sel ? "sel" : ""}`} onClick={() => onSelect(i)}>
              {!abs ? (
                <>
                  <circle cx={cxF} cy={headY + 11} r={8.5} fill="none" style={{ stroke: "var(--n-soft)", strokeWidth: 1.4 }} />
                  <line x1={cxF} y1={headY + 19} x2={cxF} y2={waistY} style={{ stroke: "var(--n-soft)", strokeWidth: 1.4 }} />
                  <line x1={cxF - 17} y1={shoulderY} x2={cxF + 17} y2={shoulderY} style={{ stroke: "var(--n-soft)", strokeWidth: 1.4 }} />
                  {LIMBS.map((l) => {
                    const active = l.id === ev.limb;
                    const arm = l.id === "RA" || l.id === "LA";
                    const jy = arm ? shoulderY : waistY + 4;
                    const jxx = cxF + l.side * (arm ? 17 : 8);
                    let tx: number, ty: number;
                    if (active) {
                      tx = ex;
                      ty = eyv;
                    } else if (arm) {
                      tx = jxx + l.side * 4;
                      ty = jy + 34;
                    } else {
                      tx = jxx;
                      ty = floorY;
                    }
                    return (
                      <line
                        key={l.id}
                        x1={jxx}
                        y1={jy}
                        x2={tx}
                        y2={ty}
                        style={{
                          stroke: active ? (sel ? "var(--n-brand)" : "var(--n-ink)") : "var(--n-soft)",
                          strokeWidth: active ? 2.4 : 1.4,
                        }}
                      />
                    );
                  })}
                </>
              ) : (
                <text x={cxF} y={floorY + 18} textAnchor="middle" className="font-mono" fontSize={13.7} fill="var(--n-soft)">
                  ({((ex - x0) / FW).toFixed(2)}, {((floorY - eyv) / STAVE_H).toFixed(2)}) · z:{depth}
                </text>
              )}
              {/* depth sign */}
              {depth === "front" && <line x1={ex} y1={eyv - 7} x2={ex} y2={eyv + 7} className="kf-shape" style={{ stroke: signCol, strokeWidth: 2.6 }} />}
              {depth === "level" && <line x1={ex - 7} y1={eyv} x2={ex + 7} y2={eyv} className="kf-shape" style={{ stroke: signCol, strokeWidth: 2.6 }} />}
              {depth === "behind" && <circle cx={ex} cy={eyv} r={3.6} className="kf-shape" fill={signCol} />}
              {sel && (
                <rect x={x0 + 4} y={lines[0] - 6} width={FW - 8} height={STAVE_H + 12} fill="none" style={{ stroke: "var(--n-brand)", strokeWidth: 1.2 }} strokeDasharray="3 3" />
              )}
              <text x={cxF} y={floorY + 34} textAnchor="middle" className="font-mono" fontSize={13} fill="var(--n-faint)">
                e{i + 1} · {limbLabel(t, ev.limb, mode)}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
