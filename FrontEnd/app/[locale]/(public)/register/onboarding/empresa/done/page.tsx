import Link from "next/link";
import { FwdGeoBackdrop } from "@/components/ui/fwd-geo-backdrop";

export default function EmpresaDonePage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-secondary">
      <FwdGeoBackdrop />

      <header className="relative flex items-center px-8 py-6">
        <span className="font-heading text-base font-extrabold text-secondary-foreground">
          FWD Talent
          <span className="text-highlight">*</span>
        </span>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[2rem] bg-surface px-10 py-12 shadow-elevated text-center">
          <p className="mb-3 font-heading text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink-muted">
            Ya está
          </p>

          <h1 className="mb-3 font-heading text-4xl font-extrabold tracking-tight text-ink-strong">
            Tu empresa está registrada.
          </h1>

          <p className="mb-10 font-body text-sm text-ink-muted">
            Un admin de FWD revisará tu cuenta en las próximas 24 hs.
            Te avisamos cuando estés listo para publicar proyectos.
          </p>

          <Link
            href="/es/empresa/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-highlight px-8 py-3 font-body text-sm font-semibold text-highlight-foreground transition-opacity duration-[--duration-fast] hover:opacity-90"
          >
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
