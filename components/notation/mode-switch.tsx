"use client";

import { Boxes, PersonStanding } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Mode } from "@/components/parameters/model";

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
  return (
    <ToggleGroup
      value={[mode]}
      onValueChange={(v) => {
        const next = v[0] as Mode | undefined;
        if (next) onChange(next);
      }}
      variant="outline"
      spacing={0}
      aria-label="Representation mode"
      className={className}
    >
      <ToggleGroupItem value="embodied" className="gap-2 px-3" title="Show the body">
        <PersonStanding className="size-4" />
        Body
      </ToggleGroupItem>
      <ToggleGroupItem value="abstract" className="gap-2 px-3" title="Show the numbers behind it">
        <Boxes className="size-4" />
        Numbers
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
