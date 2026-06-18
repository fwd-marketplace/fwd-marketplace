"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Building2,
  Inbox,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockMessage, MockThread } from "@/lib/api/types";

interface Props {
  threads: MockThread[];
}

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

// ── Thread List Item ──────────────────────────────────────────────────────────

function ThreadItem({
  thread,
  isActive,
  onClick,
}: {
  thread: MockThread;
  isActive: boolean;
  onClick: () => void;
}) {
  const lastMsg = thread.messages.at(-1);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-4 border-b border-border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken",
        isActive && "bg-primary/5 border-l-2 border-l-primary",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-body text-sm font-bold text-ink-strong leading-tight line-clamp-1">
          {thread.projectTitle}
        </p>
        {thread.unreadCount > 0 && (
          <span className="shrink-0 flex size-5 items-center justify-center rounded-full bg-primary font-body text-[10px] font-bold text-white">
            {thread.unreadCount}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 mb-1">
        <Building2 className="size-3 text-ink-subtle shrink-0" aria-hidden="true" />
        <p className="font-body text-[11px] text-ink-subtle truncate">{thread.companyName}</p>
      </div>
      {lastMsg && (
        <p className={cn(
          "font-body text-xs line-clamp-1",
          thread.unreadCount > 0 ? "font-semibold text-ink" : "text-ink-muted",
        )}>
          {lastMsg.author === "junior" ? "Vos: " : ""}{lastMsg.text}
        </p>
      )}
    </button>
  );
}

// ── Chat View ─────────────────────────────────────────────────────────────────

function ChatView({
  thread,
  onBack,
}: {
  thread: MockThread;
  onBack: () => void;
}) {
  const t = useTranslations("mensajes");
  const [messages, setMessages] = useState<MockMessage[]>(thread.messages);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(thread.messages);
    setDraft("");
  }, [thread.projectId, thread.messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    const newMsg: MockMessage = {
      id: `msg-new-${Date.now()}`,
      author: "junior",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft("");
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
            {thread.projectTitle}
          </h2>
          <p className="flex items-center gap-1 font-body text-xs text-ink-muted">
            <Building2 className="size-3" aria-hidden="true" />
            {thread.companyName}
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-surface-sunken px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          {t("mock_badge")}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1 bg-canvas">
        {messages.map((msg, i) => {
          const isJunior = msg.author === "junior";
          const prevMsg = messages[i - 1];
          const showDaySep = !prevMsg || !isSameDay(prevMsg.timestamp, msg.timestamp);

          return (
            <div key={msg.id}>
              {showDaySep && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-body text-[11px] text-ink-muted shrink-0">
                    {formatDay(msg.timestamp)}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <div className={cn("flex", isJunior ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 font-body text-sm leading-relaxed",
                    isJunior
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-surface border border-border text-ink rounded-bl-sm shadow-[var(--shadow-soft)]",
                  )}
                >
                  <p>{msg.text}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px] text-right",
                      isJunior ? "text-white/70" : "text-ink-muted",
                    )}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
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
            disabled={!draft.trim()}
            onClick={handleSend}
            aria-label={t("send_btn")}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="size-3.5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1.5 text-center font-body text-[10px] text-ink-subtle">
          {t("mock_disclaimer")}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function Mensajes({ threads }: Props) {
  const t = useTranslations("mensajes");
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("proyecto");

  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    initialProjectId ?? threads[0]?.projectId ?? null,
  );

  const [mobileShowChat, setMobileShowChat] = useState(!!initialProjectId);

  const activeThread = threads.find((th) => th.projectId === activeProjectId) ?? null;

  function selectThread(projectId: string) {
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

      {threads.length === 0 ? (
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
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)]" style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}>
          <div className="flex h-full">
            {/* ── Thread List — siempre visible en md+, oculta en mobile si showChat ── */}
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
              {threads.map((th) => (
                <ThreadItem
                  key={th.projectId}
                  thread={th}
                  isActive={th.projectId === activeProjectId}
                  onClick={() => selectThread(th.projectId)}
                />
              ))}
            </div>

            {/* ── Chat Panel ── */}
            <div
              className={cn(
                "flex-1 flex-col overflow-hidden",
                mobileShowChat ? "flex" : "hidden md:flex",
              )}
            >
              {activeThread ? (
                <ChatView
                  thread={activeThread}
                  onBack={() => setMobileShowChat(false)}
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
