"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { CosmicBackdrop } from "@/components/ui/cosmic-backdrop";
import { ProgressDots } from "@/components/onboarding/ProgressDots";
import { saveStep, getOnboarding, clearOnboarding } from "@/lib/onboarding-storage";
import { saveJuniorProfile } from "@/lib/actions/auth";

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

function Step1({
  onChange,
  showErrors = false,
}: {
  onChange: (val: Step1Value) => void;
  showErrors?: boolean;
}) {
  const t = useTranslations("register.junior.step1");
  const [fields, setFields] = useState<Step1Value>({ nombre: "", apellido1: "", apellido2: "", cedula: "" });
  const [touched, setTouched] = useState<Partial<Record<keyof Step1Value, true>>>({});

  function update(key: keyof Step1Value, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    onChange(next);
  }

  function touch(key: keyof Step1Value) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function getError(key: keyof Step1Value): string | null {
    if (!showErrors && !touched[key]) return null;
    const value = fields[key].trim();
    if (!value) return t("error_required");
    const minLen = key === "cedula" ? 5 : 2;
    if (value.length < minLen) return key === "cedula" ? t("error_min_5") : t("error_min_2");
    return null;
  }

  const FIELD_DEFS: {
    key: keyof Step1Value;
    labelKey: string;
    placeholderKey: string;
    id: string;
  }[] = [
    { key: "nombre",    labelKey: "label_nombre",    placeholderKey: "placeholder_nombre",    id: "junior-nombre" },
    { key: "apellido1", labelKey: "label_apellido1", placeholderKey: "placeholder_apellido1", id: "junior-apellido1" },
    { key: "apellido2", labelKey: "label_apellido2", placeholderKey: "placeholder_apellido2", id: "junior-apellido2" },
    { key: "cedula",    labelKey: "label_cedula",    placeholderKey: "placeholder_cedula",    id: "junior-cedula" },
  ];

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
        {FIELD_DEFS.map(({ key, labelKey, placeholderKey, id }, idx) => {
          const error = getError(key);
          return (
            <div key={key} className="flex flex-col gap-1">
              <label htmlFor={id} className="sr-only">{t(labelKey)}</label>
              <input
                id={id}
                type="text"
                value={fields[key]}
                onChange={(e) => update(key, e.target.value)}
                onBlur={() => touch(key)}
                placeholder={t(placeholderKey)}
                autoFocus={idx === 0}
                aria-describedby={error ? `${id}-error` : undefined}
                aria-invalid={error ? true : undefined}
                className={[
                  "w-full rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2",
                  error
                    ? "ring-1 ring-red-400/60 focus:ring-red-400/60"
                    : "focus:ring-primary/40",
                ].join(" ")}
              />
              {error && (
                <p id={`${id}-error`} role="alert" className="px-1 font-body text-xs text-red-500">
                  {error}
                </p>
              )}
            </div>
          );
        })}
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

type Step6Links = { githubUrl: string; linkedinUrl: string; portfolioUrl: string };

function Step6({ onChange }: { onChange: (val: Step6Links) => void }) {
  const t = useTranslations("register.junior.step6");
  const [links, setLinks] = useState<Step6Links>({ githubUrl: "", linkedinUrl: "", portfolioUrl: "" });

  function update(key: keyof Step6Links, value: string) {
    const next = { ...links, [key]: value };
    setLinks(next);
    onChange(next);
  }

  const LINK_FIELDS: { key: keyof Step6Links; labelKey: string; placeholderKey: string }[] = [
    { key: "githubUrl",    labelKey: "github_label",    placeholderKey: "github_placeholder" },
    { key: "linkedinUrl",  labelKey: "linkedin_label",  placeholderKey: "linkedin_placeholder" },
    { key: "portfolioUrl", labelKey: "portfolio_label", placeholderKey: "portfolio_placeholder" },
  ];

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
              value={links[key]}
              onChange={(e) => update(key, e.target.value)}
              placeholder={t(placeholderKey)}
              className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Step7({ onChange }: { onChange: (val: string) => void }) {
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
          onChange={(e) => { const v = e.target.value.slice(0, BIO_MAX_CHARS); setBioValue(v); onChange(v); }}
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showStepErrors, setShowStepErrors] = useState(false);
  const [isSubmitting, startTransition] = useTransition();

  useEffect(() => {
    setPendingValue(null);
    setShowStepErrors(false);
  }, [currentStep]);

  function getStepValidationMessage(): string | null {
    if (!showStepErrors || OPTIONAL_STEPS.has(currentStep) || pendingValue !== null) return null;
    switch (currentStep) {
      case 1: return t("nav.error_step1");
      case 2: return t("nav.error_select_one");
      case 3: return t("nav.error_select_several");
      case 4: return t("nav.error_select_one");
      case 5: return t("nav.error_select_several");
      default: return null;
    }
  }

  function handleNext() {
    setSubmitError(null);

    if (!OPTIONAL_STEPS.has(currentStep) && !pendingValue) {
      setShowStepErrors(true);
      return;
    }

    setShowStepErrors(false);
    saveStep("junior", currentStep, pendingValue);

    if (currentStep < TOTAL_STEPS) {
      router.push(`/${locale}/register/onboarding/junior/${currentStep + 1}`);
      return;
    }

    const stored = getOnboarding("junior");
    const raw = {
      ...(stored.step1 as object ?? {}),
      specialization: stored.step2,
      modalities:     stored.step3,
      availability:   stored.step4,
      techStack:      stored.step5,
      ...(stored.step6 as object ?? {}),
      bio:            stored.step7 as string ?? "",
    };

    startTransition(async () => {
      const result = await saveJuniorProfile(raw);
      if (result.ok) {
        clearOnboarding("junior");
        router.push(`/${locale}/register/onboarding/junior/done`);
      } else {
        setSubmitError(result.error);
      }
    });
  }

  function handleBack() {
    if (currentStep > 1) {
      router.push(`/${locale}/register/onboarding/junior/${currentStep - 1}`);
    }
  }

  const stepValidationMessage = getStepValidationMessage();
  const footerMessage = submitError ?? stepValidationMessage;

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-secondary">
      <FwdGeoBackdrop />
      <CosmicBackdrop />

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
            <Step1
              showErrors={showStepErrors}
              onChange={(val) => {
                const filled = val.nombre.trim() && val.apellido1.trim() && val.apellido2.trim() && val.cedula.trim();
                setPendingValue(filled ? val : null);
              }}
            />
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
          {currentStep === 6 && <Step6 onChange={(val) => setPendingValue(val)} />}
          {currentStep === 7 && <Step7 onChange={(val) => setPendingValue(val)} />}
        </div>
      </div>

      <footer className="relative flex flex-col items-center gap-2 px-4 py-5 sm:px-8 sm:py-6">
        {footerMessage && (
          <p role="alert" className="w-full max-w-md text-center font-body text-xs text-red-500">
            {footerMessage}
          </p>
        )}
        <div className="flex w-full items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="font-body text-sm font-medium text-secondary-foreground/70 transition-opacity hover:opacity-80 disabled:opacity-40"
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
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
          >
            {isSubmitting ? t("nav.finishing") : currentStep === TOTAL_STEPS ? t("nav.finish") : t("nav.next")}
            {!isSubmitting && <ArrowRight size={15} strokeWidth={2.5} />}
          </button>
        </div>
      </footer>
    </div>
  );
}
