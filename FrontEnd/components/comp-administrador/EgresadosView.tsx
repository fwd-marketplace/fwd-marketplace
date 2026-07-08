"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  Award,
  Ban,
  Eye,
  GraduationCap,
  Loader2,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { FilterSelect, Pagination, EmptyRow, ProfileAvatar } from "@/components/comp-administrador/admin-controls";
import {
  createAdminUserAction,
  deleteAdminUserAction,
  getAdminUserDetailAction,
  rejectAdminStudentAction,
  updateAdminUserAction,
  verifyAdminStudentAction,
} from "@/lib/actions/admin";
import type { AdminStudent, AdminUserDetail, StudentVerification } from "@/lib/api/types";

const PAGE_SIZE = 6;
const FILTER_ALL = "all";
const EMPTY_VALUE = "—";
const MESSAGE_TIMEOUT_MS = 3500;
const MIN_PASSWORD_LENGTH = 8;

const VERIFICATION_VALUES: readonly StudentVerification[] = ["verificado", "pendiente", "rechazado"];

const VERIFICATION_BADGE_STYLE: Record<StudentVerification, string> = {
  verificado: "bg-accent/15 text-accent",
  pendiente: "bg-warning/15 text-warning",
  rechazado: "bg-magenta/15 text-magenta",
};

const DISTRIBUTION_BAR_STYLE: Record<StudentVerification, string> = {
  verificado: "bg-accent",
  pendiente: "bg-warning",
  rechazado: "bg-magenta",
};

function buildInitials(nombre: string, apellido: string | null): string {
  const first = nombre.trim().charAt(0);
  const second = (apellido ?? "").trim().charAt(0);
  return (first + second).toUpperCase() || "?";
}

function readModalidad(value: string | null): string {
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

function VerificationBadge({ status, label }: { status: StudentVerification; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider ${VERIFICATION_BADGE_STYLE[status]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> {label}
    </span>
  );
}

// ── Modal genérico ──

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 font-body text-sm font-medium text-ink-strong">{value}</dd>
    </div>
  );
}

// ── Modal: detalle del egresado ──

