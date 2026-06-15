import type { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
}

export function PageTitle({
  title,
  eyebrow,
  description,
  action,
}: PageTitleProps) {
  return (
    <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 space-y-1.5">
        {eyebrow != null && (
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink-strong md:text-4xl">
          {title}
          <span className="text-primary" aria-hidden="true">
            .
          </span>
        </h1>
        {description != null && (
          <p className="font-body max-w-prose text-ink-muted">{description}</p>
        )}
      </div>
      {action != null && <div className="shrink-0">{action}</div>}
    </header>
  );
}
