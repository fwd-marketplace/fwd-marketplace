"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Lock, ExternalLink, BookOpen, HelpCircle, Play } from "lucide-react";
import type { Star, Constellation } from "../data/types";
import { QUIZ_DATA, RESOURCES_DATA } from "../data/quiz";
import { starPolygon } from "../utils";

const PIP_POINTS = starPolygon(5, 48, 20);

interface DetailPanelProps {
  star: Star;
  area: Constellation;
  onClose: () => void;
  onLight: (id: string) => void;
  onMastery: (id: string) => void;
  onStage3Complete: () => void;
}

type Tab = "info" | "quiz";

/** Forma del contenido explicativo por estrella en messages (viaje.contenido.<id>). */
interface ContentBlock {
  titulo: string;
  cuerpo: string;
}
interface StarContent {
  intro: string;
  bloques: ContentBlock[];
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function InfoTab({ starId, area }: { starId: string; area: Constellation }) {
  const t = useTranslations("viaje");
  const all = RESOURCES_DATA[starId] ?? [];
  const webResources = all.filter((r) => r.kind === "web");
  const videoResources = all.filter((r) => r.kind === "video");

  // El contenido lo redacta el asistente de aprendizaje y vive en i18n (es/en).
  // Si una estrella todavía no lo tuviera, se cae al placeholder original.
  const contentKey = `contenido.${starId}`;
  const content = t.has(contentKey) ? (t.raw(contentKey) as StarContent) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* contenido explicativo */}
      {content ? (
        <div
          className="px-4 py-[14px] rounded-[14px] border"
          style={{ borderColor: "var(--border)", background: "var(--surface-sunken)" }}
        >
          <span
            className="block font-heading font-bold text-[10px] tracking-[0.14em] uppercase mb-[10px]"
            style={{ color: "var(--ink-subtle)" }}
          >
            {t("tab_info_content_eyebrow")}
          </span>
          <p className="font-body text-[13.5px] leading-[1.55] m-0" style={{ color: "var(--ink)" }}>
            {content.intro}
          </p>
          <div className="flex flex-col gap-[14px] mt-[14px]">
            {content.bloques.map((bloque, i) => (
              <div key={i}>
                <span
                  className="block font-heading font-bold text-[11px] mb-[3px]"
                  style={{ color: area.color }}
                >
                  {bloque.titulo}
                </span>
                <p className="font-body text-[13px] leading-[1.5] m-0" style={{ color: "var(--ink-muted)" }}>
                  {bloque.cuerpo}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="px-4 py-[14px] rounded-[14px] border border-dashed"
          style={{ borderColor: "var(--border)", background: "var(--surface-sunken)" }}
        >
          <span
            className="block font-heading font-bold text-[10px] tracking-[0.14em] uppercase mb-[6px]"
            style={{ color: "var(--ink-subtle)" }}
          >
            {t("tab_info_content_eyebrow")}
          </span>
          <p className="font-body text-[13px] leading-[1.5] m-0" style={{ color: "var(--ink-muted)" }}>
            {t("tab_info_content_placeholder")}
          </p>
        </div>
      )}

      {/* recursos web */}
      {webResources.length > 0 && (
        <div>
          <span
            className="block font-heading font-bold text-[10px] tracking-[0.14em] uppercase mb-3"
            style={{ color: "var(--ink-subtle)" }}
          >
            {t("tab_info_resources_eyebrow")}
          </span>
          <div className="flex flex-col gap-[8px]">
            {webResources.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-3 py-3 rounded-[12px] transition-all duration-[160ms] no-underline group"
                style={{ background: "var(--surface-sunken)", border: "1px solid var(--border)" }}
              >
                <span
                  className="mt-[2px] shrink-0 w-[28px] h-[28px] rounded-full grid place-items-center"
                  style={{ background: area.color + "18", color: area.color }}
                >
                  <ExternalLink size={13} />
                </span>
                <span className="flex flex-col gap-[2px] min-w-0">
                  <span
                    className="font-body font-semibold text-[13px] leading-snug group-hover:underline"
                    style={{ color: "var(--ink-strong)" }}
                  >
                    {r.title}
                  </span>
                  {r.description && (
                    <span className="font-body text-[12px] leading-snug" style={{ color: "var(--ink-muted)" }}>
                      {r.description}
                    </span>
                  )}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* videos */}
      {videoResources.length > 0 && (
        <div>
          <span
            className="block font-heading font-bold text-[10px] tracking-[0.14em] uppercase mb-3"
            style={{ color: "var(--ink-subtle)" }}
          >
            {t("tab_info_videos_eyebrow")}
          </span>
          <div className="grid grid-cols-2 gap-[10px]">
            {videoResources.map((r, i) => {
              const videoId = extractYouTubeId(r.url);
              const thumb = videoId
                ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                : null;

              return (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col rounded-[12px] overflow-hidden no-underline group transition-all duration-[160ms]"
                  style={{ border: "1px solid var(--border)", background: "var(--surface-sunken)" }}
                >
                  {/* thumbnail */}
                  <div className="relative w-full aspect-video overflow-hidden">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={r.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: area.color + "22" }}
                      >
                        <Play size={24} style={{ color: area.color }} />
                      </div>
                    )}
                    {/* overlay con play al hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-all duration-[160ms]">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-[160ms] w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow">
                        <Play size={14} fill="currentColor" style={{ color: "#1a1a2e", marginLeft: 2 }} />
                      </span>
                    </div>
                  </div>

                  {/* texto */}
                  <div className="px-[10px] py-[9px] flex flex-col gap-[3px]">
                    <span
                      className="font-body font-semibold text-[12px] leading-snug line-clamp-2"
                      style={{ color: "var(--ink-strong)" }}
                    >
                      {r.title}
                    </span>
                    {r.channel && (
                      <span
                        className="font-body text-[11px]"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        {r.channel}
                      </span>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function QuizTab({
  star,
  area,
  onLight,
  onMastery,
  onStage3Complete,
}: {
  star: Star;
  area: Constellation;
  onLight: (id: string) => void;
  onMastery: (id: string) => void;
  onStage3Complete: () => void;
}) {
  const t = useTranslations("viaje");
  const quiz = QUIZ_DATA[star.id];
  const isLocked = star.state === "locked";

  // local round index — independent of star.mastery so the modal stays open between stages
  const [localRound, setLocalRound] = useState(() =>
    star.state === "available" ? 0 : Math.min(star.mastery, 2)
  );
  const [stageComplete, setStageComplete] = useState(false);

  const currentRound = quiz?.rounds[localRound] ?? [];

  // shuffle options once per round; correct flag travels with each option
  const shuffledRound = useMemo(() => {
    return currentRound.map((q) => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [star.id, localRound]);

  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(currentRound.length).fill(null),
  );
  const [submitted, setSubmitted] = useState(false);
  const [masteryAwarded, setMasteryAwarded] = useState(false);
  const [openHints, setOpenHints] = useState<Set<number>>(new Set());

  const toggleHint = (qi: number) =>
    setOpenHints((prev) => {
      const next = new Set(prev);
      next.has(qi) ? next.delete(qi) : next.add(qi);
      return next;
    });

  // Dispara el cierre+celebración desde el padre cuando la pantalla de etapa 3 se muestra.
  // Debe declararse antes de cualquier return para no romper las reglas de los hooks.
  useEffect(() => {
    if (stageComplete && localRound === 2) {
      onStage3Complete();
    }
  }, [stageComplete, localRound, onStage3Complete]);

  if (isLocked) {
    return (
      <div
        className="px-4 py-[14px] rounded-[14px] flex flex-col items-center gap-2 text-center"
        style={{ background: "var(--surface-sunken)", border: "1px solid var(--border)" }}
      >
        <Lock size={22} style={{ color: "var(--ink-subtle)" }} />
        <p className="font-body text-[13.5px] leading-[1.5] m-0" style={{ color: "var(--ink-muted)" }}>
          {t("tab_quiz_locked_msg")}
        </p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <p className="font-body text-[13px]" style={{ color: "var(--ink-muted)" }}>
        {t("tab_quiz_coming_soon")}
      </p>
    );
  }

  if (stageComplete) {
    const isLastStage = localRound === 2;
    const handleNextStage = () => {
      const nextIdx = localRound + 1;
      setLocalRound(nextIdx);
      setAnswers(new Array(quiz.rounds[nextIdx]?.length ?? 3).fill(null));
      setSubmitted(false);
      setMasteryAwarded(false);
      setOpenHints(new Set());
      setStageComplete(false);
    };
    return (
      <div
        className="px-4 py-5 rounded-[14px] flex flex-col items-center gap-3 text-center"
        style={{ background: area.color + "10", border: `1.5px solid ${area.color}` }}
      >
        <div className="flex gap-[6px]">
          {[0, 1, 2].map((i) => (
            <svg key={i} width="18" height="18" viewBox="0 0 100 100" aria-hidden="true">
              <polygon
                points={PIP_POINTS}
                fill={i <= localRound ? area.color : "transparent"}
                stroke={area.color}
                strokeWidth="6"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </div>
        <p className="font-heading font-bold text-[15px] m-0" style={{ color: area.color }}>
          {t("tab_quiz_stage_done_title", { n: localRound + 1 })}
        </p>
        <p className="font-body text-[13px] leading-[1.5] m-0" style={{ color: "var(--ink-muted)" }}>
          {isLastStage
            ? t("tab_quiz_stage_last_body")
            : t("tab_quiz_stage_done_body", { remaining: 2 - localRound })}
        </p>
        {!isLastStage && (
          <button
            type="button"
            onClick={handleNextStage}
            className="mt-1 inline-flex items-center justify-center rounded-full font-body font-semibold text-[13.5px] px-5 py-[10px] min-h-[42px] transition-all duration-[160ms]"
            style={{ background: area.color, color: "#fff" }}
          >
            {t("tab_quiz_next_stage", { n: localRound + 2 })}
          </button>
        )}
      </div>
    );
  }

  if (star.state === "done" && star.mastery >= 3) {
    return (
      <div
        className="px-4 py-5 rounded-[14px] flex flex-col items-center gap-3 text-center"
        style={{ background: area.color + "14", border: `1.5px solid ${area.color}` }}
      >
        <div className="flex gap-[6px]">
          {[0, 1, 2].map((i) => (
            <svg key={i} width="18" height="18" viewBox="0 0 100 100" aria-hidden="true">
              <polygon
                points={PIP_POINTS}
                fill={area.color}
                stroke={area.color}
                strokeWidth="6"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </div>
        <p className="font-heading font-bold text-[14px] m-0" style={{ color: area.color }}>
          {t("tab_quiz_all_done_title")}
        </p>
        <p className="font-body text-[13px] leading-[1.5] m-0" style={{ color: "var(--ink-muted)" }}>
          {t("tab_quiz_all_done_body")}
        </p>
      </div>
    );
  }

  const score = submitted
    ? answers.reduce<number>((acc, a, i) => {
        if (a === null) return acc;
        return acc + (shuffledRound[i]!.options[a]!.correct ? 1 : 0);
      }, 0)
    : null;

  const passed = score !== null && score >= quiz.minToPass;
  const allAnswered = answers.every((a) => a !== null);

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    const s = answers.reduce<number>((acc, a, i) => {
      if (a === null) return acc;
      return acc + (shuffledRound[i]!.options[a]!.correct ? 1 : 0);
    }, 0);
    if (s >= quiz.minToPass && !masteryAwarded) {
      setMasteryAwarded(true);
      if (star.state === "available") {
        onLight(star.id);
      } else {
        onMastery(star.id);
      }
      // stageComplete se activa desde el botón "Continuar", no aquí,
      // para que el usuario vea primero cuáles respuestas estaban bien/mal
    }
  };

  const handleReset = () => {
    setAnswers(new Array(shuffledRound.length).fill(null));
    setSubmitted(false);
    setOpenHints(new Set());
  };

  return (
    <div className="flex flex-col gap-4">
      {/* indicador de parte */}
      <div className="flex items-center justify-between">
        <span
          className="font-body font-semibold text-[12px] px-3 py-1 rounded-full"
          style={{ background: area.color + "18", color: area.color }}
        >
          {t("tab_quiz_round", { n: localRound + 1 })}
        </span>
        <div className="flex gap-[5px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: i < localRound
                  ? area.color
                  : i === localRound
                  ? area.color + "70"
                  : "var(--border-strong)",
              }}
            />
          ))}
        </div>
      </div>

      {shuffledRound.map((q, qi) => {
        const chosen = answers[qi] ?? null;
        const isCorrect = submitted && chosen !== null && q.options[chosen]!.correct;
        const isWrong = submitted && chosen !== null && !q.options[chosen]!.correct;
        const hintOpen = openHints.has(qi);

        return (
          <div
            key={qi}
            className="rounded-[14px] overflow-hidden"
            style={{
              border: `1.5px solid ${
                submitted
                  ? isCorrect
                    ? "#20BEC6"
                    : isWrong
                    ? "#EC008C"
                    : "var(--border)"
                  : "var(--border)"
              }`,
              background: "var(--surface-sunken)",
            }}
          >
            <div className="px-4 pt-[14px] pb-3">
              <p className="font-body font-semibold text-[13.5px] leading-[1.45] m-0" style={{ color: "var(--ink-strong)" }}>
                <span
                  className="inline-block text-[11px] font-bold tracking-widest uppercase mr-2"
                  style={{ color: area.color }}
                >
                  {qi + 1}.
                </span>
                {q.prompt}
              </p>
            </div>

            <div className="flex flex-col gap-[6px] px-4 pb-4">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const showWrong = submitted && isChosen && !opt.correct;

                let bg = "transparent";
                let border = "var(--border)";
                let textColor = "var(--ink)";

                if (submitted && isChosen && opt.correct) { bg = "#20BEC618"; border = "#20BEC6"; textColor = "#0e8a90"; }
                else if (showWrong) { bg = "#EC008C14"; border = "#EC008C"; textColor = "#b50069"; }
                else if (isChosen) { bg = area.color + "14"; border = area.color; textColor = "var(--ink-strong)"; }

                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() => {
                      if (submitted) return;
                      setAnswers((prev) => prev.map((v, i) => (i === qi ? oi : v)));
                    }}
                    className="w-full text-left px-3 py-[9px] rounded-[10px] font-body text-[13px] leading-snug transition-all duration-[160ms]"
                    style={{ background: bg, border: `1.5px solid ${border}`, color: textColor, cursor: submitted ? "default" : "pointer" }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* botón de pista — solo si la respuesta fue incorrecta */}
            {submitted && isWrong && (
              <div className="px-4 pb-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => toggleHint(qi)}
                  aria-label={t("tab_quiz_hint_aria")}
                  className="self-start inline-flex items-center gap-[5px] rounded-full font-body font-semibold text-[11.5px] px-3 py-[5px] transition-all duration-[160ms]"
                  style={{
                    background: hintOpen ? "#FFFBE6" : "var(--surface)",
                    border: `1.5px solid ${hintOpen ? "#FFE57A" : "var(--border)"}`,
                    color: hintOpen ? "#8a6e00" : "var(--ink-muted)",
                  }}
                >
                  <span className="font-bold">?</span>
                  {t("tab_quiz_hint_aria")}
                </button>
                {hintOpen && (
                  <div
                    className="px-3 py-[10px] rounded-[10px] font-body text-[12px] leading-[1.5]"
                    style={{ background: "#FFFBE6", border: "1px dashed #FFE57A", color: "#8a6e00" }}
                  >
                    {q.explanation ?? t("tab_quiz_hint_placeholder")}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* resultado y botones */}
      {submitted ? (
        <div className="flex flex-col gap-3">
          <div
            className="px-4 py-3 rounded-[12px] text-center"
            style={{
              background: passed ? "#20BEC618" : "#EC008C10",
              border: `1.5px solid ${passed ? "#20BEC6" : "#EC008C"}`,
            }}
          >
            <p
              className="font-body font-semibold text-[13.5px] m-0"
              style={{ color: passed ? "#0e8a90" : "#b50069" }}
            >
              {score} / {currentRound.length} —{" "}
              {passed ? t("tab_quiz_pass") : t("tab_quiz_fail")}
            </p>
          </div>
          {passed ? (
            <button
              type="button"
              onClick={() => setStageComplete(true)}
              className="w-full inline-flex items-center justify-center rounded-full font-body font-semibold text-[14px] px-5 py-3 min-h-[44px] transition-all duration-[160ms]"
              style={{ background: area.color, color: "#fff", border: `1.5px solid ${area.color}` }}
            >
              {t("tab_quiz_continue")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center rounded-full font-body font-semibold text-[14px] px-5 py-3 min-h-[44px] transition-all duration-[160ms]"
              style={{ background: "var(--surface-sunken)", border: "1.5px solid var(--border)", color: "var(--ink)" }}
            >
              {t("tab_quiz_retake")}
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={!allAnswered}
          onClick={handleSubmit}
          className="w-full inline-flex items-center justify-center rounded-full font-body font-semibold text-[14px] px-5 py-3 min-h-[44px] transition-all duration-[160ms]"
          style={{
            background: allAnswered ? area.color : "var(--surface-sunken)",
            color: allAnswered ? "#fff" : "var(--ink-muted)",
            border: `1.5px solid ${allAnswered ? area.color : "var(--border)"}`,
            cursor: allAnswered ? "pointer" : "not-allowed",
          }}
        >
          {t("tab_quiz_submit")}
        </button>
      )}
    </div>
  );
}

export function DetailPanel({ star, area, onClose, onLight, onMastery, onStage3Complete }: DetailPanelProps) {
  const t = useTranslations("viaje");
  const isDone = star.state === "done";
  const isAvailable = star.state === "available";
  const isLocked = star.state === "locked";

  const [activeTab, setActiveTab] = useState<Tab>("info");

  const statePill = isDone
    ? { label: t("panel_state_done"),      bg: area.color + "18", fg: area.color }
    : isAvailable
    ? { label: t("panel_state_available"), bg: "#FFFBE620", fg: "#8a6e00" }
    : { label: t("panel_state_locked"),    bg: "var(--surface-sunken)", fg: "var(--ink-subtle)" };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: t("tab_info"), icon: <BookOpen size={13} /> },
    { id: "quiz", label: t("tab_quiz"), icon: <HelpCircle size={13} /> },
  ];

  return (
    <>
      <div className="sheet-scrim-enter fixed inset-0 z-40 bg-[rgba(18,6,36,0.65)] backdrop-blur-[2px]" onClick={onClose} />

      <aside
        role="dialog"
        aria-label={star.label}
        className={[
          "sheet-enter fixed z-[41] bg-surface text-ink overflow-y-auto",
          "md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] md:max-h-[88dvh] md:rounded-[24px] md:p-[32px]",
          "max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:max-h-[88dvh] max-md:rounded-t-[22px] max-md:p-5 max-md:pb-[30px]",
        ].join(" ")}
        style={{
          boxShadow: `0 0 0 1.5px ${area.color}28, 0 8px 28px ${area.color}22, 0 32px 64px oklch(0.25 0.18 260 / 0.28)`,
          borderTop: `3px solid ${area.color}`,
        }}
      >
        {/* grip móvil */}
        <div className="md:hidden w-[42px] h-1 rounded-full bg-border-strong mx-auto mb-[14px]" />

        {/* cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("panel_close")}
          className="absolute top-4 right-4 md:top-[22px] md:right-[22px] w-[34px] h-[34px] rounded-full bg-surface-sunken border-0 text-ink-muted grid place-items-center transition-all duration-[160ms] hover:bg-border hover:text-ink"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* ── SECCIÓN FIJA — encabezado + descripción + maestría + estado ── */}
        <div className="flex items-center gap-[9px] pr-10 mb-[14px]">
          <span
            className="inline-flex items-center gap-[6px] font-body font-medium text-[11.5px] px-[11px] py-1 rounded-full border-[1.5px]"
            style={{ color: area.color, borderColor: area.color }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: area.color }} />
            {area.name}
          </span>
          <span
            className="inline-flex items-center gap-[5px] font-body font-semibold text-[11px] px-[10px] py-1 rounded-full"
            style={{ background: statePill.bg, color: statePill.fg }}
          >
            {isLocked && <Lock size={11} stroke={statePill.fg} aria-hidden="true" />}
            {statePill.label}
          </span>
        </div>

        <h2 className="font-heading font-extrabold text-[28px] tracking-[-0.02em] text-ink-strong leading-[1.05] mb-3">
          {star.label}
          <span style={{ color: area.color }} aria-hidden="true">.</span>
        </h2>

        <p className="font-body text-[15px] leading-[1.5] text-ink-muted mb-5">
          {star.whatItIs}
        </p>

        {/* maestría */}
        <div className="px-4 py-[14px] rounded-[14px] bg-surface-sunken border border-border mb-4">
          <div className="flex items-baseline justify-between mb-[9px]">
            <span className="font-heading font-bold text-[10px] tracking-[0.14em] uppercase text-ink-subtle">
              {t("panel_mastery")}
            </span>
            <span
              className="font-heading font-extrabold text-[15px]"
              style={{ color: isDone ? area.color : "var(--ink-subtle)" }}
            >
              {star.mastery} / 3
            </span>
          </div>
          <div className="flex gap-[7px]">
            {[0, 1, 2].map((i) => (
              <svg key={i} width="16" height="16" viewBox="0 0 100 100" aria-hidden="true">
                <polygon
                  points={PIP_POINTS}
                  fill={i < star.mastery ? (isDone ? area.color : "var(--border-strong)") : "transparent"}
                  stroke={i < star.mastery ? (isDone ? area.color : "var(--border-strong)") : "var(--border-strong)"}
                  strokeWidth="7"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
          </div>
        </div>

        {/* bloques de estado */}
        {isDone && (
          <div
            className="px-4 py-[14px] rounded-[14px] mb-4"
            style={{ background: area.color + "12", borderLeft: `3px solid ${area.color}` }}
          >
            <span
              className="block font-heading font-bold text-[10px] tracking-[0.14em] uppercase mb-[5px]"
              style={{ color: area.color }}
            >
              {t("panel_unlocked_eyebrow")}
            </span>
            <p className="font-body text-[13.5px] leading-[1.5] text-ink m-0">
              {t("panel_unlocked_prefix")} <strong className="font-semibold text-ink-strong">{star.unlockedDate}</strong>{" "}
              {t("panel_unlocked_joining")} <strong className="font-semibold text-ink-strong">{star.via}</strong>.
            </p>
          </div>
        )}

        {isAvailable && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-[14px] rounded-[14px] mb-4"
            style={{ background: "#FFFBE6", border: "1.5px solid #FFE57A" }}
          >
            <div className="flex flex-col gap-[3px]">
              <span className="font-heading font-bold text-[10px] tracking-[0.14em] uppercase text-[#8a6e00]">
                {t("panel_available_eyebrow")}
              </span>
              <p className="font-body text-[13px] leading-snug text-ink m-0">{t("panel_available_quiz_required")}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className="shrink-0 inline-flex items-center gap-[6px] rounded-full font-body font-semibold text-[13px] px-4 py-2 transition-all duration-[160ms]"
              style={{ background: "#FFCB05", color: "#1a1000" }}
            >
              <HelpCircle size={14} />
              {t("tab_quiz")}
            </button>
          </div>
        )}

        {isLocked && (
          <div className="px-4 py-[14px] rounded-[14px] bg-surface-sunken border border-border mb-4">
            <span className="block font-heading font-bold text-[10px] tracking-[0.14em] uppercase text-[#6B6F85] mb-[5px]">
              {t("panel_locked_eyebrow")}
            </span>
            <p className="font-body text-[13.5px] leading-[1.5] text-ink m-0">{star.howToUnlock}</p>
            <p className="font-body text-[12.5px] text-ink-muted mt-2 m-0">
              {t("panel_locked_via_prefix")} <strong className="font-semibold text-ink-strong">{star.via}</strong>.
            </p>
          </div>
        )}

        {/* ── PESTAÑAS ──────────────────────────────────────────────── */}
        <div
          className="flex gap-[4px] p-[4px] rounded-[12px] mb-4"
          style={{ background: "var(--surface-sunken)", border: "1px solid var(--border)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 inline-flex items-center justify-center gap-[6px] rounded-[9px] py-[8px] font-body font-semibold text-[12.5px] transition-all duration-[160ms]"
              style={
                activeTab === tab.id
                  ? { background: "var(--surface)", color: area.color, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                  : { background: "transparent", color: "var(--ink-muted)" }
              }
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* contenido de la pestaña activa */}
        {activeTab === "info" ? (
          <InfoTab starId={star.id} area={area} />
        ) : (
          <QuizTab key={star.id} star={star} area={area} onLight={onLight} onMastery={onMastery} onStage3Complete={onStage3Complete} />
        )}
      </aside>
    </>
  );
}
