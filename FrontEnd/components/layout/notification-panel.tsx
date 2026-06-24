"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFormatter, useLocale, useNow, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Briefcase,
  CheckCircle2,
  Clock,
  FileUp,
  MessageSquarePlus,
  UserPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNotificacionesAction,
  marcarNotificacionLeidaAction,
  marcarTodasLeidasAction,
} from "@/lib/actions/notificaciones";
import type { ApiNotificacion, ApiRoleName } from "@/lib/api/types";

/** Icono por tipo de notificacion (los tipos vienen del CHECK de la tabla `notificacion`). */
const ICON_BY_TIPO: Record<string, { Icon: React.ElementType; className: string; bgClass: string }> = {
  adjudicacion: { Icon: CheckCircle2, className: "text-accent", bgClass: "bg-accent/10" },
  cambio_estado: { Icon: Briefcase, className: "text-primary", bgClass: "bg-primary/10" },
  nuevo_mensaje: { Icon: MessageSquarePlus, className: "text-primary", bgClass: "bg-primary/10" },
  entregable_subido: { Icon: FileUp, className: "text-secondary", bgClass: "bg-secondary/10" },
  vencimiento_plazo: { Icon: Clock, className: "text-warning", bgClass: "bg-warning/10" },
  invitacion: { Icon: UserPlus, className: "text-secondary", bgClass: "bg-secondary/10" },
};
const DEFAULT_ICON = { Icon: Bell, className: "text-ink-muted", bgClass: "bg-surface-sunken" };

function iconFor(tipo: string): { Icon: React.ElementType; className: string; bgClass: string } {
  return ICON_BY_TIPO[tipo] ?? DEFAULT_ICON;
}

/** Ruta de destino al hacer click en una notificacion, segun tipo, rol y referencia. */
function linkFor(notif: ApiNotificacion, role: ApiRoleName | undefined, locale: string): string {
  const { tipo, id_referencia } = notif;
  // Mensaje nuevo: si trae el proyecto referenciado, abrir DIRECTO su chat en gestión.
  if (tipo === "nuevo_mensaje" && id_referencia) {
    return `/${locale}/gestion?proyecto=${id_referencia}&seccion=chat`;
  }
  // Invitación a un proyecto: llevar al detalle del proyecto para postular.
  if (tipo === "invitacion" && id_referencia) {
    return `/${locale}/marketplace/${id_referencia}`;
  }
  if (role === "company") {
    if (tipo === "nuevo_mensaje") return `/${locale}/gestion`;
    return `/${locale}/gestion`;
  }
  if (role === "admin") return `/${locale}/admin`;
  // student y fallback
  if (tipo === "nuevo_mensaje") return `/${locale}/gestion`;
  return `/${locale}/mis-postulaciones`;
}

interface Props {
  role: ApiRoleName | undefined;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  dark?: boolean;
}

export function NotificationPanel({
  role,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
  dark = false,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("notification_panel");
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  const router = useRouter();
  const [notifs, setNotifs] = useState<ApiNotificacion[]>([]);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  // Carga al montar (para el badge) y refresca cada vez que el panel se abre.
  useEffect(() => {
    if (!role) return;
    let active = true;
    void getNotificacionesAction().then((res) => {
      if (active && res.ok) setNotifs(res.data);
    });
    return () => {
      active = false;
    };
  }, [role, open]);

  function setOpen(next: boolean) {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }

  const unread = notifs.filter((n) => !n.leida).length;

  async function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
    await marcarTodasLeidasAction();
  }

  async function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    await marcarNotificacionLeidaAction(id);
  }

  async function handleNotifClick(notif: ApiNotificacion) {
    setOpen(false);
    if (!notif.leida) await markRead(notif.id);
    router.push(linkFor(notif, role, locale));
  }

  return (
    <div className="relative">
      {/* ── Botón campana ── */}
      {showTrigger && (
        <button
          type="button"
          aria-label={t("aria_open")}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={cn(
            "relative inline-flex size-9 items-center justify-center rounded-full transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
            dark
              ? "text-white/80 hover:bg-white/15 hover:text-white"
              : "text-ink-muted hover:bg-surface-sunken",
          )}
        >
          <Bell className="size-5" aria-hidden="true" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold",
                dark ? "bg-highlight text-ink-strong" : "bg-primary text-white",
              )}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      {/* ── Backdrop ── */}
      {open && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          className="fixed inset-0 z-[55] cursor-default"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Panel dropdown ── */}
      {open && (
        <div className="absolute right-0 top-full z-[60] mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-elevated)]">
          {/* Header del panel */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-heading text-sm font-bold text-ink-strong">
              {t("title")}
              {unread > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 font-body text-[10px] font-bold text-primary">
                  {t("unread_count", { count: unread })}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded-full px-2 py-1 font-body text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  {t("mark_all_read")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("aria_close")}
                className="flex size-7 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink-strong"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Lista */}
          <ul className="max-h-[360px] overflow-y-auto divide-y divide-border">
            {notifs.length === 0 ? (
              <li className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-surface-sunken">
                  <BellOff className="size-5 text-ink-muted" aria-hidden="true" />
                </div>
                <p className="font-body text-sm text-ink-muted">{t("empty")}</p>
              </li>
            ) : (
              notifs.map((notif) => {
                const cfg = iconFor(notif.tipo);
                return (
                  <li key={notif.id}>
                    <button
                      type="button"
                      onClick={() => { void handleNotifClick(notif); }}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken",
                        !notif.leida && "bg-primary/3",
                      )}
                    >
                      {/* Icono */}
                      <div
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                          cfg.bgClass,
                        )}
                      >
                        <cfg.Icon className={cn("size-4", cfg.className)} aria-hidden="true" />
                      </div>

                      {/* Texto */}
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs leading-relaxed text-ink-strong">
                          {notif.mensaje}
                        </p>
                        <p className="mt-1 font-body text-[10px] text-ink-subtle">
                          {format.relativeTime(new Date(notif.fecha), now)}
                        </p>
                      </div>

                      {/* Punto no leído */}
                      {!notif.leida && (
                        <span
                          aria-label={t("aria_unread")}
                          className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                        />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between gap-3">
            <Link
              href={`/${locale}/gestion`}
              onClick={() => setOpen(false)}
              className="font-body text-xs font-semibold text-primary transition-colors hover:text-secondary"
            >
              {t("view_all")}
            </Link>
            <Link
              href={`/${locale}/preferencias-notificaciones`}
              onClick={() => setOpen(false)}
              className="font-body text-[11px] text-ink-muted transition-colors hover:text-primary"
            >
              {t("preferences")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
