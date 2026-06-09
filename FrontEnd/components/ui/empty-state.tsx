import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <GeometricIcon />
      <div className="space-y-1">
        <p className="font-heading text-base font-bold text-ink-strong">
          {title}
        </p>
        {description != null && (
          <p className="font-body text-sm text-ink-muted">{description}</p>
        )}
      </div>
      {action != null && <div>{action}</div>}
    </div>
  );
}

function GeometricIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="8"
        width="14"
        height="14"
        rx="2"
        className="fill-border-strong"
      />
      <rect
        x="26"
        y="8"
        width="14"
        height="14"
        rx="2"
        className="fill-border"
      />
      <rect
        x="8"
        y="26"
        width="14"
        height="14"
        rx="2"
        className="fill-border"
      />
      <rect
        x="26"
        y="26"
        width="14"
        height="14"
        rx="2"
        className="fill-surface-sunken"
      />
    </svg>
  );
}
