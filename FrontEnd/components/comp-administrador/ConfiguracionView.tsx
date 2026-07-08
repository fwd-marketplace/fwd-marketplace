"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Palette, Moon, Languages, Store, ShieldCheck, Plus, Pencil, Trash2, X, CheckCircle2, Loader2 } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme/theme-provider";
import { updateAdminSettingsAction } from "@/lib/actions/admin";
import type { AdminSettings } from "@/lib/api/types";

const MARKETPLACE_KEYS = ["registros", "empresas", "postulaciones", "matching"] as const;
const LOCALES = ["es", "en"] as const;

/** Mapea las llaves visibles del marketplace a los flags reales de la configuración. */
const SETTING_KEY_MAP: Record<(typeof MARKETPLACE_KEYS)[number], keyof AdminSettings> = {
  registros: "allow_signups",
  empresas: "allow_companies",
  postulaciones: "allow_applications",
  matching: "enable_matching",
};

interface Role {
  id: number;
  name: string;
  description: string;
  users: number;
}

const INITIAL_ROLES: Role[] = [
  { id: 1, name: "Super Admin", description: "Acceso total al sistema", users: 2 },
  { id: 2, name: "Manager", description: "Gestión de proyectos y clientes", users: 5 },
  { id: 3, name: "Moderator", description: "Gestión de talento y reviews", users: 3 },
];

