import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: "Movement Languages",
  description:
    "One movement phrase, written simultaneously in Labanotation, Benesh, Eshkol-Wachman, and as a LifeForms keyframe timeline.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(geist.variable, geistMono.variable, newsreader.variable)}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <TooltipProvider delay={200}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
