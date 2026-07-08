"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Undo2 } from "lucide-react";
import { mejorarMensajeAction } from "@/lib/actions/ai";

interface Props {
  draft: string;
  projectId: string;
  onReplace: (text: string) => void;
}

/**
 * Botón "mejorar con IA" del chat de la empresa (Nivel 2): reescribe el borrador para que quede
 * más claro y profesional. Nunca envía: reemplaza el texto del input para que la empresa lo revise
 * y edite, con opción de deshacer y volver al borrador original.
 */
export function MejorarMensajeButton({ draft, projectId, onReplace }: Props) {
  const t = useTranslations("mejorar_mensaje");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prevDraft, setPrevDraft] = useState<string | null>(null);

  async function handleMejorar() {
    const text = draft.trim();
    if (!text || loading) {
      return;
    }
    setLoading(true);
    setError("");
    const result = await mejorarMensajeAction(text, projectId);
    setLoading(false);
    if (result.ok) {
      setPrevDraft(draft);
      onReplace(result.data);
    } else {
      setError(result.error || t("error"));
    }
  }

  function handleUndo() {
    if (prevDraft !== null) {
      onReplace(prevDraft);
      setPrevDraft(null);
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void handleMejorar()}
        disabled={!draft.trim() || loading}
        className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/5 px-3 py-1.5 font-body text-xs font-semibold text-secondary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkles className="size-3.5" aria-hidden="true" />
        {loading ? t("loading") : t("button")}
      </button>

      {prevDraft !== null && !loading && (
        <button
          type="button"
          onClick={handleUndo}
          className="inline-flex items-center gap-1 font-body text-xs font-medium text-ink-muted transition-colors hover:text-ink-strong"
        >
          <Undo2 className="size-3.5" aria-hidden="true" />
          {t("undo")}
        </button>
      )}

      {error && <span className="font-body text-xs text-magenta">{error}</span>}
    </div>
  );
}
