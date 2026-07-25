import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * The standard container for a score, diagram or canvas: titled header
 * with an icon, a body that scrolls sideways on its own, and an optional
 * "how to read it" footnote.
 */
export default function ScoreCard({
  icon: Icon,
  title,
  hint,
  children,
  footnote,
  scroll = true,
  padded = false,
  center = false,
  className,
  bodyClassName,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  footnote?: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Centre a score narrower than the card instead of pinning it left. */
  center?: boolean;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="gap-1 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-[1.05rem]">
          {Icon ? <Icon className="text-brand size-[18px]" /> : null}
          {title}
        </CardTitle>
        {hint ? <CardDescription className="text-[0.95rem]">{hint}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn("px-0 pb-0", padded && "px-5")}>
        <div className={cn(scroll && "score-scroll", padded && "pb-5", center && "flex justify-center", bodyClassName)}>
          {children}
        </div>
        {footnote ? (
          <p className="text-muted-foreground border-t px-5 py-4 text-[0.95rem] leading-relaxed">{footnote}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
