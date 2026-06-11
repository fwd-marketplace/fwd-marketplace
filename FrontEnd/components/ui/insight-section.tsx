import type { ReactNode } from "react";

interface InsightSectionProps {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function InsightSection({
  title,
  eyebrow,
  description,
  action,
  children,
}: InsightSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] md:p-6">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div className="min-w-0">
          {eyebrow != null && (
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              {eyebrow}
            </p>
          )}
          <h3 className="font-heading mt-1 text-lg font-extrabold tracking-tight text-ink-strong">
            {title}
          </h3>
          {description != null && (
            <p className="font-body mt-1 text-sm text-ink-muted">{description}</p>
          )}
        </div>
        {action != null && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  );
}
