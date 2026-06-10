"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Upload } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";

const TOTAL_STEPS = 6;
const OPTIONAL_STEPS = new Set([6]);
const MAX_LOGO_FILE_SIZE_BYTES = 5 * 1_024 * 1_024;

/* ── Progress dots ───────────────────────────────────────── */
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < current;
        const isCurrent = stepNumber === current;
        return (
          <span
            key={stepNumber}
            className={[
              "block transition-all duration-[--duration-base]",
              isCurrent
                ? "h-2 w-6 rounded-full bg-primary"
                : isCompleted
                  ? "h-2 w-2 rounded-full bg-primary"
                  : "h-2 w-2 rounded-full bg-secondary-foreground/25",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

/* ── Step 1 — Nombre empresa ─────────────────────────────── */
function Step1({ onChange }: { onChange: (val: string) => void }) {
  const t = useTranslations("register.empresa.step1");
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

      <label htmlFor="empresa-name" className="sr-only">{t("label")}</label>
      <input
        id="empresa-name"
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

/* ── Step 2 — Sector ─────────────────────────────────────── */
type Sector = "tech" | "fintech" | "health" | "logistics" | "education" | "energy" | "retail" | "manufacturing" | "consulting" | "other";

function Step2({ onChange }: { onChange: (val: Sector[]) => void }) {
  const t = useTranslations("register.empresa.step2");
  const [selectedSectors, setSelectedSectors] = useState<Sector[]>([]);

  const SECTOR_LABELS: Record<Sector, string> = {
    tech:          t("tech"),
    fintech:       t("fintech"),
    health:        t("health"),
    logistics:     t("logistics"),
    education:     t("education"),
    energy:        t("energy"),
    retail:        t("retail"),
    manufacturing: t("manufacturing"),
    consulting:    t("consulting"),
    other:         t("other"),
  };

  function toggleSector(sector: Sector) {
    const nextSelection = selectedSectors.includes(sector)
      ? selectedSectors.filter((s) => s !== sector)
      : [...selectedSectors, sector];
    setSelectedSectors(nextSelection);
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
        {(Object.keys(SECTOR_LABELS) as Sector[]).map((sector) => {
          const isSelected = selectedSectors.includes(sector);
          return (
            <button
              key={sector}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleSector(sector)}
              className={[
                "rounded-full border px-5 py-2 font-body text-sm font-medium transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-ink-strong hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              {SECTOR_LABELS[sector]}
            </button>
          );
        })}
      </div>
      <div className="h-2" />
    </div>
  );
}

/* ── Step 3 — Descripción ────────────────────────────────── */
const DESC_MAX_CHARS = 300;

function Step3({ onChange }: { onChange: (val: string) => void }) {
  const t = useTranslations("register.empresa.step3");
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
        <label htmlFor="empresa-description" className="sr-only">{t("label")}</label>
        <textarea
          id="empresa-description"
          value={descriptionValue}
          onChange={(e) => {
            const nextValue = e.target.value.slice(0, DESC_MAX_CHARS);
            setDescriptionValue(nextValue);
            onChange(nextValue);
          }}
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

/* ── Step 4 — Datos legales ──────────────────────────────── */
type LegalData = { websiteUrl: string; cedulaJuridica: string };

function Step4({ onChange }: { onChange: (val: LegalData) => void }) {
  const t = useTranslations("register.empresa.step4");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [cedulaJuridica, setCedulaJuridica] = useState("");

  function notifyChange(nextWebsite: string, nextCedula: string) {
    onChange({ websiteUrl: nextWebsite, cedulaJuridica: nextCedula });
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

      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="empresa-website" className="font-body text-xs font-semibold text-ink-muted">
            {t("website_label")}
          </label>
          <input
            id="empresa-website"
            type="url"
            value={websiteUrl}
            onChange={(e) => { setWebsiteUrl(e.target.value); notifyChange(e.target.value, cedulaJuridica); }}
            placeholder={t("website_placeholder")}
            className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="empresa-cedula" className="font-body text-xs font-semibold text-ink-muted">
            {t("cedula_label")}
          </label>
          <input
            id="empresa-cedula"
            type="text"
            value={cedulaJuridica}
            onChange={(e) => { setCedulaJuridica(e.target.value); notifyChange(websiteUrl, e.target.value); }}
            placeholder={t("cedula_placeholder")}
            className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Step 5 — Tipos de proyectos ─────────────────────────── */
type ProjectType = "web" | "mobile" | "ai" | "automation" | "dashboards" | "integrations" | "ux" | "data" | "other";

function Step5({ onChange }: { onChange: (val: ProjectType[]) => void }) {
  const t = useTranslations("register.empresa.step5");
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<ProjectType[]>([]);

  const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
    web:          t("web"),
    mobile:       t("mobile"),
    ai:           t("ai"),
    automation:   t("automation"),
    dashboards:   t("dashboards"),
    integrations: t("integrations"),
    ux:           t("ux"),
    data:         t("data"),
    other:        t("other"),
  };

  function toggleProjectType(projectType: ProjectType) {
    const nextSelection = selectedProjectTypes.includes(projectType)
      ? selectedProjectTypes.filter((pt) => pt !== projectType)
      : [...selectedProjectTypes, projectType];
    setSelectedProjectTypes(nextSelection);
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
        {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((projectType) => {
          const isSelected = selectedProjectTypes.includes(projectType);
          return (
            <button
              key={projectType}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleProjectType(projectType)}
              className={[
                "rounded-full border px-5 py-2 font-body text-sm font-medium transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-ink-strong hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              {PROJECT_TYPE_LABELS[projectType]}
            </button>
          );
        })}
      </div>
      <div className="h-2" />
    </div>
  );
}

/* ── Step 6 — Logo ───────────────────────────────────────── */
function Step6() {
  const t = useTranslations("register.empresa.step6");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processLogoFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_LOGO_FILE_SIZE_BYTES) return;
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processLogoFile(file);
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

      <div
        role="button"
        tabIndex={0}
        aria-label={t("upload_label")}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        className={[
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-colors duration-[--duration-fast]",
          isDraggingOver ? "border-primary bg-primary/5" : "border-border bg-surface-sunken",
        ].join(" ")}
      >
        {logoPreviewUrl ? (
          <img src={logoPreviewUrl} alt="" className="h-20 w-20 rounded-xl object-contain" />
        ) : (
          <Upload size={28} className="text-ink-subtle" strokeWidth={1.5} aria-hidden="true" />
        )}
        <p className="font-body text-sm text-ink-muted">
          {logoPreviewUrl ? t("loaded") : t("drop_hint")}
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full border border-border-strong px-5 py-2 font-body text-xs font-medium text-ink-strong transition-colors hover:bg-surface-sunken"
        >
          {logoPreviewUrl ? t("change_file") : t("select_file")}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileInputChange}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  );
}

/* ── Shell ───────────────────────────────────────────────── */
export default function EmpresaOnboardingPage() {
  const t = useTranslations("register");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const currentStep = Number(params.step) || 1;

  const [pendingValue, setPendingValue] = useState<unknown>(null);

  function handleNext() {
    if (currentStep < TOTAL_STEPS) {
      router.push(`/${locale}/register/onboarding/empresa/${currentStep + 1}`);
    } else {
      router.push(`/${locale}/register/onboarding/empresa/done`);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      router.push(`/${locale}/register/onboarding/empresa/${currentStep - 1}`);
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
            <Step1 onChange={(val) => setPendingValue(val.trim() || null)} />
          )}
          {currentStep === 2 && (
            <Step2 onChange={(val) => setPendingValue(val.length > 0 ? val : null)} />
          )}
          {currentStep === 3 && (
            <Step3 onChange={(val) => setPendingValue(val.trim() || null)} />
          )}
          {currentStep === 4 && (
            <Step4 onChange={(val) => setPendingValue(
              val.websiteUrl.trim() && val.cedulaJuridica.trim() ? val : null
            )} />
          )}
          {currentStep === 5 && (
            <Step5 onChange={(val) => setPendingValue(val.length > 0 ? val : null)} />
          )}
          {currentStep === 6 && <Step6 />}
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
