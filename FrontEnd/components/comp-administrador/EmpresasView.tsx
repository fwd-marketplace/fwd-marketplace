"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Eye,
  Layers,
  Loader2,
  Pencil,
  Rocket,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pagination, EmptyRow } from "@/components/comp-administrador/admin-controls";
import {
  createAdminCompanyAction,
  deleteAdminUserAction,
  updateAdminCompanyAction,
} from "@/lib/actions/admin";
import type { AdminCompany, AccountState, CompanyType } from "@/lib/api/types";

const PAGE_SIZE = 6;
const FILTER_ALL = "all";
const EMPTY_VALUE = "—";
const MESSAGE_TIMEOUT_MS = 3500;
const MIN_PASSWORD_LENGTH = 8;

const COMPANY_TYPE_VALUES: readonly CompanyType[] = ["empresa", "emprendedor"];
const ACCOUNT_STATE_VALUES: readonly AccountState[] = ["activa", "pendiente", "suspendida", "rechazada"];

const TYPE_BADGE_STYLE: Record<CompanyType, string> = {
  empresa: "bg-secondary/10 text-secondary",
  emprendedor: "bg-warning/10 text-warning",
};

const STATUS_BADGE_STYLE: Record<AccountState, string> = {
  activa: "bg-accent/15 text-accent",
  pendiente: "bg-warning/15 text-warning",
  suspendida: "bg-magenta/15 text-magenta",
  rechazada: "bg-ink-muted/15 text-ink-muted",
};

function buildInitials(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "E";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "M";
  return `${first}${second}`.toUpperCase();
}

function readMaybeList(value: string | null): string {
  if (!value) return EMPTY_VALUE;
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.join(", ");
  } catch {
    // No es JSON; se muestra tal cual.
  }
  return value;
}

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function companyName(company: AdminCompany, fallback: string): string {
  return company.nombre_comercial?.trim() || fallback;
}

function TypeBadge({ type, label }: { type: CompanyType; label: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${TYPE_BADGE_STYLE[type]}`}>
      {label}
    </span>
  );
}

function CompanyAvatar({ logoUrl, name, size }: { logoUrl: string | null; name: string; size: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "size-14 text-base" : "size-10 text-xs";
  if (logoUrl) {
    return (
      <span className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} className="size-full object-cover" />
      </span>
    );
  }
  return (
    <span className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-primary/10 font-body font-bold text-primary dark:bg-primary dark:text-primary-foreground`}>
      {buildInitials(name)}
    </span>
  );
}

