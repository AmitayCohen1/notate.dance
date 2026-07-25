import { Badge } from "@/components/ui/badge";
import type { ChipSet, Mode } from "@/components/parameters/model";
import { cn } from "@/lib/utils";

/**
 * "What this language treats as a parameter." One badge per parameter,
 * flipping its wording between the embodied and abstracted readings.
 */
export default function ParamBadges({ set, mode }: { set: ChipSet; mode: Mode }) {
  const abs = mode === "abstract";
  return (
    <div className="flex flex-wrap gap-2">
      {set.map((row) => (
        <Badge
          key={row.key}
          variant="outline"
          className={cn(
            "h-auto gap-2 rounded-md px-2.5 py-1.5 text-[0.9rem] font-normal",
            abs && "border-brand/45 bg-brand/[0.07]",
          )}
        >
          <span className={cn("font-medium", abs ? "text-brand" : "text-foreground")}>{row.key}</span>
          <span className="text-muted-foreground font-mono text-[0.82rem]">{abs ? row.abs : row.body}</span>
        </Badge>
      ))}
    </div>
  );
}
