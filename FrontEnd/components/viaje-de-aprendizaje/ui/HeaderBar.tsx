"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Star, Sparkles, Flame, LogOut, House } from "lucide-react";
import { NavbarLogoConstellation } from "@/components/layout/NavbarLogoConstellation";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { logoutUser } from "@/lib/actions/auth";
import { getInitials } from "@/lib/api/safe-json";
import type { ApiRoleName } from "@/lib/api/types";
import type { Progress } from "../data/types";

interface HeaderBarProps {
  progress: Progress;
  xp: number;
  streak: number;
  userName?: string | undefined;
  avatarUrl?: string | undefined;
  role?: ApiRoleName | undefined;
}

const PROFILE_HREF: Record<string, string> = {
  student: "/perfil-estudiante",
  company: "/perfil-empresa",
  admin: "/admin/dashboard",
};

export function HeaderBar({ progress, xp, streak, userName, avatarUrl, role }: HeaderBarProps) {
  const t = useTranslations("viaje");
  const locale = useLocale();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initials = userName ? getInitials(userName) : "";
  const profileHref = role ? (PROFILE_HREF[role] ?? "/perfil-estudiante") : "/perfil-estudiante";

  function handleLogout() {
    startTransition(async () => {
      await logoutUser();
      router.replace(`/${locale}`);
      router.refresh();
    });
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 px-[18px] py-[10px] backdrop-blur-[14px] border-b border-white/[0.10]"
      style={{ background: "linear-gradient(135deg, rgba(38,16,60,0.90) 0%, rgba(28,10,58,0.88) 60%, rgba(20,30,80,0.86) 100%)" }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">

        {/* ── Izquierda: Logo + Título ───────────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/${locale}/bienvenida`}
            aria-label={t("home_label")}
            title={t("home_label")}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors duration-[var(--duration-fast)] hover:bg-white/15 hover:text-white"
          >
            <House size={18} aria-hidden="true" />
          </Link>
          <Link
            href={`/${locale}/marketplace`}
            aria-label="FWD Marketplace"
            className="flex size-10 shrink-0 items-center justify-center"
          >
            <NavbarLogoConstellation logoAlt="FWD" />
          </Link>
          <div className="min-w-0">
            <p className="font-heading font-bold text-[9.5px] tracking-[0.2em] uppercase text-white/55 m-0 mb-[1px] truncate">
              {t("eyebrow")}
            </p>
            <h1 className="font-heading font-extrabold text-[16px] sm:text-[20px] tracking-[-0.02em] text-white leading-none m-0">
              {t("title")}
              <span className="text-highlight" aria-hidden="true">.</span>
            </h1>
          </div>
        </div>

        {/* ── Centro: chips de stats (ocultos en móvil para no amontonar) ── */}
        <div className="hidden sm:flex gap-[6px] items-center">
          <StatChip
            icon={<Star size={13} aria-hidden="true" />}
            value={`${progress.lit}/${progress.total}`}
            color="#20BEC6"
          />
          <StatChip
            icon={<Sparkles size={13} aria-hidden="true" />}
            value={xp.toLocaleString("de-DE")}
            unit={t("xp_label")}
            color="#FFCB05"
          />
          <StatChip
            icon={<Flame size={13} aria-hidden="true" />}
            value={String(streak)}
            unit={t("streak_label")}
            color="#F7901E"
          />
        </div>

        {/* ── Derecha: notif + perfil + logout ──────────────────────── */}
        <div className="flex items-center justify-end gap-1">
          {role && (
            <NotificationPanel
              role={role}
              open={notifOpen}
              onOpenChange={setNotifOpen}
              showTrigger
              dark={true}
            />
          )}

          {userName && (
            <Link
              href={`/${locale}${profileHref}`}
              title={userName}
              className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-white/15 text-white ring-1 ring-white/30 font-body text-xs font-bold transition-opacity hover:opacity-85 shrink-0"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={userName} className="size-full object-cover" />
              ) : (
                initials
              )}
            </Link>
          )}

          {userName && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              aria-label="Cerrar sesión"
              className="inline-flex size-9 items-center justify-center rounded-full text-white/80 transition-colors duration-[var(--duration-fast)] hover:bg-white/15 hover:text-white disabled:opacity-50"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

interface StatChipProps {
  icon: React.ReactNode;
  value: string;
  color: string;
  unit?: string;
}

function StatChip({ icon, value, color, unit }: StatChipProps) {
  return (
    <div
      className="inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-full"
      style={{
        background: color + "14",
        border: `1px solid ${color}40`,
        boxShadow: `0 0 10px ${color}18`,
      }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="font-heading font-extrabold text-[13px] text-white whitespace-nowrap">
        {value}
        {unit && (
          <span className="font-body font-medium text-[10px] text-white/60 ml-1">{unit}</span>
        )}
      </span>
    </div>
  );
}
