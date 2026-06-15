"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  X,
  Mail,
  Phone,
  Globe,
  Code2,
  Briefcase,
  MapPin,
  FileText,
  PenTool,
  BarChart2,
  CalendarCheck,
  Send,
  UserCheck,
  UserX,
  Info,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

type ApplicationStatus = "new" | "in_review" | "accepted" | "rejected";

interface TechTag {
  label: string;
  color: string;
}

interface PastWork {
  id: string;
  title: string;
  role: string;
  bgClass: string;
}

interface HistoryEntry {
  id: string;
  icon: React.ReactNode;
  label: string;
  date: string;
  isLast?: boolean;
}

interface Candidate {
  id: string;
  initials: string;
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  experience: string;
  matchScore: number;
  status: ApplicationStatus;
  appliedAgo: string;
  avatarBg: string;
  bio: string;
  techStack: TechTag[];
  stats: {
    stack: number;
    availability: number;
    modality: number;
    experience: number;
  };
  proposalTitle: string;
  pastWork: PastWork[];
  history: HistoryEntry[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    initials: "LR",
    name: "Lucas Rivas",
    role: "Frontend Developer",
    location: "San José, Costa Rica",
    email: "lrivas@talent.fwd",
    phone: "+506 8800-0000",
    experience: "4 años",
    matchScore: 94,
    status: "in_review",
    appliedAgo: "Hace 2 horas",
    avatarBg: "bg-accent/15 text-accent border border-accent/20",
    bio: "Desarrollador enfocado en la creación de interfaces escalables y de alto rendimiento. Especializado en el ecosistema React con una fuerte base en arquitectura de software y diseño atómico. Busco integrarme en equipos que prioricen la calidad del código y la experiencia del usuario final.",
    techStack: [
      { label: "React.js", color: "bg-primary/10 text-primary border-primary/20" },
      { label: "TypeScript", color: "bg-secondary/10 text-secondary border-secondary/20" },
      { label: "Tailwind CSS", color: "bg-accent/10 text-accent border-accent/20" },
      { label: "Next.js", color: "bg-warning/10 text-warning border-warning/20" },
      { label: "Node.js", color: "bg-magenta/10 text-magenta border-magenta/20" },
    ],
    stats: { stack: 95, availability: 100, modality: 90, experience: 88 },
    proposalTitle: "Dashboard de Analítica — Rediseño UX",
    pastWork: [
      { id: "pw1", title: "Logistics App Core", role: "React · Talend", bgClass: "from-secondary/60 to-primary/80" },
      { id: "pw2", title: "Fintech Analytics", role: "React · D3", bgClass: "from-primary/60 to-accent/80" },
    ],
    history: [
      {
        id: "h1",
        icon: <UserCheck className="size-3.5" />,
        label: "Perfil revisado por FWD Manager",
        date: "Hace 1 hora",
      },
      {
        id: "h2",
        icon: <Send className="size-3.5" />,
        label: "Postulación recibida",
        date: "Apr 12 19",
        isLast: true,
      },
    ],
  },
  {
    id: "c2",
    initials: "MA",
    name: "Martín Aranda",
    role: "React specialist",
    location: "Heredia, Costa Rica",
    email: "maranda@talent.fwd",
    phone: "+506 7711-2233",
    experience: "2 años",
    matchScore: 88,
    status: "new",
    appliedAgo: "Hace 5 horas",
    avatarBg: "bg-warning/10 text-warning border border-warning/20",
    bio: "Desarrollador React apasionado por las interfaces limpias y el rendimiento web. He trabajado en proyectos e-commerce y aplicaciones de gestión interna con enfoque en accesibilidad y buenas prácticas.",
    techStack: [
      { label: "React.js", color: "bg-primary/10 text-primary border-primary/20" },
      { label: "JavaScript", color: "bg-warning/10 text-warning border-warning/20" },
      { label: "CSS Modules", color: "bg-accent/10 text-accent border-accent/20" },
    ],
    stats: { stack: 88, availability: 80, modality: 95, experience: 70 },
    proposalTitle: "Panel de Gestión E-commerce",
    pastWork: [
      { id: "pw3", title: "E-commerce Admin", role: "React · Redux", bgClass: "from-warning/60 to-secondary/80" },
      { id: "pw4", title: "HR Dashboard", role: "Next.js · Zustand", bgClass: "from-accent/60 to-primary/80" },
    ],
    history: [
      {
        id: "h3",
        icon: <Send className="size-3.5" />,
        label: "Postulación recibida",
        date: "Hace 5 horas",
        isLast: true,
      },
    ],
  },
  {
    id: "c3",
    initials: "SC",
    name: "Sofía Castro",
    role: "UX & Frontend",
    location: "Alajuela, Costa Rica",
    email: "scastro@talent.fwd",
    phone: "+506 6622-9988",
    experience: "3 años",
    matchScore: 82,
    status: "new",
    appliedAgo: "Ayer",
    avatarBg: "bg-secondary/10 text-secondary border border-secondary/20",
    bio: "Diseñadora y desarrolladora con doble perfil UX/Frontend. Combino pensamiento de diseño con código limpio para entregar productos que no sólo funcionan bien, sino que los usuarios disfrutan usar.",
    techStack: [
      { label: "Figma", color: "bg-magenta/10 text-magenta border-magenta/20" },
      { label: "React.js", color: "bg-primary/10 text-primary border-primary/20" },
      { label: "Tailwind CSS", color: "bg-accent/10 text-accent border-accent/20" },
      { label: "Storybook", color: "bg-warning/10 text-warning border-warning/20" },
    ],
    stats: { stack: 80, availability: 90, modality: 85, experience: 75 },
    proposalTitle: "Sistema de Diseño — Design Tokens",
    pastWork: [
      { id: "pw5", title: "Design System v2", role: "Figma · React", bgClass: "from-magenta/60 to-secondary/80" },
      { id: "pw6", title: "UX Audit SaaS", role: "Figma · Notion", bgClass: "from-secondary/60 to-accent/80" },
    ],
    history: [
      {
        id: "h4",
        icon: <Send className="size-3.5" />,
        label: "Postulación recibida",
        date: "Ayer",
        isLast: true,
      },
    ],
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function getMatchColor(score: number): string {
  if (score >= 90) return "text-accent";
  if (score >= 70) return "text-warning";
  return "text-magenta";
}

function getMatchBadgeBg(score: number): string {
  if (score >= 90) return "bg-accent/15 text-accent border-accent/30";
  if (score >= 70) return "bg-warning/15 text-warning border-warning/30";
  return "bg-magenta/15 text-magenta border-magenta/30";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PostulacionesEmpresa() {
  const t = useTranslations("postulaciones_empresa");

  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [selectedId, setSelectedId] = useState<string>("c1");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "error">("success");

  const selected = candidates.find((c) => c.id === selectedId) ?? candidates[0]!;

  // ── Toast ──────────────────────────────────────────────────────────────────

  const triggerToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // ── Status update ──────────────────────────────────────────────────────────

  const updateStatus = (id: string, status: ApplicationStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  // ── Action handlers ────────────────────────────────────────────────────────

  const handleInvite = () => {
    updateStatus(selected.id, "in_review");
    triggerToast(t("toast_invited", { name: selected.name }), "success");
  };

  const handleInfo = () => {
    triggerToast(t("toast_info_requested", { name: selected.name }), "info");
  };

  const handleAccept = () => {
    updateStatus(selected.id, "accepted");
    triggerToast(t("toast_accepted", { name: selected.name }), "success");
  };

  const handleReject = () => {
    updateStatus(selected.id, "rejected");
    triggerToast(t("toast_rejected", { name: selected.name }), "error");
  };

  const handleViewPdf = () => {
    triggerToast(t("toast_pdf", { name: selected.name }), "info");
  };

  const handleOpenFigma = () => {
    triggerToast(t("toast_figma", { name: selected.name }), "info");
  };

  const handleFullProfile = () => {
    triggerToast(t("toast_full_profile", { name: selected.name }), "info");
  };

  // ── Status label ───────────────────────────────────────────────────────────

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case "new":        return t("status_new");
      case "in_review":  return t("status_in_review");
      case "accepted":   return t("status_accepted");
      case "rejected":   return t("status_rejected");
    }
  };

  const getStatusClass = (status: ApplicationStatus) => {
    switch (status) {
      case "new":        return "bg-primary/10 text-primary border-primary/20";
      case "in_review":  return "bg-warning/10 text-warning border-warning/20";
      case "accepted":   return "bg-accent/10 text-accent border-accent/20";
      case "rejected":   return "bg-magenta/10 text-magenta border-magenta/20";
    }
  };

  // ── Progress bar ───────────────────────────────────────────────────────────

  const StatBar = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between font-body text-xs font-semibold text-ink-muted">
        <span>{label}</span>
        <span className="text-ink-strong">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div
          className={`h-1.5 rounded-full transition-all duration-[var(--duration-slow)] ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-16">
      {/* ── Toast ── */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-[var(--shadow-elevated)] animate-in slide-in-from-bottom-5 ${
            toastType === "error"
              ? "border-magenta/30 bg-magenta/5 text-magenta"
              : toastType === "info"
              ? "border-primary/30 bg-surface text-ink-strong"
              : "border-border-strong bg-surface text-ink-strong"
          }`}
        >
          {toastType === "error" ? (
            <UserX className="size-5 text-magenta" />
          ) : toastType === "info" ? (
            <Info className="size-5 text-primary" />
          ) : (
            <CheckCircle2 className="size-5 text-accent" />
          )}
          <p className="font-body text-sm font-semibold">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 opacity-60 hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="space-y-0.5">
        <p className="font-body text-[11px] font-bold uppercase tracking-wider text-primary">
          {t("title")}
        </p>
        <h1 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
          {t("subtitle")}
          <span className="text-primary" aria-hidden="true">.</span>
        </h1>
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* ── Left sidebar: candidate list ── */}
        <aside className="lg:col-span-3">
          <div className="space-y-2">
            {candidates.map((candidate) => {
              const isActive = candidate.id === selectedId;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setSelectedId(candidate.id)}
                  className={`w-full rounded-2xl border p-3.5 text-left transition-all duration-[var(--duration-fast)] ${
                    isActive
                      ? "border-primary bg-surface shadow-[var(--shadow-soft)] ring-2 ring-primary/20"
                      : "border-border bg-surface hover:border-border-strong hover:shadow-[var(--shadow-soft)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold ${candidate.avatarBg}`}
                    >
                      {candidate.initials}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-heading text-sm font-bold leading-tight text-ink-strong">
                          {candidate.name}
                        </p>
                        {/* Match badge */}
                        <span
                          className={`shrink-0 rounded-full border px-1.5 py-0.5 font-body text-[9px] font-bold ${getMatchBadgeBg(candidate.matchScore)}`}
                        >
                          {candidate.matchScore}%
                        </span>
                      </div>
                      <p className="font-body text-xs text-ink-muted truncate">
                        {candidate.role}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        {/* Status pill */}
                        <span
                          className={`rounded-md border px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-wide ${getStatusClass(candidate.status)}`}
                        >
                          {getStatusLabel(candidate.status)}
                        </span>
                        <span className="flex items-center gap-0.5 font-body text-[9px] text-ink-subtle">
                          <Clock className="size-2.5" />
                          {candidate.appliedAgo}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Right: candidate detail ── */}
        <section className="lg:col-span-9 space-y-6">

          {/* ── Action bar ── */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-4">
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              {t("actions_header")}
            </p>

            <div className="flex flex-wrap gap-3">
              {/* Invite */}
              <Button
                onClick={handleInvite}
                disabled={selected.status === "accepted" || selected.status === "rejected"}
                className="h-10 rounded-full bg-primary px-5 font-body text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-40"
              >
                <CalendarCheck className="size-4" />
                {t("invite_btn")}
              </Button>

              {/* Request info */}
              <Button
                onClick={handleInfo}
                disabled={selected.status === "accepted" || selected.status === "rejected"}
                className="h-10 rounded-full bg-secondary px-5 font-body text-sm font-bold text-white hover:bg-secondary/90 disabled:opacity-40"
              >
                <Info className="size-4" />
                {t("info_btn")}
              </Button>

              {/* Accept */}
              <Button
                onClick={handleAccept}
                disabled={selected.status === "accepted" || selected.status === "rejected"}
                className="h-10 rounded-full bg-accent px-5 font-body text-sm font-bold text-white hover:bg-accent/90 disabled:opacity-40"
              >
                <UserCheck className="size-4" />
                {t("accept_btn")}
              </Button>

              {/* Reject */}
              <Button
                onClick={handleReject}
                disabled={selected.status === "accepted" || selected.status === "rejected"}
                variant="outline"
                className="h-10 rounded-full border-magenta/40 px-5 font-body text-sm font-bold text-magenta hover:bg-magenta/5 disabled:opacity-40"
              >
                <UserX className="size-4" />
                {t("reject_btn")}
              </Button>
            </div>

            {/* AI insight */}
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
              <p className="font-body text-xs italic text-ink-muted leading-relaxed">
                &ldquo;{t("engine_insight")}&rdquo;
              </p>
              <p className="mt-1.5 font-body text-[10px] font-bold text-primary">
                — {t("engine_signature")}
              </p>
            </div>
          </div>

          {/* ── Candidate header card ── */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Left: avatar + basic info */}
              <div className="flex items-center gap-4">
                <div
                  className={`flex size-14 shrink-0 items-center justify-center rounded-2xl font-heading text-lg font-bold ${selected.avatarBg}`}
                >
                  {selected.initials}
                </div>
                <div className="space-y-0.5">
                  <h2 className="font-heading text-lg font-bold text-ink-strong">
                    {selected.name}
                  </h2>
                  <div className="flex items-center gap-1 font-body text-sm text-ink-muted">
                    <MapPin className="size-3.5 shrink-0" />
                    {selected.location}
                  </div>
                  {/* Social links */}
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={`mailto:${selected.email}`}
                      aria-label="Email"
                      className="text-ink-muted hover:text-primary transition-colors"
                    >
                      <Mail className="size-4" />
                    </a>
                    <a
                      href="#"
                      aria-label="GitHub"
                      className="text-ink-muted hover:text-ink-strong transition-colors"
                    >
                      <Code2 className="size-4" />
                    </a>
                    <a
                      href="#"
                      aria-label="LinkedIn"
                      className="text-ink-muted hover:text-primary transition-colors"
                    >
                      <Briefcase className="size-4" />
                    </a>
                    <a
                      href="#"
                      aria-label="Portfolio"
                      className="text-ink-muted hover:text-primary transition-colors"
                    >
                      <Globe className="size-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right: action + match score */}
              <div className="flex flex-col items-end gap-2">
                <Button
                  onClick={handleFullProfile}
                  variant="outline"
                  className="h-9 rounded-full border-border px-4 font-body text-xs font-bold text-ink hover:bg-surface-sunken"
                >
                  {t("view_full_profile")}
                </Button>
              </div>
            </div>
          </div>

          {/* ── Match analysis ── */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-5">
            <div className="flex items-baseline justify-between">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                {t("match_analysis")}
              </p>
              <span className={`font-heading text-4xl font-extrabold ${getMatchColor(selected.matchScore)}`}>
                {selected.matchScore}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              <StatBar label="Stack" value={selected.stats.stack} color="bg-primary" />
              <StatBar label="Disp." value={selected.stats.availability} color="bg-accent" />
              <StatBar label="Modalidad" value={selected.stats.modality} color="bg-secondary" />
              <StatBar label="Exp." value={selected.stats.experience} color="bg-warning" />
            </div>
          </div>

          {/* ── Personal info + Tech stack ── */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Personal info */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-4">
              <h3 className="font-heading text-base font-bold text-ink-strong">
                {t("personal_info")}
              </h3>
              <div className="space-y-3 font-body text-sm">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2 min-w-[80px] text-ink-muted">
                    <Mail className="size-3.5 shrink-0" />
                    <span className="text-xs font-semibold">Email</span>
                  </div>
                  <span className="text-ink font-medium break-all">{selected.email}</span>
                </div>
                <div className="flex items-center gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2 min-w-[80px] text-ink-muted">
                    <Phone className="size-3.5 shrink-0" />
                    <span className="text-xs font-semibold">Teléfono</span>
                  </div>
                  <span className="text-ink font-medium">{selected.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-[80px] text-ink-muted">
                    <BarChart2 className="size-3.5 shrink-0" />
                    <span className="text-xs font-semibold">Experiencia</span>
                  </div>
                  <span className="text-ink font-medium">{selected.experience}</span>
                </div>
              </div>
            </div>

            {/* Tech stack */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-4">
              <h3 className="font-heading text-base font-bold text-ink-strong">
                {t("tech_stack")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {selected.techStack.map((tag) => (
                  <span
                    key={tag.label}
                    className={`rounded-lg border px-2.5 py-1 font-body text-xs font-semibold ${tag.color}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Professional Bio ── */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-3">
            <h3 className="font-heading text-base font-bold text-ink-strong">
              {t("bio_professional")}
            </h3>
            <p className="font-body text-sm leading-relaxed text-ink">
              {selected.bio}
            </p>
          </div>

          {/* ── Project Proposal ── */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-4">
            <h3 className="font-heading text-base font-bold text-ink-strong">
              {t("proposal_project")}
            </h3>

            {/* Mock proposal preview */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface-sunken">
              {/* Simulated dashboard UI */}
              <div className="flex h-48 flex-col bg-gradient-to-br from-secondary/80 to-primary/90 p-4">
                {/* Fake window chrome */}
                <div className="mb-3 flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-magenta/80" />
                  <div className="size-2.5 rounded-full bg-warning/80" />
                  <div className="size-2.5 rounded-full bg-accent/80" />
                </div>
                {/* Fake chart content */}
                <div className="flex flex-1 items-end gap-2 px-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-white/30"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                {/* Fake table rows */}
                <div className="mt-2 space-y-1">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex gap-2">
                      <div className="h-1.5 w-1/3 rounded bg-white/20" />
                      <div className="h-1.5 w-1/4 rounded bg-white/15" />
                      <div className="h-1.5 w-1/5 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Overlay title */}
              <div className="border-t border-border bg-surface px-4 py-2.5">
                <p className="font-heading text-sm font-bold text-ink-strong">
                  {selected.proposalTitle}
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleViewPdf}
                className="h-9 rounded-full bg-primary px-4 font-body text-xs font-bold text-white hover:bg-primary/90"
              >
                <FileText className="size-3.5" />
                {t("view_pdf")}
              </Button>
              <Button
                onClick={handleOpenFigma}
                variant="outline"
                className="h-9 rounded-full border-secondary/40 px-4 font-body text-xs font-bold text-secondary hover:bg-secondary/5"
              >
                <PenTool className="size-3.5" />
                {t("open_figma")}
              </Button>
            </div>
          </div>

          {/* ── Past work ── */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-4">
            <h3 className="font-heading text-base font-bold text-ink-strong">
              {t("past_works")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {selected.pastWork.map((work) => (
                <div
                  key={work.id}
                  className="overflow-hidden rounded-xl border border-border transition-all duration-[var(--duration-fast)] hover:border-border-strong hover:shadow-[var(--shadow-soft)]"
                >
                  {/* Simulated thumbnail */}
                  <div className={`h-24 bg-gradient-to-br ${work.bgClass} flex items-center justify-center`}>
                    <BarChart2 className="size-8 text-white/50" />
                  </div>
                  <div className="p-3">
                    <p className="font-heading text-sm font-bold text-ink-strong">
                      {work.title}
                    </p>
                    <p className="font-body text-xs text-ink-muted">{work.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Application history ── */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-4">
            <h3 className="font-heading text-base font-bold text-ink-strong">
              {t("history_postulation")}
            </h3>
            <ol className="space-y-0">
              {selected.history.map((entry, idx) => (
                <li key={entry.id} className="flex gap-3">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${
                        idx === 0
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-surface-sunken text-ink-muted"
                      }`}
                    >
                      {entry.icon}
                    </div>
                    {!entry.isLast && (
                      <div className="mt-1 h-6 w-px bg-border" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4 pt-0.5 space-y-0.5">
                    <p className="font-body text-sm font-semibold text-ink-strong">
                      {entry.label}
                    </p>
                    <p className="font-body text-xs text-ink-muted">{entry.date}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
