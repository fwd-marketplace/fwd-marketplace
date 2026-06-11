"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { ProgressDots } from "@/components/onboarding/ProgressDots";

const TOTAL_STEPS = 7;
const OPTIONAL_STEPS = new Set([6, 7]);

const ALL_TECHS = [
  "React", "Vue", "Angular", "Next.js", "Tailwind", "TypeScript",
  "Node.js", "Python", "PHP", "Java", "Go", "PostgreSQL",
  "MySQL", "MongoDB", "Supabase", "Redis", "Docker", "Git",
  "AWS", "Figma", "GraphQL", "Prisma",
];

const BIO_MAX_CHARS = 500;

type Step1Value = { nombre: string; apellido1: string; apellido2: string; cedula: string };

function Step1({ onChange }: { onChange: (val: Step1Value) => void }) {
  const t = useTranslations("register.junior.step1");
  const [fields, setFields] = useState<Step1Value>({ nombre: "", apellido1: "", apellido2: "", cedula: "" });

  function update(key: keyof Step1Value, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    onChange(next);
  }

  const inputClass = "w-full rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          {t("eyebrow")}
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          {t("title")}
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">{t("description")}</p>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="junior-nombre" className="sr-only">{t("label_nombre")}</label>
        <input
          id="junior-nombre"
          type="text"
          value={fields.nombre}
          onChange={(e) => update("nombre", e.target.value)}
          placeholder={t("placeholder_nombre")}
          autoFocus
          className={inputClass}
        />
        <label htmlFor="junior-apellido1" className="sr-only">{t("label_apellido1")}</label>
        <input
          id="junior-apellido1"
          type="text"
          value={fields.apellido1}
          onChange={(e) => update("apellido1", e.target.value)}
          placeholder={t("placeholder_apellido1")}
          className={inputClass}
        />
        <label htmlFor="junior-apellido2" className="sr-only">{t("label_apellido2")}</label>
        <input
          id="junior-apellido2"
          type="text"
          value={fields.apellido2}
          onChange={(e) => update("apellido2", e.target.value)}
          placeholder={t("placeholder_apellido2")}
          className={inputClass}
        />
        <label htmlFor="junior-cedula" className="sr-only">{t("label_cedula")}</label>
        <input
          id="junior-cedula"
          type="text"
          value={fields.cedula}
          onChange={(e) => update("cedula", e.target.value)}
          placeholder={t("placeholder_cedula")}
          className={inputClass}
        />
      </div>
      <div className="h-2" />
    </div>
  );
}

type Specialization = "frontend" | "backend" | "fullstack" | "ia";

