"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import InfoTip from "@/components/notation/info-tip";
import { BONE, BONES, type BoneId, type Dancer, ewOfBone } from "@/lib/studio";
import { useCopy } from "@/components/locale-provider";

const ROW_H = 34;
const LEFT = 128;
const TOP = 30;

/**
 * The track as an Eshkol-Wachman score: one row per segment, one column
 * per beat, each cell a vertical / horizontal coordinate in 45° units.
 * Faint cells hold their previous value. Stepping is in whole 45° units —
 * the notation's own graduation.
 */
export default function EWTrack({
  dancer,
  length,
  selK,
  selBone,
  onSelect,
  onStep,
}: {
  dancer: Dancer | undefined;
  length: number;
  selK: number;
  selBone: BoneId | null;
  onSelect: (k: number, bone: BoneId) => void;
  onStep: (axis: "az" | "el", dir: 1 | -1) => void;
}) {
  const t = useCopy();
  if (!dancer || !dancer.keys.length) return null;

  const colW = Math.max(38, 720 / length);
  const W = LEFT + length * colW + 20;
  const H = TOP + BONES.length * ROW_H + 30;
  const key = dancer.keys[selK];
  const can = !!key && !!selBone;

  return (
    <div className="flex h-full min-h-0">
      {/* ---- tools rail ---- */}
      <div className="flex w-[250px] shrink-0 flex-col items-start gap-6 overflow-y-auto border-r p-4">
        <div className="space-y-2.5">
          <p className="text-muted-foreground text-[0.8rem] font-medium tracking-wide uppercase">Vertical</p>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" disabled={!can} onClick={() => onStep("el", 1)} className="h-8 w-9 px-0">
              <ArrowUp className="size-4" />
            </Button>
            <Button size="sm" variant="outline" disabled={!can} onClick={() => onStep("el", -1)} className="h-8 w-9 px-0">
              <ArrowDown className="size-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2.5">
          <p className="text-muted-foreground text-[0.8rem] font-medium tracking-wide uppercase">Horizontal</p>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" disabled={!can} onClick={() => onStep("az", -1)} className="h-8 w-9 px-0">
              <ArrowLeft className="size-4" />
            </Button>
            <Button size="sm" variant="outline" disabled={!can} onClick={() => onStep("az", 1)} className="h-8 w-9 px-0">
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="text-muted-foreground space-y-1.5 text-[0.9rem] leading-relaxed">
          <p className="text-foreground font-mono text-[0.85rem]">
            {can && key ? `${t.studio.bones[selBone!]} · ${t.studio.beatOf(key.beat)}` : t.studio.ewTrack.empty}
          </p>
          <p>
            {t.studio.ewTrack.hint}
            <InfoTip title={t.studio.ewTrack.infoTitle} side="right">{t.studio.ewTrack.info}</InfoTip>
          </p>
        </div>
      </div>

      {/* ---- grid ---- */}
      <div className="min-w-0 flex-1 overflow-auto p-4">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: "none" }}>
          {/* time grid */}
          {Array.from({ length: length + 1 }, (_, b) => {
            const x = LEFT + b * colW;
            const major = b % 4 === 0;
            return (
              <g key={`c${b}`}>
                <line
                  x1={x}
                  y1={TOP}
                  x2={x}
                  y2={TOP + BONES.length * ROW_H}
                  style={{ stroke: "var(--n-line)", strokeWidth: major ? 1 : 0.4 }}
                />
                {major && b < length && (
                  <text x={x + 3} y={TOP - 9} className="font-mono" fontSize={11} fill="var(--n-faint)">
                    {b}
                  </text>
                )}
              </g>
            );
          })}

          {/* rows */}
          {BONES.map((bn, r) => {
            const y = TOP + r * ROW_H;
            return (
              <g key={bn.id}>
                <line x1={LEFT - 116} y1={y} x2={LEFT + length * colW} y2={y} style={{ stroke: "var(--n-line)" }} />
                <text
                  x={LEFT - 10}
                  y={y + ROW_H / 2 + 4}
                  textAnchor="end"
                  fontSize={12}
                  fill="var(--n-soft)"
                  fontFamily="var(--font-geist)"
                >
                  {bn.label}
                </text>
              </g>
            );
          })}
          <line
            x1={LEFT - 116}
            y1={TOP + BONES.length * ROW_H}
            x2={LEFT + length * colW}
            y2={TOP + BONES.length * ROW_H}
            style={{ stroke: "var(--n-line)" }}
          />

          {/* cells */}
          {dancer.keys.map((k, ki) =>
            BONES.map((bn, r) => {
              const c = ewOfBone(k.pose, bn.id);
              const prev = ki > 0 ? ewOfBone(dancer.keys[ki - 1].pose, bn.id) : null;
              const held = prev && Math.abs(prev.v - c.v) < 0.05 && Math.abs(prev.h - c.h) < 0.05;
              const x = LEFT + k.beat * colW;
              const y = TOP + r * ROW_H;
              const sel = ki === selK && bn.id === selBone;
              return (
                <g key={`${ki}-${bn.id}`} style={{ cursor: "pointer" }} onClick={() => onSelect(ki, bn.id)}>
                  <rect
                    x={x + 1}
                    y={y + 2}
                    width={colW - 2}
                    height={ROW_H - 4}
                    fill={sel ? "var(--n-brand-soft)" : "transparent"}
                    style={{
                      stroke: sel ? "var(--n-brand)" : held ? "var(--n-line)" : "var(--n-soft)",
                      strokeWidth: sel ? 1.4 : 0.8,
                    }}
                  />
                  <text
                    x={x + colW / 2}
                    y={y + ROW_H / 2 - 2}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize={11}
                    fill={held ? "var(--n-faint)" : "var(--n-ink)"}
                  >
                    {c.v.toFixed(1)}
                  </text>
                  <line
                    x1={x + colW / 2 - 9}
                    y1={y + ROW_H / 2 + 1}
                    x2={x + colW / 2 + 9}
                    y2={y + ROW_H / 2 + 1}
                    style={{ stroke: "var(--n-faint)", strokeWidth: 0.8 }}
                  />
                  <text
                    x={x + colW / 2}
                    y={y + ROW_H / 2 + 13}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize={11}
                    fill={held ? "var(--n-faint)" : "var(--n-ink)"}
                  >
                    {c.h.toFixed(1)}
                  </text>
                </g>
              );
            }),
          )}
        </svg>
      </div>
    </div>
  );
}
