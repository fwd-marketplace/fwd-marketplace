"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
  numberClass: string;
  borderClass: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <li
            key={i}
            className={`overflow-hidden rounded-2xl border-l-4 bg-surface transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
              isOpen ? item.borderClass : "border-l-transparent"
            } ring-1 ring-border`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(i)}
              className="flex w-full items-center gap-4 px-6 py-5 text-left"
            >
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.numberClass}`}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="flex-1 font-semibold text-ink-strong">{item.q}</span>
              <ChevronDown
                className={`h-5 w-5 flex-shrink-0 text-ink-muted transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pl-[4.25rem] text-sm leading-relaxed text-ink-muted">
                {item.a}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
