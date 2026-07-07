"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { CosmicBackdrop } from "@/components/ui/cosmic-backdrop";
import { ProgressDots } from "@/components/onboarding/ProgressDots";
import { saveStep, getOnboarding, clearOnboarding } from "@/lib/onboarding-storage";
import { saveEmprendedorProfile } from "@/lib/actions/auth";

const TOTAL_STEPS = 5;
const OPTIONAL_STEPS = new Set([5]);
const DESC_MAX_CHARS = 400;

export type Step1Value = { projectName: string; cedula: string };

function Step1({
  onChange,
  showErrors = false,
}: {
  onChange: (val: Step1Value | null) => void;
  showErrors?: boolean;
}) {
  const t = useTranslations("register.emprendedor.step1");
  const [nameValue, setNameValue] = useState("");
  const [cedulaValue, setCedulaValue] = useState("");
  const [touchedName, setTouchedName] = useState(false);
  const [touchedCedula, setTouchedCedula] = useState(false);

  useEffect(() => {
    const stored = getOnboarding("emprendedor").step1 as Step1Value | undefined;
    if (stored) { setNameValue(stored.projectName ?? ""); setCedulaValue(stored.cedula ?? ""); }
  }, []);

  // Emite el valor solo si ambos campos son válidos; null bloquea el "Siguiente".
  function emit(name: string, cedula: string) {
    const projectName = name.trim();
    const ced = cedula.trim();
    const valid = projectName.length >= 2 && ced.length >= 5 && ced.length <= 20;
    onChange(valid ? { projectName, cedula: ced } : null);
  }

  function nameError(): string | null {
    if (!showErrors && !touchedName) return null;
    const value = nameValue.trim();
    if (!value) return t("error_required");
    if (value.length < 2) return t("error_min_2");
    return null;
  }

  function cedulaError(): string | null {
    if (!showErrors && !touchedCedula) return null;
    const value = cedulaValue.trim();
    if (!value) return t("cedula_error_required");
    if (value.length < 5) return t("cedula_error_min");
    return null;
  }

  const errName = nameError();
  const errCedula = cedulaError();

  const fieldClass = (hasError: boolean) =>
    [
      "w-full rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2",
      hasError ? "ring-1 ring-red-400/60 focus:ring-red-400/60" : "focus:ring-primary/40",
    ].join(" ");

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

      <div className="flex flex-col gap-1">
        <label htmlFor="emprendedor-name" className="mb-1 px-1 font-body text-xs font-semibold text-ink-strong">
          {t("label")}
        </label>
        <input
          id="emprendedor-name"
          type="text"
          value={nameValue}
          onChange={(e) => { setNameValue(e.target.value); emit(e.target.value, cedulaValue); }}
          onBlur={() => setTouchedName(true)}
          placeholder={t("placeholder")}
          autoFocus
          aria-describedby={errName ? "emprendedor-name-error" : undefined}
          aria-invalid={errName ? true : undefined}
          className={fieldClass(Boolean(errName))}
        />
        {errName && (
          <p id="emprendedor-name-error" role="alert" className="px-1 font-body text-xs text-red-500">
            {errName}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="emprendedor-cedula" className="mb-1 px-1 font-body text-xs font-semibold text-ink-strong">
          {t("cedula_label")}
        </label>
        <input
          id="emprendedor-cedula"
          type="text"
          inputMode="numeric"
          value={cedulaValue}
          onChange={(e) => { setCedulaValue(e.target.value); emit(nameValue, e.target.value); }}
          onBlur={() => setTouchedCedula(true)}
          placeholder={t("cedula_placeholder")}
          aria-describedby={errCedula ? "emprendedor-cedula-error" : undefined}
          aria-invalid={errCedula ? true : undefined}
          className={fieldClass(Boolean(errCedula))}
        />
        {errCedula && (
          <p id="emprendedor-cedula-error" role="alert" className="px-1 font-body text-xs text-red-500">
            {errCedula}
          </p>
        )}
      </div>
    </div>
  );
}

type StartupStage = "idea" | "mvp" | "validating" | "scaling";

function Step2({ onChange }: { onChange: (val: StartupStage) => void }) {
  const t = useTranslations("register.emprendedor.step2");
  const [selectedStage, setSelectedStage] = useState<StartupStage | null>(null);

  useEffect(() => {
    const stored = getOnboarding("emprendedor").step2 as StartupStage | undefined;
    if (stored) setSelectedStage(stored);
  }, []);

  const STAGE_OPTIONS: { id: StartupStage; label: string; description: string }[] = [
    { id: "idea",       label: t("idea_label"),       description: t("idea_description") },
    { id: "mvp",        label: t("mvp_label"),        description: t("mvp_description") },
    { id: "validating", label: t("validating_label"), description: t("validating_description") },
    { id: "scaling",    label: t("scaling_label"),    description: t("scaling_description") },
  ];

  function selectStage(stage: StartupStage) {
    setSelectedStage(stage);
    onChange(stage);
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
        {STAGE_OPTIONS.map((stageOption) => {
          const isSelected = selectedStage === stageOption.id;
          return (
            <button
              key={stageOption.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => selectStage(stageOption.id)}
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
                <span className="font-body text-sm font-semibold text-ink-strong">{stageOption.label}</span>
                <span className="font-body text-xs text-ink-muted">{stageOption.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type TechSupport = "web" | "mobile" | "backend" | "ai" | "ux" | "data" | "automation" | "other";

function Step3({ onChange }: { onChange: (val: TechSupport[]) => void }) {
  const t = useTranslations("register.emprendedor.step3");
  const [selectedSupport, setSelectedSupport] = useState<TechSupport[]>([]);

  useEffect(() => {
    const stored = getOnboarding("emprendedor").step3 as TechSupport[] | undefined;
    if (stored && stored.length > 0) setSelectedSupport(stored);
  }, []);

  const TECH_SUPPORT_LABELS: Record<TechSupport, string> = {
    web:        t("web"),
    mobile:     t("mobile"),
    backend:    t("backend"),
    ai:         t("ai"),
    ux:         t("ux"),
    data:       t("data"),
    automation: t("automation"),
    other:      t("other"),
  };

  function toggleSupport(support: TechSupport) {
    const nextSelection = selectedSupport.includes(support)
      ? selectedSupport.filter((s) => s !== support)
      : [...selectedSupport, support];
    setSelectedSupport(nextSelection);
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
        {(Object.keys(TECH_SUPPORT_LABELS) as TechSupport[]).map((support) => {
          const isSelected = selectedSupport.includes(support);
          return (
            <button
              key={support}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleSupport(support)}
              className={[
                "rounded-full border px-5 py-2 font-body text-sm font-medium transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-ink-strong hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              {TECH_SUPPORT_LABELS[support]}
            </button>
          );
        })}
      </div>
      <div className="h-2" />
    </div>
  );
}

type BudgetRange = "under_500" | "range_500_1000" | "range_1000_2500" | "flexible";

function Step4({ onChange }: { onChange: (val: BudgetRange) => void }) {
  const t = useTranslations("register.emprendedor.step4");
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange | null>(null);

  useEffect(() => {
    const stored = getOnboarding("emprendedor").step4 as BudgetRange | undefined;
    if (stored) setSelectedBudget(stored);
  }, []);

  const BUDGET_LABELS: Record<BudgetRange, string> = {
    under_500:       t("under_500"),
    range_500_1000:  t("range_500_1000"),
    range_1000_2500: t("range_1000_2500"),
    flexible:        t("flexible"),
  };

  function selectBudget(budget: BudgetRange) {
    setSelectedBudget(budget);
    onChange(budget);
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
        {(Object.keys(BUDGET_LABELS) as BudgetRange[]).map((budget) => {
          const isSelected = selectedBudget === budget;
          return (
            <button
              key={budget}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => selectBudget(budget)}
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
                {BUDGET_LABELS[budget]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step5({ onChange }: { onChange: (val: string) => void }) {
  const t = useTranslations("register.emprendedor.step5");
  const [descriptionValue, setDescriptionValue] = useState("");
  const remainingChars = DESC_MAX_CHARS - descriptionValue.length;

  useEffect(() => {
    const stored = getOnboarding("emprendedor").step5 as string | undefined;
    if (stored) setDescriptionValue(stored);
  }, []);

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
        <label htmlFor="emprendedor-description" className="sr-only">{t("label")}</label>
        <textarea
          id="emprendedor-description"
          value={descriptionValue}
          onChange={(e) => { const v = e.target.value.slice(0, DESC_MAX_CHARS); setDescriptionValue(v); onChange(v); }}
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

export function EmprendedorOnboarding() {
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
    // Rehidrata el gating desde sessionStorage: si el paso ya se completó antes,
    // "Siguiente" sigue habilitado al navegar hacia atrás/adelante sin re-tipear.
    const stored = getOnboarding("emprendedor");
    setPendingValue(stored[`step${currentStep}`] ?? null);
    setShowStepErrors(false);
  }, [currentStep]);

  function getStepValidationMessage(): string | null {
    if (!showStepErrors || OPTIONAL_STEPS.has(currentStep) || pendingValue !== null) return null;
    switch (currentStep) {
      case 1: return t("nav.error_field_required");
      case 2: return t("nav.error_select_one");
      case 3: return t("nav.error_select_several");
      case 4: return t("nav.error_select_one");
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
    saveStep("emprendedor", currentStep, pendingValue);

    if (currentStep < TOTAL_STEPS) {
      router.push(`/${locale}/register/onboarding/emprendedor/${currentStep + 1}`);
      return;
    }

    const stored = getOnboarding("emprendedor");
    const step1 = stored.step1 as Step1Value | undefined;
    const raw = {
      projectName:   step1?.projectName ?? "",
      cedula:        step1?.cedula ?? "",
      stage:         stored.step2,
      neededSupport: stored.step3,
      budget:        stored.step4,
      description:   stored.step5 as string ?? "",
    };

    startTransition(async () => {
      const result = await saveEmprendedorProfile(raw);
      if (result.ok) {
        clearOnboarding("emprendedor");
        router.push(`/${locale}/register/onboarding/emprendedor/done`);
      } else {
        setSubmitError(result.error);
      }
    });
  }

  function handleBack() {
    if (currentStep > 1) {
      router.push(`/${locale}/register/onboarding/emprendedor/${currentStep - 1}`);
    }
  }

  const stepValidationMessage = getStepValidationMessage();
  const footerMessage = submitError ?? stepValidationMessage;

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-secondary">
      <FwdGeoBackdrop />
      <CosmicBackdrop />

      <header className="relative flex items-center justify-end px-6 py-6 sm:px-10 sm:py-7">
        <span className="font-body text-xs font-medium uppercase tracking-widest text-secondary-foreground/60">
          {t("nav.step_counter", { current: currentStep, total: TOTAL_STEPS })}
        </span>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-[2rem] bg-surface px-6 py-8 shadow-elevated sm:px-12 sm:py-10">
          {currentStep === 1 && (
            <Step1
              showErrors={showStepErrors}
              onChange={(val) => setPendingValue(val)}
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
          {currentStep === 5 && <Step5 onChange={(val) => setPendingValue(val)} />}
        </div>
      </div>

      <footer className="relative flex flex-col items-center gap-2 px-6 py-6 sm:px-10 sm:py-7">
        {footerMessage && (
          <p role="alert" className="w-full max-w-xl text-center font-body text-xs text-red-500">
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
