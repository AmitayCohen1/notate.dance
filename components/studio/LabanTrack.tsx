"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import InfoTip from "@/components/notation/info-tip";
import { HatchPattern, LabanGlyph } from "@/components/notation/glyphs";
import { DIR_ARROW, ROSE_ORDER, type DirKey, type Level, labanOf } from "@/lib/notation";
import { type Dancer, type LimbSetId, LIMBSETS, limbVec } from "@/lib/studio";
import { useCopy } from "@/components/locale-provider";

const COLS: LimbSetId[] = ["larm", "lleg", "rleg", "rarm", "body", "head"];
const LEVELS: Level[] = ["low", "middle", "high"];

const BEAT_H = 13;
const TOP = 24;
const BOTTOM = 72;
const COL_W = 46;
const SYM_W = 26;
const GAP = 10;
const CX = 196;

const COL_X: Record<LimbSetId, number> = {
  larm: CX - 2 * COL_W - GAP - 14,
  lleg: CX - COL_W - 14,
  rleg: CX + 14,
  rarm: CX + COL_W + GAP + 14,
  body: CX + 2 * COL_W + GAP + 52,
  head: CX + 3 * COL_W + GAP + 62,
};

/**
 * The selected dancer's track as a Labanotation staff, read bottom to
 * top — and editable: pick a slot, then set it with the direction rose.
 * Laban quantizes what the stance editor states exactly, so an edit here
 * straightens the whole limb.
 */
