"use client";

import { Compass, Gauge, MoveVertical, PersonStanding, Timer, Waves } from "lucide-react";
import { DEPTH_GLYPH, DIRS, LEVELS, ROSE_ORDER, type DirKey, type Level } from "@/lib/notation";
import { LIMBS, type Mode, type PhraseEvent, depthOf, ewOf } from "./model";
import { useCopy } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import InfoTip from "@/components/notation/info-tip";
import { cn } from "@/lib/utils";

function Field({
  icon: Icon,
  label,
  children,
  className,
  info,
  infoTitle,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  className?: string;
  info?: React.ReactNode;
  infoTitle?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="text-muted-foreground flex items-center gap-1.5 text-[0.8rem] font-medium tracking-wide uppercase">
        <Icon className="size-3.5" />
        {label}
        {info ? <InfoTip title={infoTitle ?? label}>{info}</InfoTip> : null}
      </div>
      {children}
    </div>
  );
}

/** A small pressed/unpressed choice button — the page's only form control. */
function Opt({
  on,
  onClick,
  title,
  className,
  children,
}: {
  on: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={on ? "default" : "outline"}
      aria-pressed={on}
      title={title}
      onClick={onClick}
      className={cn("h-8 px-2.5 text-[0.9rem] font-normal", className)}
    >
      {children}
    </Button>
  );
}

/**
 * Edits the one selected event. Every notation on the page is a view of
 * this object, so changing anything here re-spells it in four languages
 * at once.
 */
export default function EventEditor({
  ev,
  mode,
  onSet,
}: {
  ev: PhraseEvent;
  mode: Mode;
  onSet: (key: keyof PhraseEvent, val: string | number) => void;
}) {
  const t = useCopy();
  const abs = mode === "abstract";

  return (
    <div className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
      <Field icon={PersonStanding} label={abs ? t.editor.partAbs : t.editor.part}>
        <div className="flex flex-wrap gap-1.5">
          {LIMBS.map((l) => (
            <Opt key={l.id} on={ev.limb === l.id} onClick={() => onSet("limb", l.id)}>
              {abs ? `k${l.channel}` : t.limbs[l.id]}
            </Opt>
          ))}
        </div>
      </Field>

      <Field icon={Compass} label={abs ? t.editor.wayAbs : t.editor.way}>
        <div className="grid w-fit grid-cols-3 gap-1.5">
          {ROSE_ORDER.map((d: DirKey) => (
            <Opt
              key={d}
              on={ev.dir === d}
              title={t.dirs[d]}
              onClick={() => onSet("dir", d)}
              className="w-9 justify-center px-0 font-mono text-base"
            >
              {DIRS[d].arrow}
            </Opt>
          ))}
        </div>
      </Field>

      <div className="space-y-6">
        <Field icon={MoveVertical} label={abs ? t.editor.highAbs : t.editor.high}>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(LEVELS) as Level[]).map((k) => (
              <Opt key={k} on={ev.level === k} onClick={() => onSet("level", k)}>
                {abs ? `${LEVELS[k].el}°` : t.levels[k]}
              </Opt>
            ))}
          </div>
        </Field>

        <Field icon={Timer} label={abs ? t.editor.longAbs : t.editor.long}>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <Opt key={n} on={ev.beats === n} onClick={() => onSet("beats", n)}>
                {t.editor.beats(n)}
              </Opt>
            ))}
          </div>
        </Field>
      </div>

      <div className="space-y-6">
        <Field
          icon={Waves}
          label={abs ? t.editor.startsAbs : t.editor.starts}
          infoTitle={t.editor.effortTitle}
          info={t.editor.effortInfo}
        >
          <div className="flex flex-wrap gap-1.5">
            <Opt on={ev.time === "sustained"} onClick={() => onSet("time", "sustained")}>
              {abs ? t.editor.smooth : t.editor.sustained}
            </Opt>
            <Opt on={ev.time === "sudden"} onClick={() => onSet("time", "sudden")}>
              {abs ? t.editor.snap : t.editor.sudden}
            </Opt>
          </div>
        </Field>

        <Field
          icon={Gauge}
          label={abs ? t.editor.strengthAbs : t.editor.strength}
          infoTitle={t.editor.weightTitle}
          info={t.editor.weightInfo}
        >
          <div className="flex flex-wrap gap-1.5">
            <Opt on={ev.weight === "light"} onClick={() => onSet("weight", "light")}>
              {abs ? t.editor.lowGain : t.editor.light}
            </Opt>
            <Opt on={ev.weight === "strong"} onClick={() => onSet("weight", "strong")}>
              {abs ? t.editor.highGain : t.editor.strong}
            </Opt>
          </div>
        </Field>
      </div>

      <div className="lg:col-span-4">
        <Separator className="mb-4" />
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[0.85rem]">
          <span>
            <span className="text-foreground">Laban</span> {t.dirs[ev.dir]} · {t.levels[ev.level]}
          </span>
          <span>
            <span className="text-foreground">Benesh</span> {DEPTH_GLYPH[depthOf(ev)]} {t.depths[depthOf(ev)]}
          </span>
          <span>
            <span className="text-foreground">Eshkol-Wachman</span> {ewOf(ev).v} / {ewOf(ev).h}
          </span>
          <span>
            <span className="text-foreground">LifeForms</span> {t.editor.beats(ev.beats)} ·{" "}
            {ev.time === "sudden" ? t.editor.snap : t.editor.smooth}
          </span>
        </div>
      </div>
    </div>
  );
}
