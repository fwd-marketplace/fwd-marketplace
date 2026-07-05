"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  BookOpenCheck,
  ArrowLeftRight,
  Handshake,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Diferenciadores ────────────────────────────────────────────────────────
interface DiferItem {
  key: "0" | "1" | "2" | "3";
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  leftBorder: string;
}

const DIFER_ITEMS: DiferItem[] = [
  { key: "0", Icon: BadgeCheck,     iconBg: "bg-primary/10",   iconColor: "text-primary",   leftBorder: "border-l-primary"   },
  { key: "1", Icon: BookOpenCheck,  iconBg: "bg-secondary/10", iconColor: "text-secondary", leftBorder: "border-l-secondary" },
  { key: "2", Icon: ArrowLeftRight, iconBg: "bg-accent/10",    iconColor: "text-accent",    leftBorder: "border-l-accent"    },
  { key: "3", Icon: Handshake,      iconBg: "bg-warning/10",   iconColor: "text-warning",   leftBorder: "border-l-warning"   },
];

// ── FAQ ────────────────────────────────────────────────────────────────────
type FaqKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";
const FAQ_KEYS: FaqKey[] = ["0", "1", "2", "3", "4", "5", "6", "7"];

const FAQ_PALETTE = [
  { numberClass: "bg-primary/10 text-primary",     borderClass: "border-l-primary"   },
  { numberClass: "bg-secondary/10 text-secondary", borderClass: "border-l-secondary" },
  { numberClass: "bg-accent/10 text-accent",       borderClass: "border-l-accent"    },
  { numberClass: "bg-warning/10 text-warning",     borderClass: "border-l-warning"   },
  { numberClass: "bg-magenta/10 text-magenta",     borderClass: "border-l-magenta"   },
];
const FAQ_DEFAULT_COLOR = {
  numberClass: "bg-primary/10 text-primary",
  borderClass: "border-l-primary",
};

// ── Timings (ms) ───────────────────────────────────────────────────────────
const T_TITLE_DURATION  = 700;   // title fade-in
const T_CARDS_START     = 1200;  // delay before first card appears
const T_CARD_STAGGER    = 380;   // gap between each card
const T_FAQ_DELAY       = 700;   // extra wait after last card before FAQ column appears
const T_GRID_TRANSITION = 800;   // grid column resize duration
const T_CARD_ANIM       = 600;   // individual card fade+slide duration
const T_FAQ_ANIM        = 700;   // FAQ column fade+slide duration
const T_FAQ_TITLE_HOLD  = 600;   // how long FAQ title stays centered before items start
const T_FAQ_STAGGER     = 280;   // gap between each FAQ item

// ── Component ──────────────────────────────────────────────────────────────
type Phase = "idle" | "title" | "cards" | "faq-title" | "faq-items";

