"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  X,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectOption {
  id: string;
  title: string;
  modality: string;
  duration: string;
  specialties: string[];
}

const PROJECTS: ProjectOption[] = [
  { id: "p1", title: "Frontend Senior React", modality: "Remoto", duration: "3 meses", specialties: ["React", "Tailwind"] },
  { id: "p2", title: "UX/UI Designer Sprint", modality: "Híbrido", duration: "1 mes", specialties: ["UI/UX"] },
  { id: "p3", title: "Backend Node.js Architect", modality: "Presencial", duration: "6 meses", specialties: ["Node.js"] }
];

interface Candidate {
  id: string;
  name: string;
  initials: string;
  role: string;
  experience: string;
  matchScore: number;
  specialties: string[];
  availability: "immediate" | "agreed";
  modality: "remote" | "hybrid" | "onsite";
  stats: {
    techStack: number;
    availability: number;
    modality: number;
    experience: number;
  };
  insight: string;
}

const CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Alejandro Martínez",
    initials: "AM",
    role: "Frontend Developer Jr.",
    experience: "2 años",
    matchScore: 98,
    specialties: ["React", "Tailwind"],
    availability: "immediate",
    modality: "remote",
    stats: { techStack: 98, availability: 100, modality: 95, experience: 90 },
    insight: "Coincide fuertemente en React y TypeScript."
  },
  {
    id: "c2",
    name: "Valeria Gómez",
    initials: "VG",
    role: "Frontend Engineer Jr.",
    experience: "3 años",
    matchScore: 94,
    specialties: ["React"],
    availability: "immediate",
    modality: "remote",
    stats: { techStack: 95, availability: 100, modality: 95, experience: 85 },
    insight: "Fuerte experiencia en frontend con Next.js y Redux."
  },
  {
    id: "c3",
    name: "Sofía Rodríguez",
    initials: "SR",
    role: "Backend Developer Jr.",
    experience: "1 año",
    matchScore: 88,
    specialties: ["React", "Node.js"],
    availability: "immediate",
    modality: "remote",
    stats: { techStack: 85, availability: 100, modality: 95, experience: 70 },
    insight: "Excelente balance de backend con Node.js y Frontend."
  },
  {
    id: "c4",
    name: "Lucas Rivas",
    initials: "LR",
    role: "Fullstack Developer Jr.",
    experience: "1.5 años",
    matchScore: 84,
    specialties: ["React", "Tailwind", "Node.js"],
    availability: "agreed",
    modality: "hybrid",
    stats: { techStack: 80, availability: 85, modality: 90, experience: 80 },
    insight: "Perfil Fullstack con gran manejo de CSS/Tailwind."
  },
  {
    id: "c5",
    name: "Cata Pereira",
    initials: "CP",
    role: "UI Designer Jr.",
    experience: "2 años",
    matchScore: 82,
    specialties: ["UI/UX"],
    availability: "agreed",
    modality: "hybrid",
    stats: { techStack: 85, availability: 80, modality: 90, experience: 75 },
    insight: "Diseñadora de interfaces con foco en Figma y prototipos."
  },
  {
    id: "c6",
    name: "Mateo García",
    initials: "MG",
    role: "Backend Engineer Jr.",
    experience: "2.5 años",
    matchScore: 79,
    specialties: ["Node.js"],
    availability: "immediate",
    modality: "onsite",
    stats: { techStack: 82, availability: 90, modality: 70, experience: 75 },
    insight: "Especialista backend con NestJS y bases de datos relacionales."
  },
  {
    id: "c7",
    name: "Liam Neeson",
    initials: "LN",
    role: "UX Researcher Jr.",
    experience: "3 años",
    matchScore: 76,
    specialties: ["UI/UX"],
    availability: "agreed",
    modality: "remote",
    stats: { techStack: 75, availability: 80, modality: 95, experience: 50 },
    insight: "Enfoque en investigación de usuarios y diseño de wireframes."
  },
  {
    id: "c8",
    name: "Mariana Ortiz",
    initials: "MO",
    role: "Frontend Developer Jr.",
    experience: "1.5 años",
    matchScore: 89,
    specialties: ["React", "Tailwind"],
    availability: "immediate",
    modality: "remote",
    stats: { techStack: 90, availability: 100, modality: 95, experience: 70 },
    insight: "Dominio avanzado de maquetado responsivo y animaciones."
  },
  {
    id: "c9",
    name: "Gabriel Duarte",
    initials: "GD",
    role: "Backend Developer Jr.",
    experience: "2 años",
    matchScore: 85,
    specialties: ["Node.js", "Tailwind"],
    availability: "agreed",
    modality: "remote",
    stats: { techStack: 88, availability: 80, modality: 95, experience: 75 },
    insight: "Desarrollador enfocado en APIs RESTful y bases de datos NoSQL."
  },
  {
    id: "c10",
    name: "Lucía Méndez",
    initials: "LM",
    role: "UX/UI Designer Jr.",
    experience: "1 año",
    matchScore: 73,
    specialties: ["UI/UX", "React"],
    availability: "immediate",
    modality: "hybrid",
    stats: { techStack: 70, availability: 100, modality: 90, experience: 60 },
    insight: "Diseñadora UX con conocimientos prácticos de maquetación HTML/React."
  },
  {
    id: "c11",
    name: "Esteban Rojas",
    initials: "ER",
    role: "Frontend Developer Jr.",
    experience: "2 años",
    matchScore: 91,
    specialties: ["React", "Node.js"],
    availability: "immediate",
    modality: "remote",
    stats: { techStack: 92, availability: 100, modality: 95, experience: 75 },
    insight: "Perfil robusto en React, Hooks y gestión de estado global."
  },
  {
    id: "c12",
    name: "Camila Vega",
    initials: "CV",
    role: "HTML/CSS Integrator Jr.",
    experience: "1 año",
    matchScore: 68,
    specialties: ["Tailwind"],
    availability: "immediate",
    modality: "onsite",
    stats: { techStack: 65, availability: 100, modality: 70, experience: 50 },
    insight: "Especialidad en Tailwind y HTML semántico para layouts modernos."
  }
];