type RoleForm = { name: string; description: string; users: string };
const EMPTY_FORM: RoleForm = { name: "", description: "", users: "0" };

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full px-0.5 outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${checked ? "bg-primary" : "bg-border-strong"}`}
    >
      <span className={`block size-5 rounded-full bg-white shadow-soft transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export function ConfiguracionView({ initialSettings }: { initialSettings: AdminSettings }) {
  const t = useTranslations("admin_config");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RoleForm>(EMPTY_FORM);

  function markDirty() {
    setSaved(false);
  }

  function saveSettings() {
    setSaveError(null);
    startSaving(async () => {
      const result = await updateAdminSettingsAction(settings);
      if (!result.ok) {
        setSaveError(result.error);
        return;
      }
      setSettings(result.data.settings);
      setSaved(true);
      router.refresh();
    });
  }

  function changeLocale(next: string) {
    if (next === locale) return;
    const nextPath = pathname.replace(/^\/[^/]+/, `/${next}`);
    router.replace(nextPath);
  }

  function toggleSetting(key: keyof AdminSettings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    markDirty();
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(role: Role) {
    setEditingId(role.id);
    setForm({ name: role.name, description: role.description, users: String(role.users) });
    setModalOpen(true);
  }

  function deleteRole(id: number) {
    setRoles((prev) => prev.filter((role) => role.id !== id));
    markDirty();
  }

  function submitRole(event: React.FormEvent) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    const users = Number(form.users) || 0;
    const description = form.description.trim();
    if (editingId === null) {
      const nextId = roles.length ? Math.max(...roles.map((role) => role.id)) + 1 : 1;
      setRoles((prev) => [...prev, { id: nextId, name, description, users }]);
    } else {
      setRoles((prev) => prev.map((role) => (role.id === editingId ? { ...role, name, description, users } : role)));
    }
    setModalOpen(false);
    markDirty();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 pb-8 pt-20 md:px-10 md:py-8">
      <PageTitle eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      {/* Apariencia y preferencias */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-ink-strong">
          <Palette className="size-5 text-primary" aria-hidden="true" /> {t("appearance.title")}
        </h2>
        <div className="rounded-2xl bg-surface px-6 shadow-soft ring-1 ring-border">
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between gap-6 py-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Moon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-body text-sm font-bold text-ink-strong">{t("appearance.dark_mode")}</p>
                  <p className="font-body text-sm text-ink-muted">{t("appearance.dark_mode_desc")}</p>
                </div>
              </div>
              <Switch checked={isDark} onChange={toggleTheme} label={t("appearance.dark_mode")} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Languages className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-body text-sm font-bold text-ink-strong">{t("appearance.language")}</p>
                  <p className="font-body text-sm text-ink-muted">{t("appearance.language_desc")}</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-surface-sunken p-1">
                {LOCALES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    aria-pressed={locale === code}
                    onClick={() => changeLocale(code)}
                    className={`rounded-full px-4 py-1.5 font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] ${locale === code ? "bg-primary text-white" : "text-ink-muted hover:text-ink-strong"}`}
                  >
                    {code === "es" ? t("appearance.spanish") : t("appearance.english")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-ink-strong">
          <Store className="size-5 text-primary" aria-hidden="true" /> {t("marketplace.title")}
        </h2>
        <div className="rounded-2xl bg-surface px-6 shadow-soft ring-1 ring-border">
          <div className="divide-y divide-border">
            {MARKETPLACE_KEYS.map((key) => {
              const settingKey = SETTING_KEY_MAP[key];
              return (
                <div key={key} className="flex items-center justify-between gap-6 py-5">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-bold text-ink-strong">{t(`marketplace.${key}_label`)}</p>
                    <p className="font-body text-sm text-ink-muted">{t(`marketplace.${key}_desc`)}</p>
                  </div>
                  <Switch checked={settings[settingKey]} onChange={() => toggleSetting(settingKey)} label={t(`marketplace.${key}_label`)} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles y permisos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-ink-strong">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" /> {t("roles.title")}
          </h2>
          <Button onClick={openCreate}><Plus className="size-4" aria-hidden="true" /> {t("roles.create")}</Button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  <th className="px-6 py-4">{t("roles.th_role")}</th>
                  <th className="px-4 py-4">{t("roles.th_description")}</th>
                  <th className="px-4 py-4">{t("roles.th_users")}</th>
                  <th className="px-6 py-4 text-right">{t("roles.th_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center font-body text-sm text-ink-muted">
                      {t("roles.empty")}
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="font-body text-sm">
                      <td className="px-6 py-4 font-bold text-primary">{role.name}</td>
                      <td className="px-4 py-4 text-ink">{role.description}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-surface-sunken px-2.5 py-1 font-body text-xs font-medium text-ink-muted">{t("roles.users_count", { count: role.users })}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" aria-label={t("roles.edit_aria")} onClick={() => openEdit(role)} className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted ring-1 ring-border transition-colors hover:bg-surface-sunken hover:text-primary">
                            <Pencil className="size-4" aria-hidden="true" />
                          </button>
                          <button type="button" aria-label={t("roles.delete_aria")} onClick={() => deleteRole(role.id)} className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted ring-1 ring-border transition-colors hover:bg-magenta/10 hover:text-magenta">
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex flex-wrap items-center justify-end gap-4 border-t border-border pt-6">
        {saveError && <span className="font-body text-sm font-medium text-magenta">{saveError}</span>}
        {saved && !saveError && (
          <span className="flex items-center gap-1.5 font-body text-sm font-medium text-accent">
            <CheckCircle2 className="size-4" aria-hidden="true" /> {t("saved")}
          </span>
        )}
        <Button size="lg" onClick={saveSettings} disabled={isSaving}>
          {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t("save")}
        </Button>
      </div>

      {/* Role modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label={t("roles.cancel")} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-ink-strong/40" />
          <div role="dialog" aria-modal="true" aria-labelledby="role-modal-title" className="relative w-full max-w-md rounded-2xl bg-surface p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <h3 id="role-modal-title" className="font-heading text-lg font-bold text-ink-strong">
                {editingId === null ? t("roles.modal_create_title") : t("roles.modal_edit_title")}
              </h3>
              <button type="button" aria-label={t("roles.cancel")} onClick={() => setModalOpen(false)} className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={submitRole} className="space-y-4">
              <div>
                <label htmlFor="role-name" className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("roles.field_name")}</label>
                <input id="role-name" type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required autoFocus className="w-full rounded-lg bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label htmlFor="role-desc" className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("roles.field_description")}</label>
                <input id="role-desc" type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label htmlFor="role-users" className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("roles.field_users")}</label>
                <input id="role-users" type="number" min={0} value={form.users} onChange={(e) => setForm((f) => ({ ...f, users: e.target.value }))} className="w-full rounded-lg bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t("roles.cancel")}</Button>
                <Button type="submit">{editingId === null ? t("roles.submit_create") : t("roles.submit_edit")}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
