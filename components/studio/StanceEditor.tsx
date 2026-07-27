"use client";

import { Compass, MapPin, MoveVertical, RotateCw, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import InfoTip from "@/components/notation/info-tip";
import { useCopy } from "@/components/locale-provider";
import { Slider } from "@/components/ui/slider";
import { BONES, type BoneId, type Pose, ewOfBone } from "@/lib/studio";
import { cn } from "@/lib/utils";

type JointId = BoneId | "root";

function Row({
  icon: Icon,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground flex items-center gap-1.5 text-[0.8rem] font-medium tracking-wide uppercase">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className="font-mono text-[0.85rem] tabular-nums">{value}</span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
    </div>
  );
}

/**
 * The stance window: pick a segment, then aim it. Angles are absolute
 * directions, not joint rotations — the same (azimuth, elevation) the
 * notations quote.
 */
export default function StanceEditor({
  pose,
  joint,
  onJoint,
  onBone,
  onRoot,
}: {
  pose: Pose | null;
  joint: JointId;
  onJoint: (j: JointId) => void;
  onBone: (index: 0 | 1, value: number) => void;
  onRoot: (key: "x" | "z" | "facing" | "hipY", value: number) => void;
}) {
  const t = useCopy();
  if (!pose) {
    return <p className="text-muted-foreground p-5 text-[0.95rem]">{t.studio.stance.noKeyframe}</p>;
  }

  const isRoot = joint === "root";
  const [az, el] = isRoot ? [0, 0] : pose.bones[joint];
  const ew = isRoot ? null : ewOfBone(pose, joint);

  return (
    <div className="@container space-y-5 p-5">
      <div className="space-y-2.5">
        <span className="text-muted-foreground flex items-center gap-1 text-[0.8rem] font-medium tracking-wide uppercase">
          {t.studio.stance.whichPart}
          <InfoTip title={t.studio.stance.bonesTitle} side="bottom">{t.studio.stance.bonesInfo}</InfoTip>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {BONES.map((b) => (
            <Button
              key={b.id}
              size="sm"
              variant={joint === b.id ? "default" : "outline"}
              aria-pressed={joint === b.id}
              onClick={() => onJoint(b.id)}
              className="h-7 px-2.5 font-normal"
            >
              {t.studio.bones[b.id]}
            </Button>
          ))}
          <Button
            size="sm"
            variant={isRoot ? "default" : "outline"}
            aria-pressed={isRoot}
            onClick={() => onJoint("root")}
            className={cn("h-7 gap-1.5 px-2.5 font-normal")}
          >
            <MapPin className="size-3.5" />
            {t.studio.stance.placeFacing}
          </Button>
        </div>
      </div>

      {isRoot ? (
        <div className="grid gap-5 @[26rem]:grid-cols-2">
          <Row
            icon={MapPin}
            label={t.studio.stance.acrossStage}
            value={+pose.x.toFixed(2)}
            min={-2.6}
            max={2.6}
            step={0.05}
            onChange={(v) => onRoot("x", v)}
          />
          <Row
            icon={MapPin}
            label={t.studio.stance.towardsAudience}
            value={+pose.z.toFixed(2)}
            min={-2.6}
            max={2.6}
            step={0.05}
            onChange={(v) => onRoot("z", v)}
          />
          <Row
            icon={RotateCw}
            label={t.studio.stance.whichWayFacing}
            value={Math.round(pose.facing)}
            min={-180}
            max={180}
            step={5}
            onChange={(v) => onRoot("facing", v)}
          />
          <Row
            icon={Ruler}
            label={t.studio.stance.hipHeight}
            value={+pose.hipY.toFixed(2)}
            min={0.55}
            max={1.25}
            step={0.01}
            onChange={(v) => onRoot("hipY", v)}
          />
        </div>
      ) : (
        <div className="grid gap-5 @[26rem]:grid-cols-2">
          <Row
            icon={Compass}
            label={t.studio.stance.whichWayRound}
            value={Math.round(az)}
            min={-180}
            max={180}
            step={2}
            onChange={(v) => onBone(0, v)}
          />
          <Row
            icon={MoveVertical}
            label={t.studio.stance.howHigh}
            value={Math.round(el)}
            min={-90}
            max={90}
            step={2}
            onChange={(v) => onBone(1, v)}
          />
          {ew && (
            <p className="text-muted-foreground flex items-center gap-1 font-mono text-[0.85rem] @[26rem]:col-span-2">
              {t.studio.stance.ewLine} {ew.v.toFixed(1)} / {ew.h.toFixed(1)}
              <InfoTip title={t.studio.stance.ewTitle} side="top">{t.studio.stance.ewInfo}</InfoTip>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
