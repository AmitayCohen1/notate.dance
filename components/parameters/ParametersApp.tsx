"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Dices,
  Film,
  Globe,
  Grid3x3,
  Pause,
  Play,
  Rows3,
  SquareStack,
  Theater,
} from "lucide-react";
import SiteHeader from "@/components/site-header";
import ModeSwitch from "@/components/notation/mode-switch";
import ParamBadges from "@/components/notation/param-badges";
import ScoreCard from "@/components/notation/score-card";
import Section from "@/components/notation/section";
import SectionNav from "@/components/notation/section-nav";
import LabanLegend from "@/components/notation/laban-legend";
import { PLATES, Plate } from "@/components/notation/plate";
import HeroFigure from "@/components/notation/hero-figure";
import InfoTip from "@/components/notation/info-tip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DIRS } from "@/lib/notation";
import { CHIPSETS, INITIAL_PHRASE, LIMBS, type Mode, type PhraseEvent, totalBeats } from "./model";
import PhraseTimeline, { type PlayheadHandle } from "./PhraseTimeline";
import LabanView from "./LabanView";
import BeneshView from "./BeneshView";
import EWView from "./EWView";
import ViewerCanvas, { type ViewerHandle } from "./ViewerCanvas";
import SphereCanvas from "./SphereCanvas";
import EventEditor from "./EventEditor";

const BEATS_PER_SEC = 1.25;

const SECTIONS = [
  { id: "phrase", label: "The phrase" },
  { id: "laban", label: "Labanotation" },
  { id: "benesh", label: "Benesh" },
  { id: "ew", label: "Eshkol-Wachman" },
  { id: "compare", label: "Side by side" },
];

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