export function MatchesEmpresa() {
  const tDashboard = useTranslations("empresa_dashboard");
  const tMatches = useTranslations("matches_empresa");
  const locale = useLocale();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("p1");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters state
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [minMatch, setMinMatch] = useState<number>(50);
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [selectedModality, setSelectedModality] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("best");

  // Invited Candidates state
  const [invitedCandidateIds, setInvitedCandidateIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const selectedProject = useMemo(() => {
    return PROJECTS.find((p) => p.id === selectedProjectId) || PROJECTS[0]!;
  }, [selectedProjectId]);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleClearFilters = () => {
    setSelectedSpecialties([]);
    setMinMatch(50);
    setSelectedAvailability("all");
    setSelectedModality("all");
    triggerToast(tMatches("toast_cleared"));
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleInvite = (candidateId: string, name: string) => {
    setInvitedCandidateIds((prev) => {
      const next = new Set(prev);
      next.add(candidateId);
      return next;
    });
    triggerToast(tMatches("toast_invited", { name }));
  };

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    let result = [...CANDIDATES];

    // Filter by match score
    result = result.filter((c) => c.matchScore >= minMatch);

    // Filter by specialty (AND logic if any are selected)
    if (selectedSpecialties.length > 0) {
      result = result.filter((c) =>
        selectedSpecialties.every((s) => c.specialties.includes(s))
      );
    }

    // Filter by availability
    if (selectedAvailability !== "all") {
      result = result.filter((c) => c.availability === selectedAvailability);
    }

    // Filter by modality
    if (selectedModality !== "all") {
      result = result.filter((c) => c.modality === selectedModality);
    }

    // Sort candidates
    if (sortBy === "best") {
      result.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "worst") {
      result.sort((a, b) => a.matchScore - b.matchScore);
    }

    return result;
  }, [minMatch, selectedSpecialties, selectedAvailability, selectedModality, sortBy]);

  const paginatedCandidates = useMemo(() => {
    return filteredCandidates.slice(0, visibleCount);
  }, [filteredCandidates, visibleCount]);

  const hasMore = filteredCandidates.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface px-4 py-3 shadow-[var(--shadow-elevated)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 text-accent" />
          <p className="font-body text-sm font-semibold text-ink-strong">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-ink-subtle hover:text-ink-strong"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* --- MAIN BODY (2 Columns) --- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Filters (3/12) */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Project selector */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-4">
            <div>
              <span className="block font-body text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                {tMatches("viewing_matches")}
              </span>
              <div className="relative">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-surface-sunken border border-border rounded-xl text-sm font-bold text-ink-strong appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-[160ms]"
                >
                  {PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle pointer-events-none" />
              </div>
            </div>

            {/* Badges of selected project */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/60">
              <span className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 font-body text-[10px] font-bold text-primary">
                {selectedProject.modality}
              </span>
              <span className="rounded-lg bg-accent/10 border border-accent/20 px-2 py-0.5 font-body text-[10px] font-bold text-accent">
                {selectedProject.duration}
              </span>
            </div>
          </div>

          {/* Filters Form */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-heading text-lg font-bold text-ink-strong">
                {tMatches("filters_title")}
              </h2>
              <button
                type="button"
                onClick={handleClearFilters}
                className="font-body text-xs font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-1"
              >
                <RotateCcw className="size-3.5" />
                <span>{tMatches("clear_btn")}</span>
              </button>
            </div>

            {/* Specialty */}
            <div className="space-y-3">
              <span className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                {tMatches("specialty_label")}
              </span>
              <div className="flex flex-wrap gap-2">
                {["React", "Node.js", "UI/UX", "Tailwind"].map((spec) => {
                  const isSelected = selectedSpecialties.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className={`rounded-full border px-3.5 py-1.5 font-body text-xs font-semibold transition-all duration-[var(--duration-fast)] ${
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

            {/* Match Level Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {tMatches("match_level_label")}
                </span>
                <span className="font-heading text-sm font-extrabold text-accent">
                  +{minMatch}%
                </span>
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

            {/* Availability */}
            <div className="space-y-3">
              <span className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                {tMatches("availability_label")}
              </span>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 font-body text-sm text-ink hover:text-ink-strong cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="all"
                    checked={selectedAvailability === "all"}
                    onChange={() => setSelectedAvailability("all")}
                    className="accent-primary size-4"
                  />
                  <span>{tMatches("availability_all")}</span>
                </label>
                <label className="flex items-center gap-2.5 font-body text-sm text-ink hover:text-ink-strong cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="immediate"
                    checked={selectedAvailability === "immediate"}
                    onChange={() => setSelectedAvailability("immediate")}
                    className="accent-primary size-4"
                  />
                  <span>{tMatches("availability_immediate")}</span>
                </label>
                <label className="flex items-center gap-2.5 font-body text-sm text-ink hover:text-ink-strong cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="agreed"
                    checked={selectedAvailability === "agreed"}
                    onChange={() => setSelectedAvailability("agreed")}
                    className="accent-primary size-4"
                  />
                  <span>{tMatches("availability_agreed")}</span>
                </label>
              </div>
            </div>

            {/* Modality */}
            <div className="space-y-3">
              <span className="block font-body text-xs font-bold uppercase tracking-wider text-ink-muted">
                {tMatches("modality_label")}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "all", label: tMatches("modality_all") },
                  { key: "remote", label: tMatches("modality_remote") },
                  { key: "hybrid", label: tMatches("modality_hybrid") },
                  { key: "onsite", label: tMatches("modality_onsite") }
                ].map((mod) => {
                  const isSelected = selectedModality === mod.key;
                  return (
                    <button
                      key={mod.key}
                      type="button"
                      onClick={() => setSelectedModality(mod.key)}
                      className={`rounded-xl border p-2 font-body text-xs font-semibold transition-all duration-[var(--duration-fast)] text-center ${
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

        {/* Right Column: Candidates Grid (9/12) */}
        <section className="lg:col-span-9 space-y-6">
          {/* Candidates Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-heading text-lg font-bold text-ink-strong">
              {tMatches("showing_count", { count: filteredCandidates.length })}
            </h2>

            {/* Sorting */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-surface border border-border rounded-xl text-xs font-semibold text-ink-muted appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="best">{tMatches("sort_best")}</option>
                <option value="worst">{tMatches("sort_worst")}</option>
              </select>
            </div>
          </div>

          {paginatedCandidates.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {paginatedCandidates.map((candidate) => {
                const isInvited = invitedCandidateIds.has(candidate.id);
                return (
                  <div
                    key={candidate.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-fast)] hover:border-border-strong"
                  >
                    <div className="space-y-4">
                      {/* Card Top / Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                            {candidate.initials}
                          </div>
                          <div>
                            <h3 className="font-heading text-base font-bold text-ink-strong">
                              {candidate.name}
                            </h3>
                            <p className="font-body text-xs text-ink-muted">
                              {candidate.role} · {candidate.experience} exp.
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`block font-heading text-lg font-extrabold leading-none ${
                              candidate.matchScore >= 90
                                ? "text-accent"
                                : candidate.matchScore >= 70
                                ? "text-warning"
                                : "text-magenta"
                            }`}
                          >
                            {candidate.matchScore}%
                          </span>
                          <span className="font-body text-[8px] font-bold text-ink-subtle tracking-wider uppercase">
                            {tDashboard("compatibility.match_total")}
                          </span>
                        </div>
                      </div>

                      {/* Progress bars */}
                      <div className="space-y-2.5 pt-1">
                        {/* Tech Stack */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-ink-muted">
                            <span>{tDashboard("compatibility.tech_stack")}</span>
                            <span className="text-ink-strong">{candidate.stats.techStack}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-surface-sunken">
                            <div
                              className="h-1.5 rounded-full bg-primary transition-all duration-[var(--duration-slow)]"
                              style={{ width: `${candidate.stats.techStack}%` }}
                            />
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-ink-muted">
                            <span>{tDashboard("compatibility.availability")}</span>
                            <span className="text-ink-strong">{candidate.stats.availability}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-surface-sunken">
                            <div
                              className="h-1.5 rounded-full bg-accent transition-all duration-[var(--duration-slow)]"
                              style={{ width: `${candidate.stats.availability}%` }}
                            />
                          </div>
                        </div>

                        {/* Modality */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-ink-muted">
                            <span>{tDashboard("compatibility.modality")}</span>
                            <span className="text-ink-strong">{candidate.stats.modality}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-surface-sunken">
                            <div
                              className="h-1.5 rounded-full bg-secondary transition-all duration-[var(--duration-slow)]"
                              style={{ width: `${candidate.stats.modality}%` }}
                            />
                          </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-ink-muted">
                            <span>{tDashboard("compatibility.experience")}</span>
                            <span className="text-ink-strong">{candidate.stats.experience}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-surface-sunken">
                            <div
                              className="h-1.5 rounded-full bg-warning transition-all duration-[var(--duration-slow)]"
                              style={{ width: `${candidate.stats.experience}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Insight box */}
                      <div className="rounded-xl bg-surface-sunken/60 p-3 border border-border/40 font-body text-xs italic text-ink-muted leading-relaxed">
                        &ldquo;{candidate.insight}&rdquo;
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/60 mt-4 space-y-4">
                      {/* Specialties tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.specialties.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg bg-surface-sunken border border-border px-2 py-0.5 font-body text-[10px] font-medium text-ink"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Call to actions */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            className="font-body text-xs font-bold text-ink-muted hover:text-primary transition-colors"
                          >
                            {tMatches("view_profile")}
                          </button>
                          <button
                            type="button"
                            className="font-body text-xs font-bold text-ink-muted hover:text-secondary transition-colors"
                          >
                            + {tMatches("compare")}
                          </button>
                        </div>

                        <Button
                          size="sm"
                          variant={isInvited ? "outline" : "default"}
                          disabled={isInvited}
                          onClick={() => handleInvite(candidate.id, candidate.name)}
                          className={`h-8 rounded-full px-4 text-xs font-bold ${
                            isInvited
                              ? "border-accent text-accent bg-accent/5 hover:bg-accent/10"
                              : "bg-primary text-white hover:bg-primary/95"
                          }`}
                        >
                          {isInvited ? tMatches("invited_btn") : tMatches("invite_btn")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-6 text-center">
              <Sparkles className="size-8 text-ink-subtle mb-3 animate-pulse" />
              <p className="font-heading text-base font-bold text-ink-strong">
                {tMatches("empty_no_candidates_title")}
              </p>
              <p className="font-body text-sm text-ink-muted max-w-sm mt-1">
                {tMatches("empty_no_candidates_desc")}
              </p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                className="h-10 rounded-full border-border bg-surface px-6 text-sm font-bold text-ink hover:bg-surface-sunken hover:border-border-strong"
              >
                {tMatches("load_more")}
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
