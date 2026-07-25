# notate.dance

Two ways into the same question: how do you write down a movement?

**Parameters** (`/`) takes one short phrase and writes it four ways at once — Labanotation,
Benesh, Eshkol-Wachman, and a keyframe timeline in the manner of LifeForms, the software
Merce Cunningham composed with from 1989. Change one thing and every score rewrites itself.
The **Body → Numbers** switch takes the dancer away and leaves the numbers each system
really records.

**Studio** (`/studio`) is a working rebuild of the LifeForms studio window: pose a wireframe
figure, drop snapshots on a timeline, send up to four dancers walking the floor, roll dice
for a phrase — then read what you made back in all three notations, and edit it there too.
The score is kept in your browser's local storage.

Every rendering on the site is driven by one shared idea: a body is a set of segments, and
each segment is a direction on a sphere.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Stack

Next.js App Router · React · Tailwind CSS v4 · shadcn/ui (Base UI) · lucide icons.
Scores and diagrams are hand-drawn SVG and canvas; the geometry lives in `lib/geometry.ts`,
`lib/notation.ts` and `lib/studio.ts`.

`node _smoke.mjs` drives the studio in a real browser (playback, keyframes, chance, all three
notation editors, persistence) against a running dev server.

Historical images are loaded from Wikimedia Commons and credited in place; see
`components/notation/plate.tsx` for sources and licences.