export default function DiferenciadoresFaqSection() {
  const td = useTranslations("diferenciadores");
  const tf = useTranslations("faq");

  const [phase, setPhase]           = useState<Phase>("idle");
  const [visibleCards, setVisible]  = useState(0);
  const [visibleFaq, setVisibleFaq] = useState(0);
  const [openFaq, setOpenFaq]       = useState<number | null>(null);
  const sectionRef                  = useRef<HTMLElement>(null);
  const startedRef                  = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || startedRef.current) return;
        startedRef.current = true;

        // Left column: title appears
        setPhase("title");

        // Left column: cards appear one by one
        setTimeout(() => {
          setPhase("cards");
          for (let i = 1; i <= 4; i++) {
            setTimeout(() => setVisible(i), i * T_CARD_STAGGER);
          }
        }, T_CARDS_START);

        // Right column: column slides in, FAQ title centered
        const faqColumnAt = T_CARDS_START + 4 * T_CARD_STAGGER + T_FAQ_DELAY;
        setTimeout(() => setPhase("faq-title"), faqColumnAt);

        // Right column: FAQ title moves left, items appear one by one
        const faqItemsAt = faqColumnAt + T_FAQ_TITLE_HOLD;
        setTimeout(() => {
          setPhase("faq-items");
          for (let i = 1; i <= 8; i++) {
            setTimeout(() => setVisibleFaq(i), i * T_FAQ_STAGGER);
          }
        }, faqItemsAt);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showLeftTitle  = phase !== "idle";
  const showCards      = phase === "cards" || phase === "faq-title" || phase === "faq-items";
  const showFaqColumn  = phase === "faq-title" || phase === "faq-items";
  const showFaqTitle   = showFaqColumn;
  const faqTitleCenter = phase === "faq-title"; // centered only during the hold phase
  const showFaqItems   = phase === "faq-items";

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-surface py-32"
    >
      <div className="mx-auto max-w-6xl px-8 md:px-14 lg:px-20">
        {/* Two-column grid — animates between 1fr 0fr ↔ 1fr 1fr */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: showFaqColumn ? "1fr 1fr" : "1fr 0fr",
            gap: showFaqColumn ? "5rem" : "0",
            transition: `grid-template-columns ${T_GRID_TRANSITION}ms ease-in-out, gap ${T_GRID_TRANSITION}ms ease-in-out`,
            alignItems: "start",
          }}
        >
          {/* ── LEFT: diferenciadores ─────────────────────────────────── */}
          <div className="flex min-w-0 flex-col">
            {/* Header — centered until FAQ column appears, then left-aligned */}
            <div
              className="mb-12"
              style={{
                opacity: showLeftTitle ? 1 : 0,
                textAlign: showFaqColumn ? "left" : "center",
                transition: `opacity ${T_TITLE_DURATION}ms ease-in-out`,
              }}
            >
              <p className="mb-3 text-sm font-bold uppercase tracking-wider text-secondary">
                {td("eyebrow")}
              </p>
              <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong md:text-5xl">
                {td("title")}<span className="text-secondary">.</span>
              </h2>
              <p
                className="mt-4 text-lg text-ink-muted"
                style={{
                  maxWidth: showFaqColumn ? "none" : "42rem",
                  margin: showFaqColumn ? "1rem 0 0" : "1rem auto 0",
                  transition: `max-width ${T_GRID_TRANSITION}ms ease-in-out`,
                }}
              >
                {td("description")}
              </p>
            </div>

            {/* Cards — each slides up + fades in with stagger */}
            <div className="flex flex-1 flex-col justify-between gap-5">
              {DIFER_ITEMS.map(({ key, Icon, iconBg, iconColor, leftBorder }, i) => {
                const visible = showCards && visibleCards > i;
                return (
                  <div
                    key={key}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(20px)",
                      transition: `opacity ${T_CARD_ANIM}ms ease-out, transform ${T_CARD_ANIM}ms ease-out`,
                    }}
                    className={`flex flex-col gap-4 rounded-2xl border-l-4 ${leftBorder} bg-canvas p-6 shadow-sm`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
                      aria-hidden="true"
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-lg font-bold tracking-tight text-ink-strong">
                      {td(`items.${key}.title`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {td(`items.${key}.desc`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: FAQ ────────────────────────────────────────────── */}
          <div
            className="flex min-w-0 flex-col overflow-hidden"
            style={{
              opacity: showFaqColumn ? 1 : 0,
              transform: showFaqColumn ? "translateX(0)" : "translateX(32px)",
              transition: `opacity ${T_FAQ_ANIM}ms 200ms ease-out, transform ${T_FAQ_ANIM}ms 200ms ease-out`,
            }}
          >
            {/* FAQ header — starts centered, then moves left when items appear */}
            <div
              className="mb-10"
              style={{
                opacity: showFaqTitle ? 1 : 0,
                textAlign: faqTitleCenter ? "center" : "left",
                transition: `opacity ${T_TITLE_DURATION}ms ease-in-out`,
              }}
            >
              <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                {tf("eyebrow")}
              </p>
              <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong md:text-5xl">
                {tf("title")}<span className="text-primary">.</span>
              </h2>
            </div>

            {/* FAQ items — appear one by one with stagger */}
            <ul className="flex flex-1 flex-col gap-2">
              {FAQ_KEYS.map((key, i) => {
                const isOpen  = openFaq === i;
                const visible = showFaqItems && visibleFaq > i;
                const color   = FAQ_PALETTE[i % FAQ_PALETTE.length] ?? FAQ_DEFAULT_COLOR;
                return (
                  <li
                    key={key}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(16px)",
                      transition: `opacity ${T_CARD_ANIM}ms ease-out, transform ${T_CARD_ANIM}ms ease-out`,
                    }}
                  >
                    <div
                      className={`overflow-hidden rounded-2xl border-l-4 bg-canvas ring-1 ring-border transition-colors duration-[var(--duration-fast)] ${
                        isOpen ? color.borderClass : "border-l-transparent"
                      }`}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="flex w-full items-center gap-3 px-6 py-4 text-left"
                      >
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${color.numberClass}`}
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-ink-strong">
                          {tf(`items.${key}.q`)}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 flex-shrink-0 text-ink-muted transition-transform duration-[var(--duration-fast)] ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pl-14 text-sm leading-relaxed text-ink-muted">
                          {tf(`items.${key}.a`)}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
