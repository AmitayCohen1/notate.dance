"use client";

import { PRESETS, type Pose, clonePose, skeleton } from "@/lib/studio";
import { cn } from "@/lib/utils";
import { useCopy } from "@/components/locale-provider";

const SIZE = 78;

/** A small front-ish orthographic thumbnail of one stance. */
function PoseThumb({ pose }: { pose: Pose }) {
  const sk = skeleton(Object.assign(clonePose(pose), { x: 0, z: 0, facing: 12 }));
  // rounded so server and client render byte-identical SVG
  const pr = (p: { x: number; y: number; z: number }) => ({
    x: +(SIZE / 2 + (p.x * 0.92 + p.z * 0.3) * SIZE * 0.42).toFixed(2),
    y: +(SIZE * 0.96 - p.y * SIZE * 0.46).toFixed(2),
  });
  const hc = pr(sk.headC);
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
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
            style={{ stroke: "var(--n-ink)", strokeWidth: 1.7 }}
          />
        );
      })}
      <circle cx={hc.x} cy={hc.y} r={SIZE * 0.045} fill="none" style={{ stroke: "var(--n-ink)", strokeWidth: 1.4 }} />
    </svg>
  );
}

/**
 * The stance palette: click a card to stamp that stance into the selected
 * keyframe, keeping its place on the floor and its facing.
 */
export default function PosePalette({
  onApply,
  disabled,
  layout = "row",
}: {
  onApply: (pose: Pose) => void;
  disabled?: boolean;
  layout?: "row" | "grid";
}) {
  const t = useCopy();
  return (
    <div className={cn("gap-3 p-5", layout === "grid" ? "flex flex-wrap" : "flex")}>
      {PRESETS.map((p, i) => (
        <button
          key={t.studio.presets[p.name]}
          type="button"
          disabled={disabled}
          title={t.studio.applyPreset(t.studio.presets[p.name])}
          onClick={() => onApply(p.pose)}
          className={cn(
            "hover:border-ring hover:bg-muted/60 flex shrink-0 flex-col items-center gap-1 rounded-lg border px-2 pt-2 pb-1.5 transition-colors",
            disabled && "pointer-events-none opacity-40",
          )}
        >
          <PoseThumb pose={p.pose} />
          <span className="text-[0.85rem] font-medium">{t.studio.presets[p.name]}</span>
        </button>
      ))}
    </div>
  );
}
