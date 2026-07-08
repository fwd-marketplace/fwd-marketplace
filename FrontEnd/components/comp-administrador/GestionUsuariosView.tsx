"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Ban,
  Clock,
  Eye,
  Loader2,
  Pencil,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pagination, EmptyRow, ProfileAvatar } from "@/components/comp-administrador/admin-controls";
import {
  approveAdminUserAction,
  createAdminUserAction,
  deleteAdminUserAction,
  getAdminUserDetailAction,
  suspendAdminUserAction,
  updateAdminUserAction,
} from "@/lib/actions/admin";
import type { AdminUser, AdminUserDetail, ApiRoleName, AccountState } from "@/lib/api/types";

const PAGE_SIZE = 8;
const ROLE_FILTER_ALL = "all";
const STATUS_FILTER_ALL = "all";
const MESSAGE_TIMEOUT_MS = 3500;
const MIN_PASSWORD_LENGTH = 8;

const ROLE_VALUES: readonly ApiRoleName[] = ["student", "company", "admin"];
const STATUS_VALUES: readonly AccountState[] = ["activa", "pendiente", "suspendida", "rechazada"];

const ROLE_BADGE_STYLE: Record<ApiRoleName, string> = {
  student: "bg-primary text-primary-foreground",
  company: "bg-secondary text-secondary-foreground",
  admin: "bg-highlight text-highlight-foreground",
};

const STATUS_BADGE_STYLE: Record<AccountState, string> = {
  activa: "bg-accent/15 text-accent",
  pendiente: "bg-warning/15 text-warning",
  suspendida: "bg-magenta/15 text-magenta",
  rechazada: "bg-ink-muted/15 text-ink-muted",
};

function buildInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "M";
  return `${first}${second}`.toUpperCase();
}

function formatDate(value: string): string {
  return value.slice(0, 10);
}

