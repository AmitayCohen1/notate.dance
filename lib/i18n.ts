/* ============================================================
   Locales. English lives at / and /studio (rewritten to /en
   internally); Hebrew at /he and /he/studio, right-to-left.
   ============================================================ */

export const LOCALES = ["en", "he"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}

export const DIR: Record<Locale, "ltr" | "rtl"> = { en: "ltr", he: "rtl" };

/** Native name of each locale, for the language switch. */
export const LOCALE_NAME: Record<Locale, string> = { en: "EN", he: "עב" };

/**
 * The public URL of a page in a given locale. English keeps the bare
 * paths it already had — /he is the only prefix that ever shows.
 */
export function localePath(locale: Locale, path: "/" | "/studio"): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? "/he" : `/he${path}`;
}

/** The same page in the other language, for the header switch. */
export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "he" : "en";
}
