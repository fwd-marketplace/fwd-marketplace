"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Clock, Wallet, Wifi } from "lucide-react";
import { ScrollToSection } from "@/components/home/ScrollToSection";
import { StarDecoration } from "@/components/home/StarDecoration";

const STARS = [
  { x: "2%",  y: "10%", size: 13, opacity: 0.25, rotate: 15  },
  { x: "95%", y: "7%",  size: 10, opacity: 0.2,  rotate: -5  },
  { x: "1%",  y: "65%", size: 16, opacity: 0.2,  rotate: 0   },
  { x: "97%", y: "70%", size: 11, opacity: 0.22, rotate: 30  },
  { x: "60%", y: "3%",  size: 8,  opacity: 0.18, rotate: 45  },
  { x: "25%", y: "94%", size: 12, opacity: 0.2,  rotate: -20 },
  { x: "80%", y: "92%", size: 9,  opacity: 0.18, rotate: 10  },
];

const PROJECT_CARDS = [
  {
    key: "0" as const,
    topBorder: "border-t-accent",
    badgeClass: "bg-accent/10 text-accent",
    stackClass: "text-accent",
  },
  {
    key: "1" as const,
    topBorder: "border-t-highlight",
    badgeClass: "bg-highlight/10 text-highlight",
    stackClass: "text-highlight",
  },
  {
    key: "2" as const,
    topBorder: "border-t-magenta",
    badgeClass: "bg-magenta/10 text-magenta",
    stackClass: "text-magenta",
  },
];

type Phase = "idle" | "title" | "cards";

export default function MarketplacePreviewSection() {
  const t = useTranslations("marketplace_preview");

  const [phase, setPhase]          = useState<Phase>("idle");
  const [visibleCards, setVisible] = useState(0);
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
          for (let i = 1; i <= 3; i++) {
            setTimeout(() => setVisible(i), i * 250);
          }
        }, 600);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showTitle = phase !== "idle";
  const showCards = phase === "cards";

  return (
    <section
      id="marketplace-preview"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-canvas to-accent/5 py-24"
    >
      <StarDecoration stars={STARS} />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        {/* Header */}
        <div
          className="mb-14 text-center"
          style={{
            opacity: showTitle ? 1 : 0,
            transition: "opacity 600ms ease-in-out",
          }}
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-magenta">
            {t("eyebrow")}
          </p>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong md:text-5xl">
            {t("title")}<span className="text-primary">.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted">
            {t("description")}
          </p>
        </div>

        {/* Project cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECT_CARDS.map(({ key, topBorder, badgeClass, stackClass }, i) => {
            const visible = showCards && visibleCards > i;
            return (
              <article
                key={key}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(28px)",
                  transition: "opacity 500ms ease-out, transform 500ms ease-out",
                }}
                className={`group flex flex-col rounded-2xl border-t-4 ${topBorder} bg-surface shadow-sm ring-1 ring-border`}
              >
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${badgeClass}`}>
                      {t("new_badge")}
                    </span>
                    <span className="text-xs font-medium text-ink-muted">{t(`projects.${key}.company`)}</span>
                  </div>
                  <h3 className="mb-2 font-heading text-xl font-bold leading-snug tracking-tight text-ink-strong">
                    {t(`projects.${key}.title`)}
                  </h3>
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-ink-muted">
                    {t(`projects.${key}.desc`)}
                  </p>
                  <p className={`mb-5 text-xs font-semibold ${stackClass}`}>
                    {t(`projects.${key}.stack`)}
                  </p>
                  <div className="flex flex-wrap gap-3 border-t border-border pt-4 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {t(`projects.${key}.duration`)}&nbsp;{t("weeks")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wallet className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      {t(`projects.${key}.budget`)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wifi className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
                      {t("remote")}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div
          className="mt-12 flex flex-col items-center gap-3"
          style={{
            opacity: showCards && visibleCards >= 3 ? 1 : 0,
            transition: "opacity 500ms 200ms ease-out",
          }}
        >
          <p className="text-sm font-semibold text-ink-muted">{t("cta_hint")}</p>
          <ScrollToSection
            targetId="como-funciona"
            label={t("cta")}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-secondary px-8 font-semibold text-white transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:opacity-90"
            iconRight={<ChevronDown className="h-5 w-5" aria-hidden="true" />}
          />
        </div>
      </div>
    </section>
  );
}
