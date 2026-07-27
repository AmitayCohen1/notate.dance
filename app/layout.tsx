/**
 * A pass-through root. The real root layout — the one that renders
 * <html lang dir>, the fonts and the providers — is app/[locale]/layout.tsx,
 * because <html lang> depends on the route. Next still needs a layout at the
 * top of app/ for routes outside the [locale] segment (the global 404).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