function Step2({ onChange }: { onChange: (val: Specialization) => void }) {
  const t = useTranslations("register.junior.step2");
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);

  const SPECIALIZATION_OPTIONS: { id: Specialization; label: string; description: string }[] = [
    { id: "frontend",  label: t("frontend_label"),  description: t("frontend_description") },
    { id: "backend",   label: t("backend_label"),   description: t("backend_description") },
    { id: "fullstack", label: t("fullstack_label"), description: t("fullstack_description") },
    { id: "ia",        label: t("ia_label"),        description: t("ia_description") },
  ];

  function selectSpecialization(specId: Specialization) {
    setSelectedSpecialization(specId);
    onChange(specId);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          {t("eyebrow")}
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          {t("title")}
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">{t("description")}</p>
      </div>

      <div role="radiogroup" aria-label={t("group_label")} className="space-y-2.5">
        {SPECIALIZATION_OPTIONS.map((spec) => {
          const isSelected = selectedSpecialization === spec.id;
          return (
            <button
              key={spec.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => selectSpecialization(spec.id)}
              className={[
                "flex w-full items-center gap-4 rounded-2xl border px-5 py-3.5 text-left transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-surface hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-[--duration-fast]",
                  isSelected ? "border-primary" : "border-border-strong",
                ].join(" ")}
              >
                {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-body text-sm font-semibold text-ink-strong">{spec.label}</span>
                <span className="font-body text-xs text-ink-muted">{spec.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Modality = "remote" | "hybrid" | "onsite";

function Step3({ onChange }: { onChange: (val: Modality[]) => void }) {
  const t = useTranslations("register.junior.step3");
  const [selectedModalities, setSelectedModalities] = useState<Modality[]>([]);

  const MODALITY_LABELS: Record<Modality, string> = {
    remote:  t("remote"),
    hybrid:  t("hybrid"),
    onsite:  t("onsite"),
  };

  function toggleModality(modality: Modality) {
    const nextSelection = selectedModalities.includes(modality)
      ? selectedModalities.filter((m) => m !== modality)
      : [...selectedModalities, modality];
    setSelectedModalities(nextSelection);
    onChange(nextSelection);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          {t("eyebrow")}
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          {t("title")}
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">{t("description")}</p>
      </div>

      <div role="group" aria-label={t("group_label")} className="flex flex-wrap gap-2.5">
        {(Object.keys(MODALITY_LABELS) as Modality[]).map((modality) => {
          const isSelected = selectedModalities.includes(modality);
          return (
            <button
              key={modality}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleModality(modality)}
              className={[
                "rounded-full border px-5 py-2 font-body text-sm font-medium transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-ink-strong hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              {MODALITY_LABELS[modality]}
            </button>
          );
        })}
      </div>
      <div className="h-2" />
    </div>
  );
}

type Availability = "immediate" | "two_weeks" | "one_month" | "unavailable";

function Step4({ onChange }: { onChange: (val: Availability) => void }) {
  const t = useTranslations("register.junior.step4");
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);

  const AVAILABILITY_LABELS: Record<Availability, string> = {
    immediate:   t("immediate"),
    two_weeks:   t("two_weeks"),
    one_month:   t("one_month"),
    unavailable: t("unavailable"),
  };

  function selectAvailability(availability: Availability) {
    setSelectedAvailability(availability);
    onChange(availability);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          {t("eyebrow")}
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          {t("title")}
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">{t("description")}</p>
      </div>

      <div role="radiogroup" aria-label={t("group_label")} className="space-y-2.5">
        {(Object.keys(AVAILABILITY_LABELS) as Availability[]).map((availability) => {
          const isSelected = selectedAvailability === availability;
          return (
            <button
              key={availability}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => selectAvailability(availability)}
              className={[
                "flex w-full items-center gap-4 rounded-2xl border px-5 py-3.5 text-left transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-surface hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-[--duration-fast]",
                  isSelected ? "border-primary" : "border-border-strong",
                ].join(" ")}
              >
                {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </span>
              <span className="font-body text-sm font-medium text-ink-strong">
                {AVAILABILITY_LABELS[availability]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step5({ onChange }: { onChange: (val: string[]) => void }) {
  const t = useTranslations("register.junior.step5");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTechs = searchQuery.trim()
    ? ALL_TECHS.filter((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()))
    : ALL_TECHS;

  function toggleTech(tech: string) {
    const nextSelection = selectedTechs.includes(tech)
      ? selectedTechs.filter((t) => t !== tech)
      : [...selectedTechs, tech];
    setSelectedTechs(nextSelection);
    onChange(nextSelection);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          {t("eyebrow")}
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          {t("title")}
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">{t("description")}</p>
      </div>

      <label htmlFor="tech-search" className="sr-only">{t("search_label")}</label>
      <input
        id="tech-search"
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t("search_placeholder")}
        className="w-full rounded-xl bg-surface-sunken px-4 py-2.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
      />

      <div role="group" aria-label={t("group_label")} className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
        {filteredTechs.map((tech) => {
          const isSelected = selectedTechs.includes(tech);
          return (
            <button
              key={tech}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleTech(tech)}
              className={[
                "rounded-full border px-4 py-1.5 font-body text-xs font-medium transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-ink-strong hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              {tech}
            </button>
          );
        })}
        {filteredTechs.length === 0 && (
          <p className="font-body text-xs text-ink-subtle">{t("no_results")}</p>
        )}
      </div>

      {selectedTechs.length > 0 && (
        <p className="font-body text-xs text-ink-muted">
          {t("selected_count", { count: selectedTechs.length })}
        </p>
      )}
    </div>
  );
}

function Step6() {
  const t = useTranslations("register.junior.step6");

  const LINK_FIELDS = [
    { key: "github",    labelKey: "github_label",    placeholderKey: "github_placeholder" },
    { key: "linkedin",  labelKey: "linkedin_label",  placeholderKey: "linkedin_placeholder" },
    { key: "portfolio", labelKey: "portfolio_label", placeholderKey: "portfolio_placeholder" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          {t("eyebrow")}
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          {t("title")}
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">{t("description")}</p>
      </div>

      <div className="space-y-3">
        {LINK_FIELDS.map(({ key, labelKey, placeholderKey }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label htmlFor={`link-${key}`} className="font-body text-xs font-semibold text-ink-muted">
              {t(labelKey)}
            </label>
            <input
              id={`link-${key}`}
              type="url"
              placeholder={t(placeholderKey)}
              className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Step7() {
  const t = useTranslations("register.junior.step7");
  const [bioValue, setBioValue] = useState("");
  const remainingChars = BIO_MAX_CHARS - bioValue.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          {t("eyebrow")}
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          {t("title")}
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">{t("description")}</p>
      </div>

      <div className="relative">
        <label htmlFor="junior-bio" className="sr-only">{t("label")}</label>
        <textarea
          id="junior-bio"
          value={bioValue}
          onChange={(e) => setBioValue(e.target.value.slice(0, BIO_MAX_CHARS))}
          placeholder={t("placeholder")}
          rows={5}
          className="w-full resize-none rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
        />
        <span
          aria-live="polite"
          className={[
            "absolute bottom-3 right-4 font-body text-xs tabular-nums",
            remainingChars <= 50 ? "text-warning" : "text-ink-subtle",
          ].join(" ")}
        >
          {remainingChars}
        </span>
      </div>
    </div>
  );
}

export function JuniorOnboarding() {
  const t = useTranslations("register");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const currentStep = Number(params.step) || 1;

  const [pendingValue, setPendingValue] = useState<unknown>(null);

  function handleNext() {
    if (currentStep < TOTAL_STEPS) {
      router.push(`/${locale}/register/onboarding/junior/${currentStep + 1}`);
    } else {
      router.push(`/${locale}/register/onboarding/junior/done`);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      router.push(`/${locale}/register/onboarding/junior/${currentStep - 1}`);
    }
  }

  const canContinue = OPTIONAL_STEPS.has(currentStep) || Boolean(pendingValue);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-secondary">
      <FwdGeoBackdrop />

      <header className="relative flex items-center justify-between px-4 py-5 sm:px-8 sm:py-6">
        <span className="font-heading text-base font-extrabold text-secondary-foreground">
          {t("brand")}
          <span className="text-highlight">{t("brand_suffix")}</span>
        </span>
        <span className="font-body text-xs font-medium uppercase tracking-widest text-secondary-foreground/60">
          {t("nav.step_counter", { current: currentStep, total: TOTAL_STEPS })}
        </span>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[2rem] bg-surface px-6 py-8 shadow-elevated sm:px-10 sm:py-10">
          {currentStep === 1 && (
            <Step1 onChange={(val) => {
              const filled = val.nombre.trim() && val.apellido1.trim() && val.apellido2.trim() && val.cedula.trim();
              setPendingValue(filled ? val : null);
            }} />
          )}
          {currentStep === 2 && (
            <Step2 onChange={(val) => setPendingValue(val)} />
          )}
          {currentStep === 3 && (
            <Step3 onChange={(val) => setPendingValue(val.length > 0 ? val : null)} />
          )}
          {currentStep === 4 && (
            <Step4 onChange={(val) => setPendingValue(val)} />
          )}
          {currentStep === 5 && (
            <Step5 onChange={(val) => setPendingValue(val.length > 0 ? val : null)} />
          )}
          {currentStep === 6 && <Step6 />}
          {currentStep === 7 && <Step7 />}
        </div>
      </div>

      <footer className="relative flex items-center justify-between px-4 py-5 sm:px-8 sm:py-6">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="font-body text-sm font-medium text-secondary-foreground/70 transition-opacity hover:opacity-80"
          >
            {t("nav.back")}
          </button>
        ) : (
          <div />
        )}

        <ProgressDots current={currentStep} total={TOTAL_STEPS} />

        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
        >
          {currentStep === TOTAL_STEPS ? t("nav.finish") : t("nav.next")}
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>
      </footer>
    </div>
  );
}
