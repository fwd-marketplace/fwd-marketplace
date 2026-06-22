"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Search, RotateCcw, BadgeCheck, Loader2, Users } from "lucide-react";
import { searchStudentsAction } from "@/lib/actions/students";
import type { StudentSpecialty, TalentStudent } from "@/lib/api/types";

const ESPECIALIDADES: StudentSpecialty[] = ["frontend", "backend", "fullstack", "ia"];
const MODALIDADES = ["remote", "hybrid", "onsite"] as const;

type Traducir = ReturnType<typeof useTranslations>;

interface Props {
  initialStudents: TalentStudent[];
  skills: { id: string; nombre: string }[];
}

function iniciales(nombre: string, apellido: string | null): string {
  return `${nombre.charAt(0)}${apellido?.charAt(0) ?? ""}`.toUpperCase();
}

/**
 * Directorio de talento: la empresa/emprendedor busca y filtra ESTUDIANTES
 * verificados reales (datos del endpoint /students/search). Los filtros
 * estructurados (especialidad, modalidad, skill, disponibilidad) se resuelven en
 * el BackEnd; la búsqueda por nombre se afina en el cliente para respuesta
 * instantánea.
 */
export function MatchesEmpresa({ initialStudents, skills }: Props) {
  const t = useTranslations("talento");
  const [students, setStudents] = useState<TalentStudent[]>(initialStudents);
  const [isPending, startTransition] = useTransition();
  const esPrimeraVez = useRef(true);

  const [q, setQ] = useState("");
  const [especialidad, setEspecialidad] = useState<StudentSpecialty | "">("");
  const [modalidad, setModalidad] = useState<string>("");
  const [skillId, setSkillId] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  useEffect(() => {
    // El primer render ya tiene initialStudents (filtros vacíos); no re-pedimos.
    if (esPrimeraVez.current) {
      esPrimeraVez.current = false;
      return;
    }
    startTransition(async () => {
      const result = await searchStudentsAction({
        ...(especialidad ? { especialidad } : {}),
        ...(modalidad ? { modalidad } : {}),
        ...(skillId ? { skill: skillId } : {}),
        ...(soloDisponibles ? { solo_disponibles: true } : {}),
      });
      if (result.ok) setStudents(result.data.students);
    });
  }, [especialidad, modalidad, skillId, soloDisponibles]);

  const visibles = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return students;
    return students.filter((s) =>
      `${s.usuario?.nombre ?? ""} ${s.usuario?.apellido1 ?? ""}`.toLowerCase().includes(needle),
    );
  }, [q, students]);

  function limpiarFiltros() {
    setQ("");
    setEspecialidad("");
    setModalidad("");
    setSkillId("");
    setSoloDisponibles(false);
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong">
          {t("title")}
          <span className="text-primary" aria-hidden="true">.</span>
        </h1>
        <p className="mt-1 font-body text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Filtros */}
        <aside className="lg:col-span-3">
          <div className="space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-heading text-lg font-bold text-ink-strong">{t("filters_title")}</h2>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="flex items-center gap-1 font-body text-xs font-bold text-primary transition-opacity hover:opacity-80"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                {t("clear_btn")}
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search_placeholder")}
                aria-label={t("search_placeholder")}
                className="w-full rounded-xl border border-border bg-surface-sunken py-2.5 pl-9 pr-3 font-body text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <span className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                {t("specialty_label")}
              </span>
              <div className="flex flex-wrap gap-2">
                {ESPECIALIDADES.map((e) => {
                  const activo = especialidad === e;
                  return (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEspecialidad(activo ? "" : e)}
                      className={`rounded-full border px-3.5 py-1.5 font-body text-xs font-semibold transition-colors duration-[var(--duration-fast)] ${
                        activo
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-surface-sunken text-ink-muted hover:text-ink"
                      }`}
                    >
                      {t(`specialty.${e}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <span className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                {t("modality_label")}
              </span>
              <div className="flex flex-wrap gap-2">
                {MODALIDADES.map((m) => {
                  const activo = modalidad === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModalidad(activo ? "" : m)}
                      className={`rounded-full border px-3.5 py-1.5 font-body text-xs font-semibold transition-colors duration-[var(--duration-fast)] ${
                        activo
                          ? "border-secondary bg-secondary text-white"
                          : "border-border bg-surface-sunken text-ink-muted hover:text-ink"
                      }`}
                    >
                      {t(`modality.${m}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {skills.length > 0 && (
              <div className="space-y-2">
                <label
                  htmlFor="talento-skill"
                  className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted"
                >
                  {t("skill_label")}
                </label>
                <select
                  id="talento-skill"
                  value={skillId}
                  onChange={(e) => setSkillId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-sunken px-3 py-2.5 font-body text-sm text-ink-strong outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">{t("skill_all")}</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={soloDisponibles}
                onChange={(e) => setSoloDisponibles(e.target.checked)}
                className="size-4 accent-primary"
              />
              <span className="font-body text-sm font-medium text-ink">{t("only_available")}</span>
            </label>
          </div>
        </aside>

        {/* Resultados */}
        <section className="lg:col-span-9">
          <div className="mb-4 flex items-center gap-2 font-body text-sm text-ink-muted">
            {isPending && <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />}
            <span>{t("results_count", { count: visibles.length })}</span>
          </div>

          {visibles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
              <Users className="mx-auto size-10 text-ink-subtle" aria-hidden="true" />
              <p className="mt-3 font-body text-sm text-ink-muted">{t("empty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibles.map((s) => (
                <StudentCard key={s.id} student={s} t={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StudentCard({ student, t }: { student: TalentStudent; t: Traducir }) {
  const nombre = student.usuario?.nombre ?? "";
  const apellido = student.usuario?.apellido1 ?? "";
  const nombreCompleto = `${nombre} ${apellido}`.trim();
  const espConocida = ESPECIALIDADES.includes(student.especialidad as StudentSpecialty);

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-shadow duration-[var(--duration-base)] hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-center gap-3">
        {student.url_avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.url_avatar}
            alt={nombreCompleto}
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary/10 font-heading text-sm font-bold text-secondary">
            {iniciales(nombre, apellido)}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-heading text-base font-bold text-ink-strong">{nombreCompleto}</h3>
            {student.estado_verificacion === "verificado" && (
              <BadgeCheck className="size-4 shrink-0 text-accent" aria-label={t("verified")} />
            )}
          </div>
          {student.especialidad && (
            <p className="font-body text-xs text-ink-muted">
              {espConocida ? t(`specialty.${student.especialidad}`) : student.especialidad}
            </p>
          )}
        </div>
      </div>

      {student.titulo_fwd && (
        <p className="mt-3 font-body text-xs text-ink-muted">{student.titulo_fwd}</p>
      )}

      {student.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {student.skills.slice(0, 5).map((sk) => (
            <span
              key={sk}
              className="rounded-full bg-surface-sunken px-2.5 py-0.5 font-body text-[11px] font-medium text-ink-muted"
            >
              {sk}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold ${
            student.disponible ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
          }`}
        >
          {student.disponible ? t("available_badge") : t("busy_badge")}
        </span>
      </div>
    </article>
  );
}