export default function LabanTrack({
  dancer,
  length,
  selK,
  selPart,
  onSelect,
  onSetDir,
  onSetLevel,
}: {
  dancer: Dancer | undefined;
  length: number;
  selK: number;
  selPart: LimbSetId;
  onSelect: (k: number, part: LimbSetId) => void;
  onSetDir: (dir: DirKey) => void;
  onSetLevel: (level: Level) => void;
}) {
  const t = useCopy();
  const staffRef = useRef<HTMLDivElement>(null);

  // the staff reads upward from beat 0, so open at the bottom
  useEffect(() => {
    const el = staffRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [length, dancer?.keys.length]);

  if (!dancer || !dancer.keys.length) return null;

  const H = length * BEAT_H + TOP + BOTTOM;
  const W = COL_X.head + SYM_W + 80;
  const key = dancer.keys[selK];
  const current = key ? labanOf(limbVec(key.pose, selPart)) : null;

  const quantAt = (ki: number, part: LimbSetId) => labanOf(limbVec(dancer.keys[ki].pose, part));

  return (
    <div className="flex h-full min-h-0">
      {/* ---- tools rail ---- */}
      <div className="flex w-[250px] shrink-0 flex-col items-start gap-6 overflow-y-auto border-r p-4">
        <div className="space-y-2.5">
          <p className="text-muted-foreground text-[0.8rem] font-medium tracking-wide uppercase">Direction</p>
          <div className="grid w-fit grid-cols-3 gap-1.5">
            {ROSE_ORDER.map((d) => (
              <Button
                key={d}
                size="sm"
                variant={current?.dir === d ? "default" : "outline"}
                aria-pressed={current?.dir === d}
                title={d}
                disabled={!key}
                onClick={() => onSetDir(d)}
                className="h-8 w-9 justify-center px-0 font-mono text-base font-normal"
              >
                {DIR_ARROW[d]}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-muted-foreground text-[0.8rem] font-medium tracking-wide uppercase">Level</p>
          <div className="flex flex-col gap-1.5">
            {LEVELS.map((l) => (
              <Button
                key={l}
                size="sm"
                variant={current?.level === l ? "default" : "outline"}
                aria-pressed={current?.level === l}
                disabled={!key}
                onClick={() => onSetLevel(l)}
                className="h-8 justify-start px-2.5 font-normal"
              >
                {l}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-muted-foreground space-y-1.5 text-[0.9rem] leading-relaxed">
          <p className="text-foreground font-mono text-[0.85rem]">
            {key ? `${t.studio.limbsets[selPart]} · ${t.studio.beatOf(key.beat)}` : t.studio.labanTrack.empty}
          </p>
          <p>
            {t.studio.labanTrack.hint}
            <InfoTip title={t.studio.labanTrack.infoTitle} side="right">{t.studio.labanTrack.info}</InfoTip>
          </p>
          <p className="text-[0.85rem]">
            {t.studio.labanTrack.note}
          </p>
        </div>
      </div>

      {/* ---- staff ---- */}
      <div ref={staffRef} className="min-w-0 flex-1 overflow-auto p-4">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: "none" }}>
          <defs>
            <HatchPattern id="studioHatch" />
          </defs>

          {/* centre line, body/head rules */}
          <line x1={CX - 3} y1={TOP - 8} x2={CX - 3} y2={H - BOTTOM + 10} style={{ stroke: "var(--n-ink)", strokeWidth: 1.5 }} />
          <line x1={CX + 3} y1={TOP - 8} x2={CX + 3} y2={H - BOTTOM + 10} style={{ stroke: "var(--n-ink)", strokeWidth: 1.5 }} />
          {(["body", "head"] as LimbSetId[]).map((p) => (
            <line
              key={p}
              x1={COL_X[p] + SYM_W / 2}
              y1={TOP - 8}
              x2={COL_X[p] + SYM_W / 2}
              y2={H - BOTTOM + 10}
              style={{ stroke: "var(--n-line)" }}
            />
          ))}

          {/* start double bar */}
          {[4, 9].map((dy) => (
            <line
              key={dy}
              x1={COL_X.larm - 20}
              y1={H - BOTTOM + dy}
              x2={COL_X.head + SYM_W + 20}
              y2={H - BOTTOM + dy}
              style={{ stroke: "var(--n-ink)", strokeWidth: 1.3 }}
            />
          ))}

          {/* beat ticks every 4 */}
          {Array.from({ length: Math.floor(length / 4) + 1 }, (_, i) => {
            const b = i * 4;
            const y = H - BOTTOM - b * BEAT_H;
            return (
              <g key={`t${b}`}>
                <line x1={COL_X.larm - 20} y1={y} x2={COL_X.larm - 8} y2={y} style={{ stroke: "var(--n-line)" }} />
                <text x={COL_X.larm - 26} y={y + 4} textAnchor="end" className="font-mono" fontSize={11} fill="var(--n-faint)">
                  {b}
                </text>
              </g>
            );
          })}

          {/* column labels, staggered so they don't collide */}
          {COLS.map((p, i) => (
            <text
              key={p}
              x={COL_X[p] + SYM_W / 2}
              y={H - (i % 2 ? 16 : 38)}
              textAnchor="middle"
              fontSize={12}
              fill="var(--n-soft)"
              fontFamily="var(--font-geist)"
            >
              {t.studio.limbsets[p]}
            </text>
          ))}

          {/* symbols + hit slots */}
          {dancer.keys.map((k, ki) => {
            const nextBeat = ki < dancer.keys.length - 1 ? dancer.keys[ki + 1].beat : length;
            const y1 = H - BOTTOM - k.beat * BEAT_H;
            const y0 = H - BOTTOM - nextBeat * BEAT_H;
            return COLS.map((p) => {
              const q = quantAt(ki, p);
              const held = ki > 0 && JSON.stringify(q) === JSON.stringify(quantAt(ki - 1, p));
              const x = COL_X[p] + (COL_W - SYM_W) / 2 - 8;
              const sel = ki === selK && p === selPart;
              return (
                <g key={`${ki}-${p}`}>
                  {held ? (
                    <line
                      x1={x + SYM_W / 2}
                      y1={y0 + 3}
                      x2={x + SYM_W / 2}
                      y2={y1 - 3}
                      strokeDasharray="1 4"
                      pointerEvents="none"
                      style={{ stroke: "var(--n-faint)" }}
                    />
                  ) : (
                    <g pointerEvents="none">
                      <LabanGlyph
                        dir={q.dir}
                        level={q.level}
                        x={x}
                        y={y0 + 2}
                        w={SYM_W}
                        h={Math.max(9, y1 - y0 - 4)}
                        mirror={p[0] === "l"}
                        hatchId="studioHatch"
                        plainFill="var(--n-card)"
                        strokeW={1.4}
                        dotR={2.2}
                      />
                    </g>
                  )}
                  <rect
                    x={x - 5}
                    y={y0}
                    width={SYM_W + 10}
                    height={y1 - y0}
                    fill="transparent"
                    style={{
                      cursor: "pointer",
                      stroke: sel ? "var(--n-brand)" : "transparent",
                      strokeWidth: sel ? 1.3 : 0,
                    }}
                    strokeDasharray={sel ? "3 3" : undefined}
                    onClick={() => onSelect(ki, p)}
                  />
                </g>
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
}
