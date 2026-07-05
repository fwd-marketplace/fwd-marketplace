"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Upload } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";
import { CosmicBackdrop } from "@/components/ui/cosmic-backdrop";
import { ProgressDots } from "@/components/onboarding/ProgressDots";
import { saveStep, getOnboarding, clearOnboarding } from "@/lib/onboarding-storage";
import { saveEmpresaProfile } from "@/lib/actions/auth";
import { uploadEmpresarioLogo } from "@/lib/actions/perfil";

const TOTAL_STEPS = 6;
const OPTIONAL_STEPS = new Set([6]);
const MAX_LOGO_FILE_SIZE_BYTES = 5 * 1_024 * 1_024;

function Step1({
  onChange,
  showErrors = false,
}: {
  onChange: (val: string) => void;
  showErrors?: boolean;
}) {
  const t = useTranslations("register.empresa.step1");
  const [nameValue, setNameValue] = useState("");
  const [touched, setTouched] = useState(false);

  function getError(): string | null {
    if (!showErrors && !touched) return null;
    const value = nameValue.trim();
    if (!value) return t("error_required");
    if (value.length < 2) return t("error_min_2");
    return null;
  }

  const error = getError();

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
        <label htmlFor="empresa-name" className="sr-only">{t("label")}</label>
        <input
          id="empresa-name"
          type="text"
          value={nameValue}
          onChange={(e) => { setNameValue(e.target.value); onChange(e.target.value); }}
          onBlur={() => setTouched(true)}
          placeholder={t("placeholder")}
          autoFocus
          aria-describedby={error ? "empresa-name-error" : undefined}
          aria-invalid={error ? true : undefined}
          className={[
            "w-full rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2",
            error ? "ring-1 ring-red-400/60 focus:ring-red-400/60" : "focus:ring-primary/40",
          ].join(" ")}
        />
        {error && (
          <p id="empresa-name-error" role="alert" className="px-1 font-body text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
      <div className="h-2" />
    </div>
  );
}

type Sector = "tech" | "fintech" | "health" | "logistics" | "education" | "energy" | "retail" | "manufacturing" | "consulting" | "other";

function Step2({ onChange }: { onChange: (val: Sector[]) => void }) {
  const t = useTranslations("register.empresa.step2");
  const [selectedSectors, setSelectedSectors] = useState<Sector[]>([]);

  const SECTOR_LABELS: Record<Sector, string> = {
    tech: t("tech"),
    fintech: t("fintech"),
    health: t("health"),
    logistics: t("logistics"),
    education: t("education"),
    energy: t("energy"),
    retail: t("retail"),
    manufacturing: t("manufacturing"),
    consulting: t("consulting"),
    other: t("other"),
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

const DESC_MAX_CHARS = 300;

function Step3({
  onChange,
  showErrors = false,
}: {
  onChange: (val: string) => void;
  showErrors?: boolean;
}) {
  const t = useTranslations("register.empresa.step3");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [touched, setTouched] = useState(false);
  const remainingChars = DESC_MAX_CHARS - descriptionValue.length;

  function getError(): string | null {
    if (!showErrors && !touched) return null;
    const value = descriptionValue.trim();
    if (!value) return t("error_required");
    if (value.length < 10) return t("error_min_10");
    return null;
  }

  const error = getError();

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
            onBlur={() => setTouched(true)}
            placeholder={t("placeholder")}
            rows={5}
            aria-describedby={error ? "empresa-desc-error" : undefined}
            aria-invalid={error ? true : undefined}
            className={[
              "w-full resize-none rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2",
              error ? "ring-1 ring-red-400/60 focus:ring-red-400/60" : "focus:ring-primary/40",
            ].join(" ")}
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
        {error && (
          <p id="empresa-desc-error" role="alert" className="px-1 font-body text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

type LegalData = { direccion: string; cedulaJuridica: string };

function Step4({
  onChange,
  showErrors = false,
}: {
  onChange: (val: LegalData) => void;
  showErrors?: boolean;
}) {
  const t = useTranslations("register.empresa.step4");
  const [direccion, setDireccion] = useState("");
  const [cedulaJuridica, setCedulaJuridica] = useState("");
  const [touchedDireccion, setTouchedDireccion] = useState(false);
  const [touchedCedula, setTouchedCedula] = useState(false);

  function notifyChange(nextDireccion: string, nextCedula: string) {
    onChange({ direccion: nextDireccion, cedulaJuridica: nextCedula });
  }

  function getDireccionError(): string | null {
    if (!showErrors && !touchedDireccion) return null;
    const value = direccion.trim();
    if (!value) return t("error_required");
    if (value.length < 5) return t("error_min_5");
    return null;
  }

  function getCedulaError(): string | null {
    if (!showErrors && !touchedCedula) return null;
    const value = cedulaJuridica.trim();
    if (!value) return t("error_required");
    if (value.length < 5) return t("error_min_5");
    return null;
  }

  const direccionError = getDireccionError();
  const cedulaError = getCedulaError();

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
        <div className="flex flex-col gap-1">
          <label htmlFor="empresa-direccion" className="font-body text-xs font-semibold text-ink-muted">
            {t("direccion_label")}
          </label>
          <input
            id="empresa-direccion"
            type="text"
            value={direccion}
            onChange={(e) => { setDireccion(e.target.value); notifyChange(e.target.value, cedulaJuridica); }}
            onBlur={() => setTouchedDireccion(true)}
            placeholder={t("direccion_placeholder")}
            aria-describedby={direccionError ? "empresa-dir-error" : undefined}
            aria-invalid={direccionError ? true : undefined}
            className={[
              "w-full rounded-2xl bg-surface-sunken px-5 py-3.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2",
              direccionError ? "ring-1 ring-red-400/60 focus:ring-red-400/60" : "focus:ring-primary/40",
            ].join(" ")}
          />
          {direccionError && (
            <p id="empresa-dir-error" role="alert" className="px-1 font-body text-xs text-red-500">
              {direccionError}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="empresa-cedula" className="font-body text-xs font-semibold text-ink-muted">
            {t("cedula_label")}
          </label>
          <input
            id="empresa-cedula"
            type="text"
            value={cedulaJuridica}
            onChange={(e) => { setCedulaJuridica(e.target.value); notifyChange(direccion, e.target.value); }}
            onBlur={() => setTouchedCedula(true)}
            placeholder={t("cedula_placeholder")}
            aria-describedby={cedulaError ? "empresa-ced-error" : undefined}
            aria-invalid={cedulaError ? true : undefined}
            className={[
              "w-full rounded-2xl bg-surface-sunken px-5 py-3.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2",
              cedulaError ? "ring-1 ring-red-400/60 focus:ring-red-400/60" : "focus:ring-primary/40",
            ].join(" ")}
          />
          {cedulaError && (
            <p id="empresa-ced-error" role="alert" className="px-1 font-body text-xs text-red-500">
              {cedulaError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type ProjectType = "web" | "mobile" | "ai" | "automation" | "dashboards" | "integrations" | "ux" | "data" | "other";

function Step5({ onChange }: { onChange: (val: ProjectType[]) => void }) {
  const t = useTranslations("register.empresa.step5");
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<ProjectType[]>([]);

  const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
    web: t("web"),
    mobile: t("mobile"),
    ai: t("ai"),
    automation: t("automation"),
    dashboards: t("dashboards"),
    integrations: t("integrations"),
    ux: t("ux"),
    data: t("data"),
    other: t("other"),
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

function Step6({ onLogoFile }: { onLogoFile: (file: File) => void }) {
  const t = useTranslations("register.empresa.step6");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processLogoFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_LOGO_FILE_SIZE_BYTES) return;
    setLogoPreviewUrl(URL.createObjectURL(file));
    onLogoFile(file);
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

export function EmpresaOnboarding() {
  const t = useTranslations("register");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const currentStep = Number(params.step) || 1;

  const [pendingValue, setPendingValue] = useState<unknown>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showStepErrors, setShowStepErrors] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
  const logoFileRef = useRef<File | null>(null);

  useEffect(() => {
    setPendingValue(null);
    setShowStepErrors(false);
  }, [currentStep]);

  function getStepValidationMessage(): string | null {
    if (!showStepErrors || OPTIONAL_STEPS.has(currentStep) || pendingValue !== null) return null;
    switch (currentStep) {
      case 1: return t("nav.error_field_required");
      case 2: return t("nav.error_select_several");
      case 3: return t("nav.error_field_required");
      case 4: return t("nav.error_step1");
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
    saveStep("empresa", currentStep, pendingValue);

    if (currentStep < TOTAL_STEPS) {
      router.push(`/${locale}/register/onboarding/empresa/${currentStep + 1}`);
      return;
    }

    const stored = getOnboarding("empresa");
    const step4 = stored.step4 as { direccion: string; cedulaJuridica: string } | undefined;
    const raw = {
      companyName: stored.step1 as string,
      sectors: stored.step2,
      description: stored.step3 as string,
      cedulaJuridica: step4?.cedulaJuridica ?? "",
      direccion: step4?.direccion ?? "",
      projectTypes: stored.step5,
      logoUrl: "",
    };

    startTransition(async () => {
      const result = await saveEmpresaProfile(raw);
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      // Subir el logo si el usuario seleccionó uno
      if (logoFileRef.current) {
        const formData = new FormData();
        formData.append("file", logoFileRef.current);
        await uploadEmpresarioLogo(formData);
      }
      clearOnboarding("empresa");
      router.push(`/${locale}/register/onboarding/empresa/done`);
    });
  }

  function handleBack() {
    if (currentStep > 1) {
      router.push(`/${locale}/register/onboarding/empresa/${currentStep - 1}`);
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
              onChange={(val) => setPendingValue(val.trim() || null)}
            />
          )}
          {currentStep === 2 && (
            <Step2 onChange={(val) => setPendingValue(val.length > 0 ? val : null)} />
          )}
          {currentStep === 3 && (
            <Step3
              showErrors={showStepErrors}
              onChange={(val) => setPendingValue(val.trim() || null)}
            />
          )}
          {currentStep === 4 && (
            <Step4
              showErrors={showStepErrors}
              onChange={(val) => setPendingValue(
                val.direccion.trim() && val.cedulaJuridica.trim() ? val : null
              )}
            />
          )}
          {currentStep === 5 && (
            <Step5 onChange={(val) => setPendingValue(val.length > 0 ? val : null)} />
          )}
          {currentStep === 6 && <Step6 onLogoFile={(f) => { logoFileRef.current = f; }} />}
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
