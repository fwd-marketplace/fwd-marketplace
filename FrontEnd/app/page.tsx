export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-canvas px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
          FWD Marketplace
        </p>
        <h1 className="font-heading text-5xl font-extrabold tracking-tight text-ink-strong">
          Tu primer proyecto
          <span className="text-primary" aria-hidden="true">
            .
          </span>
        </h1>
        <p className="max-w-prose font-body text-lg text-ink-muted">
          Encontrá un proyecto corto, pagado y real. Empezá a construir tu
          carrera de verdad.
        </p>

        <div className="flex flex-wrap gap-3 pt-4">
          <span className="rounded-full bg-primary px-4 py-1.5 font-body text-sm font-semibold text-primary-foreground">
            Azul primario
          </span>
          <span className="rounded-full bg-secondary px-4 py-1.5 font-body text-sm font-semibold text-secondary-foreground">
            Morado secundario
          </span>
          <span className="rounded-full bg-accent px-4 py-1.5 font-body text-sm font-semibold text-accent-foreground">
            Teal accent
          </span>
          <span className="rounded-full bg-highlight px-4 py-1.5 font-body text-sm font-semibold text-highlight-foreground">
            Amarillo highlight
          </span>
          <span className="rounded-full bg-warning px-4 py-1.5 font-body text-sm font-semibold text-warning-foreground">
            Naranja warning
          </span>
          <span className="rounded-full bg-magenta px-4 py-1.5 font-body text-sm font-semibold text-magenta-foreground">
            Magenta
          </span>
        </div>
      </div>
    </main>
  );
}
