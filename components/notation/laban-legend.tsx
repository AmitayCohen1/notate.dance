"use client";

import { type DirKey, type Level } from "@/lib/notation";
import { useCopy } from "@/components/locale-provider";
import { HatchPattern, LabanGlyph } from "@/components/notation/glyphs";

const SHAPES: DirKey[] = ["forward", "rf", "right", "rb", "back", "lb", "left", "lf", "place"];
const SHADES: Level[] = ["high", "middle", "low"];

function Specimen({ dir, level, caption }: { dir: DirKey; level: Level; caption: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={42} height={52} viewBox="0 0 42 52" aria-hidden="true">
        <defs>
          <HatchPattern id={`legend-${dir}-${level}`} />
        </defs>
        <LabanGlyph
          dir={dir}
          level={level}
          x={7}
          y={6}
          w={28}
          h={40}
          mirror={false}
          hatchId={`legend-${dir}-${level}`}
          plainFill="var(--n-card)"
          dotR={3}
        />
      </svg>
      <span className="text-muted-foreground text-center text-[0.8rem] leading-tight">{caption}</span>
    </div>
  );
}

/**
 * How to read a Labanotation symbol, in two rules: the outline gives the
 * direction, the fill gives the level. Everything else on the staff is
 * position and length.
 */
export default function LabanLegend() {
  const t = useCopy();
  return (
    <div className="grid gap-8 md:grid-cols-[1.6fr_1fr]">
      <div className="space-y-3">
        <p className="text-[0.8rem] font-medium tracking-wide uppercase">{t.laban.rule1}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-4">
          {SHAPES.map((d) => (
            <Specimen key={d} dir={d} level="middle" caption={t.dirs[d]} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-[0.8rem] font-medium tracking-wide uppercase">{t.laban.rule2}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-4">
          {SHADES.map((lv) => (
            <Specimen key={lv} dir="forward" level={lv} caption={t.levels[lv]} />
          ))}
        </div>
        <p className="text-muted-foreground text-[0.9rem] leading-relaxed">{t.laban.legendNote}</p>
      </div>
    </div>
  );
}
