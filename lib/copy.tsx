/* ============================================================
   Every word on the site, in both languages.

   Components read this through useCopy() rather than holding
   text of their own, so one component tree renders either
   language. The shape of `he` is checked against `en`.
   ============================================================ */

import type { Locale } from "./i18n";

/* One of the people who made the site. `photo` is null when there is no
   portrait yet, and the about band draws a monogram in its place. */
type Person = { name: string; bio: string; photo: string | null };

const en = {
  meta: {
    title: "Movement Languages — one movement, written four ways",
    description:
      "One movement phrase, written simultaneously in Labanotation, Benesh, Eshkol-Wachman, and as a LifeForms keyframe timeline. Change one thing and watch four notations rewrite it.",
    studioTitle: "Studio",
    studioDescription:
      "A working reconstruction of LifeForms / DanceForms: pose a wireframe figure, keyframe it, and read the result back in Labanotation, Benesh and Eshkol-Wachman.",
    ogAlt:
      "A wireframe figure with its right arm swept out along a blue arc — the notation viewer from Movement Languages.",
  },

  header: {
    brand: "Movement Languages",
    params: "Parameters",
    studio: "Studio",
    about: "About",
    switchLabel: "עברית",
    switchTitle: "Read this page in Hebrew",
  },

  hero: {
    titleTop: "One movement,",
    titleBottom: "written four ways.",
    sub: "Dance has no single way of being written down. Change one thing — and watch four notations rewrite it.",
    ctaMove: "Start with one move",
    ctaStudio: "Open the Studio",
    readoutLabel: "Right arm, right now",
    note: "A stance is ten directions and a hip height — nothing else. Those numbers are how Eshkol-Wachman and Laban would write this arm; the trailing line is where the wrist has just been.",
  },

  move: {
    eyebrow: "The thing every notation has to write",
    title: "One move, five decisions",
    lead: (
      <>
        Set them here. Everything below is the <em>same</em> five decisions, spelled out by four different systems.
      </>
    ),
    prev: "Previous move",
    next: "Next move",
    counter: (i: number, n: number) => `move ${i} / ${n}`,
    roll: "Roll the whole phrase",
    rollTip: "Chance operations, the way Cunningham used them",
  },

  nav: {
    readAs: "Read as",
    sections: {
      phrase: "The phrase",
      laban: "Labanotation",
      benesh: "Benesh",
      ew: "Eshkol-Wachman",
      compare: "Side by side",
    },
    modeInfoTitle: "Body, or the numbers underneath?",
    modeInfo: (
      <>
        <p>
          <strong>Body</strong> shows each notation the way a dancer reads it — staves, figures, body parts.
        </p>
        <p>
          <strong>Numbers</strong> takes the dancer away and leaves what the system actually records: which channel,
          which direction, how high, how long. That set is what all four share, and exactly what a computer animates.
        </p>
      </>
    ),
  },

  mode: {
    label: "Representation mode",
    body: "Body",
    bodyTitle: "Show the body",
    numbers: "Numbers",
    numbersTitle: "Show the numbers behind it",
  },

  phrase: {
    eyebrow: "Computer keyframes · 1989–",
    title: "Snapshots, and the gaps between them",
    infoTitle: "Cunningham and LifeForms",
    info: (
      <>
        <p>
          LifeForms was built in the 1980s at Simon Fraser University by Tom Calvert&apos;s group, and later sold as{" "}
          <em>DanceForms</em>. Merce Cunningham began composing with it in 1989.
        </p>
        <p>
          He had used chance procedures — dice, coin tosses, the <em>I Ching</em> — since the 1950s to decide what came
          next. The software proposed positions no trained dancer would think of, and he kept them.
        </p>
      </>
    ),
    lead: (
      <p>
        A <strong>keyframe</strong> is a snapshot: at this beat, this body part points this way. The computer invents the
        movement in between. That is all the timeline below holds — five snapshots, and the machine filling the gaps.
      </p>
    ),
    play: "Play the phrase",
    pause: "Pause",
    beat: "beat",
    timelineTitleAbs: "Channels × keyframes",
    timelineTitle: "Body parts × keyframes",
    timelineHint: "Click any diamond to edit that move above.",
    viewerTitleAbs: "Channel curves",
    viewerTitle: "Figure viewer",
    viewerHintAbs: "Elevation θ per channel over beats",
    viewerHint: "Front view, interpolating between targets",
  },

  laban: {
    eyebrow: "Rudolf Laban · 1928",
    title: "Labanotation",
    infoTitle: "Where it comes from",
    info: (
      <>
        <p>
          Rudolf Laban published this system as <em>Kinetographie Laban</em> in 1928. It is still the most widely used
          dance notation, and full scores are archived so works can be restaged decades later.
        </p>
        <p>
          A real staff has more columns than the four here — supporting legs, torso, head — and extra signs for the
          quality of a movement.
        </p>
      </>
    ),
    lead: (
      <p>
        Read this one <strong>from the bottom up</strong>, like watching a lift climb a wall. Each column is a body part.
        Every symbol answers three questions at once: its <strong>shape</strong> says which way the limb points, the{" "}
        <strong>filling</strong> says how high, and its <strong>height on the page</strong> says how long the movement
        lasts.
      </p>
    ),
    titleAbs: "Direction lattice + bare intervals",
    title2: "The staff",
    hintAbs: "26 rays of the kinesphere, plus duration as pure interval length",
    hint: "Read upward from the double start line; four gesture columns",
    footnoteAbs:
      "In Numbers mode the staff dissolves into Laban's deeper claim: direction is one of 26 rays of a point-centred lattice — the kinesphere — and duration is bare interval length.",
    footnote:
      "Simplified to four gesture columns; real Labanotation adds support, body and head columns and a large symbol repertory.",
    rule1: "Rule 1 — the shape is the direction",
    rule2: "Rule 2 — the fill is the level",
    legendNote: (
      <>
        Hatched is high, a dot is middle, solid black is low. A symbol&apos;s <em>length</em> along the staff is how long
        the movement takes.
      </>
    ),
  },

  benesh: {
    eyebrow: "Rudolf & Joan Benesh · 1955",
    title: "Benesh notation",
    infoTitle: "Where it comes from",
    info: (
      <>
        <p>
          Joan Benesh danced with Sadler&apos;s Wells; her husband Rudolf was an accountant and painter. They published
          their system in 1955 and it became the standard in ballet — the Royal Ballet still employs choreologists who
          write in it.
        </p>
        <p>A full score also records travelling and turning under the stave, in bars, like music.</p>
      </>
    ),
    lead: (
      <>
        <p>
          This one looks like sheet music and reads left to right — but the five lines are not pitches, they are{" "}
          <strong>heights on the body</strong>: top of head, shoulders, waist, knees, floor.
        </p>
        <p>
          You draw where the hands and feet <em>appear</em>, as if standing behind the dancer. A little stroke says how
          deep: <span className="font-mono">|</span> in front, <span className="font-mono">—</span> level,{" "}
          <span className="font-mono">•</span> behind.
        </p>
      </>
    ),
    titleAbs: "Picture plane — coordinates only",
    title2: "The stave",
    hintAbs: "Position (x, y) plus a three-valued depth, figure removed",
    hint: "One frame per move, seen from behind",
    footnoteAbs:
      "With the dancer gone the parameter shows itself plainly: a point (x, y) in a picture plane plus a ternary depth — a shallow 3-D coordinate.",
    footnote: "Rhythm marks above the stave give each frame's duration in beats.",
  },

  ew: {
    eyebrow: "Noa Eshkol & Avraham Wachman · 1958",
    title: "Eshkol-Wachman notation",
    infoTitle: "Where it comes from",
    info: (
      <>
        <p>
          Noa Eshkol, an Israeli choreographer, built this system in 1958 with the architect Avraham Wachman. She wanted
          movement described without any reference to style, mood or stage.
        </p>
        <p>
          Because it only describes angles, it has been used far beyond dance: for sign language, physical therapy, and
          studies of animal behaviour.
        </p>
      </>
    ),
    lead: (
      <>
        <p>
          Treat every limb as a straight stick that swings on an invisible ball around its joint. Then its position is
          two numbers: <strong>how high</strong> (0 is straight down, 4 is straight up) and{" "}
          <strong>which way round</strong> (one step = 45°).
        </p>
        <p>The score is a table — limbs down the side, time across the top. No picture of a body anywhere.</p>
      </>
    ),
    gridTitleAbs: "Score grid — channels × time",
    gridTitle: "Score grid — limbs × time",
    gridHint: "Cells read vertical / horizontal, in 45° units",
    gridFootnote:
      "Vertical 0 points straight down and 4 straight up; horizontal counts 45° units around the body, 0 = forward.",
    sphereTitle: "System of reference",
    sphereHintAbs: "The sphere, graduated in 45° units",
    sphereHint: "The limb on its joint-sphere",
    sphereFootnote: "The sphere is the notation — in Numbers mode nothing is removed but a label.",
  },

  compare: {
    eyebrow: "Side by side",
    title: "The same movement, four spellings",
    lead: (
      <p>
        Each row is one thing a dance can specify. Each column shows how one system writes it. The last column is what is
        left when you take the body away — the part every system agrees on.
      </p>
    ),
    head: {
      fixes: "What it fixes",
      laban: "Labanotation",
      benesh: "Benesh",
      ew: "Eshkol-Wachman",
      lifeforms: "LifeForms",
      numbers: "Just the numbers",
    },
    rows: [
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
    ],
    closing: (
      <>
        <p>
          A single shared data structure — <span className="font-mono text-[0.9em]">{"{channel, direction, level, duration, dynamic}"}</span>{" "}
          — drives every score on this page. That structure is itself the answer to the question the page asks: the
          parameters, without a body.
        </p>
        <p>
          It is also what the <strong>Studio</strong> writes, one keyframe at a time.
        </p>
      </>
    ),
  },

  about: {
    eyebrow: "Who made this",
    people: [
      {
        name: "Gal Bruck Gorfung",
        bio: "A creator, dancer, and researcher in neuroscience.",
        photo: "/gal.jpg",
      },
      {
        name: "Amitay Cohen",
        bio: "A creator, dancer, and software developer.",
        photo: "/amitay.jpg",
      },
    ] as Person[],
  },

  footer: {
    cunninghamTitle: "A choreographer at a screen",
    cunninghamInfoTitle: "Cunningham's computer works",
    cunninghamInfo: (
      <>
        <p>
          <em>Trackers</em> (1991) was the first stage work he made with the software.
        </p>
        <p>
          For <em>BIPED</em> (1999) he went further: dancers were motion-captured, and the artists Paul Kaiser and
          Shelley Eshkar projected their hand-drawn, bodiless traces over the live stage.
        </p>
      </>
    ),
    cunningham:
      "Merce Cunningham was seventy when he started choreographing at a computer. He liked that the figure on screen had no habits and never got tired, so it suggested positions a trained dancer never would.",
    simpleTitle: "This is the simple version",
    simpleInfoTitle: "What has been left out",
    simpleInfo: (
      <>
        <p>
          Real Labanotation has columns for the supporting legs, torso and head, and a large set of signs for the quality
          of a movement.
        </p>
        <p>Real Benesh records travelling and turning below the stave, in bars, like music.</p>
        <p>
          Real Eshkol-Wachman divides angles as finely as it likes, and distinguishes flat, cone-shaped and twisting
          paths.
        </p>
      </>
    ),
    simple:
      "Each system here is cut down to the same small vocabulary — one moving part at a time, eight directions, three heights — so that they can be compared side by side. The real ones are much richer.",
    tryTitle: "Try it yourself",
    try: (
      <>
        The <strong>Studio</strong> is a working rebuild of the software: pose a figure, place snapshots, send the
        dancers walking, and read what you made back in all three notations.
      </>
    ),
  },

  /* ---------- shared movement vocabulary ---------- */

  limbs: {
    RA: "Right arm",
    LA: "Left arm",
    RL: "Right leg",
    LL: "Left leg",
    channel: (n: number) => `Channel ${n}`,
  },

  /** Cramped row labels inside the scores. */
  limbsShort: { RA: "R arm", LA: "L arm", RL: "R leg", LL: "L leg" },

  dirs: {
    place: "place",
    forward: "forward",
    rf: "right-forward",
    right: "right",
    rb: "right-back",
    back: "back",
    lb: "left-back",
    left: "left",
    lf: "left-forward",
  },

  levels: { low: "low", middle: "middle", high: "high" },

  depths: { front: "front", level: "level", behind: "behind" },

  editor: {
    part: "Which part",
    partAbs: "Channel",
    way: "Which way",
    wayAbs: "Azimuth φ",
    high: "How high",
    highAbs: "Elevation θ",
    long: "How long",
    longAbs: "Interval Δt",
    beats: (n: number) => `${n} beat${n > 1 ? "s" : ""}`,
    starts: "How it starts",
    startsAbs: "Easing",
    effortTitle: "Laban called this effort",
    effortInfo: (
      <>
        <p>
          Laban thought a movement&apos;s <em>quality</em> mattered as much as its path, and wrote it with a separate
          family of signs he called effort.
        </p>
        <p>
          <strong>Sustained</strong> spreads the change evenly over the whole time. <strong>Sudden</strong> snaps to the
          new position early and holds it.
        </p>
      </>
    ),
    sustained: "sustained",
    sudden: "sudden",
    smooth: "smooth",
    snap: "snap",
    strength: "How strong",
    strengthAbs: "Amplitude",
    weightTitle: "Light or strong",
    weightInfo: (
      <p>
        The other half of Laban&apos;s effort pair: how much weight the mover puts behind the movement. Here it simply
        draws the line thicker.
      </p>
    ),
    light: "light",
    strong: "strong",
    lowGain: "low gain",
    highGain: "high gain",
  },

  chips: {
    lifeforms: [
      { key: "Snapshot", body: "a pose held at one beat", abs: "(channel, time) → pose" },
      { key: "Body part", body: "the arm or leg that moves", abs: "channel number k ∈ {1…4}" },
      { key: "Time", body: "beats, left to right", abs: "t ∈ [0, T]" },
      { key: "In between", body: "how it travels between snapshots", abs: "easing e(t)" },
      { key: "Chance", body: "dice choose what happens next", abs: "uniform sample of the space" },
    ],
    laban: [
      { key: "Direction", body: "the shape of the symbol", abs: "one of 26 rays from the centre" },
      { key: "Height", body: "how the symbol is filled in", abs: "angle θ ∈ {−45°, 0°, +45°}" },
      { key: "Length", body: "how tall the symbol is", abs: "interval length Δt" },
      { key: "Body part", body: "which column it sits in", abs: "channel index k" },
      { key: "Quality", body: "extra signs for effort", abs: "shape and gain of e(t)" },
    ],
    benesh: [
      { key: "Position", body: "where the hand or foot appears", abs: "point (x, y) in a flat frame" },
      { key: "Depth", body: "| in front · — level · • behind", abs: "z ∈ {+1, 0, −1}" },
      { key: "The five lines", body: "head, shoulders, waist, knees, floor", abs: "rulings of the frame" },
      { key: "Rhythm", body: "dots above each frame", abs: "frame duration Δt" },
      { key: "Frame", body: "one drawing per moment", abs: "a sample of the path" },
    ],
    ew: [
      { key: "How high", body: "0 straight down → 4 straight up", abs: "v ∈ {0…4}" },
      { key: "Which way round", body: "45° at a time around the body", abs: "h ∈ {0…7}" },
      { key: "Limb", body: "a straight stick on a ball joint", abs: "radius of a sphere" },
      { key: "Time unit", body: "one column of the table", abs: "tick of a discrete clock" },
      { key: "Kind of move", body: "flat, cone-shaped, or a twist", abs: "class of path on the sphere" },
    ],
  },

  /** Captions drawn inside the scores and canvases. */
  scores: {
    kinesphere: "kinesphere lattice · 26 rays + centre",
    intervals: "Δt intervals",
    unitVectorS2: "unit vector on S²",
    eventLabel: (n: number) => `event e${n}`,
    joint: { shoulder: "from the shoulder", hip: "from the hip" },
    frontView: "front view · ring = limb reaching forward",
    elevation: "elevation θ ∈ [−90°, +90°] · step targets, eased",
  },

  /* ---------- the Studio ---------- */

  studio: {
    poseButton: "Pose",
    poseSheetTitle: "Pose and numbers",
    poseSheetDesc: "Stance controls, ready-made poses and the notation echo",
    aboutAria: "About this studio",
    scoreBadge: "score",
    scoreSummary: (dancers: number, beats: number) =>
      `${dancers} dancer${dancers > 1 ? "s" : ""} · ${beats} beats`,

    groups: { dancer: "Dancer", camera: "Camera", chance: "Chance", snapshot: "Snapshot", length: "Length" },
    cams: { perspective: "Persp", front: "Front", side: "Side", plan: "Plan" },
    tabs: { timeline: "Timeline", laban: "Labanotation", benesh: "Benesh", ew: "Eshkol-Wachman" },

    ghosts: "Ghosts",
    paths: "Paths",
    chancePose: "Pose",
    chancePhrase: "Phrase",
    chanceSpace: "Space",
    stageHint: "drag to turn the stage · scroll to zoom",
    atPlayhead: "At playhead",
    atPlayheadTip: "Save the current pose as a snapshot at the playhead (K)",
    play: "Play",
    pause: "Pause",
    loop: "Loop",
    beat: "beat",
    tempo: "Tempo",
    bpm: "bpm",
    status: (name: string, i: number, n: number, beat: string) =>
      `${name} · keyframe ${i}/${n}${beat} · space plays · ← → steps · K keys`,
    atBeat: (b: number) => ` at beat ${b}`,
    resetTip: "Reset to the demo score",

    aria: {
      selectedDancer: "Selected dancer",
      addDancer: "Add dancer",
      removeDancer: "Remove dancer",
      camera: "Camera",
      nudgeEarlier: "Nudge earlier",
      nudgeLater: "Nudge later",
      mirror: "Mirror pose",
      deleteKey: "Delete keyframe",
      shorter: "Eight beats shorter",
      longer: "Eight beats longer",
      reset: "Reset score",
    },

    presetHint: "Or start from a ready-made pose — it keeps the dancer's place on the floor.",
    paletteTitle: "Stance palette",
    paletteInfo: (
      <p>
        The original software shipped libraries of named body shapes that a choreographer dragged onto the timeline.
        These ten are the same idea.
      </p>
    ),
    applyPreset: (name: string) => `Apply ${name} to the selected keyframe`,

    reference: {
      title: "What LifeForms had, and what this studio keeps",
      desc: "A study of the software's concepts, not a port of its code.",
      headSoftware: "In the software",
      headHere: "Here",
      rows: [
        ["Stance window", "Stance editor — per-segment azimuth/elevation, hip height, facing"],
        ["Stance palettes", "Palette — stamp a named stance into the selected keyframe"],
        ["Sequence editor", "Timeline — diamonds per dancer, nudge, delete, eased interpolation"],
        ["Studio window", "Stage — up to four dancers, orbit and zoom, front/side/plan cameras"],
        ["Spatial paths", "Floor paths — every keyframe carries x/z and a facing"],
        ["Ghosting", "Ghost frames — the adjacent keyframe stances drawn faint"],
        ["Chance procedures", "Chance — dice a pose, a phrase, or the use of space"],
        ["— never in the software —", "Translations — the same track editable in three notations"],
        ["Skinning, IK, file I/O", "Out of scope: the wireframe is the point"],
      ],
      essay: (
        <>
          <p>
            LifeForms began in the mid-1980s at Simon Fraser University, in Tom Calvert&apos;s computer-graphics group,
            as a tool for <em>composing</em> human movement rather than animating characters. Cunningham started with it
            in 1989 and made <em>Trackers</em> (1991) partly at the screen; Credo Interactive later sold it as{" "}
            <em>DanceForms</em>.
          </p>
          <p>
            What drew him was not efficiency but estrangement: the figure had no habits, no training and no fatigue, so
            its stances arrived without the body&apos;s own censorship.
          </p>
          <p>
            Every keyframe here stores a full stance — ten segment directions in (azimuth, elevation) — plus hip height,
            a floor position and a facing. The score lives in this browser&apos;s local storage.
          </p>
        </>
      ),
      link: "How the three notations work",
    },

    stance: {
      whichPart: "Which part",
      placeFacing: "Place / facing",
      noKeyframe: "No keyframe selected — add one at the playhead.",
      acrossStage: "Across the stage",
      towardsAudience: "Towards the audience",
      whichWayFacing: "Which way facing",
      hipHeight: "How low the hips are",
      whichWayRound: "Which way round",
      howHigh: "How high",
      tabPose: "Pose",
      tabNumbers: "Numbers",
      bonesTitle: "Ten bones, aimed one at a time",
      bonesInfo: (
        <>
          <p>
            The figure is ten straight bones. You aim each one in space rather than bending a joint by a certain amount
            — the same way the three notations describe a body.
          </p>
          <p>
            <strong>Place / facing</strong> moves the whole dancer around the floor instead.
          </p>
        </>
      ),
      ewLine: "Eshkol-Wachman:",
      ewTitle: "What those two numbers mean",
      ewInfo: (
        <>
          <p>
            This is the same aim written the way Eshkol-Wachman writes it: height first (0 straight down, 4 straight
            up), then which way round (each unit is 45°).
          </p>
          <p>It is the same pair of angles as the two sliders above — just counted in eighths of a turn.</p>
        </>
      ),
    },

    labanTrack: {
      empty: "Pick a slot on the staff",
      hint: "Click a box on the staff, then aim it.",
      infoTitle: "Reading this staff",
      info: (
        <>
          <p>It reads bottom to top. Each column is a body part; the middle double line is the dancer.</p>
          <p>
            A symbol&apos;s shape is the direction, its filling is the height, and how tall it is on the page is how long
            it lasts.
          </p>
          <p>A dotted line means that limb just stays where it was.</p>
        </>
      ),
      note: "Laban rounds to eight directions, so aiming here straightens the whole arm or leg.",
    },

    beneshTrack: {
      empty: "Grab a hand or foot sign",
      hint: "Drag a hand or foot anywhere inside its frame.",
      infoTitle: "Reading these frames",
      info: (
        <>
          <p>
            The five lines are heights on the body — head, shoulders, waist, knees, floor — not musical pitches. You are
            standing behind the dancer.
          </p>
          <p>
            The little stroke on each hand or foot says how deep it is: upright for in front, flat for level, a dot for
            behind.
          </p>
          <p>The dots above each frame count its beats.</p>
        </>
      ),
    },

    ewTrack: {
      empty: "Click a cell in the table",
      hint: "Each press turns that bone by 45°.",
      infoTitle: "Reading this table",
      info: (
        <>
          <p>
            Every cell holds two numbers. The top one is height: 0 is straight down, 2 is horizontal, 4 is straight up.
            The bottom one is which way round the body, counting 45° at a time from straight ahead.
          </p>
          <p>Grey numbers mean nothing changed since the previous keyframe.</p>
          <p>This is the only view that moves one bone at a time — the others move a whole arm or leg.</p>
        </>
      ),
    },

    beatOf: (b: number) => `beat ${b}`,
    dancerName: (n: number) => `Dancer ${n}`,

    bones: {
      torso: "Torso",
      head: "Head",
      ruarm: "R upper arm",
      rfarm: "R forearm",
      luarm: "L upper arm",
      lfarm: "L forearm",
      rthigh: "R thigh",
      rshin: "R shin",
      lthigh: "L thigh",
      lshin: "L shin",
    },

    limbsets: { larm: "L arm", lleg: "L leg", rleg: "R leg", rarm: "R arm", body: "Body", head: "Head" } as Record<string, string>,

    presets: {
      Stand: "Stand",
      Reach: "Reach",
      Second: "Second",
      "Plié": "Plié",
      Arabesque: "Arabesque",
      Attitude: "Attitude",
      Curl: "Curl",
      Lunge: "Lunge",
      Jump: "Jump",
      Tilt: "Tilt",
    } as Record<string, string>,
  },

  /* ---------- credited historical images ---------- */

  plates: {
    labanDirections: {
      alt: "Chart of the direction signs used in Kinetography Laban, arranged in three dimensions",
      caption:
        "The real symbol table. Each shape is a direction; the shading inside it is the level. This is the whole spatial vocabulary of Labanotation on one sheet.",
    },
    labanScore: {
      alt: "Page from Sei solo, a dance scored in Kinetography Laban",
      caption:
        "A page of real Labanotation: Raphaël Cottin’s Sei solo (2009). Support columns, body columns and effort signs — the full system the diagram above simplifies.",
    },
    laban26: {
      alt: "The 26 directions of the kinesphere with their Laban symbols",
      caption:
        "Laban’s deeper claim, drawn: 26 directions radiating from one centre — the kinesphere — each with its symbol.",
    },
    labanPortrait: {
      alt: "Rudolf Laban with his notation signs",
      caption: "Rudolf Laban (1879–1958) with the signs that became Kinetographie Laban, published 1928.",
    },
    benesh: {
      alt: "A short example of Benesh Movement Notation on a five-line stave",
      caption:
        "Benesh on its five-line stave. The lines are body height — head, shoulders, waist, knees, floor — and the marks are where the extremities appear inside that frame.",
    },
    eshkol: {
      alt: "Portrait of the Israeli dancer and notator Noa Eshkol",
      caption:
        "Noa Eshkol (1924–2007), who with the architect Avraham Wachman built a notation of pure angle — used since for dance, sign language and animal behaviour.",
    },
    cunningham: {
      alt: "Portrait of Merce Cunningham, 1961",
      caption:
        "Merce Cunningham in 1961. From 1989 he composed at a screen with LifeForms, valuing the wireframe figure for having no habits to censor what the machine proposed.",
    },
    feuillet: {
      alt: "A page of Feuillet's 1700 dance notation, showing floor tracks with step signs",
      caption:
        "The ancestor: Feuillet’s Chorégraphie (1700) notated the floor path and hung step signs off it. Space first, body second — the same instinct, two centuries early.",
    },
    source: "Wikimedia Commons",
  },
};

