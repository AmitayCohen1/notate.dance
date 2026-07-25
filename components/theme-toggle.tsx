"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // before mount there is no known theme — keep the markup stable for hydration
  const dark = mounted && resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={mounted ? (dark ? "Switch to light theme" : "Switch to dark theme") : "Switch theme"}
            onClick={() => setTheme(dark ? "light" : "dark")}
          >
            {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </Button>
        }
      />
      <TooltipContent>{dark ? "Light" : "Dark"}</TooltipContent>
    </Tooltip>
  );
}
