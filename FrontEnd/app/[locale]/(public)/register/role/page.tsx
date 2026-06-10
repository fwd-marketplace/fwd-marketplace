"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";

type Role = "junior" | "empresa" | "emprendedor";

const roles: { id: Role; label: string; description: string }[] = [
  {
    id: "junior",
    label: "Soy desarrollador/a junior",
    description: "Busco proyectos reales para crecer y sumar experiencia.",
  },
  {
    id: "empresa",
    label: "Represento una empresa",
    description: "Quiero publicar proyectos y trabajar con talento FWD.",
  },
  {
    id: "emprendedor",
    label: "Tengo un emprendimiento",
    description: "Busco apoyo técnico para hacer crecer mi proyecto.",
  },
];

export default function RolePage() {
  const [selected, setSelected] = useState<Role | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  function handleContinue() {
    if (!selected) return;
    router.push(`/${locale}/register/onboarding/${selected}/1`);
  }

  return (
    <>
      <FwdGeoBackdrop />

      <div className="relative flex min-h-[100dvh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[2rem] bg-surface px-10 py-12 shadow-elevated">
          <p className="mb-3 text-center font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
            Tu cuenta
          </p>

          <h1 className="mb-2 text-center font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
            ¿Cómo vas a usar FWD?
          </h1>

          <p className="mb-8 text-center font-body text-sm text-ink-muted">
            Elegí el perfil que mejor te describe.
          </p>

          <div className="space-y-3">
            {roles.map((role) => {
              const isSelected = selected === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelected(role.id)}
                  className={[
                    "flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors duration-[--duration-fast]",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface hover:border-border-strong hover:bg-surface-sunken",
                  ].join(" ")}
                >
                  {/* Radio circle */}
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
                      {role.label}
                    </span>
                    <span className="font-body text-xs text-ink-muted">
                      {role.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected}
            className="mt-8 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuar
          </button>
        </div>
      </div>
    </>
  );
}
