"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";

type AccountRole = "junior" | "empresa" | "emprendedor";

const ROLE_OPTIONS: { id: AccountRole; labelKey: string; descriptionKey: string }[] = [
  { id: "junior",       labelKey: "role.junior_label",       descriptionKey: "role.junior_description" },
  { id: "empresa",      labelKey: "role.empresa_label",      descriptionKey: "role.empresa_description" },
  { id: "emprendedor",  labelKey: "role.emprendedor_label",  descriptionKey: "role.emprendedor_description" },
];

export function RoleSelector() {
  const t = useTranslations("register");
  const [selectedRole, setSelectedRole] = useState<AccountRole | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  function handleContinue() {
    if (!selectedRole) return;
    router.push(`/${locale}/register/onboarding/${selectedRole}/1`);
  }

  return (
    <div className="bg-secondary">
      <FwdGeoBackdrop />

      <div className="relative flex min-h-[100dvh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[2rem] bg-surface px-6 py-8 shadow-elevated sm:px-10 sm:py-12">
          <p className="mb-3 text-center font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
            {t("role.eyebrow")}
          </p>

          <h1 className="mb-2 text-center font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
            {t("role.title")}
          </h1>

          <p className="mb-8 text-center font-body text-sm text-ink-muted">
            {t("role.description")}
          </p>

          <div role="radiogroup" aria-label={t("role.title")} className="space-y-3">
            {ROLE_OPTIONS.map((roleOption) => {
              const isSelected = selectedRole === roleOption.id;
              return (
                <button
                  key={roleOption.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedRole(roleOption.id)}
                  className={[
                    "flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors duration-[--duration-fast]",
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
                    {isSelected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </span>

                  <span className="flex flex-col gap-0.5">
                    <span className="font-body text-sm font-semibold text-ink-strong">
                      {t(roleOption.labelKey)}
                    </span>
                    <span className="font-body text-xs text-ink-muted">
                      {t(roleOption.descriptionKey)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole}
            className="mt-8 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-white transition-opacity duration-[--duration-fast] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("role.continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
