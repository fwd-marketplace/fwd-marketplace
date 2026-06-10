"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";

const TOTAL_STEPS = 7;

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

/* ── Step 1 — Nombre ─────────────────────────────────────── */
function Step1({ onChange }: { onChange: (val: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Empecemos
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          ¿Cómo te llamás?
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Usamos tu nombre para personalizar tu experiencia.
        </p>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="Tu nombre completo"
        autoFocus
        className="w-full rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none transition-shadow duration-[--duration-fast] focus:ring-2 focus:ring-primary/40"
      />

      <div className="h-2" />
    </div>
  );
}

/* ── Step 2 — Especialización ────────────────────────────── */
const SPECIALIZATIONS = [
  { id: "frontend",  label: "Frontend",   description: "Interfaces y experiencia de usuario" },
  { id: "backend",   label: "Backend",    description: "APIs, bases de datos y servidores" },
  { id: "fullstack", label: "Fullstack",  description: "Front y back en igual medida" },
  { id: "ia-datos",  label: "IA / Datos", description: "Modelos, pipelines y análisis" },
] as const;

type Specialization = (typeof SPECIALIZATIONS)[number]["id"];

function Step2({ onChange }: { onChange: (val: Specialization) => void }) {
  const [selected, setSelected] = useState<Specialization | null>(null);

  function select(id: Specialization) {
    setSelected(id);
    onChange(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Sobre vos
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          ¿En qué área te especializás?
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Elegí la que mejor describe tu perfil actual.
        </p>
      </div>

      <div className="space-y-2.5">
        {SPECIALIZATIONS.map((spec) => {
          const isSelected = selected === spec.id;
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => select(spec.id)}
              className={[
                "flex w-full items-center gap-4 rounded-2xl border px-5 py-3.5 text-left transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-surface hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-[--duration-fast]",
                  isSelected ? "border-primary" : "border-border-strong",
                ].join(" ")}
              >
                {isSelected && (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-body text-sm font-semibold text-ink-strong">
                  {spec.label}
                </span>
                <span className="font-body text-xs text-ink-muted">
                  {spec.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 3 — Modalidad ──────────────────────────────────── */
const MODALITIES = ["Remoto", "Híbrido", "Presencial"] as const;
type Modality = (typeof MODALITIES)[number];

function Step3({ onChange }: { onChange: (val: Modality[]) => void }) {
  const [selected, setSelected] = useState<Modality[]>([]);

  function toggle(item: Modality) {
    const next = selected.includes(item)
      ? selected.filter((m) => m !== item)
      : [...selected, item];
    setSelected(next);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Tu preferencia
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          ¿Cómo preferís trabajar?
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Podés elegir más de una.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {MODALITIES.map((item) => {
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

/* ── Step 4 — Disponibilidad ─────────────────────────────── */
const AVAILABILITY = [
  "Inmediata",
  "En 2 semanas",
  "En 1 mes",
  "No disponible por ahora",
] as const;
type Availability = (typeof AVAILABILITY)[number];

function Step4({ onChange }: { onChange: (val: Availability) => void }) {
  const [selected, setSelected] = useState<Availability | null>(null);

  function select(val: Availability) {
    setSelected(val);
    onChange(val);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Tu disponibilidad
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          ¿Cuándo podés empezar?
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Esto se muestra en tu perfil público.
        </p>
      </div>

      <div className="space-y-2.5">
        {AVAILABILITY.map((item) => {
          const isSelected = selected === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => select(item)}
              className={[
                "flex w-full items-center gap-4 rounded-2xl border px-5 py-3.5 text-left transition-colors duration-[--duration-fast]",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-surface hover:border-border-strong hover:bg-surface-sunken",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-[--duration-fast]",
                  isSelected ? "border-primary" : "border-border-strong",
                ].join(" ")}
              >
                {isSelected && (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </span>
              <span className="font-body text-sm font-medium text-ink-strong">
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 5 — Stack ──────────────────────────────────────── */
const ALL_TECHS = [
  "React", "Vue", "Angular", "Next.js", "Tailwind", "TypeScript",
  "Node.js", "Python", "PHP", "Java", "Go", "PostgreSQL",
  "MySQL", "MongoDB", "Supabase", "Redis", "Docker", "Git",
  "AWS", "Figma", "GraphQL", "Prisma",
];

function Step5({ onChange }: { onChange: (val: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? ALL_TECHS.filter((t) => t.toLowerCase().includes(query.toLowerCase()))
    : ALL_TECHS;

  function toggle(tech: string) {
    const next = selected.includes(tech)
      ? selected.filter((t) => t !== tech)
      : [...selected, tech];
    setSelected(next);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Tu stack
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          ¿Qué tecnologías manejás?
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Seleccioná todas las que apliquen. Podés editarlo después.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar tecnología..."
        className="w-full rounded-xl bg-surface-sunken px-4 py-2.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
      />

      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
        {filtered.map((tech) => {
          const isSelected = selected.includes(tech);
          return (
            <button
              key={tech}
              type="button"
              onClick={() => toggle(tech)}
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
        {filtered.length === 0 && (
          <p className="font-body text-xs text-ink-subtle">Sin resultados.</p>
        )}
      </div>

      {selected.length > 0 && (
        <p className="font-body text-xs text-ink-muted">
          {selected.length} seleccionada{selected.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

/* ── Step 6 — Links ──────────────────────────────────────── */
function Step6() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Tu portafolio
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          ¿Dónde podemos ver tu trabajo?
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Todos los campos son opcionales. Podés agregarlos después desde tu perfil.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { label: "GitHub",   placeholder: "github.com/tu-usuario" },
          { label: "LinkedIn", placeholder: "linkedin.com/in/tu-usuario" },
          { label: "Portfolio", placeholder: "tu-sitio.com" },
        ].map(({ label, placeholder }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-ink-muted">
              {label}
            </label>
            <input
              type="url"
              placeholder={placeholder}
              className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none transition-shadow duration-[--duration-fast] focus:ring-2 focus:ring-primary/40"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 7 — Bio ────────────────────────────────────────── */
const BIO_MAX = 500;

function Step7() {
  const [value, setValue] = useState("");
  const remaining = BIO_MAX - value.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Para cerrar
        </p>
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
          Contanos un poco sobre vos.
        </h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Una descripción corta que las empresas verán en tu perfil.
        </p>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, BIO_MAX))}
          placeholder="Ej: Desarrolladora Frontend con enfoque en React y diseño de interfaces. Egresada FWD 2025, apasionada por el código limpio y los productos con impacto real."
          rows={5}
          className="w-full resize-none rounded-2xl bg-surface-sunken px-5 py-4 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none transition-shadow duration-[--duration-fast] focus:ring-2 focus:ring-primary/40"
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

/* ── Shell ───────────────────────────────────────────────── */
export default function JuniorOnboardingPage() {
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

  // Steps 6 and 7 are optional (links and bio)
  const OPTIONAL_STEPS = [6, 7];
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
