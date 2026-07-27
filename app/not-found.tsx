import Link from "next/link";
import "./globals.css";

/**
 * The 404 for anything outside a locale segment. It renders its own
 * document because the root layout above it is a pass-through.
 */
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-muted-foreground font-mono text-[0.78rem] tracking-[0.16em] uppercase">404</p>
          <h1 className="text-[2rem] font-semibold tracking-tight">This page has no notation.</h1>
          <div className="text-muted-foreground flex gap-4 text-[1rem]">
            <Link href="/" className="hover:text-foreground underline underline-offset-4">
              Movement Languages
            </Link>
            <Link href="/he" className="hover:text-foreground underline underline-offset-4">
              שפות של תנועה
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