function StatusBadge({ status, label }: { status: AccountState; label: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE_STYLE[status]}`}>
      {label}
    </span>
  );
}

// ── Modal genérico ──

function ModalShell({ titleId, onClose, children, size = "lg" }: { titleId: string; onClose: () => void; children: React.ReactNode; size?: "lg" | "sm" }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-strong/40 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className={`w-full overflow-hidden rounded-2xl bg-surface shadow-elevated ring-1 ring-border duration-[var(--duration-base)] ease-[var(--ease-out)] ${size === "lg" ? "max-w-lg" : "max-w-md"}`}
      >
        {children}
      </div>
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none ring-1 ring-border placeholder:text-ink-subtle focus:ring-2 focus:ring-primary/40";

function Field({ id, label, error, children }: { id: string; label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="font-body text-sm font-semibold text-ink-strong">{label}</label>
      {children}
      {error && <p className="font-body text-xs text-magenta">{error}</p>}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 font-body text-sm font-medium text-ink-strong">{value}</dd>
    </div>
  );
}

// ── Modal: detalle de empresa (datos de la fila, sin fetch) ──

function CompanyDetailModal({ company, locale, onClose }: { company: AdminCompany; locale: string; onClose: () => void }) {
  const t = useTranslations("admin_empresas");
  const titleId = "empresa-detail-title";
  const name = companyName(company, t("table.no_name"));
  const contact = company.usuario ? [company.usuario.nombre, company.usuario.apellido1].filter(Boolean).join(" ") : EMPTY_VALUE;

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-sunken p-6">
        <div className="flex min-w-0 items-center gap-4">
          <CompanyAvatar logoUrl={company.url_logo} name={name} size="lg" />
          <div className="min-w-0">
            <h2 id={titleId} className="truncate font-heading text-xl font-bold tracking-tight text-ink-strong">{name}</h2>
            <p className="font-body text-sm text-ink-muted">{t("detail_modal.subtitle")}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("detail_modal.close")}>
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={company.tipo} label={t(`types.${company.tipo}`)} />
          {company.usuario && <StatusBadge status={company.usuario.estado_cuenta} label={t(`account_states.${company.usuario.estado_cuenta}`)} />}
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <DetailRow label={t("detail_modal.field_type")} value={t(`types.${company.tipo}`)} />
          {company.sector && <DetailRow label={t("detail_modal.field_sector")} value={company.sector} />}
          {company.etapa && <DetailRow label={t("detail_modal.field_stage")} value={company.etapa} />}
          {company.cantidad_empleados && <DetailRow label={t("detail_modal.field_employees")} value={company.cantidad_empleados} />}
          {company.url_sitio_web && <DetailRow label={t("detail_modal.field_website")} value={company.url_sitio_web} />}
          {company.direccion && <DetailRow label={t("detail_modal.field_address")} value={company.direccion} />}
          {company.modalidades && <DetailRow label={t("detail_modal.field_modality")} value={readMaybeList(company.modalidades)} />}
          {company.presupuesto && <DetailRow label={t("detail_modal.field_budget")} value={company.presupuesto} />}
        </dl>
        {company.descripcion && (
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{t("detail_modal.field_description")}</p>
            <p className="mt-1 font-body text-sm leading-relaxed text-ink">{company.descripcion}</p>
          </div>
        )}

        {company.usuario && (
          <div className="border-t border-border pt-4">
            <p className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-ink-strong">{t("detail_modal.section_account")}</p>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <DetailRow label={t("detail_modal.field_contact")} value={contact || EMPTY_VALUE} />
              <DetailRow label={t("detail_modal.field_email")} value={company.usuario.correo} />
              <DetailRow label={t("detail_modal.field_account_status")} value={t(`account_states.${company.usuario.estado_cuenta}`)} />
              <DetailRow label={t("detail_modal.field_joined")} value={formatDate(company.usuario.fecha_registro, locale)} />
            </dl>
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-border bg-surface-sunken p-4">
        <Button variant="outline" onClick={onClose}>{t("detail_modal.close")}</Button>
      </div>
    </ModalShell>
  );
}

// ── Modal: crear empresa ──

function CreateCompanyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (message: string) => void }) {
  const t = useTranslations("admin_empresas");
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const titleId = "empresa-create-title";

  const schema = useMemo(
    () =>
      z.object({
        nombre: z.string().trim().min(1, t("form_modal.errors.name_required")),
        correo: z.string().email(t("form_modal.errors.email_invalid")),
        password: z.string().min(MIN_PASSWORD_LENGTH, t("form_modal.errors.password_min")),
        tipo: z.enum(["empresa", "emprendedor"]),
        nombre_comercial: z.string().trim().min(1, t("form_modal.errors.commercial_required")),
        sector: z.string().trim().optional(),
      }),
    [t],
  );
  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", correo: "", password: "", tipo: "empresa", nombre_comercial: "", sector: "" },
  });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await createAdminCompanyAction({
        correo: values.correo,
        password: values.password,
        nombre: values.nombre,
        tipo: values.tipo,
        nombre_comercial: values.nombre_comercial,
        ...(values.sector ? { sector: values.sector } : {}),
      });
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      onSuccess(t("messages.created"));
    });
  }

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-sunken p-6">
        <div className="min-w-0">
          <h2 id={titleId} className="font-heading text-xl font-bold tracking-tight text-ink-strong">{t("form_modal.create_title")}</h2>
          <p className="font-body text-sm text-ink-muted">{t("form_modal.create_subtitle")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("detail_modal.close")}>
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <form className="max-h-[60vh] space-y-4 overflow-y-auto p-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field id="company-commercial" label={t("form_modal.field_commercial_name")} error={errors.nombre_comercial?.message}>
          <input id="company-commercial" type="text" placeholder={t("form_modal.field_commercial_name_placeholder")} className={INPUT_CLASS} {...register("nombre_comercial")} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="company-type" label={t("form_modal.field_type")} error={errors.tipo?.message}>
            <select id="company-type" className={`${INPUT_CLASS} cursor-pointer appearance-none`} {...register("tipo")}>
              {COMPANY_TYPE_VALUES.map((type) => (
                <option key={type} value={type}>{t(`types.${type}`)}</option>
              ))}
            </select>
          </Field>
          <Field id="company-sector" label={t("form_modal.field_sector")} error={errors.sector?.message}>
            <input id="company-sector" type="text" placeholder={t("form_modal.field_sector_placeholder")} className={INPUT_CLASS} {...register("sector")} />
          </Field>
        </div>
        <Field id="company-contact" label={t("form_modal.field_contact_name")} error={errors.nombre?.message}>
          <input id="company-contact" type="text" placeholder={t("form_modal.field_contact_name_placeholder")} className={INPUT_CLASS} {...register("nombre")} />
        </Field>
        <Field id="company-email" label={t("form_modal.field_email")} error={errors.correo?.message}>
          <input id="company-email" type="email" placeholder={t("form_modal.field_email_placeholder")} className={INPUT_CLASS} {...register("correo")} />
        </Field>
        <Field id="company-password" label={t("form_modal.field_password")} error={errors.password?.message}>
          <input id="company-password" type="password" placeholder={t("form_modal.field_password_placeholder")} className={INPUT_CLASS} {...register("password")} />
        </Field>

        {serverError && <p className="font-body text-sm text-magenta">{serverError}</p>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>{t("form_modal.cancel")}</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {isPending ? t("form_modal.creating") : t("form_modal.create")}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── Modal: editar empresa (perfil empresario) ──

function EditCompanyModal({ company, onClose, onSuccess }: { company: AdminCompany; onClose: () => void; onSuccess: (message: string) => void }) {
  const t = useTranslations("admin_empresas");
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const titleId = "empresa-edit-title";

  const schema = useMemo(
    () =>
      z.object({
        nombre_comercial: z.string().trim().min(1, t("form_modal.errors.commercial_required")),
        tipo: z.enum(["empresa", "emprendedor"]),
        sector: z.string().trim().optional(),
        etapa: z.string().trim().optional(),
        cantidad_empleados: z.string().trim().optional(),
        url_sitio_web: z.string().trim().optional(),
        direccion: z.string().trim().optional(),
        descripcion: z.string().trim().optional(),
      }),
    [t],
  );
  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre_comercial: company.nombre_comercial ?? "",
      tipo: company.tipo,
      sector: company.sector ?? "",
      etapa: company.etapa ?? "",
      cantidad_empleados: company.cantidad_empleados ?? "",
      url_sitio_web: company.url_sitio_web ?? "",
      direccion: company.direccion ?? "",
      descripcion: company.descripcion ?? "",
    },
  });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await updateAdminCompanyAction(company.id, {
        nombre_comercial: values.nombre_comercial,
        tipo: values.tipo,
        ...(values.sector ? { sector: values.sector } : {}),
        ...(values.etapa ? { etapa: values.etapa } : {}),
        ...(values.cantidad_empleados ? { cantidad_empleados: values.cantidad_empleados } : {}),
        ...(values.url_sitio_web ? { url_sitio_web: values.url_sitio_web } : {}),
        ...(values.direccion ? { direccion: values.direccion } : {}),
        ...(values.descripcion ? { descripcion: values.descripcion } : {}),
      });
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      onSuccess(t("messages.updated"));
    });
  }

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-sunken p-6">
        <div className="min-w-0">
          <h2 id={titleId} className="font-heading text-xl font-bold tracking-tight text-ink-strong">{t("form_modal.edit_title")}</h2>
          <p className="font-body text-sm text-ink-muted">{t("form_modal.edit_subtitle")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("detail_modal.close")}>
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <form className="max-h-[60vh] space-y-4 overflow-y-auto p-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field id="edit-commercial" label={t("form_modal.field_commercial_name")} error={errors.nombre_comercial?.message}>
          <input id="edit-commercial" type="text" placeholder={t("form_modal.field_commercial_name_placeholder")} className={INPUT_CLASS} {...register("nombre_comercial")} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="edit-type" label={t("form_modal.field_type")} error={errors.tipo?.message}>
            <select id="edit-type" className={`${INPUT_CLASS} cursor-pointer appearance-none`} {...register("tipo")}>
              {COMPANY_TYPE_VALUES.map((type) => (
                <option key={type} value={type}>{t(`types.${type}`)}</option>
              ))}
            </select>
          </Field>
          <Field id="edit-sector" label={t("form_modal.field_sector")} error={errors.sector?.message}>
            <input id="edit-sector" type="text" placeholder={t("form_modal.field_sector_placeholder")} className={INPUT_CLASS} {...register("sector")} />
          </Field>
          <Field id="edit-stage" label={t("form_modal.field_stage")} error={errors.etapa?.message}>
            <input id="edit-stage" type="text" placeholder={t("form_modal.field_stage_placeholder")} className={INPUT_CLASS} {...register("etapa")} />
          </Field>
          <Field id="edit-employees" label={t("form_modal.field_employees")} error={errors.cantidad_empleados?.message}>
            <input id="edit-employees" type="text" placeholder={t("form_modal.field_employees_placeholder")} className={INPUT_CLASS} {...register("cantidad_empleados")} />
          </Field>
        </div>
        <Field id="edit-website" label={t("form_modal.field_website")} error={errors.url_sitio_web?.message}>
          <input id="edit-website" type="text" placeholder={t("form_modal.field_website_placeholder")} className={INPUT_CLASS} {...register("url_sitio_web")} />
        </Field>
        <Field id="edit-address" label={t("form_modal.field_address")} error={errors.direccion?.message}>
          <input id="edit-address" type="text" placeholder={t("form_modal.field_address_placeholder")} className={INPUT_CLASS} {...register("direccion")} />
        </Field>
        <Field id="edit-description" label={t("form_modal.field_description")} error={errors.descripcion?.message}>
          <textarea id="edit-description" rows={3} placeholder={t("form_modal.field_description_placeholder")} className={INPUT_CLASS} {...register("descripcion")} />
        </Field>

        {serverError && <p className="font-body text-sm text-magenta">{serverError}</p>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>{t("form_modal.cancel")}</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {isPending ? t("form_modal.saving") : t("form_modal.save")}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function ConfirmDeleteModal({ isPending, onConfirm, onClose }: { isPending: boolean; onConfirm: () => void; onClose: () => void }) {
  const t = useTranslations("admin_empresas");
  const titleId = "empresa-confirm-title";
  return (
    <ModalShell titleId={titleId} onClose={onClose} size="sm">
      <div className="space-y-2 p-6">
        <h2 id={titleId} className="font-heading text-lg font-bold tracking-tight text-ink-strong">{t("confirm_delete.title")}</h2>
        <p className="font-body text-sm text-ink-muted">{t("confirm_delete.message")}</p>
      </div>
      <div className="flex justify-end gap-2 border-t border-border bg-surface-sunken p-4">
        <Button variant="outline" onClick={onClose} disabled={isPending}>{t("confirm_delete.cancel")}</Button>
        <Button variant="magenta" onClick={onConfirm} disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {isPending ? t("confirm_delete.working") : t("confirm_delete.confirm")}
        </Button>
      </div>
    </ModalShell>
  );
}

function StatCard({ icon, label, value, accentClassName }: { icon: React.ReactNode; label: string; value: number; accentClassName: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
      <div className={`rounded-xl p-3 ${accentClassName}`}>{icon}</div>
      <div>
        <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-subtle">{label}</p>
        <p className="font-heading text-2xl font-black text-ink-strong">{value}</p>
      </div>
    </div>
  );
}

export function EmpresasView({ companies, locale }: { companies: AdminCompany[]; locale: string }) {
  const t = useTranslations("admin_empresas");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(FILTER_ALL);
  const [sectorFilter, setSectorFilter] = useState(FILTER_ALL);
  const [stageFilter, setStageFilter] = useState(FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [detailCompany, setDetailCompany] = useState<AdminCompany | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<AdminCompany | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCompany | null>(null);
  const [isActionPending, startActionTransition] = useTransition();

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), MESSAGE_TIMEOUT_MS);
  }

  function refresh() {
    router.refresh();
  }

  const stats = useMemo(
    () => ({
      total: companies.length,
      empresa: companies.filter((c) => c.tipo === "empresa").length,
      emprendedor: companies.filter((c) => c.tipo === "emprendedor").length,
      active: companies.filter((c) => c.usuario?.estado_cuenta === "activa").length,
    }),
    [companies],
  );

  const sectorOptions = useMemo(
    () => [...new Set(companies.map((c) => c.sector).filter((value): value is string => Boolean(value)))],
    [companies],
  );
  const stageOptions = useMemo(
    () => [...new Set(companies.map((c) => c.etapa).filter((value): value is string => Boolean(value)))],
    [companies],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return companies.filter((company) => {
      if (typeFilter !== FILTER_ALL && company.tipo !== typeFilter) return false;
      if (sectorFilter !== FILTER_ALL && company.sector !== sectorFilter) return false;
      if (stageFilter !== FILTER_ALL && company.etapa !== stageFilter) return false;
      if (statusFilter !== FILTER_ALL && company.usuario?.estado_cuenta !== statusFilter) return false;
      if (normalizedQuery) {
        const haystack = `${company.nombre_comercial ?? ""} ${company.usuario?.nombre ?? ""} ${company.usuario?.correo ?? ""}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [companies, query, typeFilter, sectorFilter, stageFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  function clearFilters() {
    setQuery("");
    setTypeFilter(FILTER_ALL);
    setSectorFilter(FILTER_ALL);
    setStageFilter(FILTER_ALL);
    setStatusFilter(FILTER_ALL);
    setPage(1);
  }

  function handleMutationSuccess(text: string) {
    setCreateOpen(false);
    setEditCompany(null);
    flash(text);
    refresh();
  }

  function runDelete() {
    if (!deleteTarget?.usuario) return;
    const userId = deleteTarget.usuario.id;
    startActionTransition(async () => {
      const result = await deleteAdminUserAction(userId);
      if (!result.ok) {
        flash(result.error);
        return;
      }
      flash(t("messages.deleted"));
      setDeleteTarget(null);
      refresh();
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-10">
      {message && (
        <div className="fixed bottom-5 right-5 z-[60] rounded-xl border border-border-strong bg-surface px-4 py-3 font-body text-sm font-semibold text-ink-strong shadow-elevated">
          {message}
        </div>
      )}

      <PageTitle
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="size-4" aria-hidden="true" />
            {t("create_company")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Building2 className="size-6 text-primary" />} label={t("stats.total")} value={stats.total} accentClassName="bg-primary/10" />
        <StatCard icon={<Layers className="size-6 text-secondary" />} label={t("stats.empresa")} value={stats.empresa} accentClassName="bg-secondary/10" />
        <StatCard icon={<Rocket className="size-6 text-warning" />} label={t("stats.emprendedor")} value={stats.emprendedor} accentClassName="bg-warning/10" />
        <StatCard icon={<ShieldCheck className="size-6 text-accent" />} label={t("stats.active")} value={stats.active} accentClassName="bg-accent/15" />
      </div>

      {/* Filtros */}
      <section className="rounded-2xl bg-surface-sunken p-6 ring-1 ring-border">
        <h2 className="mb-4 font-heading text-lg font-bold text-ink-strong">{t("filters.title")}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[16rem] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(event) => updateFilter(setQuery)(event.target.value)}
              placeholder={t("filters.search_placeholder")}
              aria-label={t("filters.search_placeholder")}
              className="w-full rounded-lg bg-surface py-2.5 pl-9 pr-3 font-body text-sm text-ink-strong outline-none ring-1 ring-border placeholder:text-ink-subtle focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <FilterSelect rounded="lg" ariaLabel={t("filters.type_all")} value={typeFilter} onChange={updateFilter(setTypeFilter)} options={[{ value: FILTER_ALL, label: t("filters.type_all") }, ...COMPANY_TYPE_VALUES.map((type) => ({ value: type, label: t(`types.${type}`) }))]} />
          <FilterSelect rounded="lg" ariaLabel={t("filters.sector_all")} value={sectorFilter} onChange={updateFilter(setSectorFilter)} options={[{ value: FILTER_ALL, label: t("filters.sector_all") }, ...sectorOptions.map((value) => ({ value, label: value }))]} />
          <FilterSelect rounded="lg" ariaLabel={t("filters.stage_all")} value={stageFilter} onChange={updateFilter(setStageFilter)} options={[{ value: FILTER_ALL, label: t("filters.stage_all") }, ...stageOptions.map((value) => ({ value, label: value }))]} />
          <FilterSelect rounded="lg" ariaLabel={t("filters.status_all")} value={statusFilter} onChange={updateFilter(setStatusFilter)} options={[{ value: FILTER_ALL, label: t("filters.status_all") }, ...ACCOUNT_STATE_VALUES.map((status) => ({ value: status, label: t(`account_states.${status}`) }))]} />
          <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary hover:underline">
            <X className="size-4" aria-hidden="true" /> {t("filters.clear")}
          </button>
        </div>
      </section>

      {/* Tabla */}
      {pageItems.length === 0 ? (
        <EmptyRow message={t("table.empty")} />
      ) : (
        <section className="overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-border font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  <th className="px-6 py-4">{t("table.company")}</th>
                  <th className="px-4 py-4">{t("table.type")}</th>
                  <th className="px-4 py-4">{t("table.sector")}</th>
                  <th className="px-4 py-4">{t("table.stage")}</th>
                  <th className="px-4 py-4">{t("table.status")}</th>
                  <th className="px-6 py-4 text-right">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((company) => {
                  const name = companyName(company, t("table.no_name"));
                  return (
                    <tr key={company.id} className="font-body text-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <CompanyAvatar logoUrl={company.url_logo} name={name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink-strong">{name}</p>
                            <p className="truncate text-xs text-ink-muted">{company.usuario?.correo ?? EMPTY_VALUE}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4"><TypeBadge type={company.tipo} label={t(`types.${company.tipo}`)} /></td>
                      <td className="px-4 py-4 text-ink">{company.sector ?? EMPTY_VALUE}</td>
                      <td className="px-4 py-4 text-ink">{company.etapa ?? EMPTY_VALUE}</td>
                      <td className="px-4 py-4">
                        {company.usuario ? <StatusBadge status={company.usuario.estado_cuenta} label={t(`account_states.${company.usuario.estado_cuenta}`)} /> : EMPTY_VALUE}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDetailCompany(company)}>
                            <Eye className="size-3.5" aria-hidden="true" />
                            {t("row_actions.view")}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditCompany(company)} aria-label={t("row_actions.edit")}>
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-magenta hover:bg-magenta/10" disabled={!company.usuario} onClick={() => setDeleteTarget(company)} aria-label={t("row_actions.delete")}>
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4">
            <p className="font-body text-sm text-ink-muted">{t("table.summary", { shown: pageItems.length, total: filtered.length })}</p>
            <Pagination page={safePage} pageCount={pageCount} onPage={setPage} shape="round" />
          </div>
        </section>
      )}

      {detailCompany && <CompanyDetailModal company={detailCompany} locale={locale} onClose={() => setDetailCompany(null)} />}
      {createOpen && <CreateCompanyModal onClose={() => setCreateOpen(false)} onSuccess={handleMutationSuccess} />}
      {editCompany && <EditCompanyModal key={editCompany.id} company={editCompany} onClose={() => setEditCompany(null)} onSuccess={handleMutationSuccess} />}
      {deleteTarget && <ConfirmDeleteModal isPending={isActionPending} onConfirm={runDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