export type Copy = typeof en;

const he: Copy = {
  meta: {
    title: "שפות של תנועה — תנועה אחת, נכתבת בארבע דרכים",
    description:
      "משפט תנועה אחד, נכתב בו-זמנית בלאבאנוטציה, בכתב בנש, בכתב אשכול-ורכמן וכציר תמונות מפתח של LifeForms. שנו פרט אחד, וראו ארבעה כתבים כותבים אותו מחדש.",
    studioTitle: "סטודיו",
    studioDescription:
      "שחזור עובד של LifeForms / DanceForms: העמידו דמות קווית, קבעו לה תמונות מפתח, וקראו את התוצאה בחזרה בלאבאנוטציה, בכתב בנש ובכתב אשכול-ורכמן.",
    ogAlt: "דמות קווית ובה הזרוע הימנית נפרשת לאורך קשת כחולה — צופה הכתב מתוך שפות של תנועה.",
  },

  header: {
    brand: "שפות של תנועה",
    params: "פרמטרים",
    studio: "סטודיו",
    about: "אודות",
    switchLabel: "EN",
    switchTitle: "לקריאת הדף באנגלית",
  },

  hero: {
    titleTop: "תנועה אחת,",
    titleBottom: "נכתבת בארבע דרכים.",
    sub: "למחול אין דרך אחת להיכתב. שנו פרט אחד — וראו ארבעה כתבים כותבים אותו מחדש.",
    ctaMove: "מתחילים מתנועה אחת",
    ctaStudio: "לסטודיו",
    readoutLabel: "הזרוע הימנית, ברגע זה",
    note: "עמידה היא עשרה כיוונים וגובה אגן — ותו לא. המספרים האלה הם בדיוק מה שאשכול-ורכמן ולאבאן היו כותבים על הזרוע הזאת; הקו הנגרר הוא המקום שבו שורש כף היד היה זה עתה.",
  },

  move: {
    eyebrow: "הדבר שכל כתב תנועה חייב לכתוב",
    title: "תנועה אחת, חמש הכרעות",
    lead: (
      <>
        קבעו אותן כאן. כל מה שלמטה הוא <em>אותן</em> חמש הכרעות בדיוק, מאויתות בארבע שיטות שונות.
      </>
    ),
    prev: "התנועה הקודמת",
    next: "התנועה הבאה",
    counter: (i: number, n: number) => `תנועה ${i} / ${n}`,
    roll: "הגרילו את כל המשפט",
    rollTip: "פעולות של מקרה, כפי שקאנינגהם השתמש בהן",
  },

  nav: {
    readAs: "לקרוא כ",
    sections: {
      phrase: "המשפט",
      laban: "לאבאנוטציה",
      benesh: "בנש",
      ew: "אשכול-ורכמן",
      compare: "זה מול זה",
    },
    modeInfoTitle: "גוף, או המספרים שמתחתיו?",
    modeInfo: (
      <>
        <p>
          <strong>גוף</strong> מציג כל כתב כפי שרקדן קורא אותו — סרגלים, דמויות, איברים.
        </p>
        <p>
          <strong>מספרים</strong> מסלק את הרקדן ומשאיר את מה שהשיטה באמת רושמת: איזה ערוץ, איזה כיוון, באיזה גובה, כמה
          זמן. הקבוצה הזאת משותפת לארבעתם, והיא בדיוק מה שמחשב יודע להנפיש.
        </p>
      </>
    ),
  },

  mode: {
    label: "אופן הייצוג",
    body: "גוף",
    bodyTitle: "להציג את הגוף",
    numbers: "מספרים",
    numbersTitle: "להציג את המספרים שמאחורי זה",
  },

  phrase: {
    eyebrow: "תמונות מפתח ממוחשבות · 1989–",
    title: "תצלומי רגע, והפערים שביניהם",
    infoTitle: "קאנינגהם ו-LifeForms",
    info: (
      <>
        <p>
          התוכנה LifeForms נבנתה בשנות השמונים באוניברסיטת סיימון פרייזר בידי קבוצתו של טום קלוורט, ונמכרה אחר כך בשם{" "}
          <em>DanceForms</em>. מרס קאנינגהם החל להלחין בעזרתה ב-1989.
        </p>
        <p>
          כבר משנות החמישים נעזר בפעולות של מקרה — קוביות, הטלות מטבע, <em>אי צ&apos;ינג</em> — כדי להכריע מה יבוא אחר
          כך. התוכנה הציעה תנוחות שרקדן מאומן לא היה חושב עליהן, והוא השאיר אותן.
        </p>
      </>
    ),
    lead: (
      <p>
        <strong>תמונת מפתח</strong> היא תצלום רגע: בפעמה הזאת, האיבר הזה מצביע לכאן. את התנועה שביניהן ממציא המחשב. זה כל
        מה שיש בציר שלמטה — חמישה תצלומי רגע, והמכונה שממלאת את הפערים.
      </p>
    ),
    play: "נגנו את המשפט",
    pause: "עצרו",
    beat: "פעמה",
    timelineTitleAbs: "ערוצים × תמונות מפתח",
    timelineTitle: "איברים × תמונות מפתח",
    timelineHint: "לחצו על מעוין כדי לערוך את התנועה שלו למעלה.",
    viewerTitleAbs: "עקומות הערוצים",
    viewerTitle: "צופה הדמות",
    viewerHintAbs: "גובה θ לכל ערוץ לאורך הפעמות",
    viewerHint: "מבט מלפנים, עם אינטרפולציה בין היעדים",
  },

  laban: {
    eyebrow: "רודולף לאבאן · 1928",
    title: "לאבאנוטציה",
    infoTitle: "מאין זה בא",
    info: (
      <>
        <p>
          רודולף לאבאן פרסם את השיטה ב-1928 בשם <em>Kinetographie Laban</em>. היא עדיין כתב התנועה הנפוץ ביותר, ופרטיטורות
          שלמות נשמרות בארכיון כדי שאפשר יהיה להעלות יצירות מחדש עשורים אחר כך.
        </p>
        <p>
          לסרגל אמיתי יש יותר עמודות מארבע — רגליים תומכות, גו, ראש — וגם סימנים נוספים לאיכות התנועה.
        </p>
      </>
    ),
    lead: (
      <p>
        את זה קוראים <strong>מלמטה למעלה</strong>, כמו מעלית שמטפסת על קיר. כל עמודה היא איבר. כל סימן עונה על שלוש שאלות
        בבת אחת: <strong>הצורה</strong> אומרת לאן האיבר מצביע, <strong>המילוי</strong> אומר באיזה גובה, ו
        <strong>הגובה שלו על הדף</strong> אומר כמה זמן התנועה נמשכת.
      </p>
    ),
    titleAbs: "סריג הכיוונים + מרווחים חשופים",
    title2: "הסרגל",
    hintAbs: "26 קרניים של כדור התנועה, ומשך כאורך מרווח בלבד",
    hint: "קוראים כלפי מעלה מקו הפתיחה הכפול; ארבע עמודות מחווה",
    footnoteAbs:
      "במצב מספרים הסרגל מתמוסס אל הטענה העמוקה של לאבאן: כיוון הוא אחת מ-26 קרניים של סריג שמרכזו נקודה — כדור התנועה — ומשך הוא אורך מרווח, ותו לא.",
    footnote:
      "מפושט לארבע עמודות מחווה; לאבאנוטציה אמיתית מוסיפה עמודות תמיכה, גוף וראש, ורפרטואר סימנים גדול.",
    rule1: "כלל 1 — הצורה היא הכיוון",
    rule2: "כלל 2 — המילוי הוא הגובה",
    legendNote: (
      <>
        מקווקו הוא גבוה, נקודה היא אמצע, שחור מלא הוא נמוך. <em>האורך</em> של סימן לאורך הסרגל הוא משך התנועה.
      </>
    ),
  },

  benesh: {
    eyebrow: "רודולף וג'ואן בנש · 1955",
    title: "כתב בנש",
    infoTitle: "מאין זה בא",
    info: (
      <>
        <p>
          ג&apos;ואן בנש רקדה בסאדלרס וֶלס; בעלה רודולף היה רואה חשבון וצייר. הם פרסמו את שיטתם ב-1955 והיא הפכה לתקן
          בבלט — הרויאל בלט עדיין מעסיק כוריאולוגים שכותבים בה.
        </p>
        <p>פרטיטורה מלאה רושמת מתחת לסרגל גם מעברים במרחב וסיבובים, בתיבות, כמו בתווים.</p>
      </>
    ),
    lead: (
      <>
        <p>
          זה נראה כמו תווים ונקרא משמאל לימין — אבל חמשת הקווים אינם צלילים, אלא <strong>גבהים על הגוף</strong>: קודקוד
          הראש, הכתפיים, המותן, הברכיים, הרצפה.
        </p>
        <p>
          מסמנים היכן הידיים והרגליים <em>נראות</em>, כאילו עומדים מאחורי הרקדן. קו קטן אומר באיזה עומק:{" "}
          <span className="font-mono">|</span> מלפנים, <span className="font-mono">—</span> במישור,{" "}
          <span className="font-mono">•</span> מאחור.
        </p>
      </>
    ),
    titleAbs: "מישור התמונה — קואורדינטות בלבד",
    title2: "הסרגל",
    hintAbs: "מיקום (x, y) ועומק בעל שלושה ערכים, בלי הדמות",
    hint: "פריים אחד לכל תנועה, במבט מאחור",
    footnoteAbs:
      "כשהרקדן מסולק, הפרמטר מתגלה במלוא פשטותו: נקודה (x, y) במישור תמונה ועוד עומק משולש — קואורדינטה תלת-ממדית רדודה.",
    footnote: "סימני המקצב שמעל הסרגל נותנים את משך כל פריים בפעמות.",
  },

  ew: {
    eyebrow: "נועה אשכול ואברהם ורכמן · 1958",
    title: "כתב אשכול-ורכמן",
    infoTitle: "מאין זה בא",
    info: (
      <>
        <p>
          נועה אשכול, כוריאוגרפית ישראלית, בנתה את השיטה ב-1958 יחד עם האדריכל אברהם ורכמן. היא ביקשה לתאר תנועה בלי שום
          התייחסות לסגנון, למצב רוח או לבמה.
        </p>
        <p>
          מכיוון שהיא מתארת זוויות בלבד, השתמשו בה הרחק מעבר למחול: לשפת סימנים, לפיזיותרפיה ולמחקר התנהגות בעלי חיים.
        </p>
      </>
    ),
    lead: (
      <>
        <p>
          התייחסו לכל איבר כאל מקל ישר שמסתובב על כדור בלתי נראה סביב המפרק שלו. אז מיקומו הוא שני מספרים:{" "}
          <strong>באיזה גובה</strong> (0 הוא ישר למטה, 4 הוא ישר למעלה) ו<strong>לאיזה כיוון</strong> (צעד אחד = 45°).
        </p>
        <p>הפרטיטורה היא טבלה — איברים לאורך הצד, זמן לאורך הראש. שום ציור של גוף בשום מקום.</p>
      </>
    ),
    gridTitleAbs: "רשת הפרטיטורה — ערוצים × זמן",
    gridTitle: "רשת הפרטיטורה — איברים × זמן",
    gridHint: "כל תא נקרא אנכי / אופקי, ביחידות של 45°",
    gridFootnote:
      "אנכי 0 מצביע ישר למטה ו-4 ישר למעלה; אופקי סופר יחידות של 45° סביב הגוף, כאשר 0 = קדימה.",
    sphereTitle: "מערכת הייחוס",
    sphereHintAbs: "הכדור, מחולק ליחידות של 45°",
    sphereHint: "האיבר על כדור המפרק שלו",
    sphereFootnote: "הכדור הוא הכתב — במצב מספרים לא הוסר דבר מלבד תווית.",
  },

  compare: {
    eyebrow: "זה מול זה",
    title: "אותה תנועה, ארבעה איותים",
    lead: (
      <p>
        כל שורה היא דבר אחד שמחול יכול לקבוע. כל עמודה מראה איך שיטה אחת כותבת אותו. העמודה האחרונה היא מה שנשאר כשמסלקים
        את הגוף — החלק שכל השיטות מסכימות עליו.
      </p>
    ),
    head: {
      fixes: "מה זה קובע",
      laban: "לאבאנוטציה",
      benesh: "בנש",
      ew: "אשכול-ורכמן",
      lifeforms: "LifeForms",
      numbers: "רק המספרים",
    },
    rows: [
      [
        "לאן מצביעים",
        "צורת הסימן — 8 כיוונים ועוד ״במקום״",
        "היכן היד או הרגל יושבת בפריים",
        "זווית סביב הגוף, 45° בכל פעם",
        "כיוון המקטע",
        "unit vector v ∈ S²",
      ],
      [
        "באיזה גובה",
        "איך הסימן ממולא",
        "גובה ביחס לחמשת קווי הגוף",
        "0 ישר למטה ← 4 ישר למעלה",
        "גובה התנוחה",
        "angle θ",
      ],
      [
        "כמה זמן",
        "כמה גבוה הסימן",
        "הסדר משמאל לימין, נקודות לפעמות",
        "עמודה אחת ליחידת זמן",
        "היכן תצלום הרגע יושב בזמן",
        "interval [t₀, t₀+Δt]",
      ],
      [
        "מי זז",
        "איזו עמודה בסרגל",
        "איזו יד או רגל מצוירת",
        "איזו שורה בטבלה",
        "איזה ערוץ של הדמות",
        "channel index k",
      ],
      [
        "איך זה מרגיש",
        "סימני מאמץ — משקל, זמן, מרחב, זרימה",
        "סימני משפט והדגשה",
        "בכוונה, ברובו נשמט",
        "העקומה בין תצלומי הרגע",
        "easing e(t)",
      ],
    ],
    closing: (
      <>
        <p>
          מבנה נתונים משותף אחד —{" "}
          <span className="font-mono text-[0.9em]">{"{channel, direction, level, duration, dynamic}"}</span> — מניע כל
          פרטיטורה בדף הזה. המבנה הזה הוא עצמו התשובה לשאלה שהדף שואל: הפרמטרים, בלי גוף.
        </p>
        <p>
          וזה גם מה שה<strong>סטודיו</strong> כותב, תמונת מפתח אחת בכל פעם.
        </p>
      </>
    ),
  },

  about: {
    eyebrow: "מי עשה את זה",
    people: [
      {
        name: "גל ברוק גורפונג",
        bio: "יוצר, רקדן, וחוקר בתחום מדעי המוח.",
        photo: "/gal.jpg",
      },
      {
        name: "אמיתי כהן",
        bio: "יוצר, רקדן, ומפתח תוכנה.",
        photo: "/amitay.jpg",
      },
    ] as Person[],
  },

  footer: {
    cunninghamTitle: "כוריאוגרף מול מסך",
    cunninghamInfoTitle: "היצירות הממוחשבות של קאנינגהם",
    cunninghamInfo: (
      <>
        <p>
          <em>Trackers</em> (1991) הייתה יצירת הבמה הראשונה שעשה בעזרת התוכנה.
        </p>
        <p>
          ב-<em>BIPED</em> (1999) הרחיק לכת: הרקדנים צולמו בלכידת תנועה, והאמנים פול קייזר ושלי אשכר הקרינו את העקבות
          המצוירות בידם, נטולות הגוף, מעל הבמה החיה.
        </p>
      </>
    ),
    cunningham:
      "מרס קאנינגהם היה בן שבעים כשהחל לככב מול מחשב. הוא אהב שלדמות שעל המסך אין הרגלים והיא לעולם לא מתעייפת, ולכן היא הציעה תנוחות שרקדן מאומן לא היה מציע לעולם.",
    simpleTitle: "זו הגרסה הפשוטה",
    simpleInfoTitle: "מה הושמט",
    simpleInfo: (
      <>
        <p>
          ללאבאנוטציה אמיתית יש עמודות לרגליים התומכות, לגו ולראש, וגם מערך גדול של סימנים לאיכות התנועה.
        </p>
        <p>כתב בנש אמיתי רושם מתחת לסרגל מעברים במרחב וסיבובים, בתיבות, כמו בתווים.</p>
        <p>
          כתב אשכול-ורכמן אמיתי מחלק זוויות בדיוק כדק שירצה, ומבחין בין מסלולים מישוריים, חרוטיים ומסולסלים.
        </p>
      </>
    ),
    simple:
      "כל שיטה כאן מצומצמת לאותו אוצר מילים קטן — איבר אחד שזז בכל פעם, שמונה כיוונים, שלושה גבהים — כדי שאפשר יהיה להשוות ביניהן זו לצד זו. השיטות האמיתיות עשירות הרבה יותר.",
    tryTitle: "נסו בעצמכם",
    try: (
      <>
        ה<strong>סטודיו</strong> הוא שחזור עובד של התוכנה: העמידו דמות, הניחו תצלומי רגע, שלחו את הרקדנים ללכת, וקראו את
        מה שיצרתם בחזרה בשלושת הכתבים.
      </>
    ),
  },

  limbs: {
    RA: "יד ימין",
    LA: "יד שמאל",
    RL: "רגל ימין",
    LL: "רגל שמאל",
    channel: (n: number) => `ערוץ ${n}`,
  },

  limbsShort: { RA: "יד ימ׳", LA: "יד שמ׳", RL: "רגל ימ׳", LL: "רגל שמ׳" },

  dirs: {
    place: "במקום",
    forward: "קדימה",
    rf: "ימינה-קדימה",
    right: "ימינה",
    rb: "ימינה-אחורה",
    back: "אחורה",
    lb: "שמאלה-אחורה",
    left: "שמאלה",
    lf: "שמאלה-קדימה",
  },

  levels: { low: "נמוך", middle: "אמצע", high: "גבוה" },

  depths: { front: "מלפנים", level: "במישור", behind: "מאחור" },

  editor: {
    part: "איזה איבר",
    partAbs: "ערוץ",
    way: "לאיזה כיוון",
    wayAbs: "אזימוט φ",
    high: "באיזה גובה",
    highAbs: "גובה θ",
    long: "כמה זמן",
    longAbs: "מרווח Δt",
    beats: (n: number) => (n === 1 ? "פעמה אחת" : `${n} פעמות`),
    starts: "איך זה מתחיל",
    startsAbs: "האטה",
    effortTitle: "לאבאן קרא לזה מאמץ",
    effortInfo: (
      <>
        <p>
          לאבאן סבר ש<em>איכות</em> התנועה חשובה לא פחות ממסלולה, וכתב אותה במשפחת סימנים נפרדת שקרא לה מאמץ.
        </p>
        <p>
          <strong>מתמשך</strong> פורש את השינוי באופן אחיד על פני כל הזמן. <strong>פתאומי</strong> קופץ אל התנוחה החדשה
          מוקדם ומחזיק בה.
        </p>
      </>
    ),
    sustained: "מתמשך",
    sudden: "פתאומי",
    smooth: "חלק",
    snap: "קפיצה",
    strength: "באיזה כוח",
    strengthAbs: "משרעת",
    weightTitle: "קל או חזק",
    weightInfo: (
      <p>
        החצי השני מזוג המאמץ של לאבאן: כמה משקל הזז מפעיל בתנועה. כאן זה פשוט מצייר את הקו עבה יותר.
      </p>
    ),
    light: "קל",
    strong: "חזק",
    lowGain: "הגבר נמוך",
    highGain: "הגבר גבוה",
  },

  chips: {
    lifeforms: [
      { key: "תצלום רגע", body: "תנוחה מוחזקת בפעמה אחת", abs: "(channel, time) → pose" },
      { key: "איבר", body: "היד או הרגל שזזה", abs: "channel number k ∈ {1…4}" },
      { key: "זמן", body: "פעמות, משמאל לימין", abs: "t ∈ [0, T]" },
      { key: "מה שביניהם", body: "איך זה נע בין תצלומי הרגע", abs: "easing e(t)" },
      { key: "מקרה", body: "קוביות בוחרות מה יקרה אחר כך", abs: "uniform sample of the space" },
    ],
    laban: [
      { key: "כיוון", body: "צורת הסימן", abs: "one of 26 rays from the centre" },
      { key: "גובה", body: "איך הסימן ממולא", abs: "angle θ ∈ {−45°, 0°, +45°}" },
      { key: "אורך", body: "כמה גבוה הסימן", abs: "interval length Δt" },
      { key: "איבר", body: "באיזו עמודה הוא יושב", abs: "channel index k" },
      { key: "איכות", body: "סימנים נוספים למאמץ", abs: "shape and gain of e(t)" },
    ],
    benesh: [
      { key: "מיקום", body: "היכן היד או הרגל נראית", abs: "point (x, y) in a flat frame" },
      { key: "עומק", body: "| מלפנים · — במישור · • מאחור", abs: "z ∈ {+1, 0, −1}" },
      { key: "חמשת הקווים", body: "ראש, כתפיים, מותן, ברכיים, רצפה", abs: "rulings of the frame" },
      { key: "מקצב", body: "נקודות מעל כל פריים", abs: "frame duration Δt" },
      { key: "פריים", body: "ציור אחד לכל רגע", abs: "a sample of the path" },
    ],
    ew: [
      { key: "באיזה גובה", body: "0 ישר למטה ← 4 ישר למעלה", abs: "v ∈ {0…4}" },
      { key: "לאיזה כיוון", body: "45° בכל פעם סביב הגוף", abs: "h ∈ {0…7}" },
      { key: "איבר", body: "מקל ישר על מפרק כדורי", abs: "radius of a sphere" },
      { key: "יחידת זמן", body: "עמודה אחת בטבלה", abs: "tick of a discrete clock" },
      { key: "סוג התנועה", body: "מישורית, חרוטית, או סלסול", abs: "class of path on the sphere" },
    ],
  },

  scores: {
    kinesphere: "סריג כדור התנועה · 26 קרניים + מרכז",
    intervals: "מרווחי Δt",
    unitVectorS2: "וקטור יחידה על S²",
    eventLabel: (n: number) => `אירוע e${n}`,
    joint: { shoulder: "מהכתף", hip: "מהאגן" },
    frontView: "מבט מלפנים · טבעת = איבר שמושט קדימה",
    elevation: "גובה θ ∈ [−90°, +90°] · יעדי צעד, עם האטה",
  },

  studio: {
    poseButton: "תנוחה",
    poseSheetTitle: "תנוחה ומספרים",
    poseSheetDesc: "בקרות עמידה, תנוחות מוכנות והֶדי הכתב",
    aboutAria: "על אודות הסטודיו",
    scoreBadge: "פרטיטורה",
    scoreSummary: (dancers: number, beats: number) =>
      `${dancers === 1 ? "רקדן אחד" : `${dancers} רקדנים`} · ${beats} פעמות`,

    groups: { dancer: "רקדן", camera: "מצלמה", chance: "מקרה", snapshot: "תצלום רגע", length: "אורך" },
    cams: { perspective: "פרספ׳", front: "חזית", side: "צד", plan: "מלמעלה" },
    tabs: { timeline: "ציר זמן", laban: "לאבאנוטציה", benesh: "בנש", ew: "אשכול-ורכמן" },

    ghosts: "רפאים",
    paths: "מסלולים",
    chancePose: "תנוחה",
    chancePhrase: "משפט",
    chanceSpace: "מרחב",
    stageHint: "גררו כדי לסובב את הבמה · גלגלו כדי לקרב",
    atPlayhead: "בראש הנגינה",
    atPlayheadTip: "שמרו את התנוחה הנוכחית כתצלום רגע בראש הנגינה (K)",
    play: "נגנו",
    pause: "עצרו",
    loop: "לולאה",
    beat: "פעמה",
    tempo: "מפעם",
    bpm: "פעימות לדקה",
    status: (name: string, i: number, n: number, beat: string) =>
      `${name} · תמונת מפתח ${i}/${n}${beat} · רווח מנגן · ← → מדלגים · K שומר`,
    atBeat: (b: number) => ` בפעמה ${b}`,
    resetTip: "איפוס לפרטיטורת הדוגמה",

    aria: {
      selectedDancer: "הרקדן הנבחר",
      addDancer: "הוספת רקדן",
      removeDancer: "הסרת רקדן",
      camera: "מצלמה",
      nudgeEarlier: "הזזה אחורה",
      nudgeLater: "הזזה קדימה",
      mirror: "היפוך התנוחה",
      deleteKey: "מחיקת תמונת המפתח",
      shorter: "שמונה פעמות פחות",
      longer: "שמונה פעמות יותר",
      reset: "איפוס הפרטיטורה",
    },

    presetHint: "או התחילו מתנוחה מוכנה — היא שומרת על מקומו של הרקדן על הרצפה.",
    paletteTitle: "לוח העמידות",
    paletteInfo: (
      <p>
        התוכנה המקורית הגיעה עם ספריות של צורות גוף בעלות שם, שהכוריאוגרף היה גורר אל ציר הזמן. עשר אלה הן אותו רעיון.
      </p>
    ),
    applyPreset: (name: string) => `החלת ${name} על תמונת המפתח הנבחרת`,

    reference: {
      title: "מה היה ב-LifeForms, ומה נשמר בסטודיו הזה",
      desc: "עיון במושגים של התוכנה, לא המרה של הקוד שלה.",
      headSoftware: "בתוכנה",
      headHere: "כאן",
      rows: [
        ["חלון העמידה", "עורך העמידה — אזימוט/גובה לכל מקטע, גובה אגן, פנייה"],
        ["לוחות עמידות", "לוח — הטבעת עמידה בעלת שם בתמונת המפתח הנבחרת"],
        ["עורך הרצף", "ציר זמן — מעוינים לכל רקדן, הזזה, מחיקה, אינטרפולציה מואטת"],
        ["חלון הסטודיו", "במה — עד ארבעה רקדנים, סיבוב וזום, מצלמות חזית/צד/מלמעלה"],
        ["מסלולים במרחב", "מסלולי רצפה — כל תמונת מפתח נושאת x/z וכיוון פנייה"],
        ["הצללה", "פריימי רפאים — עמידות תמונות המפתח הסמוכות, מצוירות בעדינות"],
        ["פעולות של מקרה", "מקרה — הגרלת תנוחה, משפט או שימוש במרחב"],
        ["— מעולם לא היה בתוכנה —", "תרגומים — אותו מסלול, ניתן לעריכה בשלושה כתבים"],
        ["עיטוף, IK, קלט/פלט", "מחוץ לתחום: הדמות הקווית היא כל העניין"],
      ],
      essay: (
        <>
          <p>
            LifeForms התחילה באמצע שנות השמונים באוניברסיטת סיימון פרייזר, בקבוצת הגרפיקה הממוחשבת של טום קלוורט, ככלי
            ל<em>הלחנה</em> של תנועה אנושית ולא להנפשת דמויות. קאנינגהם התחיל איתה ב-1989 ויצר את <em>Trackers</em>{" "}
            (1991) בחלקה מול המסך; Credo Interactive מכרה אותה אחר כך בשם <em>DanceForms</em>.
          </p>
          <p>
            מה שמשך אותו לא היה יעילות אלא הזרה: לדמות לא היו הרגלים, לא אימון ולא עייפות, ולכן העמידות שלה הגיעו בלי
            הצנזורה של הגוף עצמו.
          </p>
          <p>
            כל תמונת מפתח כאן שומרת עמידה שלמה — עשרה כיווני מקטע ב(אזימוט, גובה) — ועוד גובה אגן, מיקום על הרצפה וכיוון
            פנייה. הפרטיטורה נשמרת באחסון המקומי של הדפדפן הזה.
          </p>
        </>
      ),
      link: "איך שלושת הכתבים עובדים",
    },

    stance: {
      whichPart: "איזה חלק",
      placeFacing: "מקום / פנייה",
      noKeyframe: "לא נבחרה תמונת מפתח — הוסיפו אחת בראש הנגינה.",
      acrossStage: "לרוחב הבמה",
      towardsAudience: "לכיוון הקהל",
      whichWayFacing: "לאיזה כיוון פונים",
      hipHeight: "כמה נמוך האגן",
      whichWayRound: "לאיזה כיוון",
      howHigh: "באיזה גובה",
      tabPose: "תנוחה",
      tabNumbers: "מספרים",
      bonesTitle: "עשר עצמות, מכוונות אחת-אחת",
      bonesInfo: (
        <>
          <p>
            הדמות היא עשר עצמות ישרות. מכוונים כל אחת מהן במרחב במקום לכופף מפרק במידה מסוימת — בדיוק כפי ששלושת הכתבים
            מתארים גוף.
          </p>
          <p>
            <strong>מקום / פנייה</strong> מזיז את הרקדן כולו על הרצפה במקום זאת.
          </p>
        </>
      ),
      ewLine: "אשכול-ורכמן:",
      ewTitle: "מה שני המספרים האלה אומרים",
      ewInfo: (
        <>
          <p>
            זהו אותו כיוון בדיוק, כתוב כפי שאשכול-ורכמן כותבים אותו: קודם הגובה (0 ישר למטה, 4 ישר למעלה), ואז לאיזה
            כיוון (כל יחידה היא 45°).
          </p>
          <p>אלה אותן שתי זוויות של שני המחוונים שלמעלה — רק ספורות בשמיניות של סיבוב.</p>
        </>
      ),
    },

    labanTrack: {
      empty: "בחרו משבצת על הסרגל",
      hint: "לחצו על תיבה בסרגל, ואז כוונו אותה.",
      infoTitle: "איך קוראים את הסרגל הזה",
      info: (
        <>
          <p>קוראים מלמטה למעלה. כל עמודה היא איבר; הקו הכפול האמצעי הוא הרקדן.</p>
          <p>צורת הסימן היא הכיוון, המילוי שלו הוא הגובה, וגובהו על הדף הוא משך הזמן שהוא נמשך.</p>
          <p>קו מקווקו אומר שהאיבר פשוט נשאר במקום שבו היה.</p>
        </>
      ),
      note: "לאבאן מעגל לשמונה כיוונים, ולכן כיוון כאן מיישר את כל היד או הרגל.",
    },

    beneshTrack: {
      empty: "אחזו בסימן של יד או רגל",
      hint: "גררו יד או רגל לכל מקום בתוך הפריים שלה.",
      infoTitle: "איך קוראים את הפריימים האלה",
      info: (
        <>
          <p>
            חמשת הקווים הם גבהים על הגוף — ראש, כתפיים, מותן, ברכיים, רצפה — ולא צלילים. אתם עומדים מאחורי הרקדן.
          </p>
          <p>
            הקו הקטן שעל כל יד או רגל אומר באיזה עומק היא: זקוף למלפנים, שטוח למישור, נקודה למאחור.
          </p>
          <p>הנקודות מעל כל פריים סופרות את הפעמות שלו.</p>
        </>
      ),
    },

    ewTrack: {
      empty: "לחצו על תא בטבלה",
      hint: "כל לחיצה מסובבת את העצם הזאת ב-45°.",
      infoTitle: "איך קוראים את הטבלה הזאת",
      info: (
        <>
          <p>
            בכל תא שני מספרים. העליון הוא הגובה: 0 ישר למטה, 2 אופקי, 4 ישר למעלה. התחתון הוא לאיזה כיוון סביב הגוף,
            בספירה של 45° בכל פעם מקדימה ישר.
          </p>
          <p>מספרים אפורים אומרים ששום דבר לא השתנה מאז תמונת המפתח הקודמת.</p>
          <p>זהו המבט היחיד שמזיז עצם אחת בכל פעם — האחרים מזיזים יד או רגל שלמה.</p>
        </>
      ),
    },

    beatOf: (b: number) => `פעמה ${b}`,
    dancerName: (n: number) => `רקדן ${n}`,

    bones: {
      torso: "גו",
      head: "ראש",
      ruarm: "זרוע ימין",
      rfarm: "אמת ימין",
      luarm: "זרוע שמאל",
      lfarm: "אמת שמאל",
      rthigh: "ירך ימין",
      rshin: "שוק ימין",
      lthigh: "ירך שמאל",
      lshin: "שוק שמאל",
    },

    limbsets: { larm: "יד שמאל", lleg: "רגל שמאל", rleg: "רגל ימין", rarm: "יד ימין", body: "גוף", head: "ראש" } as Record<string, string>,

    presets: {
      Stand: "עמידה",
      Reach: "הושטה",
      Second: "פוזיציה שנייה",
      "Plié": "פלייה",
      Arabesque: "ארבסק",
      Attitude: "אטיטיוד",
      Curl: "כיווץ",
      Lunge: "מכרע",
      Jump: "קפיצה",
      Tilt: "הטיה",
    } as Record<string, string>,
  },

  plates: {
    labanDirections: {
      alt: "לוח סימני הכיוון של Kinetography Laban, מסודרים בשלושה ממדים",
      caption:
        "טבלת הסימנים האמיתית. כל צורה היא כיוון; ההצללה שבתוכה היא הגובה. זהו כל אוצר המילים המרחבי של לאבאנוטציה בדף אחד.",
    },
    labanScore: {
      alt: "עמוד מתוך Sei solo, מחול הכתוב ב-Kinetography Laban",
      caption:
        "עמוד של לאבאנוטציה אמיתית: Sei solo (2009) מאת רפאל קוטן. עמודות תמיכה, עמודות גוף וסימני מאמץ — השיטה המלאה שהתרשים שלמעלה מפשט.",
    },
    laban26: {
      alt: "26 הכיוונים של כדור התנועה עם סימני לאבאן שלהם",
      caption: "הטענה העמוקה של לאבאן, מצוירת: 26 כיוונים שקורנים ממרכז אחד — כדור התנועה — לכל אחד סימן משלו.",
    },
    labanPortrait: {
      alt: "רודולף לאבאן עם סימני הכתב שלו",
      caption: "רודולף לאבאן (1879–1958) עם הסימנים שהפכו ל-Kinetographie Laban, שפורסם ב-1928.",
    },
    benesh: {
      alt: "דוגמה קצרה של כתב התנועה בנש על סרגל בן חמישה קווים",
      caption:
        "כתב בנש על הסרגל בן חמשת הקווים. הקווים הם גובה על הגוף — ראש, כתפיים, מותן, ברכיים, רצפה — והסימנים הם המקום שבו הגפיים נראות בתוך אותו פריים.",
    },
    eshkol: {
      alt: "דיוקן של הרקדנית והכותבת הישראלית נועה אשכול",
      caption:
        "נועה אשכול (1924–2007), שבנתה עם האדריכל אברהם ורכמן כתב של זווית טהורה — ומאז שימש למחול, לשפת סימנים ולחקר התנהגות בעלי חיים.",
    },
    cunningham: {
      alt: "דיוקן של מרס קאנינגהם, 1961",
      caption:
        "מרס קאנינגהם ב-1961. מ-1989 הלחין מול מסך בעזרת LifeForms, והעריך בדמות הקווית דווקא את היעדר ההרגלים שיצנזרו את הצעות המכונה.",
    },
    feuillet: {
      alt: "עמוד מכתב המחול של פֵייה משנת 1700, ובו מסלולי רצפה עם סימני צעד",
      caption:
        "האב הקדמון: Chorégraphie של פֵייה (1700) רשם את מסלול הרצפה ותלה עליו את סימני הצעד. מרחב תחילה, גוף אחר כך — אותה אינטואיציה, מאתיים שנה מוקדם יותר.",
    },
    source: "ויקישיתוף",
  },
};

export const COPY: Record<Locale, Copy> = { en, he };
