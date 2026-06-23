"use client";

import { useState, useMemo } from "react";
import { Check, CheckCircle2, RotateCcw, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ApiProject } from "@/lib/api/types";

// ── Mock data ─────────────────────────────────────────────────────────────────

interface MockCandidate {
  id: string;
  name: string;
  initials: string;
  role: string;
  experience: string;
  matchScore: number;
  specialties: string[];
  availability: "immediate" | "agreed";
  modality: "remote" | "hybrid" | "onsite";
  stats: { techStack: number; availability: number; modality: number };
  insight: string;
}

const MOCK_CANDIDATES: MockCandidate[] = [
  {
    id: "m1",
    name: "Andrea Mora",
    initials: "AM",
    role: "Frontend Developer",
    experience: "1 año",
    matchScore: 92,
    specialties: ["React", "TypeScript", "Tailwind"],
    availability: "immediate",
    modality: "remote",
    stats: { techStack: 95, availability: 100, modality: 85 },
    insight: "Especialidad en React con TypeScript y sistemas de diseño modernos.",
  },
  {
    id: "m2",
    name: "Carlos Jiménez",
    initials: "CJ",
    role: "Full Stack Developer",
    experience: "1.5 años",
    matchScore: 86,
    specialties: ["Node.js", "React", "PostgreSQL"],
    availability: "immediate",
    modality: "remote",
    stats: { techStack: 88, availability: 90, modality: 80 },
    insight: "Desarrollador full stack con foco en APIs REST y bases de datos.",
  },
  {
    id: "m3",
    name: "Sofía Vega",
    initials: "SV",
    role: "Backend Developer",
    experience: "8 meses",
    matchScore: 78,
    specialties: ["Python", "FastAPI", "Docker"],
    availability: "agreed",
    modality: "hybrid",
    stats: { techStack: 80, availability: 75, modality: 90 },
    insight: "Desarrolladora backend con experiencia en automatización y CI/CD.",
  },
  {
    id: "m4",
    name: "Luis Rodríguez",
    initials: "LR",
    role: "UI/UX Developer",
    experience: "1 año",
    matchScore: 74,
    specialties: ["Figma", "CSS", "React"],
    availability: "agreed",
    modality: "onsite",
    stats: { techStack: 70, availability: 85, modality: 65 },
    insight: "Diseñador desarrollador con portafolio en interfaces de usuario.",
  },
];

const MODALITY_OPTIONS = [
  { key: "all", label: "Todas" },
  { key: "remote", label: "Remoto" },
  { key: "hybrid", label: "Híbrido" },
  { key: "onsite", label: "Presencial" },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  project: ApiProject | null;
  inviteLabel: string;
  invitedLabel: string;
  emptyText: string;
  toastInvitedTemplate: string;
  className?: string;
}

