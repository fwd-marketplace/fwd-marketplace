"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Bot, CheckCircle2, MessagesSquare, Send, Sparkles, X } from "lucide-react";
import { ESCALATION_TAG, streamProjectChatbot, type AiStreamEvent } from "@/lib/api/ai-client";
import { sendMensajeAction } from "@/lib/actions/mensajes";
import type { AiChatMessage } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
  projectTitulo: string;
  /**
   * Si se provee, "Ir al chat" cambia a la sección de chat en la MISMA página (sin recargar). Si no,
   * cae a un enlace que navega a /gestion del proyecto.
   */
  onGoToChat?: () => void;
}

/**
 * Chatbot del proyecto (Nivel 0): el junior pregunta dudas sobre ESTE proyecto y el bot responde
 * anclado a su contexto. Cuando el bot no puede responder añade la etiqueta de escalamiento y el
 * widget resalta "Hablar con la empresa" (Nivel 1), que crea un mensaje real en el chat humano.
 * El enlace para hablar con la empresa está SIEMPRE disponible, pero discreto, hasta que hace falta.
 */

/** Quita la etiqueta de escalamiento (completa o un prefijo parcial al final) del texto visible. */
function stripEscalationTag(text: string): string {
  return text.replace(ESCALATION_TAG, "").replace(/\s*\[\[?[A-Z]*$/i, "").trimEnd();
}

export function ProjectChatbot({ projectId, projectTitulo, onGoToChat }: Props) {
  const t = useTranslations("project_chatbot");
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [escalateSuggested, setEscalateSuggested] = useState(false);

  // Escalamiento a humano (Nivel 1).
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateDraft, setEscalateDraft] = useState("");
  const [escalateSending, setEscalateSending] = useState(false);
  const [escalateSent, setEscalateSent] = useState(false);
  const [escalateError, setEscalateError] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streamingText, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) {
      return;
    }

    const nextHistory: AiChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextHistory);
    setInput("");
    setError("");
    setIsStreaming(true);
    setStreamingText("");

    const controller = new AbortController();
    abortRef.current = controller;

    let accumulated = "";
    let failed = false;

    await streamProjectChatbot(
      projectId,
      nextHistory,
      (event: AiStreamEvent) => {
        if (event.type === "delta") {
          accumulated += event.text;
          setStreamingText(stripEscalationTag(accumulated));
        } else if (event.type === "error") {
          failed = true;
          setError(event.error);
        }
      },
      controller.signal,
    );

    setIsStreaming(false);
    setStreamingText("");

    if (accumulated.includes(ESCALATION_TAG)) {
      setEscalateSuggested(true);
    }
    const clean = stripEscalationTag(accumulated).trim();
    if (clean) {
      setMessages((prev) => [...prev, { role: "assistant", content: clean }]);
    } else if (!failed) {
      setError(t("error_generic"));
    }
  }

  function handleKey(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  function openEscalate() {
    setEscalateError("");
    if (!escalateDraft) {
      setEscalateDraft(t("escalate_default_draft", { titulo: projectTitulo }));
    }
    setEscalateOpen(true);
  }

  async function handleEscalate() {
    const text = escalateDraft.trim();
    if (!text || escalateSending) {
      return;
    }
    setEscalateSending(true);
    setEscalateError("");
    const result = await sendMensajeAction(projectId, text);
    setEscalateSending(false);
    if (result.ok) {
      setEscalateSent(true);
    } else {
      setEscalateError(t("error_generic"));
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-secondary/20 bg-secondary/5 p-5 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-secondary/40 hover:bg-secondary/10"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
          <Bot className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block font-heading text-base font-bold text-ink-strong">
            {t("title")}
          </span>
          <span className="block font-body text-sm text-ink-muted">{t("subtitle")}</span>
        </span>
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-secondary/20 bg-surface shadow-[var(--shadow-soft)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <Bot className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-sm font-bold text-ink-strong">{t("title")}</p>
            <p className="font-body text-[11px] text-ink-muted">{t("header_hint")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("close")}
          className="flex size-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink-strong"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} className="max-h-72 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isStreaming && (
          <div className="rounded-xl bg-surface-sunken px-4 py-3">
            <p className="flex items-center gap-1.5 font-body text-sm font-semibold text-ink-strong">
              <Sparkles className="size-4 text-secondary" aria-hidden="true" />
              {t("empty_title")}
            </p>
            <p className="mt-1 font-body text-xs text-ink-muted">{t("empty_hint")}</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMine = msg.role === "user";
          return (
            <div
              key={index}
              className={cn("flex", isMine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 font-body text-sm leading-relaxed",
                  isMine
                    ? "rounded-br-sm bg-secondary text-white"
                    : "rounded-bl-sm border border-border bg-canvas text-ink",
                )}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-sm border border-border bg-canvas px-3.5 py-2.5 font-body text-sm leading-relaxed text-ink">
              {streamingText || <span className="text-ink-muted">{t("thinking")}</span>}
            </div>
          </div>
        )}

        {error && <p className="font-body text-xs text-magenta">{error}</p>}
      </div>

      {/* Escalamiento enviado */}
      {escalateSent ? (
        <div className="border-t border-border bg-accent/5 px-4 py-4">
          <p className="flex items-center gap-2 font-body text-sm font-semibold text-accent">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            {t("escalate_sent_title")}
          </p>
          <p className="mt-1 font-body text-xs text-ink-muted">{t("escalate_sent_desc")}</p>
          {onGoToChat ? (
            <button
              type="button"
              onClick={onGoToChat}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-secondary/80"
            >
              <MessagesSquare className="size-4" aria-hidden="true" />
              {t("go_to_chat")}
            </button>
          ) : (
            <Link
              href={`/${locale}/gestion?proyecto=${projectId}`}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-secondary/80"
            >
              <MessagesSquare className="size-4" aria-hidden="true" />
              {t("go_to_chat")}
            </Link>
          )}
        </div>
      ) : escalateOpen ? (
        /* Compositor para escribirle a la empresa */
        <div className="border-t border-border px-4 py-4">
          <p className="mb-1 font-heading text-sm font-bold text-ink-strong">
            {t("escalate_title")}
          </p>
          <p className="mb-2 font-body text-xs text-ink-muted">{t("escalate_desc")}</p>
          <textarea
            value={escalateDraft}
            onChange={(e) => setEscalateDraft(e.target.value)}
            rows={3}
            placeholder={t("escalate_placeholder")}
            className="w-full resize-none rounded-xl border border-border bg-canvas px-3 py-2 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
          {escalateError && <p className="mt-1 font-body text-xs text-magenta">{escalateError}</p>}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleEscalate()}
              disabled={!escalateDraft.trim() || escalateSending}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="size-4" aria-hidden="true" />
              {escalateSending ? t("escalate_sending") : t("escalate_send")}
            </button>
            <button
              type="button"
              onClick={() => setEscalateOpen(false)}
              className="rounded-full px-3 py-2 font-body text-sm font-medium text-ink-muted transition-colors hover:text-ink-strong"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Input del bot */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                placeholder={t("input_placeholder")}
                disabled={isStreaming}
                className="min-h-[42px] flex-1 resize-none rounded-xl border border-border bg-canvas px-3.5 py-2.5 font-body text-sm text-ink placeholder:text-ink-muted/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 disabled:opacity-60"
                style={{ maxHeight: 120, overflowY: "auto" }}
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!input.trim() || isStreaming}
                aria-label={t("send")}
                className={cn(
                  "flex size-[42px] shrink-0 items-center justify-center rounded-xl transition-colors duration-[var(--duration-fast)]",
                  input.trim() && !isStreaming
                    ? "bg-secondary text-white hover:bg-secondary/80"
                    : "cursor-not-allowed bg-border text-ink-muted",
                )}
              >
                <Send className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Botón híbrido: prominente cuando el bot lo sugiere; discreto el resto del tiempo. */}
            {escalateSuggested ? (
              <button
                type="button"
                onClick={openEscalate}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-warning/15 px-4 py-2 font-body text-sm font-semibold text-warning transition-colors hover:bg-warning/25"
              >
                <MessagesSquare className="size-4" aria-hidden="true" />
                {t("talk_to_company")}
              </button>
            ) : (
              <button
                type="button"
                onClick={openEscalate}
                className="mt-2 block w-full text-center font-body text-xs font-medium text-ink-muted underline-offset-2 transition-colors hover:text-secondary hover:underline"
              >
                {t("prefer_human")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
