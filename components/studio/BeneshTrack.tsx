"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import InfoTip from "@/components/notation/info-tip";
import type { Vec3 } from "@/lib/geometry";
import { DEPTH_GLYPH, beneshDepthOf } from "@/lib/notation";
import { type Dancer, type LimbSetId, LIMBSETS, clonePose, limbLen, limbVec, skeleton } from "@/lib/studio";

const FW = 156;
const STAVE_H = 122;
const TOP = 52;
const H = TOP + STAVE_H + 58;
const LINE_NAMES = ["Top of head", "Shoulders", "Waist", "Knees", "Floor"];

/** Which named joints a draggable extremity sign hangs from. */
const PARTS: { id: LimbSetId; wrist: string; joint: string }[] = [
  { id: "rarm", wrist: "rwrist", joint: "rsh" },
  { id: "larm", wrist: "lwrist", joint: "lsh" },
  { id: "rleg", wrist: "rankle", joint: "rhip" },
  { id: "lleg", wrist: "lankle", joint: "lhip" },
];

const DEPTHS = ["front", "level", "behind"] as const;
type Depth = (typeof DEPTHS)[number];

/**
 * The track as Benesh frames: one stave picture per keyframe, the figure
 * seen from behind. Wrists and ankles are draggable — drop a sign
 * somewhere in the frame and the limb points there.
 */
