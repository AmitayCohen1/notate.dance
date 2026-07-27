import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Newsreader, Heebo, Frank_Ruhl_Libre } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/components/locale-provider";
import { COPY } from "@/lib/copy";
import { DIR, LOCALES, isLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import "../globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader" });

// Geist and Newsreader have no Hebrew glyphs, so the Hebrew page swaps in a
// grotesque and a serif doing the same two jobs.
const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo" });
const frankRuhl = Frank_Ruhl_Libre({ subsets: ["hebrew", "latin"], variable: "--font-frank-ruhl" });

const SITE = "https://notate-dance.vercel.app";
const NAME = { en: "Movement Languages", he: "שפות של תנועה" } as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = COPY[locale].meta;
  // English is served from the bare paths; /en resolves but is not canonical.
  const path = locale === "en" ? "/" : "/he";

  return {
    metadataBase: new URL(SITE),
    title: { default: t.title, template: `%s — ${NAME[locale]}` },
    description: t.description,
    applicationName: NAME[locale],
    authors: COPY[locale].about.people.map((person) => ({ name: person.name })),
    creator: COPY[locale].about.people.map((person) => person.name).join(", "),
    alternates: {
      canonical: path,
      languages: { en: "/", he: "/he", "x-default": "/" },
    },
    keywords:
      locale === "he"
        ? ["כתב תנועה", "לאבאנוטציה", "כתב בנש", "אשכול-ורכמן", "נועה אשכול", "כוריאוגרפיה", "מחול", "מרס קאנינגהם"]
        : [
            "dance notation",
            "Labanotation",
            "Benesh Movement Notation",
            "Eshkol-Wachman",
            "LifeForms",
            "DanceForms",
            "choreography",
            "Merce Cunningham",
          ],
    openGraph: {
      type: "website",
      siteName: NAME[locale],
      url: `${SITE}${path}`,
      locale: locale === "he" ? "he_IL" : "en_US",
      title: t.title,
      description: t.description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: t.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: ["/og.png"],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;

  return (
    <html
      lang={l}
      dir={DIR[l]}
      suppressHydrationWarning
      className={cn(geist.variable, geistMono.variable, newsreader.variable, heebo.variable, frankRuhl.variable)}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LocaleProvider locale={l}>
            <TooltipProvider delay={200}>{children}</TooltipProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