function StudentDetailModal({ userId, locale, onClose }: { userId: string; locale: string; onClose: () => void }) {
  const t = useTranslations("admin_egresados");
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const titleId = "egresado-detail-title";

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getAdminUserDetailAction(userId).then((result) => {
      if (!active) return;
      if (result.ok) setDetail(result.data.user);
      else setError(result.error);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const fullName = detail ? [detail.nombre, detail.apellido1, detail.apellido2].filter(Boolean).join(" ") : "";
  const estudiante = detail?.estudiante ?? null;

  return (
    <ModalShell titleId={titleId} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-sunken p-6">
        <div className="flex min-w-0 items-center gap-4">
          <ProfileAvatar photoUrl={detail?.url_foto ?? null} fallback={detail ? buildInitials(detail.nombre, detail.apellido1) : "--"} name={fullName} size="lg" tone="secondary" />
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
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <DetailRow label={t("detail_modal.field_email")} value={detail.correo} />
              <DetailRow label={t("detail_modal.field_status")} value={detail.estado_cuenta} />
              <DetailRow label={t("detail_modal.field_joined")} value={formatDate(detail.fecha_registro, locale)} />
              {detail.cedula && <DetailRow label={t("detail_modal.field_cedula")} value={detail.cedula} />}
            </dl>

            <div className="border-t border-border pt-4">
              {estudiante ? (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <DetailRow label={t("detail_modal.field_verification")} value={t(`verification.${estudiante.estado_verificacion}`)} />
                  {estudiante.especialidad && <DetailRow label={t("detail_modal.field_especialidad")} value={estudiante.especialidad} />}
                  {estudiante.titulo_fwd && <DetailRow label={t("detail_modal.field_titulo")} value={estudiante.titulo_fwd} />}
                  {estudiante.disponibilidad && <DetailRow label={t("detail_modal.field_disponibilidad")} value={estudiante.disponibilidad} />}
                  {estudiante.modalidad_preferida && <DetailRow label={t("detail_modal.field_modalidad")} value={readModalidad(estudiante.modalidad_preferida)} />}
                  {estudiante.reputacion != null && <DetailRow label={t("detail_modal.field_reputacion")} value={estudiante.reputacion.toFixed(2)} />}
                  {estudiante.skills.length > 0 && <DetailRow label={t("detail_modal.field_skills")} value={estudiante.skills.join(", ")} />}
                  {estudiante.descripcion && <DetailRow label={t("detail_modal.field_bio")} value={estudiante.descripcion} />}
                  {estudiante.url_github && <DetailRow label={t("detail_modal.field_github")} value={estudiante.url_github} />}
                  {estudiante.url_linkedin && <DetailRow label={t("detail_modal.field_linkedin")} value={estudiante.url_linkedin} />}
                  {estudiante.url_portfolio && <DetailRow label={t("detail_modal.field_portfolio")} value={estudiante.url_portfolio} />}
                </dl>
              ) : (
                <p className="font-body text-sm text-ink-muted">{t("detail_modal.no_profile")}</p>
              )}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex justify-end border-t border-border bg-surface-sunken p-4">
        <Button variant="outline" onClick={onClose}>{t("detail_modal.close")}</Button>
      </div>
    </ModalShell>
  );
}

// ── Modal: crear / editar estudiante ──

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

interface StudentFormModalProps {
  readonly mode: "create" | "edit";
  readonly student: AdminStudent | null;
  readonly onClose: () => void;
  readonly onSuccess: (message: string) => void;
}

function StudentFormModal({ mode, student, onClose, onSuccess }: StudentFormModalProps) {
  const t = useTranslations("admin_egresados");
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const titleId = "egresado-form-title";

  const schema = useMemo(
    () =>
      z
        .object({
          nombre: z.string().trim().min(1, t("form_modal.errors.name_required")),
          apellido1: z.string().trim().optional(),
          correo: z.string().email(t("form_modal.errors.email_invalid")),
          password: z.string().optional(),
        })
        .superRefine((values, ctx) => {
          if (mode === "create" && (!values.password || values.password.length < MIN_PASSWORD_LENGTH)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["password"], message: t("form_modal.errors.password_min") });
          }
        }),
    [mode, t],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "edit" && student
        ? { nombre: student.usuario?.nombre ?? "", apellido1: student.usuario?.apellido1 ?? "", correo: student.usuario?.correo ?? "", password: "" }
        : { nombre: "", apellido1: "", correo: "", password: "" },
  });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      if (mode === "create") {
        if (!values.password) return;
        const result = await createAdminUserAction({
          correo: values.correo,
          password: values.password,
          nombre: values.nombre,
          rol: "student",
          ...(values.apellido1 ? { apellido1: values.apellido1 } : {}),
        });
        if (!result.ok) {
          setServerError(result.error);
          return;
        }
        onSuccess(t("messages.created"));
      } else if (student?.usuario) {
        const result = await updateAdminUserAction(student.usuario.id, {
          nombre: values.nombre,
          correo: values.correo,
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
          <Field id="egresado-name" label={t("form_modal.field_name")} error={errors.nombre?.message}>
            <input id="egresado-name" type="text" placeholder={t("form_modal.field_name_placeholder")} className={INPUT_CLASS} {...register("nombre")} />
          </Field>
          <Field id="egresado-lastname" label={t("form_modal.field_lastname")} error={errors.apellido1?.message}>
            <input id="egresado-lastname" type="text" placeholder={t("form_modal.field_lastname_placeholder")} className={INPUT_CLASS} {...register("apellido1")} />
          </Field>
        </div>

        <Field id="egresado-email" label={t("form_modal.field_email")} error={errors.correo?.message}>
          <input id="egresado-email" type="email" placeholder={t("form_modal.field_email_placeholder")} className={INPUT_CLASS} {...register("correo")} />
        </Field>

        {mode === "create" && (
          <Field id="egresado-password" label={t("form_modal.field_password")} error={errors.password?.message}>
            <input id="egresado-password" type="password" placeholder={t("form_modal.field_password_placeholder")} className={INPUT_CLASS} {...register("password")} />
          </Field>
        )}

        {serverError && <p className="font-body text-sm text-magenta">{serverError}</p>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>{t("form_modal.cancel")}</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── Modal: confirmación de borrado ──

function ConfirmDeleteModal({ isPending, onConfirm, onClose }: { isPending: boolean; onConfirm: () => void; onClose: () => void }) {
  const t = useTranslations("admin_egresados");
  const titleId = "egresado-confirm-title";
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

interface StatCardProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
  readonly accentClassName: string;
}

function StatCard({ icon, label, value, accentClassName }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border">
      <span className={`flex size-11 items-center justify-center rounded-xl ${accentClassName}`}>{icon}</span>
      <p className="mt-4 font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold text-ink-strong">{value}</p>
    </div>
  );
}

type FormState = { mode: "create" | "edit"; student: AdminStudent | null } | null;

export function EgresadosView({ initialStudents, locale }: { initialStudents: AdminStudent[]; locale: string }) {
  const t = useTranslations("admin_egresados");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL);
  const [specialtyFilter, setSpecialtyFilter] = useState(FILTER_ALL);
  const [skillFilter, setSkillFilter] = useState(FILTER_ALL);
  const [modalityFilter, setModalityFilter] = useState(FILTER_ALL);
  const [onlyPending, setOnlyPending] = useState(false);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminStudent | null>(null);
  const [isActionPending, startActionTransition] = useTransition();

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), MESSAGE_TIMEOUT_MS);
  }

  function refresh() {
    router.refresh();
  }

  const stats = useMemo(() => {
    const total = initialStudents.length;
    const verified = initialStudents.filter((s) => s.estado_verificacion === "verificado").length;
    const pending = initialStudents.filter((s) => s.estado_verificacion === "pendiente").length;
    const reputations = initialStudents.map((s) => s.reputacion).filter((value): value is number => value != null);
    const avgReputation = reputations.length > 0 ? (reputations.reduce((sum, value) => sum + value, 0) / reputations.length).toFixed(1) : EMPTY_VALUE;
    return { total, verified, pending, avgReputation };
  }, [initialStudents]);

  const distribution = useMemo(() => {
    const total = initialStudents.length || 1;
    return VERIFICATION_VALUES.map((status) => {
      const count = initialStudents.filter((s) => s.estado_verificacion === status).length;
      return { status, count, percent: Math.round((count / total) * 100) };
    });
  }, [initialStudents]);

  const specialtyOptions = useMemo(
    () => [...new Set(initialStudents.map((s) => s.especialidad).filter((value): value is string => Boolean(value)))],
    [initialStudents],
  );
  const skillOptions = useMemo(
    () => [...new Set(initialStudents.flatMap((s) => s.skills))],
    [initialStudents],
  );
  const modalityOptions = useMemo(
    () => [...new Set(initialStudents.map((s) => readModalidad(s.modalidad_preferida)).filter((value) => value !== EMPTY_VALUE))],
    [initialStudents],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return initialStudents.filter((student) => {
      if (statusFilter !== FILTER_ALL && student.estado_verificacion !== statusFilter) return false;
      if (onlyPending && student.estado_verificacion !== "pendiente") return false;
      if (specialtyFilter !== FILTER_ALL && student.especialidad !== specialtyFilter) return false;
      if (skillFilter !== FILTER_ALL && !student.skills.includes(skillFilter)) return false;
      if (modalityFilter !== FILTER_ALL && readModalidad(student.modalidad_preferida) !== modalityFilter) return false;
      if (normalizedQuery) {
        const haystack = `${student.usuario?.nombre ?? ""} ${student.usuario?.apellido1 ?? ""} ${student.usuario?.correo ?? ""}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [initialStudents, query, statusFilter, onlyPending, specialtyFilter, skillFilter, modalityFilter]);

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
    setStatusFilter(FILTER_ALL);
    setSpecialtyFilter(FILTER_ALL);
    setSkillFilter(FILTER_ALL);
    setModalityFilter(FILTER_ALL);
    setOnlyPending(false);
    setPage(1);
  }

  function handleMutationSuccess(text: string) {
    setFormState(null);
    flash(text);
    refresh();
  }

  function runVerification(student: AdminStudent, action: "verify" | "reject") {
    startActionTransition(async () => {
      const result = action === "verify" ? await verifyAdminStudentAction(student.id) : await rejectAdminStudentAction(student.id);
      if (!result.ok) {
        flash(result.error);
        return;
      }
      flash(action === "verify" ? t("messages.verified") : t("messages.rejected"));
      refresh();
    });
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

  const statusOptions = [
    { value: FILTER_ALL, label: t("filters.status_all") },
    ...VERIFICATION_VALUES.map((status) => ({ value: status, label: t(`verification.${status}`) })),
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 pb-8 pt-20 md:px-10 md:py-8">
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
          <Button onClick={() => setFormState({ mode: "create", student: null })}>
            <UserPlus className="size-4" aria-hidden="true" />
            {t("create_student")}
          </Button>
        }
      />

      {/* Stat cards (datos reales) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<GraduationCap className="size-5 text-primary" />} label={t("stats.total")} value={String(stats.total)} accentClassName="bg-primary/10" />
        <StatCard icon={<ShieldCheck className="size-5 text-accent" />} label={t("stats.verified")} value={String(stats.verified)} accentClassName="bg-accent/10" />
        <StatCard icon={<AlertCircle className="size-5 text-warning" />} label={t("stats.pending")} value={String(stats.pending)} accentClassName="bg-warning/10" />
        <StatCard icon={<Award className="size-5 text-secondary" />} label={t("stats.avg_reputation")} value={stats.avgReputation} accentClassName="bg-secondary/10" />
      </div>

      {/* Distribución por verificación (calculada de datos reales) */}
      <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
        <h2 className="mb-5 font-heading text-lg font-bold text-ink-strong">{t("distribution.title")}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {distribution.map(({ status, count, percent }) => (
            <div key={status}>
              <div className="flex items-center justify-between">
                <p className="font-body text-sm text-ink">{t(`distribution.${status}`)}</p>
                <p className="font-body text-sm font-bold text-ink-strong">{count}</p>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                <div className={`h-full rounded-full ${DISTRIBUTION_BAR_STYLE[status]}`} style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-1 font-body text-xs text-ink-muted">{percent}%</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filtros */}
      <section className="rounded-2xl bg-surface-sunken p-4 ring-1 ring-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[14rem] flex-1">
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
          <FilterSelect rounded="lg" ariaLabel={t("filters.status_all")} value={statusFilter} onChange={updateFilter(setStatusFilter)} options={statusOptions} />
          <FilterSelect rounded="lg" ariaLabel={t("filters.specialty_all")} value={specialtyFilter} onChange={updateFilter(setSpecialtyFilter)} options={[{ value: FILTER_ALL, label: t("filters.specialty_all") }, ...specialtyOptions.map((value) => ({ value, label: value }))]} />
          <FilterSelect rounded="lg" ariaLabel={t("filters.skill_all")} value={skillFilter} onChange={updateFilter(setSkillFilter)} options={[{ value: FILTER_ALL, label: t("filters.skill_all") }, ...skillOptions.map((value) => ({ value, label: value }))]} />
          <FilterSelect rounded="lg" ariaLabel={t("filters.modality_all")} value={modalityFilter} onChange={updateFilter(setModalityFilter)} options={[{ value: FILTER_ALL, label: t("filters.modality_all") }, ...modalityOptions.map((value) => ({ value, label: value }))]} />
          <button
            type="button"
            aria-pressed={onlyPending}
            onClick={() => { setOnlyPending((prev) => !prev); setPage(1); }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-medium ring-1 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] ${onlyPending ? "bg-warning/20 text-warning ring-warning/40" : "bg-warning/10 text-warning ring-warning/30"}`}
          >
            <AlertCircle className="size-4" aria-hidden="true" /> {t("filters.only_pending")}
          </button>
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
            <table className="w-full min-w-[920px] text-left">
              <thead>
                <tr className="border-b border-border font-body text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  <th className="px-6 py-4">{t("table.profile")}</th>
                  <th className="px-4 py-4">{t("table.titulo")}</th>
                  <th className="px-4 py-4">{t("table.specialty")}</th>
                  <th className="px-4 py-4">{t("table.strengths")}</th>
                  <th className="px-4 py-4">{t("table.modality")}</th>
                  <th className="px-4 py-4">{t("table.status")}</th>
                  <th className="px-6 py-4 text-right">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((student) => {
                  const fullName = [student.usuario?.nombre, student.usuario?.apellido1].filter(Boolean).join(" ") || EMPTY_VALUE;
                  return (
                    <tr key={student.id} className="font-body text-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar photoUrl={student.url_avatar} fallback={buildInitials(student.usuario?.nombre ?? "", student.usuario?.apellido1 ?? null)} name={fullName} size="md" tone="secondary" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink-strong">{fullName}</p>
                            <p className="truncate text-xs text-ink-muted">{student.usuario?.correo ?? EMPTY_VALUE}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-ink">{student.titulo_fwd ?? EMPTY_VALUE}</td>
                      <td className="px-4 py-4 text-ink">{student.especialidad ?? EMPTY_VALUE}</td>
                      <td className="px-4 py-4">
                        {student.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {student.skills.slice(0, 3).map((skill) => (
                              <span key={skill} className="rounded-md bg-surface-sunken px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{skill}</span>
                            ))}
                            {student.skills.length > 3 && <span className="font-body text-[10px] text-ink-subtle">+{student.skills.length - 3}</span>}
                          </div>
                        ) : (
                          <span className="font-body text-xs text-ink-subtle">{t("table.no_skills")}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-ink-muted">{readModalidad(student.modalidad_preferida)}</td>
                      <td className="px-4 py-4">
                        <VerificationBadge status={student.estado_verificacion} label={t(`verification.${student.estado_verificacion}`)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" disabled={!student.usuario} onClick={() => student.usuario && setDetailUserId(student.usuario.id)}>
                            <Eye className="size-3.5" aria-hidden="true" />
                            {t("row_actions.view")}
                          </Button>
                          <Button size="sm" variant="ghost" disabled={!student.usuario} onClick={() => setFormState({ mode: "edit", student })} aria-label={t("row_actions.edit")}>
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </Button>
                          {student.estado_verificacion !== "verificado" && (
                            <Button size="sm" variant="ghost" className="text-accent hover:bg-accent/10" disabled={isActionPending} onClick={() => runVerification(student, "verify")} aria-label={t("row_actions.verify")}>
                              <UserCheck className="size-3.5" aria-hidden="true" />
                            </Button>
                          )}
                          {student.estado_verificacion !== "rechazado" && (
                            <Button size="sm" variant="ghost" className="text-warning hover:bg-warning/10" disabled={isActionPending} onClick={() => runVerification(student, "reject")} aria-label={t("row_actions.reject")}>
                              <Ban className="size-3.5" aria-hidden="true" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-magenta hover:bg-magenta/10" disabled={!student.usuario} onClick={() => setDeleteTarget(student)} aria-label={t("row_actions.delete")}>
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

      {detailUserId && <StudentDetailModal userId={detailUserId} locale={locale} onClose={() => setDetailUserId(null)} />}
      {formState && (
        <StudentFormModal
          key={formState.student?.id ?? "create"}
          mode={formState.mode}
          student={formState.student}
          onClose={() => setFormState(null)}
          onSuccess={handleMutationSuccess}
        />
      )}
      {deleteTarget && <ConfirmDeleteModal isPending={isActionPending} onConfirm={runDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