export function ProjectMatchPanel({ project, inviteLabel, invitedLabel, emptyText, toastInvitedTemplate, className }: Props) {
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [minMatch, setMinMatch] = useState<number>(50);
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [selectedModality, setSelectedModality] = useState<string>("all");

  const projectSkills = useMemo<string[]>(() => {
    if (project?.skills && project.skills.length > 0) {
      return project.skills.map((s) => s.skill?.nombre ?? "").filter(Boolean);
    }
    return [...new Set(MOCK_CANDIDATES.flatMap((c) => c.specialties))];
  }, [project]);

  const filteredCandidates = useMemo(() => {
    let result = [...MOCK_CANDIDATES];
    result = result.filter((c) => c.matchScore >= minMatch);
    if (selectedSpecialties.length > 0) {
      result = result.filter((c) =>
        selectedSpecialties.every((s) => c.specialties.includes(s))
      );
    }
    if (selectedAvailability !== "all") {
      result = result.filter((c) => c.availability === selectedAvailability);
    }
    if (selectedModality !== "all") {
      result = result.filter((c) => c.modality === selectedModality);
    }
    return result.sort((a, b) => b.matchScore - a.matchScore);
  }, [minMatch, selectedSpecialties, selectedAvailability, selectedModality]);

  if (!project) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleInvite = (candidate: MockCandidate) => {
    setInvitedIds((prev) => new Set([...prev, candidate.id]));
    showToast(toastInvitedTemplate.replace("{name}", candidate.name));
  };

  const handleClearFilters = () => {
    setSelectedSpecialties([]);
    setMinMatch(50);
    setSelectedAvailability("all");
    setSelectedModality("all");
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  };

  return (
    <div className={cn("relative py-8", className ?? "px-6 md:px-10")}>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-elevated)] animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="size-4 text-accent shrink-0" />
          <p className="font-body text-sm font-semibold text-ink-strong">{toast}</p>
          <button type="button" onClick={() => setToast(null)} className="ml-1 text-ink-muted hover:text-ink-strong">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="size-4 text-secondary shrink-0" aria-hidden="true" />
        <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
          Juniors compatibles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-heading text-base font-bold text-ink-strong">Filtros</h2>
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 font-body text-xs font-bold text-primary hover:opacity-80 transition-opacity"
              >
                <RotateCcw className="size-3.5" />
                <span>Limpiar</span>
              </button>
            </div>

            {/* Especialidad */}
            <div className="space-y-3">
              <span className="block font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Especialidad
              </span>
              <div className="flex flex-wrap gap-2">
                {projectSkills.map((spec) => {
                  const isSelected = selectedSpecialties.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className={`rounded-full border px-3 py-1 font-body text-[11px] font-semibold transition-all duration-[var(--duration-fast)] ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-border bg-surface-sunken text-ink-muted hover:border-border-strong hover:text-ink"
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nivel de match */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Nivel de match
                </span>
                <span className="font-heading text-sm font-extrabold text-accent">+{minMatch}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={minMatch}
                onChange={(e) => setMinMatch(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-sunken accent-primary rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Disponibilidad */}
            <div className="space-y-3">
              <span className="block font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Disponibilidad
              </span>
              <div className="space-y-2">
                {[
                  { value: "all", label: "Todas" },
                  { value: "immediate", label: "Inmediata" },
                  { value: "agreed", label: "A convenir" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2.5 font-body text-sm text-ink hover:text-ink-strong cursor-pointer">
                    <input
                      type="radio"
                      name="availability-panel"
                      value={opt.value}
                      checked={selectedAvailability === opt.value}
                      onChange={() => setSelectedAvailability(opt.value)}
                      className="accent-primary size-4"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Modalidad */}
            <div className="space-y-3">
              <span className="block font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Modalidad
              </span>
              <div className="grid grid-cols-2 gap-2">
                {MODALITY_OPTIONS.map((mod) => {
                  const isSelected = selectedModality === mod.key;
                  return (
                    <button
                      key={mod.key}
                      type="button"
                      onClick={() => setSelectedModality(mod.key)}
                      className={`rounded-xl border p-2 font-body text-[11px] font-semibold transition-all duration-[var(--duration-fast)] text-center ${
                        isSelected
                          ? "bg-secondary border-secondary text-white"
                          : "border-border bg-surface-sunken text-ink-muted hover:border-border-strong hover:text-ink"
                      }`}
                    >
                      {mod.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Candidates Grid */}
        <section className="lg:col-span-9 space-y-5">
          <p className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
            {filteredCandidates.length} resultado{filteredCandidates.length !== 1 ? "s" : ""}
          </p>

          {filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
              <Sparkles className="size-8 text-ink-muted/30 animate-pulse" aria-hidden="true" />
              <p className="font-body text-sm text-ink-muted">{emptyText}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {filteredCandidates.map((candidate) => {
                const isInvited = invitedIds.has(candidate.id);
                const scoreColor =
                  candidate.matchScore >= 90 ? "text-accent"
                  : candidate.matchScore >= 70 ? "text-warning"
                  : "text-magenta";

                return (
                  <div
                    key={candidate.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-fast)] hover:border-border-strong"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-heading text-sm font-bold uppercase text-primary">
                            {candidate.initials}
                          </div>
                          <div>
                            <p className="font-heading text-sm font-bold text-ink-strong">{candidate.name}</p>
                            <p className="font-body text-xs text-ink-muted">{candidate.role} · {candidate.experience}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={cn("block font-heading text-lg font-extrabold leading-none", scoreColor)}>
                            {candidate.matchScore}%
                          </span>
                          <span className="font-body text-[8px] font-bold uppercase tracking-wider text-ink-muted">match</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          { label: "Stack técnico", value: candidate.stats.techStack, color: "bg-primary" },
                          { label: "Disponibilidad", value: candidate.stats.availability, color: "bg-accent" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="space-y-0.5">
                            <div className="flex justify-between font-body text-[10px] font-semibold text-ink-muted">
                              <span>{label}</span>
                              <span className="text-ink-strong">{value}%</span>
                            </div>
                            <div className="h-1 w-full rounded-full bg-surface-sunken">
                              <div className={cn("h-1 rounded-full transition-all duration-[var(--duration-slow)]", color)} style={{ width: `${value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {candidate.specialties.map((s) => (
                          <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-[10px] font-semibold text-primary">
                            {s}
                          </span>
                        ))}
                      </div>

                      <p className="font-body text-xs text-ink-muted leading-relaxed">{candidate.insight}</p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        variant={isInvited ? "outline" : "default"}
                        disabled={isInvited}
                        onClick={() => handleInvite(candidate)}
                        className={cn(
                          "h-8 rounded-full px-4 font-body text-xs font-bold",
                          isInvited
                            ? "border-accent bg-accent/5 text-accent hover:bg-accent/10"
                            : "bg-primary text-white hover:bg-secondary",
                        )}
                      >
                        {isInvited ? (
                          <><Check className="mr-1 size-3" aria-hidden="true" />{invitedLabel}</>
                        ) : (
                          inviteLabel
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
