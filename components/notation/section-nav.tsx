"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A slim sticky index of the page's sections. It replaces tabs: every
 * section is on the page and readable in order, and this only helps you
 * jump — and tells you where you are.
 */
export default function SectionNav({
  sections,
  children,
}: {
  sections: { id: string; label: string }[];
  /** Controls that genuinely apply to every section below. */
  children?: React.ReactNode;
}) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      // a band just under the sticky chrome, so "current" means "being read"
      { rootMargin: "-160px 0px -55% 0px", threshold: 0 },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [sections]);

  return (
    <div className="bg-background/85 sticky top-16 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-6 py-2.5">
        <nav className="score-scroll flex min-w-0 items-center gap-1" aria-label="Sections">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-[0.9rem] font-medium whitespace-nowrap transition-colors",
                active === s.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="flex-1" />
        {children}
      </div>
    </div>
  );
}
