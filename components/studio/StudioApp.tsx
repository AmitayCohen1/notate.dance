"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Dices,
  FlipHorizontal2,
  Ghost,
  Grid3x3,
  Info,
  Layers,
  Minus,
  Pause,
  PersonStanding,
  Play,
  Plus,
  Repeat,
  RotateCcw,
  Route,
  Rows3,
  SlidersHorizontal,
  Theater,
  Trash2,
  Users,
} from "lucide-react";
import SiteHeader from "@/components/site-header";
import { PLATES, Plate } from "@/components/notation/plate";
import InfoTip from "@/components/notation/info-tip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useElementSize } from "@/hooks/use-element-size";
import type { Vec3 } from "@/lib/geometry";
import { type DirKey, type Level, labanOf, labanToVec } from "@/lib/notation";
import {
  BONE,
  type BoneId,
  CAM_PRESETS,
  type Camera as Cam,
  type LimbSetId,
  type Pose,
  STAND,
  STORE_KEY,
  type Score,
  clonePose,
  demoScore,
  limbVec,
  loadScore,
  mirrorPose,
  poseAt,
  randomHexagram,
  randomPhrase,
  randomPlace,
  randomPose,
  setLimbVec,
} from "@/lib/studio";
import StageCanvas, { type StageHandle } from "./StageCanvas";
import Timeline, { type TimelineHandle } from "./Timeline";
import StanceEditor from "./StanceEditor";
import PosePalette from "./PosePalette";
import NotationEcho from "./NotationEcho";
import LabanTrack from "./LabanTrack";
import BeneshTrack from "./BeneshTrack";
import EWTrack from "./EWTrack";

type JointId = BoneId | "root";

const CAMS: { id: keyof typeof CAM_PRESETS; label: string }[] = [
  { id: "perspective", label: "Persp" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "plan", label: "Plan" },
];

const DOCK_TABS = [
  { value: "timeline", label: "Timeline", Icon: Rows3 },
  { value: "laban", label: "Labanotation", Icon: Columns3 },
  { value: "benesh", label: "Benesh", Icon: Layers },
  { value: "ew", label: "Eshkol-Wachman", Icon: Grid3x3 },
] as const;