export default function ParametersApp() {
  const [phrase, setPhrase] = useState<PhraseEvent[]>(INITIAL_PHRASE);
  const [mode, setMode] = useState<Mode>("embodied");
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [readout, setReadout] = useState({ ew: "2.0 / 0.0", laban: "forward · middle" });

  const tRef = useRef(0);
  const clockRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<PlayheadHandle>(null);
  const viewerRef = useRef<ViewerHandle>(null);

  const abs = mode === "abstract";
  const ev = phrase[selected];

  // playback loop — runs only while playing; advances tRef and drives the
  // canvas + playhead imperatively so we don't re-render at 60fps.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last: number | null = null;
    const total = totalBeats(phrase);
    const tick = (ts: number) => {
      if (last === null) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      tRef.current += dt * BEATS_PER_SEC;
      if (tRef.current >= total + 0.6) tRef.current = 0;
      timelineRef.current?.setPlayhead(tRef.current);
      viewerRef.current?.redraw();
      if (clockRef.current) clockRef.current.textContent = tRef.current.toFixed(1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, phrase]);

  const setField = (key: keyof PhraseEvent, val: string | number) => {
    setPhrase((p) => p.map((e, i) => (i === selected ? { ...e, [key]: val } : e)));
  };

  const castChance = () => {
    const n = 4 + Math.floor(Math.random() * 3);
    const dirs = Object.keys(DIRS) as (keyof typeof DIRS)[];
    const next: PhraseEvent[] = Array.from({ length: n }, () => ({
      limb: pick(LIMBS).id,
      dir: Math.random() < 0.12 ? "place" : pick(dirs.filter((d) => d !== "place")),
      level: pick(["low", "middle", "high"] as const),
      beats: 1 + Math.floor(Math.random() * 3),
      time: pick(["sustained", "sudden"] as const),
      weight: pick(["light", "strong"] as const),
    }));
    tRef.current = 0;
    setPhrase(next);
    setSelected(0);
    setPlaying(false);
    if (clockRef.current) clockRef.current.textContent = "0.0";
  };

  const step = (d: number) => {
    setSelected((s) => (s + d + phrase.length) % phrase.length);
    setPlaying(false);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader current="params" />

      {/* ============================ HERO ============================ */}
      <section className="border-b">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-14 lg:grid-cols-[1fr_0.92fr] lg:gap-14 lg:py-16">
          <div className="space-y-7">
            <h1 className="text-[2.9rem] leading-[1] font-semibold tracking-tight text-balance sm:text-[4rem]">
              One movement,
              <br />
              <span className="text-brand">written four ways.</span>
            </h1>
            <p className="text-foreground max-w-[34ch] text-[1.45rem] leading-snug font-medium">
              Dance has no single way of being written down. Change one thing — and watch four notations rewrite it.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#move" className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-5 text-[1rem]")}>
                <SquareStack className="size-[18px]" />
                Start with one move
              </a>
              <Link
                href="/studio"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 gap-2 px-5 text-[1rem]")}
              >
                <Theater className="size-[18px]" />
                Open the Studio
              </Link>
            </div>
          </div>

          <div className="bg-card overflow-hidden rounded-xl border">
            <HeroFigure className="h-[300px] sm:h-[372px]" onReadout={setReadout} />
            <div className="flex items-center justify-between gap-4 border-t px-5 py-3">
              <span className="text-muted-foreground text-[0.78rem] font-medium tracking-wide uppercase">
                Right arm, right now
              </span>
              <span className="font-mono text-[0.9rem] tabular-nums">
                <span className="text-brand">{readout.ew}</span>
                <span className="text-muted-foreground"> · {readout.laban}</span>
              </span>
            </div>
            <p className="text-muted-foreground border-t px-5 py-3.5 text-[0.92rem] leading-relaxed">
              A stance is ten directions and a hip height — nothing else. Those numbers are how Eshkol-Wachman and Laban
              would write this arm; the trailing line is where the wrist has just been.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== THE INSTRUMENT: ONE MOVE ===================== */}
      <section id="move" className="bg-muted/35 scroll-mt-20 border-b">
        <div className="mx-auto max-w-[1200px] space-y-8 px-6 py-16">
          {/* the same header signature every section uses */}
          <div className="flex items-center gap-4">
            <span className="text-brand font-mono text-[1.05rem] leading-none tabular-nums">00</span>
            <span className="text-muted-foreground font-mono text-[0.78rem] tracking-[0.16em] whitespace-nowrap uppercase">
              The thing every notation has to write
            </span>
            <span className="bg-border h-px flex-1" />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-[46ch] space-y-4">
              <h2 className="text-[2.35rem] leading-[1.04] font-semibold tracking-tight sm:text-[3rem]">
                One move, five decisions
              </h2>
              <p className="prose-note text-[1.28rem] leading-[1.55]">
                Set them here. Everything below is the <em>same</em> five decisions, spelled out by four different
                systems.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Previous move" onClick={() => step(-1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="font-mono text-[0.95rem] tabular-nums">
                move {selected + 1} / {phrase.length}
              </span>
              <Button variant="ghost" size="icon" aria-label="Next move" onClick={() => step(1)}>
                <ChevronRight className="size-4" />
              </Button>
              <Separator orientation="vertical" className="mx-2 h-7" />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="outline" onClick={castChance} className="text-destructive h-10 gap-2">
                      <Dices className="size-4" />
                      Roll the whole phrase
                    </Button>
                  }
                />
                <TooltipContent>Chance operations, the way Cunningham used them</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Card className="overflow-hidden py-0">
            <EventEditor ev={ev} mode={mode} onSet={setField} />
          </Card>
        </div>
      </section>

      {/* ===================== SECTION INDEX (sticky) ===================== */}
      <SectionNav sections={SECTIONS}>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-muted-foreground hidden text-[0.78rem] font-medium tracking-wide uppercase sm:block">
            Read as
          </span>
          <ModeSwitch mode={mode} onChange={setMode} />
          <InfoTip title="Body, or the numbers underneath?" side="bottom">
            <p>
              <strong>Body</strong> shows each notation the way a dancer reads it — staves, figures, body parts.
            </p>
            <p>
              <strong>Numbers</strong> takes the dancer away and leaves what the system actually records: which channel,
              which direction, how high, how long. That set is what all four share, and exactly what a computer animates.
            </p>
          </InfoTip>
        </div>
      </SectionNav>

      {/* ============================ SECTIONS ============================ */}
      <main>
        {/* ---------------------- 1. THE PHRASE ---------------------- */}
        <Section
          id="phrase"
          index="01"
          eyebrow="Computer keyframes · 1989–"
          title="Snapshots, and the gaps between them"
          infoTitle="Cunningham and LifeForms"
          info={
            <>
              <p>
                LifeForms was built in the 1980s at Simon Fraser University by Tom Calvert&apos;s group, and later sold
                as <em>DanceForms</em>. Merce Cunningham began composing with it in 1989.
              </p>
              <p>
                He had used chance procedures — dice, coin tosses, the <em>I Ching</em> — since the 1950s to decide what
                came next. The software proposed positions no trained dancer would think of, and he kept them.
              </p>
            </>
          }
          lead={
            <>
              <p>
                A <strong>keyframe</strong> is a snapshot: at this beat, this body part points this way. The computer
                invents the movement in between. That is all the timeline below holds — five snapshots, and the machine
                filling the gaps.
              </p>
            </>
          }
          chips={<ParamBadges set={CHIPSETS.lifeforms} mode={mode} />}
          aside={<Plate plate={PLATES.cunningham} imgClassName="max-h-[300px]" />}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => setPlaying((p) => !p)} className="gap-2">
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playing ? "Pause" : "Play the phrase"}
            </Button>
            <span className="text-muted-foreground font-mono text-[0.9rem] tabular-nums">
              beat <span ref={clockRef}>{tRef.current.toFixed(1)}</span> / {totalBeats(phrase)}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <ScoreCard
              icon={SquareStack}
              title={abs ? "Channels × keyframes" : "Body parts × keyframes"}
              hint="Click any diamond to edit that move above."
            >
              <PhraseTimeline
                ref={timelineRef}
                phrase={phrase}
                mode={mode}
                selected={selected}
                onSelect={setSelected}
                tRef={tRef}
              />
            </ScoreCard>

            <ScoreCard
              icon={abs ? Boxes : Film}
              title={abs ? "Channel curves" : "Figure viewer"}
              hint={abs ? "Elevation θ per channel over beats" : "Front view, interpolating between targets"}
              scroll={false}
            >
              <ViewerCanvas ref={viewerRef} phrase={phrase} mode={mode} selected={selected} tRef={tRef} />
            </ScoreCard>
          </div>
        </Section>

        {/* ---------------------- 2. LABANOTATION ---------------------- */}
        <Section
          id="laban"
          index="02"
          eyebrow="Rudolf Laban · 1928"
          title="Labanotation"
          infoTitle="Where it comes from"
          info={
            <>
              <p>
                Rudolf Laban published this system as <em>Kinetographie Laban</em> in 1928. It is still the most widely
                used dance notation, and full scores are archived so works can be restaged decades later.
              </p>
              <p>
                A real staff has more columns than the four here — supporting legs, torso, head — and extra signs for the
                quality of a movement.
              </p>
            </>
          }
          lead={
            <p>
              Read this one <strong>from the bottom up</strong>, like watching a lift climb a wall. Each column is a body
              part. Every symbol answers three questions at once: its <strong>shape</strong> says which way the limb
              points, the <strong>filling</strong> says how high, and its <strong>height on the page</strong> says how
              long the movement lasts.
            </p>
          }
          chips={<ParamBadges set={CHIPSETS.laban} mode={mode} />}
          aside={<Plate plate={PLATES.labanDirections} />}
          tinted
        >
          <Card>
            <CardContent>
              <LabanLegend />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,640px)_1fr] lg:items-start">
          <ScoreCard
            icon={Columns3}
            center
            title={abs ? "Direction lattice + bare intervals" : "The staff"}
            hint={
              abs
                ? "26 rays of the kinesphere, plus duration as pure interval length"
                : "Read upward from the double start line; four gesture columns"
            }
            padded
            footnote={
              abs
                ? "In Numbers mode the staff dissolves into Laban's deeper claim: direction is one of 26 rays of a point-centred lattice — the kinesphere — and duration is bare interval length."
                : "Simplified to four gesture columns; real Labanotation adds support, body and head columns and a large symbol repertory."
            }
          >
            <LabanView phrase={phrase} mode={mode} selected={selected} onSelect={setSelected} />
          </ScoreCard>
          <Plate plate={abs ? PLATES.laban26 : PLATES.labanScore} />
          </div>
        </Section>

        {/* ---------------------- 3. BENESH ---------------------- */}
        <Section
          id="benesh"
          index="03"
          eyebrow="Rudolf & Joan Benesh · 1955"
          title="Benesh notation"
          infoTitle="Where it comes from"
          info={
            <>
              <p>
                Joan Benesh danced with Sadler&apos;s Wells; her husband Rudolf was an accountant and painter. They
                published their system in 1955 and it became the standard in ballet — the Royal Ballet still employs
                choreologists who write in it.
              </p>
              <p>A full score also records travelling and turning under the stave, in bars, like music.</p>
            </>
          }
          lead={
            <>
              <p>
                This one looks like sheet music and reads left to right — but the five lines are not pitches, they are{" "}
                <strong>heights on the body</strong>: top of head, shoulders, waist, knees, floor.
              </p>
              <p>
                You draw where the hands and feet <em>appear</em>, as if standing behind the dancer. A little stroke says
                how deep: <span className="font-mono">|</span> in front, <span className="font-mono">—</span> level,{" "}
                <span className="font-mono">•</span> behind.
              </p>
            </>
          }
          chips={<ParamBadges set={CHIPSETS.benesh} mode={mode} />}
          aside={<Plate plate={PLATES.benesh} />}
        >
          <ScoreCard
            icon={Rows3}
            title={abs ? "Picture plane — coordinates only" : "The stave"}
            hint={
              abs ? "Position (x, y) plus a three-valued depth, figure removed" : "One frame per move, seen from behind"
            }
            padded
            footnote={
              abs
                ? "With the dancer gone the parameter shows itself plainly: a point (x, y) in a picture plane plus a ternary depth — a shallow 3-D coordinate."
                : "Rhythm marks above the stave give each frame's duration in beats."
            }
          >
            <BeneshView phrase={phrase} mode={mode} selected={selected} onSelect={setSelected} />
          </ScoreCard>
        </Section>

        {/* ---------------------- 4. ESHKOL-WACHMAN ---------------------- */}
        <Section
          id="ew"
          index="04"
          eyebrow="Noa Eshkol & Avraham Wachman · 1958"
          title="Eshkol-Wachman notation"
          infoTitle="Where it comes from"
          info={
            <>
              <p>
                Noa Eshkol, an Israeli choreographer, built this system in 1958 with the architect Avraham Wachman. She
                wanted movement described without any reference to style, mood or stage.
              </p>
              <p>
                Because it only describes angles, it has been used far beyond dance: for sign language, physical therapy,
                and studies of animal behaviour.
              </p>
            </>
          }
          lead={
            <>
              <p>
                Treat every limb as a straight stick that swings on an invisible ball around its joint. Then its position
                is two numbers: <strong>how high</strong> (0 is straight down, 4 is straight up) and{" "}
                <strong>which way round</strong> (one step = 45°).
              </p>
              <p>The score is a table — limbs down the side, time across the top. No picture of a body anywhere.</p>
            </>
          }
          chips={<ParamBadges set={CHIPSETS.ew} mode={mode} />}
          aside={<Plate plate={PLATES.eshkol} imgClassName="max-h-[330px]" />}
          tinted
        >
          <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
            <ScoreCard
              icon={Grid3x3}
              title={abs ? "Score grid — channels × time" : "Score grid — limbs × time"}
              hint="Cells read vertical / horizontal, in 45° units"
              padded
              footnote="Vertical 0 points straight down and 4 straight up; horizontal counts 45° units around the body, 0 = forward."
            >
              <EWView phrase={phrase} mode={mode} selected={selected} onSelect={setSelected} />
            </ScoreCard>

            <ScoreCard
              icon={Globe}
              title="System of reference"
              hint={abs ? "The sphere, graduated in 45° units" : "The limb on its joint-sphere"}
              scroll={false}
              footnote="The sphere is the notation — in Numbers mode nothing is removed but a label."
            >
              <SphereCanvas phrase={phrase} mode={mode} selected={selected} />
            </ScoreCard>
          </div>
        </Section>

        {/* ---------------------- 5. SIDE BY SIDE ---------------------- */}
        <Section
          id="compare"
          index="05"
          eyebrow="Side by side"
          title="The same movement, four spellings"
          lead={
            <p>
              Each row is one thing a dance can specify. Each column shows how one system writes it. The last column is
              what is left when you take the body away — the part every system agrees on.
            </p>
          }
          aside={<Plate plate={PLATES.feuillet} imgClassName="max-h-[380px]" />}
        >
          <Card className="overflow-hidden py-0">
            <div className="score-scroll">
              <Table className="min-w-[880px] text-[0.92rem]">
                <TableHeader>
                  <TableRow className="bg-muted/60">
                    <TableHead className="w-[130px]">What it fixes</TableHead>
                    <TableHead>Labanotation</TableHead>
                    <TableHead>Benesh</TableHead>
                    <TableHead>Eshkol-Wachman</TableHead>
                    <TableHead>LifeForms</TableHead>
                    <TableHead className="text-brand">Just the numbers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    [
                      "Where it points",
                      "Shape of the symbol — 8 directions plus “place”",
                      "Where the hand or foot sits in the frame",
                      "Angle round the body, 45° at a time",
                      "Direction of the segment",
                      "unit vector v ∈ S²",
                    ],
                    [
                      "How high",
                      "How the symbol is filled in",
                      "Height against the five body lines",
                      "0 straight down → 4 straight up",
                      "Height of the pose",
                      "angle θ",
                    ],
                    [
                      "How long",
                      "How tall the symbol is",
                      "Order left to right, dots for beats",
                      "One column per time unit",
                      "Where the snapshot sits in time",
                      "interval [t₀, t₀+Δt]",
                    ],
                    [
                      "Who moves",
                      "Which column on the staff",
                      "Which hand or foot is drawn",
                      "Which row of the table",
                      "Which channel of the figure",
                      "channel index k",
                    ],
                    [
                      "How it feels",
                      "Effort signs — weight, time, space, flow",
                      "Phrasing and accent marks",
                      "Mostly left out on purpose",
                      "The curve between snapshots",
                      "easing e(t)",
                    ],
                  ].map((row) => (
                    <TableRow key={row[0]}>
                      <TableCell className="font-medium">{row[0]}</TableCell>
                      {row.slice(1, 5).map((cell, i) => (
                        <TableCell key={i} className="text-muted-foreground align-top leading-relaxed">
                          {cell}
                        </TableCell>
                      ))}
                      <TableCell className="text-brand align-top font-mono text-[0.85rem]">{row[5]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Plate plate={PLATES.labanPortrait} imgClassName="max-h-[320px]" />
            <Card>
              <CardContent className="prose-note space-y-3 text-[1.05rem]">
                <p>
                  A single shared data structure —{" "}
                  <span className="font-mono text-[0.9em]">{"{channel, direction, level, duration, dynamic}"}</span> —
                  drives every score on this page. That structure is itself the answer to the question the page asks:
                  the parameters, without a body.
                </p>
                <p>
                  It is also what the <strong>Studio</strong> writes, one keyframe at a time.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>
      </main>

      {/* ============================ FOOTER ============================ */}
      <footer className="bg-muted/40 border-t">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-16 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="flex items-center gap-1 font-medium">
              A choreographer at a screen
              <InfoTip title="Cunningham's computer works">
                <p>
                  <em>Trackers</em> (1991) was the first stage work he made with the software.
                </p>
                <p>
                  For <em>BIPED</em> (1999) he went further: dancers were motion-captured, and the artists Paul Kaiser
                  and Shelley Eshkar projected their hand-drawn, bodiless traces over the live stage.
                </p>
              </InfoTip>
            </h3>
            <p className="prose-note text-[1rem]">
              Merce Cunningham was seventy when he started choreographing at a computer. He liked that the figure on
              screen had no habits and never got tired, so it suggested positions a trained dancer never would.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="flex items-center gap-1 font-medium">
              This is the simple version
              <InfoTip title="What has been left out">
                <p>
                  Real Labanotation has columns for the supporting legs, torso and head, and a large set of signs for the
                  quality of a movement.
                </p>
                <p>Real Benesh records travelling and turning below the stave, in bars, like music.</p>
                <p>
                  Real Eshkol-Wachman divides angles as finely as it likes, and distinguishes flat, cone-shaped and
                  twisting paths.
                </p>
              </InfoTip>
            </h3>
            <p className="prose-note text-[1rem]">
              Each system here is cut down to the same small vocabulary — one moving part at a time, eight directions,
              three heights — so that they can be compared side by side. The real ones are much richer.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Try it yourself</h3>
            <p className="prose-note text-[1rem]">
              The <strong>Studio</strong> is a working rebuild of the software: pose a figure, place snapshots, send the
              dancers walking, and read what you made back in all three notations.
            </p>
            <Link href="/studio" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-2 gap-2")}>
              Open the Studio
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
