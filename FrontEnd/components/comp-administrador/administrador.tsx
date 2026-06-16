"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Building2, Check, Clock, FolderKanban, UserMinus, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  approveAdminUserAction,
  cancelAdminProjectAction,
  rejectAdminUserAction,
  suspendAdminUserAction,
} from "@/lib/actions/admin";
import type { AdminPendingUser, AdminProject } from "@/lib/api/types";

type TabType = "applications" | "projects";

export function Administrador({
  initialPendingUsers,
  initialProjects,
}: {
  initialPendingUsers: AdminPendingUser[];
  initialProjects: AdminProject[];
}) {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = React.useState<TabType>("applications");
  const [pendingUsers, setPendingUsers] = React.useState(initialPendingUsers);
  const [projects, setProjects] = React.useState(initialProjects);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const activeProjects = projects.filter((project) => project.estado.nombre !== "cancelado").length;
  const companyCount = pendingUsers.filter((user) => user.role?.nombre === "company").length;

  function showMessage(nextMessage: string) {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(null), 4000);
  }

  function approveUser(userId: string) {
    startTransition(async () => {
      const result = await approveAdminUserAction(userId);
      if (!result.ok) {
        showMessage(result.error);
        return;
      }
      setPendingUsers((current) => current.filter((user) => user.id !== userId));
      showMessage(t("messages.user_approved"));
    });
  }

  function rejectUser(userId: string) {
    startTransition(async () => {
      const result = await rejectAdminUserAction(userId);
      if (!result.ok) {
        showMessage(result.error);
        return;
      }
      setPendingUsers((current) => current.filter((user) => user.id !== userId));
      showMessage(t("messages.user_rejected"));
    });
  }

  function suspendUser(userId: string) {
    startTransition(async () => {
      const result = await suspendAdminUserAction(userId);
      if (!result.ok) {
        showMessage(result.error);
        return;
      }
      setPendingUsers((current) => current.filter((user) => user.id !== userId));
      showMessage(t("messages.user_suspended"));
    });
  }

  function cancelProject(projectId: string) {
    startTransition(async () => {
      const result = await cancelAdminProjectAction(projectId);
      if (!result.ok) {
        showMessage(result.error);
        return;
      }
      setProjects((current) =>
        current.map((project) =>
          project.id === projectId ? { ...project, estado: { nombre: "cancelado" } } : project,
        ),
      );
      showMessage(t("messages.project_cancelled"));
    });
  }

  return (
    <div className="min-h-screen space-y-8 bg-canvas p-6 font-sans text-ink md:p-10">
      {message && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-border-strong bg-surface px-4 py-3 font-body text-sm font-semibold text-ink-strong shadow-[var(--shadow-elevated)]">
          {message}
        </div>
      )}

      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong md:text-4xl">
          {t("title")}<span className="text-primary">.</span>
        </h1>
        <p className="text-sm text-ink-muted md:text-base">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4 border-border bg-surface p-5">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Users className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-subtle">{t("stats.pending_approvals")}</p>
            <p className="font-heading text-2xl font-black text-ink-strong">{pendingUsers.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-border bg-surface p-5">
          <div className="rounded-xl bg-accent/10 p-3 text-accent">
            <Building2 className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-subtle">{t("stats.active_companies")}</p>
            <p className="font-heading text-2xl font-black text-ink-strong">{companyCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-border bg-surface p-5">
          <div className="rounded-xl bg-highlight/10 p-3 text-primary">
            <FolderKanban className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-subtle">{t("stats.active_projects")}</p>
            <p className="font-heading text-2xl font-black text-ink-strong">{activeProjects}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-border bg-surface p-5">
          <div className="rounded-xl bg-warning/10 p-3 text-warning">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-subtle">{t("stats.total_students")}</p>
            <p className="font-heading text-2xl font-black text-ink-strong">2.0</p>
          </div>
        </Card>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border">
        {(["applications", "projects"] as TabType[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`-mb-px whitespace-nowrap border-b-2 px-5 py-3 font-heading text-xs font-bold tracking-wider transition-colors md:text-sm ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:border-border hover:text-ink"
            }`}
          >
            {t(`tabs.${tab}`).toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === "applications" && (
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-tight text-ink-strong md:text-xl">
            {t("applications.title")}
          </h2>
          <Card className="overflow-hidden border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-sunken">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-strong">{t("applications.name")}</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-strong">{t("applications.specialization")}</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-strong">{t("applications.status")}</th>
                    <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-ink-strong">{t("applications.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingUsers.length > 0 ? (
                    pendingUsers.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-surface-sunken/40">
                        <td className="p-4">
                          <p className="font-semibold text-ink-strong">{[user.nombre, user.apellido1].filter(Boolean).join(" ")}</p>
                          <p className="text-xs text-ink-muted">{user.correo}</p>
                        </td>
                        <td className="p-4 text-ink-muted">{user.role?.nombre ? t(`users.role_${user.role.nombre}`) : "2.0"}</td>
                        <td className="p-4">
                          <Badge className="border-none bg-warning/15 text-warning">{t("applications.pending")}</Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="accent" onClick={() => approveUser(user.id)} disabled={isPending}>
                              <Check className="size-3" />
                              {t("applications.approve")}
                            </Button>
                            <Button size="sm" variant="magenta" onClick={() => rejectUser(user.id)} disabled={isPending}>
                              <X className="size-3" />
                              {t("applications.reject")}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => suspendUser(user.id)} disabled={isPending}>
                              <UserMinus className="size-3" />
                              {t("companies.suspend")}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-ink-muted">{t("applications.empty")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}

      {activeTab === "projects" && (
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-tight text-ink-strong md:text-xl">
            {t("projects.title")}
          </h2>
          <Card className="overflow-hidden border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-sunken">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-strong">{t("projects.project")}</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-strong">{t("projects.company")}</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-ink-strong">{t("projects.status")}</th>
                    <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-ink-strong">{t("projects.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <tr key={project.id} className="transition-colors hover:bg-surface-sunken/40">
                        <td className="p-4 font-semibold text-ink-strong">{project.titulo}</td>
                        <td className="p-4 text-ink-muted">{project.empresa?.nombre_comercial ?? "2.0"}</td>
                        <td className="p-4">
                          <Badge className={project.estado.nombre === "cancelado" ? "border-none bg-magenta/15 text-magenta" : "border-none bg-accent/15 text-accent"}>
                            {t(`project_states.${project.estado.nombre}`)}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            variant="magenta"
                            onClick={() => cancelProject(project.id)}
                            disabled={isPending || project.estado.nombre === "cancelado"}
                          >
                            {t("projects.cancel")}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-ink-muted">{t("projects.empty")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
