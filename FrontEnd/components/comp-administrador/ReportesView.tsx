"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, FileText } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Label,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import type {
  AccountState,
  AdminCompany,
  AdminProject,
  AdminStudent,
  AdminUser,
  ApiRoleName,
  CompanyType,
  ProjectState,
  StudentVerification,
} from "@/lib/api/types";

const ACTIVE_STATES: ProjectState[] = ["en_recepcion", "en_evaluacion", "adjudicado", "en_desarrollo"];
const TOP_COMPANIES = 6;

const STATE_ORDER: ProjectState[] = ["borrador", "en_recepcion", "en_evaluacion", "adjudicado", "en_desarrollo", "cerrado", "cancelado", "pausado"];

const STATE_COLOR: Record<ProjectState, string> = {
  borrador: "var(--ink-muted)",
  en_recepcion: "var(--primary)",
  en_evaluacion: "var(--secondary)",
  adjudicado: "var(--highlight)",
  en_desarrollo: "var(--warning)",
  cerrado: "var(--accent)",
  cancelado: "var(--magenta)",
  pausado: "var(--border-strong)",
};

const ROLE_COLOR: Record<ApiRoleName, string> = { student: "var(--primary)", company: "var(--secondary)", admin: "var(--highlight)" };

const ACCOUNT_COLOR: Record<AccountState, string> = { activa: "var(--accent)", pendiente: "var(--warning)", suspendida: "var(--magenta)", rechazada: "var(--ink-muted)" };
const ACCOUNT_ORDER: AccountState[] = ["activa", "pendiente", "suspendida", "rechazada"];

const VERIFICATION_COLOR: Record<StudentVerification, string> = { verificado: "var(--accent)", pendiente: "var(--warning)", rechazado: "var(--magenta)" };
const VERIFICATION_ORDER: StudentVerification[] = ["verificado", "pendiente", "rechazado"];

const TYPE_COLOR: Record<CompanyType, string> = { empresa: "var(--secondary)", emprendedor: "var(--warning)" };

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  color: "var(--ink-strong)",
  fontSize: "0.8125rem",
} as const;
const AXIS_TICK = { fill: "var(--ink-muted)", fontSize: 12 } as const;
const LABEL_STYLE = { fill: "var(--ink-strong)", fontSize: 12, fontWeight: 600 } as const;
const LEGEND_STYLE = { fontSize: "0.75rem", color: "var(--ink-muted)" } as const;

interface Slice {
  name: string;
  value: number;
  color: string;
}

function countBy<T, K extends string>(items: T[], pick: (item: T) => K | null | undefined): Map<K, number> {
  const map = new Map<K, number>();
  for (const item of items) {
    const key = pick(item);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

// ── Gráficas reutilizables ──

function DonutChart({ data }: { data: Slice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={56} outerRadius={86} paddingAngle={2} stroke="var(--surface)">
          {data.map((slice) => (
            <Cell key={slice.name} fill={slice.color} />
          ))}
          <Label position="center" value={total} style={{ fill: "var(--ink-strong)", fontSize: "1.6rem", fontWeight: 800 }} />
        </Pie>
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          formatter={(value) => [`${value} (${total ? Math.round((Number(value) / total) * 100) : 0}%)`, ""]}
        />
        <Legend wrapperStyle={LEGEND_STYLE} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function HorizontalBars({ data }: { data: Slice[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, left: 8, bottom: 4 }}>
        <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis type="category" dataKey="name" width={130} tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "var(--surface-sunken)" }} contentStyle={CHART_TOOLTIP_STYLE} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((slice) => (
            <Cell key={slice.name} fill={slice.color} />
          ))}
          <LabelList dataKey="value" position="right" style={LABEL_STYLE} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function VerticalBars({ data }: { data: Slice[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 18, right: 8, left: -10, bottom: 4 }}>
        <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: "var(--border)" }} tickLine={false} interval={0} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "var(--surface-sunken)" }} contentStyle={CHART_TOOLTIP_STYLE} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={44}>
          {data.map((slice) => (
            <Cell key={slice.name} fill={slice.color} />
          ))}
          <LabelList dataKey="value" position="top" style={LABEL_STYLE} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartSection({
  title,
  subtitle,
  isEmpty,
  emptyLabel,
  mounted,
  children,
}: {
  title: string;
  subtitle: string;
  isEmpty: boolean;
  emptyLabel: string;
  mounted: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
      <h2 className="font-heading text-lg font-bold text-ink-strong">{title}</h2>
      <p className="mb-4 mt-0.5 font-body text-xs text-ink-muted">{subtitle}</p>
      {isEmpty ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center font-body text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <div className="h-72 w-full">{mounted ? children : null}</div>
      )}
    </section>
  );
}