/** A small labelled group inside a toolbar. */
function ToolGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground hidden text-[0.72rem] font-medium tracking-wider uppercase lg:block">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function StudioApp() {
  const [score, setScore] = useState<Score>(() => demoScore());
  const [selD, setSelD] = useState(0);
  const [selK, setSelK] = useState(0);
  const [joint, setJoint] = useState<JointId>("ruarm");
  const [selPart, setSelPart] = useState<LimbSetId>("rarm");
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [ghosts, setGhosts] = useState(true);
  const [paths, setPaths] = useState(true);
  const [t, setT] = useState(0);
  const [hexagram, setHexagram] = useState("䷀");
  const [dock, setDock] = useState<string>("timeline");
  const [inspector, setInspector] = useState<string>("stance");
  const [cameraId, setCameraId] = useState<string>("perspective");
  const [mobileInspector, setMobileInspector] = useState(false);

  const tRef = useRef(0);
  const camRef = useRef<Cam>({ ...CAM_PRESETS.perspective });
  const stageRef = useRef<StageHandle>(null);
  const timelineRef = useRef<TimelineHandle>(null);
  const beatRef = useRef<HTMLSpanElement>(null);
  const dockSize = useElementSize<HTMLDivElement>();

  const dancer = score.dancers[selD];
  const key = dancer?.keys[selK];

  // hydrate from local storage after mount so server and client agree
  useEffect(() => setScore(loadScore()), []);

  // persist, debounced
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(score));
      } catch {
        /* storage unavailable — the score just won't persist */
      }
    }, 250);
    return () => clearTimeout(id);
  }, [score]);

  /** Move the playhead without re-rendering the score views. */
  const gotoBeat = useCallback((beat: number) => {
    tRef.current = beat;
    timelineRef.current?.setPlayhead(beat);
    stageRef.current?.redraw();
    if (beatRef.current) beatRef.current.textContent = beat.toFixed(1);
    setT(beat);
  }, []);

  /** Every score mutation goes through here: copy, mutate, commit. */
  const edit = useCallback((fn: (s: Score) => void) => {
    setScore((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  /** Edit the selected keyframe's pose, and park the playhead on it. */
  const editKey = useCallback(
    (fn: (pose: Pose) => void) => {
      const beat = score.dancers[selD]?.keys[selK]?.beat;
      edit((s) => {
        const k = s.dancers[selD]?.keys[selK];
        if (k) fn(k.pose);
      });
      if (beat !== undefined) gotoBeat(beat);
    },
    [edit, gotoBeat, score.dancers, selD, selK],
  );

  // ---------- playback ----------
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (ts: number) => {
      if (last === null) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      tRef.current += (dt * score.tempo) / 60;
      if (tRef.current >= score.length) {
        if (loop) tRef.current = 0;
        else {
          tRef.current = score.length;
          setPlaying(false);
        }
      }
      timelineRef.current?.setPlayhead(tRef.current);
      stageRef.current?.redraw();
      if (beatRef.current) beatRef.current.textContent = tRef.current.toFixed(1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // the notation echo follows at a readable rate, not at 60fps
    const echo = setInterval(() => setT(tRef.current), 120);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(echo);
    };
  }, [playing, loop, score.tempo, score.length]);

  // ---------- selection ----------
  const selectKey = (d: number, k: number) => {
    setSelD(d);
    setSelK(k);
    const beat = score.dancers[d]?.keys[k]?.beat;
    if (beat !== undefined) gotoBeat(beat);
  };

  // ---------- keyframe operations ----------
  const addKeyframe = useCallback(() => {
    const beat = Math.round(tRef.current);
    const d = score.dancers[selD];
    if (!d) return;
    const pose = poseAt(d, beat);
    const existing = d.keys.findIndex((k) => k.beat === beat);
    edit((s) => {
      const dd = s.dancers[selD];
      if (existing >= 0) dd.keys[existing].pose = pose;
      else {
        dd.keys.push({ beat, pose });
        dd.keys.sort((a, b) => a.beat - b.beat);
      }
    });
    setSelK(
      existing >= 0
        ? existing
        : [...d.keys, { beat, pose }].sort((a, b) => a.beat - b.beat).findIndex((k) => k.beat === beat),
    );
    gotoBeat(beat);
  }, [edit, gotoBeat, score.dancers, selD]);

  const deleteKeyframe = () => {
    if (!dancer || dancer.keys.length <= 1) return;
    edit((s) => {
      s.dancers[selD].keys.splice(selK, 1);
    });
    setSelK(Math.max(0, selK - 1));
  };

  const nudge = (dir: 1 | -1) => {
    if (!key || !dancer) return;
    const target = Math.max(0, Math.min(score.length, key.beat + dir));
    edit((s) => {
      const d = s.dancers[selD];
      d.keys[selK].beat = target;
      d.keys.sort((a, b) => a.beat - b.beat);
    });
    const order = dancer.keys
      .map((k, i) => ({ beat: i === selK ? target : k.beat, i }))
      .sort((a, b) => a.beat - b.beat);
    setSelK(order.findIndex((o) => o.i === selK));
    gotoBeat(target);
  };

  // ---------- dancers & length ----------
  const addDancer = () => {
    if (score.dancers.length >= 4) return;
    edit((s) => {
      s.dancers.push({
        name: `Dancer ${s.dancers.length + 1}`,
        keys: [{ beat: 0, pose: Object.assign(clonePose(STAND), randomPlace()) }],
      });
    });
    setSelD(score.dancers.length);
    setSelK(0);
  };

  const removeDancer = () => {
    if (score.dancers.length <= 1) return;
    edit((s) => {
      s.dancers.splice(selD, 1);
    });
    setSelD(Math.max(0, selD - 1));
    setSelK(0);
  };

  const changeLength = (delta: number) => {
    edit((s) => {
      s.length = Math.max(8, Math.min(64, s.length + delta));
      if (delta < 0) {
        for (const d of s.dancers) {
          d.keys = d.keys.filter((k) => k.beat <= s.length);
          if (!d.keys.length) d.keys = [{ beat: 0, pose: clonePose(STAND) }];
        }
      }
    });
    if (delta < 0) {
      setSelK(0);
      gotoBeat(Math.min(tRef.current, score.length - 8));
    }
  };

  // ---------- chance operations ----------
  const chancePose = () => {
    setHexagram(randomHexagram());
    editKey((pose) => {
      const keep = { x: pose.x, z: pose.z, facing: pose.facing };
      Object.assign(pose, randomPose(), keep);
    });
  };

  const chancePhrase = () => {
    setHexagram(randomHexagram());
    edit((s) => {
      s.dancers[selD].keys = randomPhrase(s.length);
    });
    setSelK(0);
    gotoBeat(0);
  };

  const chanceSpace = () => {
    setHexagram(randomHexagram());
    edit((s) => {
      for (const k of s.dancers[selD].keys) Object.assign(k.pose, randomPlace());
    });
  };

  const resetScore = () => {
    setScore(demoScore());
    setSelD(0);
    setSelK(0);
    setPlaying(false);
    gotoBeat(0);
  };

  // ---------- notation edits ----------
  const setLabanDir = (dir: DirKey) => {
    if (!key) return;
    const q = labanOf(limbVec(key.pose, selPart));
    q.dir = dir;
    if (q.dir === "place" && q.level === "middle") q.level = "low";
    editKey((pose) => setLimbVec(pose, selPart, labanToVec(q)));
  };

  const setLabanLevel = (level: Level) => {
    if (!key) return;
    const q = labanOf(limbVec(key.pose, selPart));
    q.level = level;
    if (q.dir === "place" && q.level === "middle") q.dir = "forward";
    editKey((pose) => setLimbVec(pose, selPart, labanToVec(q)));
  };

  const setBeneshDepth = (depth: "front" | "level" | "behind") => {
    if (!key) return;
    const v = limbVec(key.pose, selPart);
    let px = v.x;
    let py = v.y;
    const pm = Math.hypot(px, py);
    if (pm < 0.05) {
      px = 0;
      py = -1;
    } else {
      px /= pm;
      py /= pm;
    }
    const z = depth === "front" ? 0.62 : depth === "behind" ? -0.62 : 0;
    const s = Math.sqrt(1 - z * z);
    editKey((pose) => setLimbVec(pose, selPart, { x: px * s, y: py * s, z }));
  };

  const dragBenesh = (k: number, part: LimbSetId, v: Vec3) => {
    edit((s) => {
      const kk = s.dancers[selD]?.keys[k];
      if (kk) setLimbVec(kk.pose, part, v);
    });
    stageRef.current?.redraw();
  };

  const stepEW = (axis: "az" | "el", dir: 1 | -1) => {
    if (!key || joint === "root") return;
    editKey((pose) => {
      const b = pose.bones[joint];
      if (axis === "el") b[1] = Math.max(-90, Math.min(90, b[1] + 45 * dir));
      else b[0] = ((b[0] + 45 * dir + 540) % 360) - 180;
    });
  };

  const applyCamera = (id: string) => {
    setCameraId(id);
    Object.assign(camRef.current, CAM_PRESETS[id]);
    stageRef.current?.redraw();
  };

  const applyPreset = (pose: Pose) => {
    editKey((p) => {
      const keep = { x: p.x, z: p.z, facing: p.facing };
      Object.assign(p, clonePose(pose), keep);
    });
  };

  // ---------- keyboard: it should feel like a tool ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPlaying(false);
        gotoBeat(Math.max(0, tRef.current - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPlaying(false);
        gotoBeat(Math.min(score.length, tRef.current + 1));
      } else if (e.key === "k") {
        addKeyframe();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addKeyframe, gotoBeat, score.length]);

  /* ---------------- panels reused in the sidebar and the mobile sheet ---------------- */

  const inspectorPanel = (
    <Tabs value={inspector} onValueChange={(v) => setInspector(String(v))} className="flex min-h-0 flex-1 flex-col gap-0">
      <div className="shrink-0 border-b p-2">
        <TabsList className="h-9 w-full">
          <TabsTrigger value="stance" className="gap-1.5 text-[0.9rem]">
            <SlidersHorizontal className="size-4" />
            Pose
          </TabsTrigger>
          <TabsTrigger value="echo" className="gap-1.5 text-[0.9rem]">
            <Grid3x3 className="size-4" />
            Numbers
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="stance" className="min-h-0 flex-1 overflow-y-auto">
        <StanceEditor
          pose={key?.pose ?? null}
          joint={joint}
          onJoint={setJoint}
          onBone={(i, v) =>
            editKey((pose) => {
              if (joint !== "root") pose.bones[joint][i] = v;
            })
          }
          onRoot={(k, v) =>
            editKey((pose) => {
              pose[k] = v;
            })
          }
        />
        <div className="border-t">
          <div className="text-muted-foreground flex items-start gap-1 px-5 pt-4 text-[0.9rem] leading-relaxed">
            <span>Or start from a ready-made pose — it keeps the dancer&apos;s place on the floor.</span>
            <InfoTip title="Stance palette" side="left">
              <p>
                The original software shipped libraries of named body shapes that a choreographer dragged onto the
                timeline. These ten are the same idea.
              </p>
            </InfoTip>
          </div>
          <PosePalette onApply={applyPreset} disabled={!key} layout="grid" />
        </div>
      </TabsContent>

      <TabsContent value="echo" className="min-h-0 flex-1 overflow-y-auto">
        <NotationEcho dancer={dancer} t={t} />
      </TabsContent>
    </Tabs>
  );

  const referenceSheet = (
    <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-[560px]">
      <SheetHeader className="border-b p-6">
        <SheetTitle className="text-xl">What LifeForms had, and what this studio keeps</SheetTitle>
        <SheetDescription className="text-[0.95rem]">
          A study of the software&apos;s concepts, not a port of its code.
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 p-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="w-[38%]">In the software</TableHead>
                <TableHead>Here</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ["Stance window", "Stance editor — per-segment azimuth/elevation, hip height, facing"],
                ["Stance palettes", "Palette — stamp a named stance into the selected keyframe"],
                ["Sequence editor", "Timeline — diamonds per dancer, nudge, delete, eased interpolation"],
                ["Studio window", "Stage — up to four dancers, orbit and zoom, front/side/plan cameras"],
                ["Spatial paths", "Floor paths — every keyframe carries x/z and a facing"],
                ["Ghosting", "Ghost frames — the adjacent keyframe stances drawn faint"],
                ["Chance procedures", "Chance — dice a pose, a phrase, or the use of space"],
                ["— never in the software —", "Translations — the same track editable in three notations"],
                ["Skinning, IK, file I/O", "Out of scope: the wireframe is the point"],
              ].map(([a, b]) => (
                <TableRow key={a}>
                  <TableCell className="text-muted-foreground align-top leading-relaxed">{a}</TableCell>
                  <TableCell className="align-top leading-relaxed">{b}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Plate plate={PLATES.cunningham} imgClassName="max-h-[320px]" />

        <Card>
          <CardContent className="prose-note space-y-3 text-[1.02rem]">
            <p>
              LifeForms began in the mid-1980s at Simon Fraser University, in Tom Calvert&apos;s computer-graphics group,
              as a tool for <em>composing</em> human movement rather than animating characters. Cunningham started with
              it in 1989 and made <em>Trackers</em> (1991) partly at the screen; Credo Interactive later sold it as{" "}
              <em>DanceForms</em>.
            </p>
            <p>
              What drew him was not efficiency but estrangement: the figure had no habits, no training and no fatigue, so
              its stances arrived without the body&apos;s own censorship.
            </p>
            <p>
              Every keyframe here stores a full stance — ten segment directions in (azimuth, elevation) — plus hip
              height, a floor position and a facing. The score lives in this browser&apos;s local storage.
            </p>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full gap-2" render={<Link href="/" />} nativeButton={false}>
          <BookOpen className="size-4" />
          How the three notations work
        </Button>
      </div>
    </SheetContent>
  );

  /* ---------------------------------- render ---------------------------------- */

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <SiteHeader current="studio">
        <Badge variant="outline" className="hidden h-7 gap-1.5 rounded-md px-2 font-normal md:flex">
          <span className="text-muted-foreground">score</span>
          <span className="font-mono">
            {score.dancers.length} dancer{score.dancers.length > 1 ? "s" : ""} · {score.length} beats
          </span>
        </Badge>
        {/* the inspector lives in a side sheet until there is room for a panel */}
        <Sheet open={mobileInspector} onOpenChange={setMobileInspector}>
          <SheetTrigger
            render={
              <Button size="sm" variant="outline" className="h-8 gap-1.5 font-normal xl:hidden">
                <SlidersHorizontal className="size-4" />
                Pose
              </Button>
            }
          />
          <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]">
            <SheetHeader className="border-b p-4">
              <SheetTitle>Pose and numbers</SheetTitle>
              <SheetDescription className="sr-only">Stance controls, ready-made poses and the notation echo</SheetDescription>
            </SheetHeader>
            {inspectorPanel}
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="About this studio">
                <Info className="size-[18px]" />
              </Button>
            }
          />
          {referenceSheet}
        </Sheet>
      </SiteHeader>

      {/* ============================ WORKSPACE ============================ */}
      <div className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 flex-col">
          {/* ---- stage toolbar ---- */}
          <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2">
            <ToolGroup label="Dancer">
              <ToggleGroup
                value={[String(selD)]}
                onValueChange={(v) => v[0] !== undefined && selectKey(Number(v[0]), 0)}
                variant="outline"
                spacing={0}
                aria-label="Selected dancer"
              >
                {score.dancers.map((d, i) => (
                  <ToggleGroupItem key={i} value={String(i)} className="px-2.5 text-[0.85rem]">
                    {i + 1}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Button size="icon-sm" variant="ghost" aria-label="Add dancer" onClick={addDancer} disabled={score.dancers.length >= 4}>
                <Plus className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Remove dancer"
                onClick={removeDancer}
                disabled={score.dancers.length <= 1}
              >
                <Users className="size-4" />
              </Button>
            </ToolGroup>

            <Separator orientation="vertical" className="h-7" />

            <ToolGroup label="Camera">
              <Camera className="text-muted-foreground size-4 lg:hidden" />
              <ToggleGroup
                value={[cameraId]}
                onValueChange={(v) => v[0] && applyCamera(String(v[0]))}
                variant="outline"
                spacing={0}
                aria-label="Camera"
              >
                {CAMS.map((c) => (
                  <ToggleGroupItem key={c.id} value={c.id} className="px-2.5 text-[0.85rem]">
                    {c.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </ToolGroup>

            <Separator orientation="vertical" className="h-7" />

            <Button
              size="sm"
              variant={ghosts ? "secondary" : "ghost"}
              aria-pressed={ghosts}
              onClick={() => setGhosts((g) => !g)}
              className="h-8 gap-1.5 font-normal"
            >
              <Ghost className="size-4" />
              Ghosts
            </Button>
            <Button
              size="sm"
              variant={paths ? "secondary" : "ghost"}
              aria-pressed={paths}
              onClick={() => setPaths((p) => !p)}
              className="h-8 gap-1.5 font-normal"
            >
              <Route className="size-4" />
              Paths
            </Button>

            <div className="flex-1" />

            <ToolGroup label="Chance">
              <span className="text-xl leading-none" aria-hidden="true">
                {hexagram}
              </span>
              <Button size="sm" variant="outline" onClick={chancePose} className="text-destructive h-8 gap-1.5 font-normal">
                <Dices className="size-4" />
                Pose
              </Button>
              <Button size="sm" variant="outline" onClick={chancePhrase} className="text-destructive h-8 font-normal">
                Phrase
              </Button>
              <Button size="sm" variant="outline" onClick={chanceSpace} className="text-destructive h-8 font-normal">
                Space
              </Button>
            </ToolGroup>

          </div>

          {/* ---- stage ---- */}
          <div className="bg-muted/25 relative min-h-[240px] flex-1">
            <StageCanvas
              ref={stageRef}
              score={score}
              selD={selD}
              selK={selK}
              tRef={tRef}
              camRef={camRef}
              ghosts={ghosts}
              paths={paths}
            />
            <div className="text-muted-foreground pointer-events-none absolute top-3 left-4 font-mono text-xs">
              drag to turn the stage · scroll to zoom
            </div>
          </div>

          {/* ---- bottom dock: the score, in four languages ---- */}
          <div className="flex h-[clamp(240px,34vh,380px)] shrink-0 flex-col border-t" ref={dockSize.ref}>
            <Tabs value={dock} onValueChange={(v) => setDock(String(v))} className="flex min-h-0 flex-1 flex-col gap-0">
              <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2">
                <TabsList className="h-9">
                  {DOCK_TABS.map(({ value, label, Icon }) => (
                    <TabsTrigger key={value} value={value} className="gap-1.5 px-3 text-[0.9rem]">
                      <Icon className="size-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="flex-1" />

                <ToolGroup label="Snapshot">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button size="sm" variant="outline" onClick={addKeyframe} className="h-8 gap-1.5 font-normal">
                          <Plus className="size-4" />
                          At playhead
                        </Button>
                      }
                    />
                    <TooltipContent>Save the current pose as a snapshot at the playhead (K)</TooltipContent>
                  </Tooltip>
                  <Button size="icon-sm" variant="outline" aria-label="Nudge earlier" onClick={() => nudge(-1)}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button size="icon-sm" variant="outline" aria-label="Nudge later" onClick={() => nudge(1)}>
                    <ChevronRight className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Mirror pose"
                    onClick={() => editKey((p) => mirrorPose(p))}
                  >
                    <FlipHorizontal2 className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Delete keyframe"
                    onClick={deleteKeyframe}
                    disabled={!dancer || dancer.keys.length <= 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </ToolGroup>

                <Separator orientation="vertical" className="h-7" />

                <ToolGroup label="Length">
                  <Button size="icon-sm" variant="outline" aria-label="Eight beats shorter" onClick={() => changeLength(-8)}>
                    <Minus className="size-4" />
                  </Button>
                  <span className="font-mono text-[0.85rem] tabular-nums">{score.length}</span>
                  <Button size="icon-sm" variant="outline" aria-label="Eight beats longer" onClick={() => changeLength(8)}>
                    <Plus className="size-4" />
                  </Button>
                </ToolGroup>
              </div>

              <TabsContent value="timeline" className="score-scroll min-h-0 flex-1 px-4 py-3">
                <Timeline
                  ref={timelineRef}
                  score={score}
                  selD={selD}
                  selK={selK}
                  tRef={tRef}
                  width={dockSize.width}
                  onSelect={selectKey}
                  onSelectDancer={(d) => selectKey(d, 0)}
                  onScrub={(b) => {
                    setPlaying(false);
                    gotoBeat(b);
                  }}
                />
              </TabsContent>

              <TabsContent value="laban" className="min-h-0 flex-1 overflow-y-auto">
                <LabanTrack
                  dancer={dancer}
                  length={score.length}
                  selK={selK}
                  selPart={selPart}
                  onSelect={(k, part) => {
                    setSelPart(part);
                    selectKey(selD, k);
                  }}
                  onSetDir={setLabanDir}
                  onSetLevel={setLabanLevel}
                />
              </TabsContent>

              <TabsContent value="benesh" className="min-h-0 flex-1 overflow-y-auto">
                <BeneshTrack
                  dancer={dancer}
                  length={score.length}
                  selK={selK}
                  selPart={selPart}
                  onSelect={(k, part) => {
                    setSelPart(part);
                    selectKey(selD, k);
                  }}
                  onDrag={dragBenesh}
                  onDepth={setBeneshDepth}
                />
              </TabsContent>

              <TabsContent value="ew" className="min-h-0 flex-1 overflow-y-auto">
                <EWTrack
                  dancer={dancer}
                  length={score.length}
                  selK={selK}
                  selBone={joint === "root" ? null : joint}
                  onSelect={(k, bone) => {
                    setJoint(bone);
                    selectKey(selD, k);
                  }}
                  onStep={stepEW}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* ---- inspector ---- */}
        <aside className="hidden w-[400px] shrink-0 flex-col border-l xl:flex">{inspectorPanel}</aside>
      </div>

      {/* ============================ TRANSPORT ============================ */}
      <div className="bg-card flex shrink-0 flex-wrap items-center gap-3 border-t px-4 py-2.5">
        <Button onClick={() => setPlaying((p) => !p)} className="gap-2">
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          variant={loop ? "secondary" : "outline"}
          aria-pressed={loop}
          onClick={() => setLoop((l) => !l)}
          className="gap-2"
        >
          <Repeat className="size-4" />
          Loop
        </Button>

        <span className="font-mono text-[0.9rem] tabular-nums">
          beat <span ref={beatRef}>{t.toFixed(1)}</span>
          <span className="text-muted-foreground"> / {score.length}</span>
        </span>

        <Separator orientation="vertical" className="h-7" />

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-[0.85rem]">Tempo</span>
          <Slider
            value={score.tempo}
            min={40}
            max={180}
            step={1}
            onValueChange={(v) => {
              const n = Array.isArray(v) ? v[0] : v;
              edit((s) => {
                s.tempo = n;
              });
            }}
            className="w-24"
          />
          <span className="w-[64px] shrink-0 font-mono text-[0.85rem] tabular-nums">{score.tempo} bpm</span>
        </div>

        <div className="flex-1" />

        <span className="text-muted-foreground hidden font-mono text-xs lg:block">
          {dancer?.name} · keyframe {selK + 1}/{dancer?.keys.length ?? 0}
          {key ? ` at beat ${key.beat}` : ""} · space plays · ← → steps · K keys
        </span>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Reset score" onClick={resetScore}>
                <RotateCcw className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Reset to the demo score</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
