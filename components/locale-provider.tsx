"use client";

import { createContext, useContext } from "react";
import { COPY, type Copy } from "@/lib/copy";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** Set once per page from the route segment, in the root layout. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Every string on the page, in the language of the current route. */
export function useCopy(): Copy {
  return COPY[useContext(LocaleContext)];
}
