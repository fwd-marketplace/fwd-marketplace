"use client";

import { useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { ProgressDots } from "@/components/onboarding/ProgressDots";
import { saveStep, getOnboarding, clearOnboarding } from "@/lib/onboarding-storage";
import { saveEmprendedorProfile } from "@/lib/actions/auth";

const TOTAL_STEPS = 5;
const OPTIONAL_STEPS = new Set([5]);
const DESC_MAX_CHARS = 400;

function Step1({ onChange }: { onChange: (val: string) => void }) {
  const t = useTranslations("register.emprendedor.step1");
  const [nameValue, setNameValue] = useState("");

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

      <label htmlFor="emprendedor-name" className="sr-only">{t("label")}</label>
      <input
        id="emprendedor-name"
        type="text"
        value={nameValue}
        onChange={(e) => { setNameValue(e.target.value); onChange(e.target.value); }}
        placeholder={t("placeholder")}
        autoFocus
        className="w-full rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
      />
      <div className="h-2" />
    </div>
  );
}

type StartupStage = "idea" | "mvp" | "validating" | "scaling";

function Step2({ onChange }: { onChange: (val: StartupStage) => void }) {
  const t = useTranslations("register.emprendedor.step2");
  const [selectedStage, setSelectedStage] = useState<StartupStage | null>(null);

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
  const [isSubmitting, startTransition] = useTransition();

  function handleNext() {
    setSubmitError(null);
    saveStep("emprendedor", currentStep, pendingValue);

    if (currentStep < TOTAL_STEPS) {
      router.push(`/${locale}/register/onboarding/emprendedor/${currentStep + 1}`);
      return;
    }

    const stored = getOnboarding("emprendedor");
    const raw = {
      projectName:   stored.step1 as string,
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

  const canContinue = !isSubmitting && (OPTIONAL_STEPS.has(currentStep) || Boolean(pendingValue));

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
            <Step1 onChange={(val) => setPendingValue(val.trim() || null)} />
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

      <footer className="relative flex flex-col items-center gap-2 px-4 py-5 sm:px-8 sm:py-6">
        {submitError && (
          <p role="alert" className="w-full max-w-md text-center font-body text-xs text-red-500">
            {submitError}
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
            disabled={!canContinue}
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