function RoleBadge({ role, label }: { role: ApiRoleName; label: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${ROLE_BADGE_STYLE[role]}`}>
      {label}
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

interface ModalShellProps {
  readonly titleId: string;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
  readonly size?: "lg" | "sm";
}

function ModalShell({ titleId, onClose, children, size = "lg" }: ModalShellProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-strong/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className={`w-full overflow-hidden rounded-2xl bg-surface shadow-elevated ring-1 ring-border duration-[var(--duration-base)] ease-[var(--ease-out)] ${
          size === "lg" ? "max-w-lg" : "max-w-md"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ── Modal: detalle de usuario (Ver) ──

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 font-body text-sm font-medium text-ink-strong">{value}</dd>
    </div>
  );
}

function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const t = useTranslations("gestion_usuarios");
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const titleId = "user-detail-title";

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getAdminUserDetailAction(userId).then((result) => {
      if (!active) return;
      if (result.ok) {
        setDetail(result.data.user);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const fullName = detail ? [detail.nombre, detail.apellido1, detail.apellido2].filter(Boolean).join(" ") : "";

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-sunken p-6">
        <div className="flex min-w-0 items-center gap-4">
          <ProfileAvatar photoUrl={detail?.url_foto ?? null} fallback={detail ? buildInitials(fullName) : "--"} name={fullName} size="lg" />
          <div className="min-w-0">
            <h2 id={titleId} className="truncate font-heading text-xl font-bold tracking-tight text-ink-strong">
              {detail ? fullName : t("detail_modal.title")}
            </h2>
            <p className="font-body text-sm text-ink-muted">{t("detail_modal.subtitle")}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("detail_modal.close")}>
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 font-body text-sm text-ink-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("detail_modal.loading")}
          </div>
        ) : error ? (
          <p className="py-8 text-center font-body text-sm text-magenta">{error}</p>
        ) : detail ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {detail.role?.nombre && <RoleBadge role={detail.role.nombre} label={t(`roles.${detail.role.nombre}`)} />}
              <StatusBadge status={detail.estado_cuenta} label={t(`statuses.${detail.estado_cuenta}`)} />
            </div>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <DetailRow label={t("detail_modal.field_email")} value={detail.correo} />
              <DetailRow label={t("detail_modal.field_joined")} value={formatDate(detail.fecha_registro)} />
              {detail.cedula && <DetailRow label={t("detail_modal.field_cedula")} value={detail.cedula} />}
            </dl>

            <div className="border-t border-border pt-4">
              <p className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-ink-strong">
                {t("detail_modal.section_profile")}
              </p>
              {detail.estudiante ? (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {detail.estudiante.especialidad && <DetailRow label={t("detail_modal.student_especialidad")} value={detail.estudiante.especialidad} />}
                  {detail.estudiante.titulo_fwd && <DetailRow label={t("detail_modal.student_titulo")} value={detail.estudiante.titulo_fwd} />}
                  {detail.estudiante.disponibilidad && <DetailRow label={t("detail_modal.student_disponibilidad")} value={detail.estudiante.disponibilidad} />}
                  <DetailRow label={t("detail_modal.student_verificacion")} value={detail.estudiante.estado_verificacion} />
                  {detail.estudiante.skills.length > 0 && <DetailRow label={t("detail_modal.student_skills")} value={detail.estudiante.skills.join(", ")} />}
                  {detail.estudiante.descripcion && <DetailRow label={t("detail_modal.student_bio")} value={detail.estudiante.descripcion} />}
                </dl>
              ) : detail.empresario ? (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {detail.empresario.nombre_comercial && <DetailRow label={t("detail_modal.company_nombre")} value={detail.empresario.nombre_comercial} />}
                  <DetailRow label={t("detail_modal.company_tipo")} value={detail.empresario.tipo} />
                  {detail.empresario.sector && <DetailRow label={t("detail_modal.company_sector")} value={detail.empresario.sector} />}
                  {detail.empresario.etapa && <DetailRow label={t("detail_modal.company_etapa")} value={detail.empresario.etapa} />}
                  {detail.empresario.url_sitio_web && <DetailRow label={t("detail_modal.company_sitio")} value={detail.empresario.url_sitio_web} />}
                  {detail.empresario.descripcion && <DetailRow label={t("detail_modal.company_bio")} value={detail.empresario.descripcion} />}
                </dl>
              ) : (
                <p className="font-body text-sm text-ink-muted">{t("detail_modal.no_profile")}</p>
              )}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex justify-end border-t border-border bg-surface-sunken p-4">
        <Button variant="outline" onClick={onClose}>
          {t("detail_modal.close")}
        </Button>
      </div>
    </ModalShell>
  );
}

// ── Modal: formulario crear / editar ──

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly error?: string | undefined;
  readonly children: React.ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="font-body text-sm font-semibold text-ink-strong">
        {label}
      </label>
      {children}
      {error && <p className="font-body text-xs text-magenta">{error}</p>}
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none ring-1 ring-border placeholder:text-ink-subtle focus:ring-2 focus:ring-primary/40";

interface UserFormModalProps {
  readonly mode: "create" | "edit";
  readonly user: AdminUser | null;
  readonly onClose: () => void;
  readonly onSuccess: (message: string) => void;
}

