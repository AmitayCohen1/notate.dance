import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/** A credited historical image. Every plate on the site names its source. */
export interface PlateSource {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  license: string;
  href: string;
  /** Tailwind object-fit helper for odd aspect ratios. */
  fit?: "contain" | "cover";
  bg?: boolean;
}

export const PLATES = {
  labanDirections: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Signes-de-direction-3D-HD.jpg/960px-Signes-de-direction-3D-HD.jpg",
    alt: "Chart of the direction signs used in Kinetography Laban, arranged in three dimensions",
    caption:
      "The real symbol table. Each shape is a direction; the shading inside it is the level. This is the whole spatial vocabulary of Labanotation on one sheet.",
    credit: "Raphaël Cottin",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Signes-de-direction-3D-HD.jpg",
    fit: "contain",
    bg: true,
  },
  labanScore: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Sei-solo-courante_Laban-score.jpg/960px-Sei-solo-courante_Laban-score.jpg",
    alt: "Page from Sei solo, a dance scored in Kinetography Laban",
    caption:
      "A page of real Labanotation: Raphaël Cottin’s Sei solo (2009). Support columns, body columns and effort signs — the full system the diagram above simplifies.",
    credit: "Raphaël Cottin",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Sei-solo-courante_Laban-score.jpg",
    fit: "contain",
    bg: true,
  },
  laban26: {
    src: "https://upload.wikimedia.org/wikipedia/commons/1/1c/26_Directions_with_symbols.png",
    alt: "The 26 directions of the kinesphere with their Laban symbols",
    caption:
      "Laban’s deeper claim, drawn: 26 directions radiating from one centre — the kinesphere — each with its symbol.",
    credit: "Sandra Hooghwinkel",
    license: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:26_Directions_with_symbols.png",
    fit: "contain",
    bg: true,
  },
  labanPortrait: {
    src: "https://upload.wikimedia.org/wikipedia/commons/4/46/Labanotation1.jpg",
    alt: "Rudolf Laban with his notation signs",
    caption: "Rudolf Laban (1879–1958) with the signs that became Kinetographie Laban, published 1928.",
    credit: "Unknown photographer",
    license: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:Labanotation1.jpg",
    fit: "cover",
  },
  benesh: {
    src: "https://upload.wikimedia.org/wikipedia/commons/5/58/Benesh.jpg",
    alt: "A short example of Benesh Movement Notation on a five-line stave",
    caption:
      "Benesh on its five-line stave. The lines are body height — head, shoulders, waist, knees, floor — and the marks are where the extremities appear inside that frame.",
    credit: "Juliette Kando",
    license: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Benesh.jpg",
    fit: "contain",
    bg: true,
  },
  eshkol: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Noa_Eshkol.jpg/960px-Noa_Eshkol.jpg",
    alt: "Portrait of the Israeli dancer and notator Noa Eshkol",
    caption:
      "Noa Eshkol (1924–2007), who with the architect Avraham Wachman built a notation of pure angle — used since for dance, sign language and animal behaviour.",
    credit: "Unknown photographer",
    license: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:Noa_Eshkol.jpg",
    fit: "cover",
  },
  cunningham: {
    src: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Merce_Cunningham_1961.png",
    alt: "Portrait of Merce Cunningham, 1961",
    caption:
      "Merce Cunningham in 1961. From 1989 he composed at a screen with LifeForms, valuing the wireframe figure for having no habits to censor what the machine proposed.",
    credit: "Dance Magazine",
    license: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:Merce_Cunningham_1961.png",
    fit: "cover",
  },
  feuillet: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Feuillet_notation.jpg/960px-Feuillet_notation.jpg",
    alt: "A page of Feuillet's 1700 dance notation, showing floor tracks with step signs",
    caption:
      "The ancestor: Feuillet’s Chorégraphie (1700) notated the floor path and hung step signs off it. Space first, body second — the same instinct, two centuries early.",
    credit: "Raoul-Auger Feuillet",
    license: "CC0",
    href: "https://commons.wikimedia.org/wiki/File:Feuillet_notation.jpg",
    fit: "contain",
    bg: true,
  },
} satisfies Record<string, PlateSource>;

/**
 * How much room the plate takes in the layout. The frame is a layout
 * decision, not a property of the picture: every image is letterboxed
 * inside a fixed box so a tall scan or a wide strip can never stretch a
 * card and knock the page about. It also means no shift while loading.
 */
const FRAMES = {
  wide: "aspect-[4/3]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  strip: "aspect-[16/5]",
} as const;

export function Plate({
  plate,
  frame = "wide",
  className = "",
}: {
  plate: PlateSource;
  frame?: keyof typeof FRAMES;
  className?: string;
}) {
  return (
    <figure className={cn("bg-card flex flex-col overflow-hidden rounded-xl border", className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden",
          FRAMES[frame],
          plate.bg ? "bg-white p-3 dark:bg-zinc-100" : "bg-muted/50",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={plate.src}
          alt={plate.alt}
          loading="lazy"
          decoding="async"
          className={cn("max-h-full max-w-full", plate.fit === "cover" ? "h-full w-full object-cover" : "object-contain")}
        />
      </div>
      <figcaption className="flex-1 space-y-1.5 border-t p-4">
        <p className="text-[0.95rem] leading-relaxed">{plate.caption}</p>
        <a
          href={plate.href}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono text-xs"
        >
          {plate.credit} · {plate.license} · Wikimedia Commons
          <ExternalLink className="size-3" />
        </a>
      </figcaption>
    </figure>
  );
}
