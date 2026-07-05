"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck, BookOpenCheck, ArrowLeftRight, Handshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StarDecoration } from "@/components/home/StarDecoration";

interface DiferItem {
  key: "0" | "1" | "2" | "3";
  Icon: LucideIcon;
  topBorder: string;
  color: string;
  iconBg: string;
}

const DIFER_ITEMS: DiferItem[] = [
  { key: "0", Icon: BadgeCheck,     topBorder: "border-t-highlight", color: "text-highlight", iconBg: "bg-highlight/10" },
  { key: "1", Icon: BookOpenCheck,  topBorder: "border-t-magenta",   color: "text-magenta",   iconBg: "bg-magenta/10"   },
  { key: "2", Icon: ArrowLeftRight, topBorder: "border-t-accent",    color: "text-accent",    iconBg: "bg-accent/10"    },
  { key: "3", Icon: Handshake,      topBorder: "border-t-warning",   color: "text-warning",   iconBg: "bg-warning/10"   },
];

const STARS = [
  { x: "3%",  y: "12%", size: 13, opacity: 0.55, rotate: 0   },
  { x: "94%", y: "8%",  size: 17, opacity: 0.5,  rotate: 20  },
  { x: "1%",  y: "72%", size: 11, opacity: 0.45, rotate: 15  },
  { x: "97%", y: "60%", size: 15, opacity: 0.52, rotate: -10 },
  { x: "48%", y: "4%",  size: 9,  opacity: 0.4,  rotate: 45  },
  { x: "78%", y: "90%", size: 13, opacity: 0.48, rotate: 30  },
  { x: "18%", y: "93%", size: 10, opacity: 0.42, rotate: -15 },
];

type Phase = "idle" | "title" | "cards";

export default function DiferenciadoresSection() {
  const t = useTranslations("diferenciadores");

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
          for (let i = 1; i <= 4; i++) {
            setTimeout(() => setVisible(i), i * 220);
          }
        }, 700);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showTitle = phase !== "idle";
  const showCards = phase === "cards";

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-surface pb-16 pt-28">
      <StarDecoration stars={STARS} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        {/* Header */}
        <div
          className="mb-14 text-center"
          style={{ opacity: showTitle ? 1 : 0, transition: "opacity 600ms ease-in-out" }}
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-secondary">
            {t("eyebrow")}
          </p>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong md:text-5xl">
            {t("title")}<span className="text-secondary">.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted">
            {t("description")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DIFER_ITEMS.map(({ key, Icon, topBorder, color, iconBg }, i) => {
            const visible = showCards && visibleCards > i;
            return (
              <div
                key={key}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(24px)",
                  transition: "opacity 500ms ease-out, transform 500ms ease-out",
                }}
                className={`rounded-2xl border-t-4 ${topBorder} bg-canvas p-6 shadow-sm ring-1 ring-border`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className={`font-heading text-2xl font-extrabold leading-tight tracking-tight ${color}`}>
                    {t(`items.${key}.title`)}
                  </h3>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${color}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {t(`items.${key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