export default function BeneshTrack({
  dancer,
  length,
  selK,
  selPart,
  onSelect,
  onDrag,
  onDepth,
}: {
  dancer: Dancer | undefined;
  length: number;
  selK: number;
  selPart: LimbSetId;
  onSelect: (k: number, part: LimbSetId) => void;
  onDrag: (k: number, part: LimbSetId, v: Vec3) => void;
  onDepth: (depth: Depth) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ k: number; part: LimbSetId; jx: number; jy: number; L: number; zsign: number } | null>(null);

  if (!dancer || !dancer.keys.length) return null;

  const S = STAVE_H / 1.78; // body units → px
  const lines = [0, 0.25, 0.5, 0.75, 1].map((u) => TOP + u * STAVE_H);
  const floorY = lines[4];
  const W = dancer.keys.length * FW + 128;

  const key = dancer.keys[selK];
  const editable = key ? PARTS.some((p) => p.id === selPart) : false;
  const depth = editable && key ? beneshDepthOf(limbVec(key.pose, selPart)) : null;

  const applyDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || !svg) return;
    const r = svg.getBoundingClientRect();
    const scale = W / r.width;
    const px = (e.clientX - r.left) * scale;
    const py = (e.clientY - r.top) * scale;
    let dx = (px - d.jx) / S;
    let dy = (d.jy - py) / S;
    const L = d.L;
    let rad = Math.hypot(dx, dy);
    if (rad > L * 0.985) {
      dx *= (L * 0.985) / rad;
      dy *= (L * 0.985) / rad;
      rad = L * 0.985;
    }
    let v: Vec3;
    if (d.zsign === 0) {
      const m = Math.hypot(dx, dy) || 1;
      v = { x: dx / m, y: dy / m, z: 0 };
    } else {
      const zc = Math.sqrt(Math.max(0, 1 - (rad * rad) / (L * L))) * d.zsign;
      const m = Math.hypot(dx / L, dy / L, zc) || 1;
      v = { x: dx / L / m, y: dy / L / m, z: zc / m };
    }
    onDrag(d.k, d.part, v);
  };

  return (
    <div className="flex h-full min-h-0">
      {/* ---- tools rail ---- */}
      <div className="flex w-[250px] shrink-0 flex-col items-start gap-6 overflow-y-auto border-r p-4">
        <div className="space-y-2.5">
          <p className="text-muted-foreground text-[0.8rem] font-medium tracking-wide uppercase">Depth</p>
          <div className="flex gap-1.5">
            {DEPTHS.map((d) => (
              <Button
                key={d}
                size="sm"
                variant={depth === d ? "default" : "outline"}
                aria-pressed={depth === d}
                disabled={!editable}
                onClick={() => onDepth(d)}
                className="h-8 gap-2 px-2.5 font-normal"
              >
                <span className="font-mono">{DEPTH_GLYPH[d]}</span>
                {d}
              </Button>
            ))}
          </div>
        </div>
        <div className="text-muted-foreground space-y-1.5 text-[0.9rem] leading-relaxed">
          <p className="text-foreground font-mono text-[0.85rem]">
            {editable && key ? `${LIMBSETS[selPart].label} · beat ${key.beat}` : "Grab a hand or foot sign"}
          </p>
          <p>
            Drag a hand or foot anywhere inside its frame.
            <InfoTip title="Reading these frames" side="right">
              <p>
                The five lines are heights on the body — head, shoulders, waist, knees, floor — not musical pitches. You
                are standing behind the dancer.
              </p>
              <p>
                The little stroke on each hand or foot says how deep it is: upright for in front, flat for level, a dot
                for behind.
              </p>
              <p>The dots above each frame count its beats.</p>
            </InfoTip>
          </p>
        </div>
      </div>

      {/* ---- frames ---- */}
      <div className="min-w-0 flex-1 overflow-auto p-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ maxWidth: "none" }}
          onPointerMove={(e) => drag.current && applyDrag(e)}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          {/* stave lines */}
          {lines.map((y, li) => (
            <g key={li}>
              <line
                x1={10}
                y1={y}
                x2={dancer.keys.length * FW + 10}
                y2={y}
                style={{ stroke: "var(--n-ink)", strokeWidth: 1 }}
              />
              <text
                x={dancer.keys.length * FW + 18}
                y={y + 4}
                fontSize={11}
                fill="var(--n-faint)"
                fontFamily="var(--font-geist)"
              >
                {LINE_NAMES[li]}
              </text>
            </g>
          ))}

          {dancer.keys.map((k, ki) => {
            const x0 = 10 + ki * FW;
            const cxF = x0 + FW / 2;
            const beats = (ki < dancer.keys.length - 1 ? dancer.keys[ki + 1].beat : length) - k.beat;

            // body-space skeleton, seen from behind
            const bp = Object.assign(clonePose(k.pose), { x: 0, z: 0, facing: 0 });
            const sk = skeleton(bp);
            // rounded so server and client render byte-identical SVG
            const pr = (p: Vec3) => ({ x: +(cxF + p.x * S).toFixed(2), y: +(floorY - p.y * S).toFixed(2) });

            return (
              <g key={ki}>
                {/* bar line + rhythm */}
                <line
                  x1={x0 + FW}
                  y1={lines[0]}
                  x2={x0 + FW}
                  y2={floorY}
                  style={{ stroke: "var(--n-ink)", strokeWidth: ki === dancer.keys.length - 1 ? 2 : 1 }}
                />
                {Array.from({ length: Math.min(beats, 8) }, (_, b) => (
                  <circle
                    key={b}
                    cx={cxF - (Math.min(beats, 8) - 1) * 6 + b * 12}
                    cy={TOP - 22}
                    r={3}
                    fill="var(--n-soft)"
                  />
                ))}
                <text x={cxF} y={TOP - 34} textAnchor="middle" className="font-mono" fontSize={11} fill="var(--n-faint)">
                  {beats} beat{beats === 1 ? "" : "s"} · at beat {k.beat}
                </text>

                {/* the faint figure */}
                <g pointerEvents="none">
                  {sk.seg.map(([name, a, b], i) => {
                    const pa = pr(a);
                    const pb = pr(b);
                    return (
                      <line
                        key={`${name}${i}`}
                        x1={pa.x}
                        y1={pa.y}
                        x2={pb.x}
                        y2={pb.y}
                        strokeLinecap="round"
                        style={{ stroke: "var(--n-soft)", strokeWidth: 1.3 }}
                      />
                    );
                  })}
                  {(() => {
                    const hc = pr(sk.headC);
                    return (
                      <circle
                        cx={hc.x}
                        cy={hc.y}
                        r={0.085 * S}
                        fill="none"
                        style={{ stroke: "var(--n-soft)", strokeWidth: 1.2 }}
                      />
                    );
                  })()}
                </g>

                {/* draggable extremity signs */}
                {PARTS.map((meta) => {
                  const ep = pr(sk.named[meta.wrist]);
                  const jp = pr(sk.named[meta.joint]);
                  const v = limbVec(k.pose, meta.id);
                  const dep = beneshDepthOf(v);
                  const sel = ki === selK && meta.id === selPart;
                  const col = sel ? "var(--n-brand)" : "var(--n-ink)";
                  return (
                    <g
                      key={meta.id}
                      style={{ cursor: "grab" }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        (e.currentTarget as SVGGElement).setPointerCapture?.(e.pointerId);
                        onSelect(ki, meta.id);
                        drag.current = {
                          k: ki,
                          part: meta.id,
                          jx: jp.x,
                          jy: jp.y,
                          L: limbLen(meta.id),
                          zsign: dep === "front" ? 1 : dep === "behind" ? -1 : 0,
                        };
                      }}
                    >
                      <circle
                        cx={ep.x}
                        cy={ep.y}
                        r={12}
                        fill="transparent"
                        strokeDasharray={sel ? "2 3" : undefined}
                        style={{ stroke: sel ? "var(--n-brand)" : "transparent", strokeWidth: 1 }}
                      />
                      {dep === "front" && (
                        <line
                          x1={ep.x}
                          y1={ep.y - 7}
                          x2={ep.x}
                          y2={ep.y + 7}
                          pointerEvents="none"
                          style={{ stroke: col, strokeWidth: 2.6 }}
                        />
                      )}
                      {dep === "level" && (
                        <line
                          x1={ep.x - 7}
                          y1={ep.y}
                          x2={ep.x + 7}
                          y2={ep.y}
                          pointerEvents="none"
                          style={{ stroke: col, strokeWidth: 2.6 }}
                        />
                      )}
                      {dep === "behind" && <circle cx={ep.x} cy={ep.y} r={3.6} fill={col} pointerEvents="none" />}
                    </g>
                  );
                })}

                <text x={cxF} y={floorY + 22} textAnchor="middle" className="font-mono" fontSize={11} fill="var(--n-faint)">
                  k{ki + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