function UserFormModal({ mode, user, onClose, onSuccess }: UserFormModalProps) {
  const t = useTranslations("gestion_usuarios");
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const titleId = "user-form-title";

  const schema = useMemo(() => {
    const base = {
      nombre: z.string().trim().min(1, t("form_modal.errors.name_required")),
      apellido1: z.string().trim().optional(),
      correo: z.string().email(t("form_modal.errors.email_invalid")),
      rol: z.enum(["student", "company", "admin"]),
    };
    if (mode === "create") {
      return z.object({
        ...base,
        password: z.string().min(MIN_PASSWORD_LENGTH, t("form_modal.errors.password_min")),
      });
    }
    return z.object({
      ...base,
      estado_cuenta: z.enum(["activa", "pendiente", "suspendida", "rechazada"]),
    });
  }, [mode, t]);

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "edit" && user
        ? {
            nombre: user.nombre,
            apellido1: user.apellido1 ?? "",
            correo: user.correo,
            rol: user.role?.nombre ?? "student",
            estado_cuenta: user.estado_cuenta,
          }
        : { nombre: "", apellido1: "", correo: "", rol: "student", password: "" },
  });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      if (mode === "create" && "password" in values) {
        const result = await createAdminUserAction({
          correo: values.correo,
          password: values.password,
          nombre: values.nombre,
          rol: values.rol,
          ...(values.apellido1 ? { apellido1: values.apellido1 } : {}),
        });
        if (!result.ok) {
          setServerError(result.error);
          return;
        }
        onSuccess(t("messages.created"));
      } else if (mode === "edit" && user && "estado_cuenta" in values) {
        const result = await updateAdminUserAction(user.id, {
          nombre: values.nombre,
          correo: values.correo,
          rol: values.rol,
          estado_cuenta: values.estado_cuenta,
          ...(values.apellido1 ? { apellido1: values.apellido1 } : {}),
        });
        if (!result.ok) {
          setServerError(result.error);
          return;
        }
        onSuccess(t("messages.updated"));
      }
    });
  }

  const submitLabel = mode === "create"
    ? isPending ? t("form_modal.creating") : t("form_modal.create")
    : isPending ? t("form_modal.saving") : t("form_modal.save");

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-sunken p-6">
        <div className="min-w-0">
          <h2 id={titleId} className="font-heading text-xl font-bold tracking-tight text-ink-strong">
            {mode === "create" ? t("form_modal.create_title") : t("form_modal.edit_title")}
          </h2>
          <p className="font-body text-sm text-ink-muted">
            {mode === "create" ? t("form_modal.create_subtitle") : t("form_modal.edit_subtitle")}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("detail_modal.close")}>
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <form className="space-y-4 p-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="user-form-name" label={t("form_modal.field_name")} error={errors.nombre?.message}>
            <input id="user-form-name" type="text" placeholder={t("form_modal.field_name_placeholder")} className={INPUT_CLASS} {...register("nombre")} />
          </Field>
          <Field id="user-form-lastname" label={t("form_modal.field_lastname")} error={errors.apellido1?.message}>
            <input id="user-form-lastname" type="text" placeholder={t("form_modal.field_lastname_placeholder")} className={INPUT_CLASS} {...register("apellido1")} />
          </Field>
        </div>

        <Field id="user-form-email" label={t("form_modal.field_email")} error={errors.correo?.message}>
          <input id="user-form-email" type="email" placeholder={t("form_modal.field_email_placeholder")} className={INPUT_CLASS} {...register("correo")} />
        </Field>

        {mode === "create" && (
          <Field id="user-form-password" label={t("form_modal.field_password")} error={"password" in errors ? errors.password?.message : undefined}>
            <input id="user-form-password" type="password" placeholder={t("form_modal.field_password_placeholder")} className={INPUT_CLASS} {...register("password")} />
          </Field>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="user-form-role" label={t("form_modal.field_role")} error={errors.rol?.message}>
            <select id="user-form-role" className={`${INPUT_CLASS} cursor-pointer appearance-none`} {...register("rol")}>
              {ROLE_VALUES.map((role) => (
                <option key={role} value={role}>
                  {t(`roles.${role}`)}
                </option>
              ))}
            </select>
          </Field>

          {mode === "edit" && (
            <Field id="user-form-status" label={t("form_modal.field_status")}>
              <select id="user-form-status" className={`${INPUT_CLASS} cursor-pointer appearance-none`} {...register("estado_cuenta")}>
                {STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {t(`statuses.${status}`)}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {serverError && <p className="font-body text-sm text-magenta">{serverError}</p>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            {t("form_modal.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── Modal: confirmación (suspender / eliminar) ──

interface ConfirmModalProps {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly workingLabel: string;
  readonly isPending: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

function ConfirmModal({ title, message, confirmLabel, cancelLabel, workingLabel, isPending, onConfirm, onClose }: ConfirmModalProps) {
  const titleId = "user-confirm-title";
  return (
    <ModalShell titleId={titleId} onClose={onClose} size="sm">
      <div className="space-y-2 p-6">
        <h2 id={titleId} className="font-heading text-lg font-bold tracking-tight text-ink-strong">
          {title}
        </h2>
        <p className="font-body text-sm text-ink-muted">{message}</p>
      </div>
      <div className="flex justify-end gap-2 border-t border-border bg-surface-sunken p-4">
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          {cancelLabel}
        </Button>
        <Button variant="magenta" onClick={onConfirm} disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {isPending ? workingLabel : confirmLabel}
        </Button>
      </div>
    </ModalShell>
  );
}

interface StatCardProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: number;
  readonly accentClassName: string;
}

function StatCard({ icon, label, value, accentClassName }: StatCardProps) {
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

type ConfirmState = { kind: "suspend" | "delete"; user: AdminUser } | null;
type FormState = { mode: "create" | "edit"; user: AdminUser | null } | null;

export function GestionUsuariosView({ users }: { users: AdminUser[] }) {
  const t = useTranslations("gestion_usuarios");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(ROLE_FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_ALL);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [isActionPending, startActionTransition] = useTransition();

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), MESSAGE_TIMEOUT_MS);
  }

  function refresh() {
    router.refresh();
  }

  function handleMutationSuccess(text: string) {
    setFormState(null);
    flash(text);
    refresh();
  }

  function reactivateUser(user: AdminUser) {
    startActionTransition(async () => {
      const result = await approveAdminUserAction(user.id);
      if (!result.ok) {
        flash(result.error);
        return;
      }
      flash(t("messages.reactivated"));
      refresh();
    });
  }

  function runConfirm() {
    if (!confirmState) return;
    const { kind, user } = confirmState;
    startActionTransition(async () => {
      const result =
        kind === "suspend" ? await suspendAdminUserAction(user.id) : await deleteAdminUserAction(user.id);
      if (!result.ok) {
        flash(result.error);
        return;
      }
      flash(kind === "suspend" ? t("messages.suspended") : t("messages.deleted"));
      setConfirmState(null);
      refresh();
    });
  }

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.estado_cuenta === "activa").length,
      suspended: users.filter((user) => user.estado_cuenta === "suspendida").length,
      pending: users.filter((user) => user.estado_cuenta === "pendiente").length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== ROLE_FILTER_ALL && user.role?.nombre !== roleFilter) return false;
      if (statusFilter !== STATUS_FILTER_ALL && user.estado_cuenta !== statusFilter) return false;
      if (normalizedQuery) {
        const haystack = `${user.nombre} ${user.apellido1 ?? ""} ${user.correo}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [users, query, roleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  const roleFilterOptions = [
    { value: ROLE_FILTER_ALL, label: t("filters.role_all") },
    ...ROLE_VALUES.map((role) => ({ value: role, label: t(`roles.${role}`) })),
  ];
  const statusFilterOptions = [
    { value: STATUS_FILTER_ALL, label: t("filters.status_all") },
    ...STATUS_VALUES.map((status) => ({ value: status, label: t(`statuses.${status}`) })),
  ];

  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-6 px-6 pb-8 pt-20 md:px-10 md:py-8">
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
          <Button onClick={() => setFormState({ mode: "create", user: null })}>
            <UserPlus className="size-4" aria-hidden="true" />
            {t("create_user")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="size-6" />} label={t("stats.total")} value={stats.total} accentClassName="bg-primary/10 text-primary" />
        <StatCard icon={<UserCheck className="size-6" />} label={t("stats.active")} value={stats.active} accentClassName="bg-accent/15 text-accent" />
        <StatCard icon={<UserX className="size-6" />} label={t("stats.suspended")} value={stats.suspended} accentClassName="bg-magenta/15 text-magenta" />
        <StatCard icon={<Clock className="size-6" />} label={t("stats.pending")} value={stats.pending} accentClassName="bg-warning/15 text-warning" />
      </div>

      <section className="rounded-2xl bg-surface-sunken p-6 ring-1 ring-border">
        <h2 className="mb-4 font-heading text-lg font-bold text-ink-strong">{t("filters.title")}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[12rem] flex-1">
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
          <FilterSelect rounded="lg" ariaLabel={t("filters.role_all")} value={roleFilter} onChange={updateFilter(setRoleFilter)} options={roleFilterOptions} />
          <FilterSelect rounded="lg" ariaLabel={t("filters.status_all")} value={statusFilter} onChange={updateFilter(setStatusFilter)} options={statusFilterOptions} />
        </div>
      </section>

      {pageItems.length === 0 ? (
        <EmptyRow message={t("table.empty")} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-border">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-sunken">
                  <th className="p-4 font-body text-xs font-bold uppercase tracking-wider text-ink-strong">{t("table.user")}</th>
                  <th className="p-4 font-body text-xs font-bold uppercase tracking-wider text-ink-strong">{t("table.role")}</th>
                  <th className="p-4 font-body text-xs font-bold uppercase tracking-wider text-ink-strong">{t("table.status")}</th>
                  <th className="p-4 font-body text-xs font-bold uppercase tracking-wider text-ink-strong">{t("table.joined")}</th>
                  <th className="p-4 text-right font-body text-xs font-bold uppercase tracking-wider text-ink-strong">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((user) => {
                  const fullName = [user.nombre, user.apellido1].filter(Boolean).join(" ");
                  const isSuspended = user.estado_cuenta === "suspendida";
                  return (
                    <tr key={user.id} className="transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken/40">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar photoUrl={user.url_foto} fallback={buildInitials(fullName)} name={fullName} size="md" />
                          <div className="min-w-0">
                            <p className="truncate font-body font-semibold text-ink-strong">{fullName}</p>
                            <p className="truncate font-body text-xs text-ink-muted">{user.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {user.role?.nombre && <RoleBadge role={user.role.nombre} label={t(`roles.${user.role.nombre}`)} />}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={user.estado_cuenta} label={t(`statuses.${user.estado_cuenta}`)} />
                      </td>
                      <td className="p-4 font-body text-ink-muted">{formatDate(user.fecha_registro)}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDetailUserId(user.id)}>
                            <Eye className="size-3.5" aria-hidden="true" />
                            {t("row_actions.view")}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setFormState({ mode: "edit", user })} aria-label={t("row_actions.edit")}>
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </Button>
                          {isSuspended ? (
                            <Button size="sm" variant="ghost" disabled={isActionPending} onClick={() => reactivateUser(user)} aria-label={t("row_actions.reactivate")}>
                              <UserCheck className="size-3.5" aria-hidden="true" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setConfirmState({ kind: "suspend", user })} aria-label={t("row_actions.suspend")}>
                              <Ban className="size-3.5" aria-hidden="true" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-magenta hover:bg-magenta/10" onClick={() => setConfirmState({ kind: "delete", user })} aria-label={t("row_actions.delete")}>
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
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-body text-sm text-ink-muted">
          {t("pagination_summary", { start: rangeStart, end: rangeEnd, total: filtered.length })}
        </p>
        <Pagination page={safePage} pageCount={pageCount} onPage={setPage} shape="round" />
      </div>

      {detailUserId && <UserDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />}
      {formState && (
        <UserFormModal
          key={formState.user?.id ?? "create"}
          mode={formState.mode}
          user={formState.user}
          onClose={() => setFormState(null)}
          onSuccess={handleMutationSuccess}
        />
      )}
      {confirmState && (
        <ConfirmModal
          title={confirmState.kind === "suspend" ? t("confirm_suspend.title") : t("confirm_delete.title")}
          message={confirmState.kind === "suspend" ? t("confirm_suspend.message") : t("confirm_delete.message")}
          confirmLabel={confirmState.kind === "suspend" ? t("confirm_suspend.confirm") : t("confirm_delete.confirm")}
          cancelLabel={confirmState.kind === "suspend" ? t("confirm_suspend.cancel") : t("confirm_delete.cancel")}
          workingLabel={confirmState.kind === "suspend" ? t("confirm_suspend.working") : t("confirm_delete.working")}
          isPending={isActionPending}
          onConfirm={runConfirm}
          onClose={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
