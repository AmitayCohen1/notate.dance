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
import { Plate } from "@/components/notation/plate";
import HeroFigure from "@/components/notation/hero-figure";
import InfoTip from "@/components/notation/info-tip";
import { useCopy, useLocale } from "@/components/locale-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { localePath } from "@/lib/i18n";
import { DIRS } from "@/lib/notation";
import { INITIAL_PHRASE, LIMBS, type Mode, type PhraseEvent, totalBeats } from "./model";
import PhraseTimeline, { type PlayheadHandle } from "./PhraseTimeline";
import LabanView from "./LabanView";
import BeneshView from "./BeneshView";
import EWView from "./EWView";
import ViewerCanvas, { type ViewerHandle } from "./ViewerCanvas";
import SphereCanvas from "./SphereCanvas";
import EventEditor from "./EventEditor";

const BEATS_PER_SEC = 1.25;

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

/* First letter of each of the first two words — the stand-in for a portrait. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => [...word][0] ?? "")
    .join("");
}

export default function ParametersApp() {
  const t = useCopy();
  const locale = useLocale();

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

  const SECTIONS = [
    { id: "phrase", label: t.nav.sections.phrase },
    { id: "laban", label: t.nav.sections.laban },
    { id: "benesh", label: t.nav.sections.benesh },
    { id: "ew", label: t.nav.sections.ew },
    { id: "compare", label: t.nav.sections.compare },
  ];

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
              {t.hero.titleTop}
              <br />
              <span className="text-brand">{t.hero.titleBottom}</span>
            </h1>
            <p className="text-foreground max-w-[34ch] text-[1.45rem] leading-snug font-medium">{t.hero.sub}</p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#move" className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-5 text-[1rem]")}>
                <SquareStack className="size-[18px]" />
                {t.hero.ctaMove}
              </a>
              <Link
                href={localePath(locale, "/studio")}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 gap-2 px-5 text-[1rem]")}
              >
                <Theater className="size-[18px]" />
                {t.hero.ctaStudio}
              </Link>
            </div>
          </div>

          <div className="bg-card overflow-hidden rounded-xl border">
            <HeroFigure className="h-[300px] sm:h-[372px]" onReadout={setReadout} />
            <div className="flex items-center justify-between gap-4 border-t px-5 py-3">
              <span className="text-muted-foreground text-[0.78rem] font-medium tracking-wide uppercase">
                {t.hero.readoutLabel}
              </span>
              <span className="font-mono text-[0.9rem] tabular-nums">
                <span className="text-brand">{readout.ew}</span>
                <span className="text-muted-foreground"> · {readout.laban}</span>
              </span>
            </div>
            <p className="text-muted-foreground border-t px-5 py-3.5 text-[0.92rem] leading-relaxed">{t.hero.note}</p>
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
              {t.move.eyebrow}
            </span>
            <span className="bg-border h-px flex-1" />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-[46ch] space-y-4">
              <h2 className="text-[2.35rem] leading-[1.04] font-semibold tracking-tight sm:text-[3rem]">
                {t.move.title}
              </h2>
              <p className="prose-note text-[1.28rem] leading-[1.55]">{t.move.lead}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="icon" aria-label={t.move.prev} onClick={() => step(-1)}>
                <ChevronLeft className="size-4 rtl:rotate-180" />
              </Button>
              <span className="font-mono text-[0.95rem] tabular-nums">
                {t.move.counter(selected + 1, phrase.length)}
              </span>
              <Button variant="ghost" size="icon" aria-label={t.move.next} onClick={() => step(1)}>
                <ChevronRight className="size-4 rtl:rotate-180" />
              </Button>
              <Separator orientation="vertical" className="mx-2 h-7" />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="outline" onClick={castChance} className="text-destructive h-10 gap-2">
                      <Dices className="size-4" />
                      {t.move.roll}
                    </Button>
                  }
                />
                <TooltipContent>{t.move.rollTip}</TooltipContent>
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
            {t.nav.readAs}
          </span>
          <ModeSwitch mode={mode} onChange={setMode} />
          <InfoTip title={t.nav.modeInfoTitle} side="bottom">
            {t.nav.modeInfo}
          </InfoTip>
        </div>
      </SectionNav>

      {/* ============================ SECTIONS ============================ */}
      <main>
        {/* ---------------------- 1. THE PHRASE ---------------------- */}
        <Section
          id="phrase"
          index="01"
          eyebrow={t.phrase.eyebrow}
          title={t.phrase.title}
          infoTitle={t.phrase.infoTitle}
          info={t.phrase.info}
          lead={t.phrase.lead}
          chips={<ParamBadges set={t.chips.lifeforms} mode={mode} />}
          aside={<Plate name="cunningham" frame="square" />}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => setPlaying((p) => !p)} className="gap-2">
              {playing ? <Pause className="size-4" /> : <Play className="size-4 rtl:rotate-180" />}
              {playing ? t.phrase.pause : t.phrase.play}
            </Button>
            <span className="text-muted-foreground font-mono text-[0.9rem] tabular-nums">
              {t.phrase.beat} <span ref={clockRef}>{tRef.current.toFixed(1)}</span> / {totalBeats(phrase)}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <ScoreCard
              icon={SquareStack}
              title={abs ? t.phrase.timelineTitleAbs : t.phrase.timelineTitle}
              hint={t.phrase.timelineHint}
              bodyClassName="ltr-island"
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
              title={abs ? t.phrase.viewerTitleAbs : t.phrase.viewerTitle}
              hint={abs ? t.phrase.viewerHintAbs : t.phrase.viewerHint}
              scroll={false}
              bodyClassName="ltr-island"
            >
              <ViewerCanvas ref={viewerRef} phrase={phrase} mode={mode} selected={selected} tRef={tRef} />
            </ScoreCard>
          </div>
        </Section>

        {/* ---------------------- 2. LABANOTATION ---------------------- */}
        <Section
          id="laban"
          index="02"
          eyebrow={t.laban.eyebrow}
          title={t.laban.title}
          infoTitle={t.laban.infoTitle}
          info={t.laban.info}
          lead={t.laban.lead}
          chips={<ParamBadges set={t.chips.laban} mode={mode} />}
          aside={<Plate name="labanDirections" frame="wide" />}
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
              title={abs ? t.laban.titleAbs : t.laban.title2}
              hint={abs ? t.laban.hintAbs : t.laban.hint}
              padded
              bodyClassName="ltr-island"
              footnote={abs ? t.laban.footnoteAbs : t.laban.footnote}
            >
              <LabanView phrase={phrase} mode={mode} selected={selected} onSelect={setSelected} />
            </ScoreCard>
            <Plate name={abs ? "laban26" : "labanScore"} frame="wide" />
          </div>
        </Section>

        {/* ---------------------- 3. BENESH ---------------------- */}
        <Section
          id="benesh"
          index="03"
          eyebrow={t.benesh.eyebrow}
          title={t.benesh.title}
          infoTitle={t.benesh.infoTitle}
          info={t.benesh.info}
          lead={t.benesh.lead}
          chips={<ParamBadges set={t.chips.benesh} mode={mode} />}
          aside={<Plate name="benesh" frame="strip" />}
        >
          <ScoreCard
            icon={Rows3}
            title={abs ? t.benesh.titleAbs : t.benesh.title2}
            hint={abs ? t.benesh.hintAbs : t.benesh.hint}
            padded
            bodyClassName="ltr-island"
            footnote={abs ? t.benesh.footnoteAbs : t.benesh.footnote}
          >
            <BeneshView phrase={phrase} mode={mode} selected={selected} onSelect={setSelected} />
          </ScoreCard>
        </Section>

        {/* ---------------------- 4. ESHKOL-WACHMAN ---------------------- */}
        <Section
          id="ew"
          index="04"
          eyebrow={t.ew.eyebrow}
          title={t.ew.title}
          infoTitle={t.ew.infoTitle}
          info={t.ew.info}
          lead={t.ew.lead}
          chips={<ParamBadges set={t.chips.ew} mode={mode} />}
          aside={<Plate name="eshkol" frame="square" />}
          tinted
        >
          <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
            <ScoreCard
              icon={Grid3x3}
              title={abs ? t.ew.gridTitleAbs : t.ew.gridTitle}
              hint={t.ew.gridHint}
              padded
              bodyClassName="ltr-island"
              footnote={t.ew.gridFootnote}
            >
              <EWView phrase={phrase} mode={mode} selected={selected} onSelect={setSelected} />
            </ScoreCard>

            <ScoreCard
              icon={Globe}
              title={t.ew.sphereTitle}
              hint={abs ? t.ew.sphereHintAbs : t.ew.sphereHint}
              scroll={false}
              bodyClassName="ltr-island"
              footnote={t.ew.sphereFootnote}
            >
              <SphereCanvas phrase={phrase} mode={mode} selected={selected} />
            </ScoreCard>
          </div>
        </Section>

        {/* ---------------------- 5. SIDE BY SIDE ---------------------- */}
        <Section
          id="compare"
          index="05"
          eyebrow={t.compare.eyebrow}
          title={t.compare.title}
          lead={t.compare.lead}
          aside={<Plate name="labanPortrait" frame="wide" />}
        >
          <Card className="overflow-hidden py-0">
            <div className="score-scroll">
              <Table className="min-w-[880px] text-[0.92rem]">
                <TableHeader>
                  <TableRow className="bg-muted/60">
                    <TableHead className="w-[130px]">{t.compare.head.fixes}</TableHead>
                    <TableHead>{t.compare.head.laban}</TableHead>
                    <TableHead>{t.compare.head.benesh}</TableHead>
                    <TableHead>{t.compare.head.ew}</TableHead>
                    <TableHead>{t.compare.head.lifeforms}</TableHead>
                    <TableHead className="text-brand">{t.compare.head.numbers}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {t.compare.rows.map((row) => (
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
            <Plate name="feuillet" frame="wide" />
            <Card>
              <CardContent className="prose-note space-y-3 text-[1.05rem]">{t.compare.closing}</CardContent>
            </Card>
          </div>
        </Section>
      </main>

      {/* ============================ WHO MADE THIS ============================ */}
      {/* Its own band. The portraits are about the people and nothing else, so
          they do not sit beside the footer notes, which are about the work. */}
      <section id="about" className="scroll-mt-24 border-t py-16">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-9 px-6 text-center">
          <span className="text-muted-foreground font-mono text-[0.78rem] tracking-[0.16em] uppercase">
            {t.about.eyebrow}
          </span>
          <ul className="grid w-full max-w-[760px] gap-10 sm:grid-cols-2 sm:gap-12">
            {t.about.people.map((person) => (
              <li key={person.name} className="flex flex-col items-center gap-5">
                {person.photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={person.photo}
                    alt={person.name}
                    loading="lazy"
                    decoding="async"
                    className="bg-card aspect-[3/4] w-full max-w-[320px] rounded-xl border object-cover"
                  />
                ) : (
                  /* No portrait yet: hold the same frame with a monogram so the
                     two people stay the same size side by side. Stacked on a
                     phone there is nothing to match, so it is not as tall. */
                  <div
                    aria-hidden
                    className="bg-muted/60 text-muted-foreground/45 flex aspect-[3/2] w-full max-w-[320px] items-center justify-center rounded-xl border font-mono text-[2.75rem] tracking-[0.06em] sm:aspect-[3/4]"
                  >
                    {initials(person.name)}
                  </div>
                )}
                <div className="space-y-2">
                  <h2 className="text-[1.85rem] leading-[1.06] font-semibold tracking-tight">{person.name}</h2>
                  <p className="prose-note text-[1.1rem] leading-[1.45]">{person.bio}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="bg-muted/40 border-t">
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="flex items-center gap-1 font-medium">
                {t.footer.cunninghamTitle}
                <InfoTip title={t.footer.cunninghamInfoTitle}>{t.footer.cunninghamInfo}</InfoTip>
              </h3>
              <p className="prose-note text-[1rem]">{t.footer.cunningham}</p>
            </div>
            <div className="space-y-2">
              <h3 className="flex items-center gap-1 font-medium">
                {t.footer.simpleTitle}
                <InfoTip title={t.footer.simpleInfoTitle}>{t.footer.simpleInfo}</InfoTip>
              </h3>
              <p className="prose-note text-[1rem]">{t.footer.simple}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">{t.footer.tryTitle}</h3>
              <p className="prose-note text-[1rem]">{t.footer.try}</p>
              <Link
                href={localePath(locale, "/studio")}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-2 gap-2")}
              >
                {t.hero.ctaStudio}
                <ChevronRight className="size-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
