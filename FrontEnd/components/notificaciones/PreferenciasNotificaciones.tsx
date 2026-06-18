"use client";

import { useState, useTransition } from "react";
import {
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  FileUp,
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  TriangleAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ApiRoleName } from "@/lib/api/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type PrefKey =
  | "offer_accepted"
  | "offer_reviewed"
  | "new_project"
  | "deadline_reminder"
  | "new_message"
  | "entregable_sent"
  | "new_offer";

type PrefGroup = {
  groupKey: string;
  items: PrefKey[];
};

type PrefConfig = {
  icon: React.ElementType;
  iconClass: string;
  bgClass: string;
};

// ── Configuración visual ──────────────────────────────────────────────────────

const PREF_CONFIG: Record<PrefKey, PrefConfig> = {
  offer_accepted:    { icon: CheckCircle2,      iconClass: "text-accent",    bgClass: "bg-accent/10" },
  offer_reviewed:    { icon: Clock,             iconClass: "text-warning",   bgClass: "bg-warning/10" },
  new_project:       { icon: Briefcase,         iconClass: "text-primary",   bgClass: "bg-primary/10" },
  deadline_reminder: { icon: TriangleAlert,     iconClass: "text-warning",   bgClass: "bg-warning/10" },
  new_message:       { icon: MessageSquare,     iconClass: "text-secondary", bgClass: "bg-secondary/10" },
  entregable_sent:   { icon: FileUp,            iconClass: "text-secondary", bgClass: "bg-secondary/10" },
  new_offer:         { icon: MessageSquarePlus, iconClass: "text-primary",   bgClass: "bg-primary/10" },
};

const JUNIOR_GROUPS: PrefGroup[] = [
  {
    groupKey: "group_activity",
    items: ["offer_accepted", "offer_reviewed"],
  },
  {
    groupKey: "group_projects",
    items: ["new_project", "deadline_reminder"],
  },
  {
    groupKey: "group_messages",
    items: ["new_message"],
  },
];

const COMPANY_GROUPS: PrefGroup[] = [
  {
    groupKey: "group_applications",
    items: ["new_offer"],
  },
  {
    groupKey: "group_deliverables",
    items: ["entregable_sent"],
  },
  {
    groupKey: "group_messages",
    items: ["new_message"],
  },
];

const DEFAULT_PREFS: Record<PrefKey, boolean> = {
  offer_accepted:    true,
  offer_reviewed:    true,
  new_project:       true,
  deadline_reminder: true,
  new_message:       true,
  entregable_sent:   true,
  new_offer:         true,
};

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({
  id,
  checked,
  onChange,
  ariaLabel,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        checked ? "bg-primary" : "bg-border",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)]",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

// ── Pref Row ──────────────────────────────────────────────────────────────────

function PrefRow({
  prefKey,
  enabled,
  onChange,
}: {
  prefKey: PrefKey;
  enabled: boolean;
  onChange: (key: PrefKey, val: boolean) => void;
}) {
  const t = useTranslations("preferencias_notificaciones");
  const cfg = PREF_CONFIG[prefKey];
  const Icon = cfg.icon;

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            cfg.bgClass,
          )}
        >
          <Icon className={cn("size-4", cfg.iconClass)} aria-hidden="true" />
        </div>
        <div>
          <label
            htmlFor={`pref-${prefKey}`}
            className="font-body text-sm font-semibold text-ink-strong cursor-pointer"
          >
            {t(`pref_${prefKey}_label`)}
          </label>
          <p className="font-body text-xs text-ink-muted">
            {t(`pref_${prefKey}_desc`)}
          </p>
        </div>
      </div>
      <Toggle
        id={`pref-${prefKey}`}
        checked={enabled}
        onChange={(v) => onChange(prefKey, v)}
        ariaLabel={t(`pref_${prefKey}_label`)}
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  role: ApiRoleName;
}

export function PreferenciasNotificaciones({ role }: Props) {
  const t = useTranslations("preferencias_notificaciones");
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const groups = role === "company" ? COMPANY_GROUPS : JUNIOR_GROUPS;

  function handleChange(key: PrefKey, value: boolean) {
    setSaved(false);
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      // RF-48: UI-only, Etapa 13 conecta con backend
      await new Promise<void>((res) => setTimeout(res, 600));
      setSaved(true);
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <Bell className="size-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong mb-1">
            {t("title")}
            <span className="text-primary" aria-hidden="true">.</span>
          </h1>
          <p className="font-body text-sm text-ink-muted">{t("subtitle")}</p>
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <section
            key={group.groupKey}
            className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)] overflow-hidden"
          >
            <div className="border-b border-border bg-surface-sunken px-5 py-3">
              <h2 className="font-body text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                {t(group.groupKey)}
              </h2>
            </div>
            <div className="px-5 divide-y divide-border">
              {group.items.map((key) => (
                <PrefRow
                  key={key}
                  prefKey={key}
                  enabled={prefs[key]}
                  onChange={handleChange}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Save bar */}
      <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-[var(--shadow-soft)]">
        <p className="font-body text-sm text-ink-muted">
          {saved ? (
            <span className="flex items-center gap-1.5 font-semibold text-accent">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {t("saved_confirmation")}
            </span>
          ) : (
            t("save_hint")
          )}
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {t("saving")}
            </>
          ) : (
            t("save_btn")
          )}
        </button>
      </div>

      <p className="mt-4 text-center font-body text-[11px] text-ink-subtle">
        {t("mock_disclaimer")}
      </p>
    </div>
  );
}
