"use client";

import Link from "next/link";
import { Shapes, Theater, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const PAGES = [
  { href: "/", key: "params", label: "Parameters", Icon: Shapes },
  { href: "/studio", key: "studio", label: "Studio", Icon: Theater },
] as const;

/**
 * Sticky site chrome: identity on the left, the two pages as a
 * segmented control, theme toggle and any page-specific controls
 * passed as children on the right.
 */
export default function SiteHeader({
  current,
  children,
}: {
  current: "params" | "studio";
  children?: React.ReactNode;
}) {
  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="bg-foreground text-background flex size-7 items-center justify-center rounded-[5px] text-[13px] leading-none">
            ◆
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight sm:block">Movement Languages</span>
        </Link>

        <nav className="bg-muted/70 ml-1 flex items-center gap-1 rounded-lg p-1">
          {PAGES.map(({ href, key, label, Icon }) => {
            const here = key === current;
            return (
              <Link
                key={key}
                href={href}
                aria-current={here ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-[14px] font-medium transition-colors",
                  here
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* A destination, not one of the two modes — so it stays out of the pill. */}
        <Link
          href="/#about"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-1 text-[14px] font-medium transition-colors"
        >
          <UserRound className="size-4" />
          About
        </Link>

        {children}
        <ThemeToggle />
      </div>
    </header>
  );
}
