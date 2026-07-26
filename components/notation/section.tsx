import InfoTip from "@/components/notation/info-tip";

/**
 * One movement-notation section: a numbered rule, the claim in plain
 * language, and whatever scores and plates belong to it. Every section on
 * the page is built the same way, so the rhythm never changes.
 */
export default function Section({
  id,
  index,
  eyebrow,
  title,
  lead,
  aside,
  info,
  infoTitle,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  lead: React.ReactNode;
  /** Sits beside the lead — usually a credited plate. */
  aside?: React.ReactNode;
  info?: React.ReactNode;
  infoTitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t py-14 first:border-t-0 lg:py-16">
      <div className="space-y-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-start">
          <div className="max-w-[60ch] space-y-4">
            <p className="text-muted-foreground flex items-baseline gap-2.5 font-mono text-[0.8rem] tracking-wide uppercase">
              <span className="text-brand">{index}</span>
              {eyebrow}
            </p>
            <h2 className="flex items-center gap-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
              {info ? (
                <InfoTip title={infoTitle ?? title} side="bottom" className="size-7 [&_svg]:size-5">
                  {info}
                </InfoTip>
              ) : null}
            </h2>
            <div className="prose-note space-y-3">{lead}</div>
          </div>
          {aside}
        </div>
        {children}
      </div>
    </section>
  );
}
