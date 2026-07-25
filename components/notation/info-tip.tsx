"use client";

import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * The site's one way of going deeper. Plain language stays on the page;
 * the history, the exceptions and the vocabulary live in here.
 */
export default function InfoTip({
  title,
  children,
  label = "More about this",
  className,
  side = "top",
}: {
  title: string;
  children: React.ReactNode;
  label?: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            className={cn("text-muted-foreground hover:text-foreground align-middle", className)}
          >
            <HelpCircle className="size-4" />
          </Button>
        }
      />
      <PopoverContent side={side} className="w-[min(22rem,calc(100vw-2rem))] space-y-2 p-4">
        <p className="text-[0.95rem] font-semibold">{title}</p>
        <div className="text-muted-foreground space-y-2 text-[0.92rem] leading-relaxed">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

/** An inline term with its explanation one click away. */
export function Term({ children, title, info }: { children: React.ReactNode; title: string; info: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      <span className="decoration-muted-foreground/50 underline decoration-dotted underline-offset-[3px]">
        {children}
      </span>
      <InfoTip title={title} className="ml-0.5 -translate-y-px">
        {info}
      </InfoTip>
    </span>
  );
}
