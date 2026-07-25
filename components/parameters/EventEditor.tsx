"use client";

import { Compass, Gauge, MoveVertical, PersonStanding, Timer, Waves } from "lucide-react";
import { DEPTH_GLYPH, DIRS, LEVELS, ROSE_ORDER, type DirKey, type Level } from "@/lib/notation";
import { LIMBS, type Mode, type PhraseEvent, depthOf, ewOf } from "./model";
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
  const abs = mode === "abstract";

  return (
    <div className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
      <Field icon={PersonStanding} label={abs ? "Channel" : "Which part"}>
        <div className="flex flex-wrap gap-1.5">
          {LIMBS.map((l) => (
            <Opt key={l.id} on={ev.limb === l.id} onClick={() => onSet("limb", l.id)}>
              {abs ? l.abs.replace("Channel ", "k") : l.body}
            </Opt>
          ))}
        </div>
      </Field>

      <Field icon={Compass} label={abs ? "Azimuth φ" : "Which way"}>
        <div className="grid w-fit grid-cols-3 gap-1.5">
          {ROSE_ORDER.map((d: DirKey) => (
            <Opt
              key={d}
              on={ev.dir === d}
              title={DIRS[d].label}
              onClick={() => onSet("dir", d)}
              className="w-9 justify-center px-0 font-mono text-base"
            >
              {DIRS[d].arrow}
            </Opt>
          ))}
        </div>
      </Field>

      <div className="space-y-6">
        <Field icon={MoveVertical} label={abs ? "Elevation θ" : "How high"}>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(LEVELS) as Level[]).map((k) => (
              <Opt key={k} on={ev.level === k} onClick={() => onSet("level", k)}>
                {abs ? `${LEVELS[k].el}°` : k}
              </Opt>
            ))}
          </div>
        </Field>

        <Field icon={Timer} label={abs ? "Interval Δt" : "How long"}>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <Opt key={n} on={ev.beats === n} onClick={() => onSet("beats", n)}>
                {n} beat{n > 1 ? "s" : ""}
              </Opt>
            ))}
          </div>
        </Field>
      </div>

      <div className="space-y-6">
        <Field
          icon={Waves}
          label={abs ? "Easing" : "How it starts"}
          infoTitle="Laban called this effort"
          info={
            <>
              <p>
                Laban thought a movement&apos;s <em>quality</em> mattered as much as its path, and wrote it with a
                separate family of signs he called effort.
              </p>
              <p>
                <strong>Sustained</strong> spreads the change evenly over the whole time. <strong>Sudden</strong> snaps
                to the new position early and holds it.
              </p>
            </>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            <Opt on={ev.time === "sustained"} onClick={() => onSet("time", "sustained")}>
              {abs ? "smooth" : "sustained"}
            </Opt>
            <Opt on={ev.time === "sudden"} onClick={() => onSet("time", "sudden")}>
              {abs ? "snap" : "sudden"}
            </Opt>
          </div>
        </Field>

        <Field
          icon={Gauge}
          label={abs ? "Amplitude" : "How strong"}
          infoTitle="Light or strong"
          info={
            <p>
              The other half of Laban&apos;s effort pair: how much weight the mover puts behind the movement. Here it
              simply draws the line thicker.
            </p>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            <Opt on={ev.weight === "light"} onClick={() => onSet("weight", "light")}>
              {abs ? "low gain" : "light"}
            </Opt>
            <Opt on={ev.weight === "strong"} onClick={() => onSet("weight", "strong")}>
              {abs ? "high gain" : "strong"}
            </Opt>
          </div>
        </Field>
      </div>

      <div className="lg:col-span-4">
        <Separator className="mb-4" />
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[0.85rem]">
          <span>
            <span className="text-foreground">Laban</span> {DIRS[ev.dir].label} · {ev.level}
          </span>
          <span>
            <span className="text-foreground">Benesh</span> {DEPTH_GLYPH[depthOf(ev)]} {depthOf(ev)}
          </span>
          <span>
            <span className="text-foreground">Eshkol-Wachman</span> {ewOf(ev).v} / {ewOf(ev).h}
          </span>
          <span>
            <span className="text-foreground">LifeForms</span> {ev.beats} beat{ev.beats > 1 ? "s" : ""} ·{" "}
            {ev.time === "sudden" ? "snap" : "smooth"}
          </span>
        </div>
      </div>
    </div>
  );
}
