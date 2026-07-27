"use client";

import { Boxes, PersonStanding } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Mode } from "@/components/parameters/model";
import { useCopy } from "@/components/locale-provider";

/**
 * The page's central control: read every notation as a body, or strip the
 * body out and read the numbers underneath.
 */
export default function ModeSwitch({
  mode,
  onChange,
  className,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  className?: string;
}) {
  const t = useCopy();
  return (
    <ToggleGroup
      value={[mode]}
      onValueChange={(v) => {
        const next = v[0] as Mode | undefined;
        if (next) onChange(next);
      }}
      variant="outline"
      spacing={0}
      aria-label={t.mode.label}
      className={className}
    >
      <ToggleGroupItem value="embodied" className="gap-2 px-3" title={t.mode.bodyTitle}>
        <PersonStanding className="size-4" />
        {t.mode.body}
      </ToggleGroupItem>
      <ToggleGroupItem value="abstract" className="gap-2 px-3" title={t.mode.numbersTitle}>
        <Boxes className="size-4" />
        {t.mode.numbers}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
