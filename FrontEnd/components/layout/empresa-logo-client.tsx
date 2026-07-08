"use client";

import { useRef, useState } from "react";
import { Building2, Camera, Loader2, Trash2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { uploadEmpresarioLogo, deleteEmpresarioLogo } from "@/lib/actions/perfil";

interface Props {
  initialLogoUrl: string | null;
}

export function EmpresaLogoClient({ initialLogoUrl }: Props) {
  const t = useTranslations("mi_empresa");
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("logo.invalid_type"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("logo.too_large"));
      return;
    }
    setError(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadEmpresarioLogo(formData);
    setIsUploading(false);
    if (result.ok) {
      setLogoUrl(result.data.url_logo);
    } else {
      setError(t("logo.upload_error"));
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);
    const result = await deleteEmpresarioLogo();
    setIsDeleting(false);
    if (result.ok) {
      setLogoUrl(null);
    } else {
      setError(t("logo.upload_error"));
    }
  }

  return (
    <div className="shrink-0 space-y-1">
      <div className="relative">
        <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-secondary-foreground/10 shadow-[var(--shadow-elevated)]">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={t("logo.alt")} className="size-full object-cover" />
          ) : (
            <Building2 className="size-14 text-highlight" />
          )}
        </div>
        <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
          {logoUrl && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isUploading}
              aria-label={t("logo.delete")}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-magenta text-white shadow-soft transition-opacity duration-[var(--duration-fast)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading || isDeleting}
            aria-label={t("logo.change")}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-highlight text-secondary shadow-soft transition-opacity duration-[var(--duration-fast)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      {error && (
        <p className="flex max-w-24 items-center gap-1 text-[10px] font-medium text-highlight">
          <AlertCircle className="size-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