export function ReportesView({
  projects,
  users,
  students,
  companies,
}: {
  projects: AdminProject[];
  users: AdminUser[];
  students: AdminStudent[];
  companies: AdminCompany[];
}) {
  const t = useTranslations("admin_reportes");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /** Traduce un valor enumerado por prefijo, con fallback al valor crudo si no hay clave. */
  const tEnum = useCallback(
    (prefix: string, value: string | null | undefined): string | null => {
      if (!value) return null;
      const key = `${prefix}.${value}`;
      return t.has(key) ? t(key) : value;
    },
    [t],
  );

  const kpis = useMemo(() => {
    const active = projects.filter((project) => ACTIVE_STATES.includes(project.estado.nombre)).length;
    const pendingAccounts = users.filter((user) => user.estado_cuenta === "pendiente").length;
    const verified = students.filter((student) => student.estado_verificacion === "verificado").length;
    const closed = projects.filter((project) => project.estado.nombre === "cerrado").length;
    return [
      { label: t("kpi.usuarios"), value: users.length },
      { label: t("kpi.egresados"), value: students.length },
      { label: t("kpi.empresas"), value: companies.length },
      { label: t("kpi.proyectos"), value: projects.length },
      { label: t("kpi.activos"), value: active },
      { label: t("kpi.pendientes"), value: pendingAccounts, highlight: true },
      { label: t("kpi.verificados"), value: verified },
      { label: t("kpi.finalizados"), value: closed },
    ];
  }, [projects, users, students, companies, t]);

  const projectsByState = useMemo<Slice[]>(() => {
    const counts = countBy(projects, (project) => project.estado.nombre);
    return STATE_ORDER.filter((state) => (counts.get(state) ?? 0) > 0).map((state) => ({
      name: tEnum("enum_state", state) ?? state,
      value: counts.get(state) ?? 0,
      color: STATE_COLOR[state],
    }));
  }, [projects, tEnum]);

  const topCompanies = useMemo<Slice[]>(() => {
    const counts = countBy(projects, (project) => project.empresa?.nombre_comercial);
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value, color: "var(--primary)" }))
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_COMPANIES);
  }, [projects]);

  const usersByRole = useMemo<Slice[]>(() => {
    const counts = countBy(users, (user) => user.role?.nombre);
    return (["student", "company", "admin"] as ApiRoleName[])
      .filter((role) => (counts.get(role) ?? 0) > 0)
      .map((role) => ({ name: tEnum("enum_role", role) ?? role, value: counts.get(role) ?? 0, color: ROLE_COLOR[role] }));
  }, [users, tEnum]);

  const accountsByState = useMemo<Slice[]>(() => {
    const counts = countBy(users, (user) => user.estado_cuenta);
    return ACCOUNT_ORDER.filter((state) => (counts.get(state) ?? 0) > 0).map((state) => ({
      name: tEnum("enum_account", state) ?? state,
      value: counts.get(state) ?? 0,
      color: ACCOUNT_COLOR[state],
    }));
  }, [users, tEnum]);

  const studentsByVerification = useMemo<Slice[]>(() => {
    const counts = countBy(students, (student) => student.estado_verificacion);
    return VERIFICATION_ORDER.filter((state) => (counts.get(state) ?? 0) > 0).map((state) => ({
      name: tEnum("enum_verification", state) ?? state,
      value: counts.get(state) ?? 0,
      color: VERIFICATION_COLOR[state],
    }));
  }, [students, tEnum]);

  const companiesByType = useMemo<Slice[]>(() => {
    const counts = countBy(companies, (company) => company.tipo);
    return (["empresa", "emprendedor"] as CompanyType[])
      .filter((type) => (counts.get(type) ?? 0) > 0)
      .map((type) => ({ name: tEnum("enum_type", type) ?? type, value: counts.get(type) ?? 0, color: TYPE_COLOR[type] }));
  }, [companies, tEnum]);

  function exportCsv() {
    const block = (heading: string[], rows: Slice[]) => [heading, ...rows.map((row) => [row.name, String(row.value)]), []];
    const total = t("csv.header_total");
    const rows: string[][] = [
      [t("csv.report_title")],
      [],
      [t("csv.header_metric"), t("csv.header_value")],
      ...kpis.map((kpi) => [kpi.label, String(kpi.value)]),
      [],
      ...block([t("csv.block_projects_by_state"), total], projectsByState),
      ...block([t("csv.block_top_companies"), total], topCompanies),
      ...block([t("csv.block_users_by_role"), total], usersByRole),
      ...block([t("csv.block_accounts"), total], accountsByState),
      ...block([t("csv.block_verification"), total], studentsByVerification),
      ...block([t("csv.block_companies_by_type"), total], companiesByType),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${t("csv.filename")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t("eyebrow")}</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink-strong md:text-4xl">
            {t("title")}<span className="text-primary" aria-hidden="true">.</span>
          </h1>
          <p className="max-w-xl font-body text-sm text-ink-muted">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportCsv}><Download className="size-4" aria-hidden="true" /> {t("export_csv")}</Button>
          <Button onClick={() => window.print()}><FileText className="size-4" aria-hidden="true" /> {t("export_pdf")}</Button>
        </div>
      </header>

      {/* KPIs */}
      <section className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={kpi.highlight ? "border-l-4 border-warning pl-3" : ""}>
              <p className="font-body text-xs text-ink-muted">{kpi.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-ink-strong">{kpi.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartSection title={t("charts.projects_by_state_title")} subtitle={t("charts.projects_by_state_subtitle")} emptyLabel={t("empty")} isEmpty={projectsByState.length === 0} mounted={mounted}>
          <DonutChart data={projectsByState} />
        </ChartSection>

        <ChartSection title={t("charts.top_companies_title")} subtitle={t("charts.top_companies_subtitle")} emptyLabel={t("empty")} isEmpty={topCompanies.length === 0} mounted={mounted}>
          <HorizontalBars data={topCompanies} />
        </ChartSection>

        <ChartSection title={t("charts.users_by_role_title")} subtitle={t("charts.users_by_role_subtitle")} emptyLabel={t("empty")} isEmpty={usersByRole.length === 0} mounted={mounted}>
          <DonutChart data={usersByRole} />
        </ChartSection>

        <ChartSection title={t("charts.companies_by_type_title")} subtitle={t("charts.companies_by_type_subtitle")} emptyLabel={t("empty")} isEmpty={companiesByType.length === 0} mounted={mounted}>
          <VerticalBars data={companiesByType} />
        </ChartSection>
      </div>
    </div>
  );
}
