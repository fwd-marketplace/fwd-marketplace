"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Upload } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";

const TOTAL_STEPS = 6;

/* ── Progress dots ───────────────────────────────────────── */
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < current;
        const isCurrent = step === current;
        return (
          <span
            key={step}
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
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Empecemos
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          ¿Cómo se llama tu empresa?
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Usá el nombre comercial o razón social.
        </p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); onChange(e.target.value); }}
        placeholder="Nombre comercial o razón social"
        autoFocus
        className="w-full rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
      />
      <div className="h-2" />
    </div>
  );
}

/* ── Step 2 — Sector ─────────────────────────────────────── */
const SECTORS = [
  "Tecnología", "Fintech", "Salud", "Logística", "Educación",
  "Energía", "Retail", "Manufactura", "Consultoría", "Otro",
];

function Step2({ onChange }: { onChange: (val: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(item: string) {
    const next = selected.includes(item)
      ? selected.filter((s) => s !== item)
      : [...selected, item];
    setSelected(next);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Tu empresa
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          ¿En qué sector opera?
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Podés elegir más de uno.
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {SECTORS.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={[
                "rounded-full border px-5 py-2 font-body text-sm font-medium transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-ink-strong hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              {item}
            </button>
          );
        })}
      </div>
      <div className="h-2" />
    </div>
  );
}

/* ── Step 3 — Descripción ────────────────────────────────── */
const DESC_MAX = 300;

function Step3({ onChange }: { onChange: (val: string) => void }) {
  const [value, setValue] = useState("");
  const remaining = DESC_MAX - value.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Tu empresa
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          ¿A qué se dedica tu empresa?
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Esta descripción aparece en tu perfil público y en los proyectos que publiques.
        </p>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => {
            const v = e.target.value.slice(0, DESC_MAX);
            setValue(v);
            onChange(v);
          }}
          placeholder="Ej: Somos una empresa de software enfocada en soluciones logísticas para el sector retail en Centroamérica."
          rows={5}
          className="w-full resize-none rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
        />
        <span
          className={[
            "absolute bottom-3 right-4 font-body text-xs tabular-nums",
            remaining <= 50 ? "text-warning" : "text-ink-subtle",
          ].join(" ")}
        >
          {remaining}
        </span>
      </div>
    </div>
  );
}

/* ── Step 4 — Datos legales ──────────────────────────────── */
function Step4({ onChange }: { onChange: (val: { web: string; cedula: string }) => void }) {
  const [web, setWeb] = useState("");
  const [cedula, setCedula] = useState("");

  function update(nextWeb: string, nextCedula: string) {
    onChange({ web: nextWeb, cedula: nextCedula });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Verificación
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          Necesitamos verificar tu empresa.
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Esta información es confidencial y solo se usa para validar tu cuenta.
        </p>
      </div>
      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-semibold text-ink-muted">Sitio web</label>
          <input
            type="url"
            value={web}
            onChange={(e) => { setWeb(e.target.value); update(e.target.value, cedula); }}
            placeholder="https://tu-empresa.com"
            className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-semibold text-ink-muted">Cédula jurídica CR</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => { setCedula(e.target.value); update(web, e.target.value); }}
            placeholder="3-101-XXXXXX"
            className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Step 5 — Tipos de proyectos ─────────────────────────── */
const PROJECT_TYPES = [
  "Desarrollo Web", "Desarrollo Mobile", "Inteligencia Artificial",
  "Automatización", "Dashboards y Reportes", "Integraciones",
  "Diseño UX/UI", "Análisis de Datos", "Otro",
];

function Step5({ onChange }: { onChange: (val: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(item: string) {
    const next = selected.includes(item)
      ? selected.filter((s) => s !== item)
      : [...selected, item];
    setSelected(next);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Lo que buscás
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          ¿Qué tipo de proyectos querés publicar?
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Esto nos ayuda a mostrarte el talento más adecuado.
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {PROJECT_TYPES.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={[
                "rounded-full border px-5 py-2 font-body text-sm font-medium transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-ink-strong hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              {item}
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
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Casi listo
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          Agregá el logo de tu empresa.
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Opcional. JPG o PNG, máximo 5 MB. Podés subirlo después desde tu perfil.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={[
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-colors duration-[--duration-fast]",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-surface-sunken",
        ].join(" ")}
      >
        {preview ? (
          <img
            src={preview}
            alt="Logo preview"
            className="h-20 w-20 rounded-xl object-contain"
          />
        ) : (
          <Upload size={28} className="text-ink-subtle" strokeWidth={1.5} />
        )}

        <p className="font-body text-sm text-ink-muted">
          {preview ? "Logo cargado" : "Arrastrá tu logo aquí"}
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-border-strong px-5 py-2 font-body text-xs font-medium text-ink-strong transition-colors hover:bg-surface-sunken"
        >
          {preview ? "Cambiar archivo" : "Seleccionar archivo"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={onInputChange}
        className="hidden"
      />
    </div>
  );
}

/* ── Shell ───────────────────────────────────────────────── */
export default function EmpresaOnboardingPage() {
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

  const OPTIONAL_STEPS = [6];
  const canContinue = OPTIONAL_STEPS.includes(currentStep) || Boolean(pendingValue);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-secondary">
      <FwdGeoBackdrop />

      {/* Header */}
      <header className="relative flex items-center justify-between px-8 py-6">
        <span className="font-heading text-base font-extrabold text-secondary-foreground">
          FWD Talent
          <span className="text-highlight">*</span>
        </span>
        <span className="font-body text-xs font-medium uppercase tracking-widest text-secondary-foreground/60">
          Paso {currentStep} de {TOTAL_STEPS}
        </span>
      </header>

      {/* Card */}
      <div className="relative flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[2rem] bg-surface px-10 py-10 shadow-elevated">
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
            <Step4 onChange={(val) => setPendingValue(val.web.trim() && val.cedula.trim() ? val : null)} />
          )}
          {currentStep === 5 && (
            <Step5 onChange={(val) => setPendingValue(val.length > 0 ? val : null)} />
          )}
          {currentStep === 6 && <Step6 />}
        </div>
      </div>

      {/* Footer nav */}
      <footer className="relative flex items-center justify-between px-8 py-6">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="font-body text-sm font-medium text-secondary-foreground/70 transition-opacity hover:opacity-80"
          >
            Atrás
          </button>
        ) : (
          <div />
        )}

        <ProgressDots current={currentStep} total={TOTAL_STEPS} />

        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {currentStep === TOTAL_STEPS ? "Finalizar" : "Siguiente"}
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>
      </footer>
    </div>
  );
}
