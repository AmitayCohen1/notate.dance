"use client";

import { ExternalLink } from "lucide-react";
import { useCopy } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

/** A credited historical image. Every plate on the site names its source.
    Its alt text and caption live in the copy dictionary, under the same key. */
export interface PlateSource {
  src: string;
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
    credit: "Raphaël Cottin",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Signes-de-direction-3D-HD.jpg",
    fit: "contain",
    bg: true,
  },
  labanScore: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Sei-solo-courante_Laban-score.jpg/960px-Sei-solo-courante_Laban-score.jpg",
    credit: "Raphaël Cottin",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Sei-solo-courante_Laban-score.jpg",
    fit: "contain",
    bg: true,
  },
  laban26: {
    src: "https://upload.wikimedia.org/wikipedia/commons/1/1c/26_Directions_with_symbols.png",
    credit: "Sandra Hooghwinkel",
    license: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:26_Directions_with_symbols.png",
    fit: "contain",
    bg: true,
  },
  labanPortrait: {
    src: "https://upload.wikimedia.org/wikipedia/commons/4/46/Labanotation1.jpg",
    credit: "Unknown photographer",
    license: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:Labanotation1.jpg",
    fit: "cover",
  },
  benesh: {
    src: "https://upload.wikimedia.org/wikipedia/commons/5/58/Benesh.jpg",
    credit: "Juliette Kando",
    license: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Benesh.jpg",
    fit: "contain",
    bg: true,
  },
  eshkol: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Noa_Eshkol.jpg/960px-Noa_Eshkol.jpg",
    credit: "Unknown photographer",
    license: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:Noa_Eshkol.jpg",
    fit: "cover",
  },
  cunningham: {
    src: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Merce_Cunningham_1961.png",
    credit: "Dance Magazine",
    license: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:Merce_Cunningham_1961.png",
    fit: "cover",
  },
  feuillet: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Feuillet_notation.jpg/960px-Feuillet_notation.jpg",
    credit: "Raoul-Auger Feuillet",
    license: "CC0",
    href: "https://commons.wikimedia.org/wiki/File:Feuillet_notation.jpg",
    fit: "contain",
    bg: true,
  },
} satisfies Record<string, PlateSource>;

export type PlateName = keyof typeof PLATES;

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
  name,
  frame = "wide",
  className = "",
}: {
  name: PlateName;
  frame?: keyof typeof FRAMES;
  className?: string;
}) {
  const t = useCopy();
  const plate: PlateSource = PLATES[name];
  const { alt, caption } = t.plates[name];

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
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn("max-h-full max-w-full", plate.fit === "cover" ? "h-full w-full object-cover" : "object-contain")}
        />
      </div>
      <figcaption className="flex-1 space-y-1.5 border-t p-4">
        <p className="text-[0.95rem] leading-relaxed">{caption}</p>
        <a
          href={plate.href}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono text-xs"
        >
          {plate.credit} · {plate.license} · {t.plates.source}
          <ExternalLink className="size-3" />
        </a>
      </figcaption>
    </figure>
  );
}
