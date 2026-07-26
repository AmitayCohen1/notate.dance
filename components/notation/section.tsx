import InfoTip from "@/components/notation/info-tip";
import { cn } from "@/lib/utils";

/**
 * One section of the page, always built the same way:
 *
 *   ── 01 ── EYEBROW ──────────────────────────────
 *   Big title
 *   Big subtitle                    │  a credited plate
 *   what this system counts          │
 *   ───────────────────────────────────────────────
 *   the scores, full width
 *
 * Alternating bands and a numbered rule keep the boundaries obvious;
 * putting the parameter chips beside the plate keeps the header from
 * leaving a hole when the subtitle is short.
 */
export default function Section({
  id,
  index,
  eyebrow,
  title,
  lead,
  chips,
  aside,
  info,
  infoTitle,
  tinted = false,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  lead: React.ReactNode;
  /** "What this system treats as a parameter" — sits under the subtitle. */
  chips?: React.ReactNode;
  /** Usually a credited plate, beside the header. */
  aside?: React.ReactNode;
  info?: React.ReactNode;
  infoTitle?: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 border-t py-16 lg:py-20", tinted && "bg-muted/30")}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        {/* ---- the rule that names the section ---- */}
        <div className="mb-8 flex items-center gap-4">
          <span className="text-brand font-mono text-[1.05rem] leading-none tabular-nums">{index}</span>
          <span className="text-muted-foreground font-mono text-[0.78rem] tracking-[0.16em] whitespace-nowrap uppercase">
            {eyebrow}
          </span>
          <span className="bg-border h-px flex-1" />
        </div>

        {/* ---- header: title + subtitle + chips, with the plate beside it ---- */}
        <div className="grid gap-10 lg:grid-cols-[1fr_330px] lg:items-start lg:gap-14">
          <div className="space-y-6">
            <h2 className="flex max-w-[26ch] items-start gap-2 text-[2.35rem] leading-[1.04] font-semibold tracking-tight sm:text-[3rem]">
              <span className="text-balance">{title}</span>
              {info ? (
                <InfoTip
                  title={infoTitle ?? title}
                  side="bottom"
                  className="mt-2.5 size-7 shrink-0 [&_svg]:size-5"
                >
                  {info}
                </InfoTip>
              ) : null}
            </h2>
            <div className="prose-note max-w-[56ch] space-y-3 text-[1.28rem] leading-[1.55]">{lead}</div>
            {chips}
          </div>
          {aside}
        </div>

        {/* ---- the scores ---- */}
        <div className="mt-12 space-y-6">{children}</div>
      </div>
    </section>
  );
}
