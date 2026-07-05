"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { StarDecoration } from "@/components/home/StarDecoration";

type FaqKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";
const FAQ_KEYS: FaqKey[] = ["0", "1", "2", "3", "4", "5", "6", "7"];

const FAQ_CARDS = [
  { topBorder: "border-t-primary",   numberColor: "text-primary"   },
  { topBorder: "border-t-secondary", numberColor: "text-secondary" },
  { topBorder: "border-t-accent",    numberColor: "text-accent"    },
  { topBorder: "border-t-highlight", numberColor: "text-highlight" },
  { topBorder: "border-t-warning",   numberColor: "text-warning"   },
  { topBorder: "border-t-magenta",   numberColor: "text-magenta"   },
  { topBorder: "border-t-primary",   numberColor: "text-primary"   },
  { topBorder: "border-t-secondary", numberColor: "text-secondary" },
];
const FAQ_DEFAULT = { topBorder: "border-t-primary", numberColor: "text-primary" };

const STARS = [
  { x: "2%",  y: "6%",  size: 14, opacity: 0.25, rotate: 10  },
  { x: "96%", y: "10%", size: 10, opacity: 0.2,  rotate: -20 },
  { x: "1%",  y: "55%", size: 16, opacity: 0.22, rotate: 0   },
  { x: "97%", y: "50%", size: 12, opacity: 0.2,  rotate: 35  },
  { x: "55%", y: "2%",  size: 9,  opacity: 0.18, rotate: 45  },
  { x: "90%", y: "88%", size: 14, opacity: 0.22, rotate: -10 },
  { x: "12%", y: "92%", size: 10, opacity: 0.18, rotate: 20  },
  { x: "40%", y: "97%", size: 8,  opacity: 0.15, rotate: 0   },
];

type Phase = "idle" | "title" | "cards";

export default function FaqSection() {
  const t = useTranslations("faq");

  const [phase, setPhase]          = useState<Phase>("idle");
  const [visibleItems, setVisible] = useState(0);
  const [openIndex, setOpenIndex]  = useState<number | null>(null);
  const sectionRef                 = useRef<HTMLElement>(null);
  const startedRef                 = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        setPhase("title");
        setTimeout(() => {
          setPhase("cards");
          for (let i = 1; i <= 8; i++) {
            setTimeout(() => setVisible(i), i * 180);
          }
        }, 700);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showTitle = phase !== "idle";
  const showCards = phase === "cards";

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-canvas pb-28 pt-16">
      <StarDecoration stars={STARS} />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        {/* Header — centered */}
        <div
          className="mb-14 text-center"
          style={{
            opacity: showTitle ? 1 : 0,
            transition: "opacity 600ms ease-in-out",
          }}
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong md:text-5xl">
            {t("title")}<span className="text-primary">.</span>
          </h2>
        </div>

        {/* Cards grid — 2 columns, accordion */}
        <div className="grid gap-4 sm:grid-cols-2">
          {FAQ_KEYS.map((key, i) => {
            const visible = showCards && visibleItems > i;
            const card    = FAQ_CARDS[i] ?? FAQ_DEFAULT;
            const isOpen  = openIndex === i;
            const num     = String(i + 1).padStart(2, "0");
            return (
              <div
                key={key}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(24px)",
                  transition: "opacity 500ms ease-out, transform 500ms ease-out",
                }}
                className={`rounded-2xl border-t-4 ${card.topBorder} bg-surface ring-1 ring-border`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-start gap-4 p-6 text-left"
                >
                  <span
                    className={`shrink-0 font-heading text-3xl font-extrabold leading-none ${card.numberColor}`}
                    aria-hidden="true"
                  >
                    {num}
                  </span>
                  <span className="flex-1 pt-1 font-heading text-base font-bold tracking-tight text-ink-strong">
                    {t(`items.${key}.q`)}
                  </span>
                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-ink-muted transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm leading-relaxed text-ink-muted">
                    {t(`items.${key}.a`)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
