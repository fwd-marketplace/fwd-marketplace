"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, Loader2, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { intlLocale } from "@/lib/i18n/date-locale";
import { getProjectMensajesAction, sendMensajeAction } from "@/lib/actions/mensajes";
import { MejorarMensajeButton } from "@/components/gestion/MejorarMensajeButton";
import { ReportarMensajeButton } from "@/components/gestion/ReportarMensajeButton";
import type { ApiMensaje, ApiProject } from "@/lib/api/types";

/** Cada cuánto se refrescan los mensajes del chat (polling, no hay WebSockets en el MVP). */
const CHAT_POLL_INTERVAL_MS = 4000;

function formatChatTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(intlLocale(locale), { hour: "2-digit", minute: "2-digit" });
}

function juniorDisplayName(u: { nombre: string; apellido1: string | null } | null | undefined) {
  if (!u) return "Junior";
  return u.apellido1 ? `${u.nombre} ${u.apellido1}` : u.nombre;
}

/**
 * Chat humano de UN proyecto entre la empresa y los juniors postulantes. Antes vivía inline en
 * GestionPage; se extrajo para poder reutilizarlo desde el dashboard de empresa (consolidación B1).
 * Estado y polling internos; i18n propio (namespace `project_chat`), sin depender del `t` del padre.
 */
// El chat solo necesita id/título (y, para el junior, el nombre de la empresa). Aceptar esta forma
// mínima permite que la bandeja de empresa pase un proyecto inmediato desde la conversación, sin
// esperar la carga asíncrona del proyecto completo (que causaba un parpadeo al abrir el chat).
export type ChatPanelProject = Pick<ApiProject, "id" | "titulo" | "empresa">;

