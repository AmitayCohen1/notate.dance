import type { Metadata } from "next";
import StudioApp from "@/components/studio/StudioApp";
import { COPY } from "@/lib/copy";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = COPY[locale].meta;
  return {
    title: t.studioTitle,
    description: t.studioDescription,
    alternates: {
      canonical: locale === "en" ? "/studio" : "/he/studio",
      languages: { en: "/studio", he: "/he/studio", "x-default": "/studio" },
    },
  };
}

export default function Page() {
  return <StudioApp />;
}
