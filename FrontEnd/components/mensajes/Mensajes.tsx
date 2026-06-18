"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Inbox, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProjectMensajesAction, sendMensajeAction } from "@/lib/actions/mensajes";
import type { ApiMensaje, MyOffer } from "@/lib/api/types";

interface Props {
  initialOffers: MyOffer[];
  currentUserId: string;
}

type MensajesT = ReturnType<typeof useTranslations<"mensajes">>;

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

// ── Thread list item ──────────────────────────────────────────────────────────

function OfferItem({
  offer,
  isActive,
  onClick,
  t,
}: {
  offer: MyOffer;
  isActive: boolean;
  onClick: () => void;
  t: MensajesT;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-4 border-b border-border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken",
        isActive && "bg-primary/5 border-l-2 border-l-primary",
      )}
    >
      <p className="font-body text-sm font-bold text-ink-strong leading-tight line-clamp-1 mb-1">
        {offer.proyecto?.titulo ?? t("unnamed_project")}
      </p>
      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-[10px] font-semibold text-primary">
        {offer.estado.nombre}
      </span>
    </button>
  );
}

// ── Chat view ─────────────────────────────────────────────────────────────────

function ChatView({
  offer,
  currentUserId,
  onBack,
  t,
}: {
  offer: MyOffer;
  currentUserId: string;
  onBack: () => void;
  t: MensajesT;
}) {
  const [messages, setMessages] = useState<ApiMensaje[]>([]);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, startSending] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  const projectId = offer.proyecto?.id;

  const loadMessages = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingMsgs(true);
    const result = await getProjectMensajesAction(projectId);
    if (result.ok) setMessages(result.data);
    setIsLoadingMsgs(false);
  }, [projectId]);

  useEffect(() => {
    void loadMessages();
    setDraft("");
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = draft.trim();
    if (!text || !projectId) return;
    setDraft("");
    startSending(async () => {
      const result = await sendMensajeAction(projectId, text);
      if (result.ok) setMessages((prev) => [...prev, result.data]);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("back")}
          className="md:hidden flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h2 className="font-heading text-base font-extrabold tracking-tight text-ink-strong truncate">
            {offer.proyecto?.titulo ?? t("unnamed_project")}
          </h2>
          <p className="font-body text-xs text-ink-muted">{offer.estado.nombre}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1 bg-canvas">
        {isLoadingMsgs ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-ink-muted" aria-hidden="true" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center font-body text-sm text-ink-muted py-10">{t("no_messages")}</p>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.remitente?.id === currentUserId;
            const prevMsg = messages[i - 1];
            const showDaySep = !prevMsg || !isSameDay(prevMsg.fecha_envio, msg.fecha_envio);

            return (
              <div key={msg.id}>
                {showDaySep && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="font-body text-[11px] text-ink-muted shrink-0">
                      {formatDay(msg.fecha_envio)}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 font-body text-sm leading-relaxed",
                      isMine
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-surface border border-border text-ink rounded-bl-sm shadow-[var(--shadow-soft)]",
                    )}
                  >
                    {!isMine && msg.remitente && (
                      <p className="font-semibold text-[11px] text-ink-muted mb-0.5">
                        {msg.remitente.nombre}
                        {msg.remitente.apellido1 ? ` ${msg.remitente.apellido1}` : ""}
                      </p>
                    )}
                    <p>{msg.contenido}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px] text-right",
                        isMine ? "text-white/70" : "text-ink-muted",
                      )}
                    >
                      {formatTime(msg.fecha_envio)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="border-t border-border bg-surface px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface-sunken px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20">
          <label htmlFor="compose-msg" className="sr-only">
            {t("compose_placeholder")}
          </label>
          <textarea
            id="compose-msg"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("compose_placeholder")}
            className="flex-1 resize-none bg-transparent font-body text-sm text-ink-strong outline-none placeholder:text-ink-subtle max-h-32"
            style={{ overflowY: draft.includes("\n") || draft.length > 80 ? "auto" : "hidden" }}
          />
          <button
            type="button"
            disabled={!draft.trim() || isSending}
            onClick={handleSend}
            aria-label={t("send_btn")}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Mensajes({ initialOffers, currentUserId }: Props) {
  const t = useTranslations("mensajes");
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("proyecto");

  const offers = initialOffers.filter((o) => o.proyecto !== null);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    initialProjectId ?? offers[0]?.proyecto?.id ?? null,
  );
  const [mobileShowChat, setMobileShowChat] = useState(!!initialProjectId);

  const activeOffer = offers.find((o) => o.proyecto?.id === activeProjectId) ?? null;

  function selectOffer(projectId: string) {
    setActiveProjectId(projectId);
    setMobileShowChat(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-ink-strong mb-1">
          {t("title")}
          <span className="text-primary" aria-hidden="true">.</span>
        </h1>
        <p className="font-body text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      {offers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Inbox className="size-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-xl font-bold text-ink-strong mb-2">
            {t("empty_title")}
          </h2>
          <p className="font-body text-sm text-ink-muted max-w-sm mx-auto">
            {t("empty_desc")}
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)]"
          style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}
        >
          <div className="flex h-full">
            {/* Thread list */}
            <div
              className={cn(
                "flex-col border-r border-border overflow-y-auto",
                "w-full md:w-72 lg:w-80 md:flex shrink-0",
                mobileShowChat ? "hidden" : "flex",
              )}
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  {t("threads_label")}
                </p>
              </div>
              {offers.map((offer) => (
                <OfferItem
                  key={offer.id}
                  offer={offer}
                  isActive={offer.proyecto?.id === activeProjectId}
                  onClick={() => selectOffer(offer.proyecto!.id)}
                  t={t}
                />
              ))}
            </div>

            {/* Chat panel */}
            <div
              className={cn(
                "flex-1 flex-col overflow-hidden",
                mobileShowChat ? "flex" : "hidden md:flex",
              )}
            >
              {activeOffer ? (
                <ChatView
                  offer={activeOffer}
                  currentUserId={currentUserId}
                  onBack={() => setMobileShowChat(false)}
                  t={t}
                />
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                  <div>
                    <p className="font-heading text-lg font-bold text-ink-strong mb-1">
                      {t("select_prompt")}
                    </p>
                    <p className="font-body text-sm text-ink-muted">
                      {t("select_desc")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
