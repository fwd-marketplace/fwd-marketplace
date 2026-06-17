"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export type Option = { value: string; label: string };

export function FilterSelect({
  value,
  onChange,
  options,
  rounded = "full",
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  rounded?: "full" | "lg";
  ariaLabel?: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full cursor-pointer appearance-none bg-surface-sunken py-2.5 pl-4 pr-9 font-body text-sm font-medium text-ink outline-none transition-colors hover:bg-border/40 focus:ring-2 focus:ring-primary/40 ${
          rounded === "full" ? "rounded-full" : "rounded-lg"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
        aria-hidden="true"
      />
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onPage,
  shape = "square",
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  shape?: "square" | "round";
}) {
  const pages = Array.from({ length: Math.max(pageCount, 1) }, (_, index) => index + 1);
  const radius = shape === "square" ? "rounded-lg" : "rounded-full";

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Anterior"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className={`inline-flex size-10 items-center justify-center ${radius} text-ink-muted ring-1 ring-border transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      {pages.map((current) => (
        <button
          key={current}
          type="button"
          aria-current={current === page ? "page" : undefined}
          onClick={() => onPage(current)}
          className={`inline-flex size-10 items-center justify-center ${radius} font-body text-sm transition-colors ${
            current === page
              ? "bg-primary font-semibold text-white"
              : "text-ink-muted ring-1 ring-border hover:bg-surface-sunken"
          }`}
        >
          {current}
        </button>
      ))}
      <button
        type="button"
        aria-label="Siguiente"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
        className={`inline-flex size-10 items-center justify-center ${radius} text-ink-muted ring-1 ring-border transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function EmptyRow({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center font-body text-sm text-ink-muted">
      {message}
    </div>
  );
}
