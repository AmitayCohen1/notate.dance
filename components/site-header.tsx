"use client";

import Link from "next/link";
import { Languages, Shapes, Theater, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCopy, useLocale } from "@/components/locale-provider";
import { localePath, otherLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Sticky site chrome: identity on the left, the two pages as a
 * segmented control, About, the language switch, theme toggle and any
 * page-specific controls passed as children on the right.
 */
export default function SiteHeader({
  current,
  children,
}: {
  current: "params" | "studio";
  children?: React.ReactNode;
}) {
  const t = useCopy();
  const locale = useLocale();
  const other = otherLocale(locale);

  const pages = [
    { href: localePath(locale, "/"), key: "params", label: t.header.params, Icon: Shapes },
    { href: localePath(locale, "/studio"), key: "studio", label: t.header.studio, Icon: Theater },
  ] as const;

  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5">
        <Link href={localePath(locale, "/")} className="group flex items-center gap-2.5">
          <span className="bg-foreground text-background flex size-7 items-center justify-center rounded-[5px] text-[13px] leading-none">
            ◆
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight sm:block">{t.header.brand}</span>
        </Link>

        <nav className="bg-muted/70 ms-1 flex items-center gap-1 rounded-lg p-1">
          {pages.map(({ href, key, label, Icon }) => {
            const here = key === current;
            return (
              <Link
                key={key}
                href={href}
                aria-current={here ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-[14px] font-medium transition-colors",
                  here ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
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
          href={`${localePath(locale, "/")}#about`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-1 text-[14px] font-medium transition-colors"
        >
          <UserRound className="size-4" />
          {t.header.about}
        </Link>

        {/* Same page, other language. */}
        <Link
          href={localePath(other, current === "studio" ? "/studio" : "/")}
          hrefLang={other}
          title={t.header.switchTitle}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-1 text-[14px] font-medium transition-colors"
        >
          <Languages className="size-4" />
          {t.header.switchLabel}
        </Link>

        {children}
        <ThemeToggle />
      </div>
    </header>
  );
}
