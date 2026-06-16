"use client";

import { useState } from "react";
import { Store, ShieldCheck, Plus, Pencil, Trash2, X, CheckCircle2 } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";

interface SettingToggle {
  key: string;
  label: string;
  description: string;
}

const MARKETPLACE_SETTINGS: SettingToggle[] = [
  { key: "registros", label: "Permitir registros", description: "Habilita la creación de nuevas cuentas de talento." },
  { key: "empresas", label: "Permitir empresas", description: "Permite el onboarding de perfiles corporativos." },
  { key: "postulaciones", label: "Permitir postulaciones", description: "Habilita el botón de aplicar en proyectos activos." },
  { key: "matching", label: "Activar matching", description: "Algoritmo automático de sugerencia de talento." },
];

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
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-[var(--duration-fast)] ${checked ? "bg-primary" : "bg-border-strong"}`}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow-soft transition-transform duration-[var(--duration-fast)] ${checked ? "translate-x-[1.375rem]" : "translate-x-0.5"}`} />
    </button>
  );
}

export function ConfiguracionView() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    registros: true,
    empresas: true,
    postulaciones: true,
    matching: true,
  });
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [saved, setSaved] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RoleForm>(EMPTY_FORM);

  function markDirty() {
    setSaved(false);
  }

  function toggleSetting(key: string) {
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
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-8 md:px-10">
      <PageTitle
        eyebrow="Administración"
        title="Configuración"
        description="Gestiona los parámetros generales del ecosistema FWD Talent y personaliza la experiencia del marketplace."
      />

      {/* Marketplace */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-ink-strong">
          <Store className="size-5 text-primary" aria-hidden="true" /> Marketplace
        </h2>
        <div className="rounded-2xl bg-surface px-6 shadow-soft ring-1 ring-border">
          <div className="divide-y divide-border">
            {MARKETPLACE_SETTINGS.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between gap-6 py-5">
                <div className="min-w-0">
                  <p className="font-body text-sm font-bold text-ink-strong">{setting.label}</p>
                  <p className="font-body text-sm text-ink-muted">{setting.description}</p>
                </div>
                <Switch checked={!!settings[setting.key]} onChange={() => toggleSetting(setting.key)} label={setting.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles y permisos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-ink-strong">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" /> Roles y Permisos
          </h2>
          <Button onClick={openCreate}><Plus className="size-4" aria-hidden="true" /> Crear rol</Button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-4 py-4">Descripción</th>
                  <th className="px-4 py-4">Usuarios</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center font-body text-sm text-ink-muted">
                      No hay roles definidos. Creá uno con &quot;Crear rol&quot;.
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="font-body text-sm">
                      <td className="px-6 py-4 font-bold text-primary">{role.name}</td>
                      <td className="px-4 py-4 text-ink">{role.description}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-surface-sunken px-2.5 py-1 font-body text-xs font-medium text-ink-muted">{role.users} usuarios</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" aria-label={`Editar ${role.name}`} onClick={() => openEdit(role)} className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted ring-1 ring-border transition-colors hover:bg-surface-sunken hover:text-primary">
                            <Pencil className="size-4" aria-hidden="true" />
                          </button>
                          <button type="button" aria-label={`Eliminar ${role.name}`} onClick={() => deleteRole(role.id)} className="inline-flex size-9 items-center justify-center rounded-lg text-ink-muted ring-1 ring-border transition-colors hover:bg-magenta/10 hover:text-magenta">
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
        {saved && (
          <span className="flex items-center gap-1.5 font-body text-sm font-medium text-accent">
            <CheckCircle2 className="size-4" aria-hidden="true" /> Cambios guardados
          </span>
        )}
        <Button size="lg" onClick={() => setSaved(true)}>Guardar cambios</Button>
      </div>

      {/* Role modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Cerrar" onClick={() => setModalOpen(false)} className="absolute inset-0 bg-ink-strong/40" />
          <div role="dialog" aria-modal="true" aria-labelledby="role-modal-title" className="relative w-full max-w-md rounded-2xl bg-surface p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <h3 id="role-modal-title" className="font-heading text-lg font-bold text-ink-strong">
                {editingId === null ? "Crear rol" : "Editar rol"}
              </h3>
              <button type="button" aria-label="Cerrar" onClick={() => setModalOpen(false)} className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={submitRole} className="space-y-4">
              <div>
                <label htmlFor="role-name" className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">Nombre del rol</label>
                <input id="role-name" type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required autoFocus className="w-full rounded-lg bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label htmlFor="role-desc" className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">Descripción</label>
                <input id="role-desc" type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label htmlFor="role-users" className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">Usuarios</label>
                <input id="role-users" type="number" min={0} value={form.users} onChange={(e) => setForm((f) => ({ ...f, users: e.target.value }))} className="w-full rounded-lg bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingId === null ? "Crear rol" : "Guardar rol"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