export function ChatPanel({
  isEmpresa,
  project,
  userId,
}: {
  isEmpresa: boolean;
  project: ChatPanelProject | null;
  userId: string | null;
}) {
  const t = useTranslations("project_chat");
  const locale = useLocale();
  const [rawMsgs, setRawMsgs] = useState<ApiMensaje[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [selectedJuniorId, setSelectedJuniorId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load + poll cada 4 s. `loaded` evita mostrar estados intermedios (vacío / selector) mientras
  // llega la primera respuesta: hasta entonces se muestra un spinner, sin parpadeos.
  useEffect(() => {
    if (!project?.id || !userId) return;
    let active = true;
    setRawMsgs([]);
    setLoaded(false);

    const load = async () => {
      try {
        const r = await getProjectMensajesAction(project.id);
        if (!active) return;
        if (r.ok) setRawMsgs(r.data);
      } catch {
        // Ignora fallos transitorios del transporte de Server Actions (p. ej. durante Fast Refresh
        // en dev). El siguiente poll reintenta; los errores reales ya llegan como Result.err.
      } finally {
        if (active) setLoaded(true);
      }
    };

    void load();
    const timer = setInterval(() => { void load(); }, CHAT_POLL_INTERVAL_MS);
    return () => { active = false; clearInterval(timer); };
  }, [project?.id, userId]);

  // Derive unique juniors for empresa multi-tab
  const juniors = (() => {
    if (!isEmpresa || !userId) return [];
    const map = new Map<string, { id: string; nombre: string; apellido1: string | null }>();
    rawMsgs.forEach((m) => {
      const isMine = m.remitente?.id === userId;
      const juniorUser = !isMine ? m.remitente : m.destinatario_info;
      if (juniorUser && !map.has(juniorUser.id)) map.set(juniorUser.id, juniorUser);
    });
    return [...map.values()];
  })();

  // Mensajes sin leer por junior (empresa): recibidos por mí y aún sin marcar como leídos.
  // Alimenta el badge "sin ver" del selector de juniors para saber a quién responder.
  const unreadByJunior = (() => {
    const counts = new Map<string, number>();
    if (!isEmpresa || !userId) return counts;
    rawMsgs.forEach((m) => {
      const fromJunior = m.remitente?.id && m.remitente.id !== userId;
      const toMe = m.destinatario_info?.id === userId;
      if (fromJunior && toMe && m.leida === false) {
        const jid = m.remitente!.id;
        counts.set(jid, (counts.get(jid) ?? 0) + 1);
      }
    });
    return counts;
  })();

  // Reset junior selection when project changes
  useEffect(() => {
    setSelectedJuniorId(null);
  }, [project?.id]);

  // Junior activo (empresa): el que eligió en el selector, o —si hay uno solo— ése directamente,
  // sin obligarla a elegir de una lista de uno. Se deriva en render (no en un efecto) para que el
  // selector nunca parpadee antes de mostrar el hilo. Con varios juniors y ninguno elegido, es null
  // y se muestra el selector.
  const activeJuniorId = selectedJuniorId ?? (isEmpresa && juniors.length === 1 ? juniors[0]!.id : null);

  // Al abrir el hilo de un junior, marcar como leídos SOLO sus mensajes (backend con `?remitente=`).
  // Optimista primero para que el badge desaparezca al instante; luego re-sincroniza con el servidor.
  useEffect(() => {
    if (!isEmpresa || !activeJuniorId || !project?.id || !userId) return;
    setRawMsgs((prev) =>
      prev.map((m) =>
        m.remitente?.id === activeJuniorId && m.destinatario_info?.id === userId && m.leida === false
          ? { ...m, leida: true }
          : m,
      ),
    );
    void getProjectMensajesAction(project.id, activeJuniorId).then((r) => {
      if (r.ok) setRawMsgs(r.data);
    });
  }, [isEmpresa, activeJuniorId, project?.id, userId]);

  // Filter messages for the selected junior (empresa) or all (junior)
  const visibleMsgs = isEmpresa && activeJuniorId
    ? rawMsgs.filter((m) => {
        const isMine = m.remitente?.id === userId;
        return isMine
          ? m.destinatario_info?.id === activeJuniorId
          : m.remitente?.id === activeJuniorId;
      })
    : rawMsgs;

  // Solo autoscroll al llegar un mensaje nuevo (no en cada render). `block: "nearest"` mantiene el
  // scroll dentro del contenedor del chat en vez de mover la página entera.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [visibleMsgs.length]);

  // Header display info
  const otherName    = isEmpresa
    ? (activeJuniorId ? juniorDisplayName(juniors.find((j) => j.id === activeJuniorId)) : t("label_junior"))
    : (project?.empresa?.nombre_comercial ?? t("label_empresa"));
  const otherInitial = isEmpresa
    ? (activeJuniorId ? (juniors.find((j) => j.id === activeJuniorId)?.nombre[0]?.toUpperCase() ?? "J") : "J")
    : (project?.empresa?.nombre_comercial?.[0]?.toUpperCase() ?? "E");

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    if (!project?.id || !userId) return;
    if (isEmpresa && !activeJuniorId) return;

    setSending(true);
    setSendError("");
    try {
      const r = await sendMensajeAction(project.id, text, isEmpresa ? (activeJuniorId ?? undefined) : undefined);
      if (r.ok) {
        setDraft("");
        // Reload to get server-confirmed message
        const reload = await getProjectMensajesAction(project.id);
        if (reload.ok) setRawMsgs(reload.data);
      } else {
        setSendError(t("send_error"));
      }
    } catch {
      setSendError(t("send_error"));
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
  };

  // Spinner mientras llega la primera carga: evita mostrar "sin conversaciones" o el selector antes
  // de tiempo (parpadeo al entrar a un chat).
  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" aria-label={t("cargando")} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Empresa: sin conversaciones aún */}
      {isEmpresa && juniors.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <MessageSquare className="size-7 text-primary" aria-hidden="true" />
          </div>
          <p className="font-body text-sm text-ink-muted">{t("sin_conversaciones")}</p>
        </div>
      )}

      {/* Empresa: lista de juniors para seleccionar (varios juniors, ninguno activo) */}
      {isEmpresa && juniors.length > 0 && !activeJuniorId && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b border-border bg-surface px-6 py-4">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
              {t("seleccionar_junior")}
            </p>
            {project?.titulo && (
              <p className="mt-0.5 truncate font-heading text-sm font-bold text-ink-strong">
                {project.titulo}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 p-4">
            {juniors.map((j) => {
              const jMsgs = rawMsgs.filter(
                (m) => m.remitente?.id === j.id || m.destinatario_info?.id === j.id,
              );
              const lastMsg = jMsgs[jMsgs.length - 1];
              const unread = unreadByJunior.get(j.id) ?? 0;
              return (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => setSelectedJuniorId(j.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border bg-surface p-4 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-secondary/30 hover:bg-secondary/5",
                    unread > 0 ? "border-secondary/40 bg-secondary/5" : "border-border",
                  )}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-heading text-sm font-bold text-secondary">
                    {j.nombre[0]?.toUpperCase() ?? "J"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "min-w-0 flex-1 truncate font-body text-sm text-ink-strong",
                        unread > 0 ? "font-extrabold" : "font-bold",
                      )}>
                        {juniorDisplayName(j)}
                      </p>
                      {unread > 0 && (
                        <span
                          className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-magenta px-1.5 py-0.5 font-body text-[10px] font-bold text-white"
                          aria-label={t("no_leidos", { count: unread })}
                        >
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className={cn(
                        "truncate font-body text-xs",
                        unread > 0 ? "font-semibold text-ink" : "text-ink-muted",
                      )}>
                        {lastMsg.contenido}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empresa: tabs para cambiar de junior (solo cuando hay varios) */}
      {isEmpresa && juniors.length > 1 && activeJuniorId && (
        <div className="shrink-0 flex gap-0 border-b border-border bg-surface overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedJuniorId(null)}
            className="shrink-0 px-4 py-3 font-body text-sm font-semibold text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-ink border-b-2 border-transparent"
          >
            ←
          </button>
          {juniors.map((j) => {
            const unread = unreadByJunior.get(j.id) ?? 0;
            return (
              <button
                key={j.id}
                type="button"
                onClick={() => setSelectedJuniorId(j.id)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-4 py-3 font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] border-b-2",
                  activeJuniorId === j.id
                    ? "border-secondary text-secondary"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-border",
                )}
              >
                {juniorDisplayName(j)}
                {unread > 0 && activeJuniorId !== j.id && (
                  <span className="size-2 shrink-0 rounded-full bg-magenta" aria-label={t("no_leidos", { count: unread })} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Header con nombre del interlocutor */}
      {(!isEmpresa || activeJuniorId) && (
        <div className="shrink-0 flex items-center gap-3 border-b border-border bg-surface px-6 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-heading text-sm font-bold text-secondary">
            {otherInitial}
          </div>
          <div className="min-w-0">
            <p className="truncate font-body text-sm font-bold text-ink-strong">{otherName}</p>
            <p className="font-body text-xs text-ink-muted">{project?.titulo ?? ""}</p>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {(!isEmpresa || activeJuniorId) && (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {visibleMsgs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <MessageSquare className="size-7 text-primary" aria-hidden="true" />
              </div>
              <p className="font-body text-sm text-ink-muted">{t("empty")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {visibleMsgs.map((msg) => {
                const isMine = msg.remitente?.id === userId;
                return (
                  <div key={msg.id} className={cn("flex items-end gap-2.5", isMine ? "flex-row-reverse" : "flex-row")}>
                    {!isMine && (
                      <div className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-heading text-xs font-bold text-secondary">
                        {otherInitial}
                      </div>
                    )}
                    <div className={cn("flex max-w-[72%] flex-col gap-1", isMine ? "items-end" : "items-start")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 font-body text-sm leading-relaxed",
                          isMine
                            ? "rounded-br-sm bg-secondary text-white"
                            : "rounded-bl-sm border border-border bg-surface text-ink",
                        )}
                      >
                        {msg.contenido}
                      </div>
                      <span className="flex items-center gap-1.5 px-1 font-body text-[11px] text-ink-muted">
                        {formatChatTime(msg.fecha_envio, locale)}
                        {!isMine && <ReportarMensajeButton mensajeId={msg.id} />}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      )}

      {/* Input */}
      {(!isEmpresa || activeJuniorId) && (
        <div className="shrink-0 border-t border-border bg-surface px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("placeholder")}
              rows={2}
              className="min-h-[64px] flex-1 resize-none rounded-xl border border-border bg-canvas px-4 py-3 font-body text-sm leading-relaxed text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              style={{ maxHeight: 200, overflowY: "auto" }}
            />
            <button
              onClick={() => { void send(); }}
              disabled={!draft.trim() || sending}
              aria-label={t("send")}
              className={cn(
                "flex size-[42px] shrink-0 items-center justify-center rounded-xl transition-colors duration-[var(--duration-fast)]",
                draft.trim() && !sending
                  ? "bg-secondary text-white hover:bg-secondary/80"
                  : "bg-border text-ink-muted cursor-not-allowed",
              )}
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </div>
          {/* Junior y empresa: reescribir el borrador con IA antes de enviarlo (Nivel 2) */}
          {project && (
            <MejorarMensajeButton draft={draft} projectId={project.id} onReplace={setDraft} />
          )}
          {sendError && <p className="mt-1.5 px-1 font-body text-[11px] text-magenta">{sendError}</p>}
          <p className="mt-1.5 px-1 font-body text-[11px] text-ink-muted">{t("hint")}</p>
        </div>
      )}
    </div>
  );
}
