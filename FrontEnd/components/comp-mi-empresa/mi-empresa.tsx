'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  Check,
  Globe,
  Building2,
  Target,
  Clock,
  ShieldCheck,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ApiMeProfile, CatalogArea } from '@/lib/api/types';
import { updateEmpresarioProfile } from '@/lib/actions/perfil';

type ProjectType =
  | 'web' | 'mobile' | 'ai' | 'automation' | 'dashboards'
  | 'integrations' | 'ux' | 'data' | 'other';

type StartupStage = 'idea' | 'mvp' | 'validating' | 'scaling';

type TechSupport =
  | 'web' | 'mobile' | 'backend' | 'ai' | 'ux' | 'data' | 'automation' | 'other';

type BudgetRange = 'under_500' | 'range_500_1000' | 'range_1000_2500' | 'flexible';

const ALL_PROJECT_TYPES: ProjectType[] = [
  'web', 'mobile', 'ai', 'automation', 'dashboards',
  'integrations', 'ux', 'data', 'other',
];

const EMPLOYEE_RANGES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] as const;
type EmployeeRange = (typeof EMPLOYEE_RANGES)[number];

const CR_CANTONS: Record<string, string[]> = {
  'San José': [
    'San José', 'Escazú', 'Desamparados', 'Puriscal', 'Tarrazú', 'Aserrí', 'Mora',
    'Goicoechea', 'Santa Ana', 'Alajuelita', 'Vásquez de Coronado', 'Acosta', 'Tibás',
    'Moravia', 'Montes de Oca', 'Turrubares', 'Dota', 'Curridabat', 'Pérez Zeledón',
    'León Cortés',
  ],
  'Alajuela': [
    'Alajuela', 'San Ramón', 'Grecia', 'San Mateo', 'Atenas', 'Naranjo', 'Palmares',
    'Poás', 'Orotina', 'San Carlos', 'Alfaro Ruiz', 'Valverde Vega', 'Upala',
    'Los Chiles', 'Guatuso', 'Río Cuarto',
  ],
  'Cartago': [
    'Cartago', 'Paraíso', 'La Unión', 'Jiménez', 'Turrialba', 'Alvarado',
    'Oreamuno', 'El Guarco',
  ],
  'Heredia': [
    'Heredia', 'Barva', 'Santo Domingo', 'Santa Bárbara', 'San Rafael', 'San Isidro',
    'Belén', 'Flores', 'San Pablo', 'Sarapiquí',
  ],
  'Guanacaste': [
    'Liberia', 'Nicoya', 'Santa Cruz', 'Bagaces', 'Carrillo', 'Cañas', 'Abangares',
    'Tilarán', 'Nandayure', 'La Cruz', 'Hojancha',
  ],
  'Puntarenas': [
    'Puntarenas', 'Esparza', 'Buenos Aires', 'Montes de Oro', 'Osa', 'Quepos',
    'Golfito', 'Coto Brus', 'Parrita', 'Corredores', 'Garabito', 'Monteverde',
    'Puerto Jiménez',
  ],
  'Limón': ['Limón', 'Pococí', 'Siquirres', 'Talamanca', 'Matina', 'Guácimo'],
};

const CR_PROVINCES = Object.keys(CR_CANTONS);

type Contact = {
  name: string;
  role: string;
  email: string;
  initial: string;
};

type CompanyData = {
  name: string;
  description: string;
  comercialName: string;
  website: string;
  provincia: string;
  canton: string;
  modalities: string[];
  scheduleType: 'flexible' | 'fixed';
  contacts: Contact[];
  empleados: EmployeeRange;
  sectors: string[];
  mission: string;
  vision: string;
  values: string[];
  culture: string;
  projectTypes: ProjectType[];
  stage: StartupStage;
  neededSupport: TechSupport[];
  budget: BudgetRange;
  projectDescription: string;
};

const MOCK_DATA: CompanyData = {
  name: '', description: '', comercialName: '', website: '',
  provincia: 'San José', canton: 'San José',
  modalities: [], scheduleType: 'flexible', contacts: [],
  empleados: '1-10', sectors: [], mission: '', vision: '',
  values: [], culture: '', projectTypes: [],
  stage: 'idea', neededSupport: [], budget: 'flexible', projectDescription: '',
};

function parseLocation(direccion: string | null | undefined): { provincia: string; canton: string } {
  if (!direccion) return { provincia: MOCK_DATA.provincia, canton: MOCK_DATA.canton };
  try {
    const parsed = JSON.parse(direccion) as { provincia?: string; canton?: string };
    return {
      provincia: parsed.provincia ?? MOCK_DATA.provincia,
      canton: parsed.canton ?? MOCK_DATA.canton,
    };
  } catch {
    const parts = direccion.split(', ');
    return { canton: parts[0] ?? MOCK_DATA.canton, provincia: parts[1] ?? MOCK_DATA.provincia };
  }
}

function parseJsonArray<T extends string>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as string[];
    const result = parsed.filter(Boolean) as T[];
    return result.length > 0 ? result : fallback;
  } catch {
    const result = raw.split(',').map((s) => s.trim()).filter(Boolean) as T[];
    return result.length > 0 ? result : fallback;
  }
}

function parseContacts(raw: string | null | undefined): Contact[] {
  if (!raw) return MOCK_DATA.contacts;
  try {
    const parsed = JSON.parse(raw) as Array<{ name: string; role: string; email: string }>;
    return parsed.map((c) => ({
      name: c.name, role: c.role, email: c.email,
      initial: (c.name.trim().split(' ').map((n) => n[0]).join('').substring(0, 2) || 'C').toUpperCase(),
    }));
  } catch {
    return MOCK_DATA.contacts;
  }
}

function buildInitialData(profile: ApiMeProfile | null): CompanyData {
  const emp = profile?.empresario;
  const { provincia, canton } = parseLocation(emp?.direccion);
  return {
    ...MOCK_DATA,
    name: emp?.nombre_comercial ?? MOCK_DATA.name,
    description: emp?.descripcion ?? MOCK_DATA.description,
    comercialName: emp?.nombre_comercial ?? MOCK_DATA.comercialName,
    website: emp?.url_sitio_web ?? MOCK_DATA.website,
    sectors: parseJsonArray<string>(emp?.sector, MOCK_DATA.sectors),
    modalities: parseJsonArray<string>(emp?.modalidades, MOCK_DATA.modalities),
    scheduleType: (emp?.horario as 'flexible' | 'fixed' | null) ?? MOCK_DATA.scheduleType,
    provincia, canton,
    projectTypes: parseJsonArray<ProjectType>(emp?.tipos_proyecto, MOCK_DATA.projectTypes),
    stage: (emp?.etapa as StartupStage | null) ?? MOCK_DATA.stage,
    neededSupport: parseJsonArray<TechSupport>(emp?.apoyo_tecnico_necesario, MOCK_DATA.neededSupport),
    budget: (emp?.presupuesto as BudgetRange | null) ?? MOCK_DATA.budget,
    projectDescription: emp?.descripcion ?? MOCK_DATA.projectDescription,
    mission: emp?.mision ?? MOCK_DATA.mission,
    vision: emp?.vision ?? MOCK_DATA.vision,
    culture: emp?.cultura ?? MOCK_DATA.culture,
    values: parseJsonArray<string>(emp?.valores, MOCK_DATA.values),
    contacts: parseContacts(emp?.contactos),
    empleados: (emp?.cantidad_empleados as EmployeeRange | null) ?? MOCK_DATA.empleados,
  };
}

// ── Section header with pencil / save / cancel ────────────────────────────────
function SectionHeader({
  icon, title, sectionId, editingSection, isSaving,
  onEdit, onSave, onCancel,
}: {
  icon: React.ReactNode;
  title: string;
  sectionId: string;
  editingSection: string | null;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isActive = editingSection === sectionId;
  const otherActive = editingSection !== null && !isActive;
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-3 font-heading text-xl font-bold tracking-tight text-ink-strong">
        {icon}
        {title}
      </h2>
      {isActive ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-ink-muted transition-colors hover:border-border-strong hover:text-ink disabled:opacity-40"
          >
            Cancelar
          </button>
        </div>
      ) : (
        !otherActive && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar sección"
            className="flex size-7 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Pencil className="size-3.5" />
          </button>
        )
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function CompanyProfile({
  initialProfile,
  tipo = 'empresa',
  initialAreas = [],
}: {
  initialProfile: ApiMeProfile | null;
  tipo?: 'empresa' | 'emprendedor';
  initialAreas?: CatalogArea[];
}) {
  const t = useTranslations('mi_empresa');
  const tStage = useTranslations('register.emprendedor.step2');
  const tTechSupport = useTranslations('register.emprendedor.step3');
  const tBudget = useTranslations('register.emprendedor.step4');
  const tPT = useTranslations('register.empresa.step5');

  const catalogAreas = initialAreas;

  // Per-section editing: which section is open + snapshot to revert on cancel
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<CompanyData | null>(null);

  const [company, setCompany] = useState<CompanyData>(() => buildInitialData(initialProfile));
  const [newValueInput, setNewValueInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', role: '', email: '' });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const websiteError = fieldErrors['website'] ?? null;
  const [isSaving, startSaveTransition] = useTransition();

  function startEditing(section: string) {
    setEditingSection(section);
    setSnapshot(company);
    setSaveStatus('idle');
    setSaveError(null);
    setFieldErrors({});
  }

  function cancelEditing() {
    if (snapshot) setCompany(snapshot);
    setEditingSection(null);
    setSnapshot(null);
    setFieldErrors({});
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    const isUrl = (v: string) => /^https?:\/\/.+/.test(v);
    if (company.website && !isUrl(company.website)) errors['website'] = t('validation.url_invalid');
    if (tipo === 'empresa') {
      if (company.comercialName && company.comercialName.length > 255) errors['comercialName'] = t('validation.max_255');
      if (company.description && company.description.length > 400) errors['description'] = t('validation.max_400');
      if (company.mission && company.mission.length > 1000) errors['mission'] = t('validation.max_1000');
      if (company.vision && company.vision.length > 1000) errors['vision'] = t('validation.max_1000');
      if (company.culture && company.culture.length > 1000) errors['culture'] = t('validation.max_1000');
    } else {
      if (company.name && company.name.length > 255) errors['name'] = t('validation.max_255');
      if (company.projectDescription && company.projectDescription.length > 400) errors['projectDescription'] = t('validation.max_400');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function saveSection() {
    if (!validate()) return;
    setSaveStatus('idle');
    setSaveError(null);
    startSaveTransition(async () => {
      const direccion = JSON.stringify({ provincia: company.provincia, canton: company.canton });
      const contactosPayload = company.contacts.map(({ name, role, email }) => ({ name, role, email }));
      const payload = tipo === 'empresa'
        ? {
            ...(company.comercialName && { nombre_comercial: company.comercialName }),
            ...(company.sectors.length > 0 && { sector: company.sectors }),
            ...(company.description && { descripcion: company.description }),
            url_sitio_web: company.website,
            direccion,
            ...(company.projectTypes.length > 0 && { tipos_proyecto: company.projectTypes }),
            mision: company.mission,
            vision: company.vision,
            cultura: company.culture,
            valores: company.values,
            contactos: contactosPayload,
            cantidad_empleados: company.empleados,
            modalidades: company.modalities,
            horario: company.scheduleType,
          }
        : {
            ...(company.name && { nombre_comercial: company.name }),
            ...(company.projectDescription && { descripcion: company.projectDescription }),
            url_sitio_web: company.website,
            direccion,
            etapa: company.stage,
            ...(company.neededSupport.length > 0 && { soporte_tecnico: company.neededSupport }),
            presupuesto: company.budget,
            contactos: contactosPayload,
          };

      const result = await updateEmpresarioProfile(payload);
      if (result.ok) {
        setSaveStatus('success');
        setEditingSection(null);
        setSnapshot(null);
        setFieldErrors({});
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setSaveError(result.error);
      }
    });
  }

  function handleToggleNeededSupport(ts: TechSupport) {
    setCompany((prev) => ({
      ...prev,
      neededSupport: prev.neededSupport.includes(ts)
        ? prev.neededSupport.filter((s) => s !== ts)
        : [...prev.neededSupport, ts],
    }));
  }

  function handleProvinciaChange(provincia: string) {
    const cantons = CR_CANTONS[provincia] ?? [];
    setCompany((prev) => ({ ...prev, provincia, canton: cantons[0] ?? '' }));
  }

  function handleToggleProjectType(pt: ProjectType) {
    setCompany((prev) => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(pt)
        ? prev.projectTypes.filter((p) => p !== pt)
        : [...prev.projectTypes, pt],
    }));
  }

  function handleToggleModality(m: string) {
    setCompany((prev) => ({
      ...prev,
      modalities: prev.modalities.includes(m)
        ? prev.modalities.filter((mod) => mod !== m)
        : [...prev.modalities, m],
    }));
  }

  function handleToggleSchedule() {
    setCompany((prev) => ({
      ...prev,
      scheduleType: prev.scheduleType === 'flexible' ? 'fixed' : 'flexible',
    }));
  }

  function handleAddValue(e: React.SyntheticEvent) {
    e.preventDefault();
    const trimmed = newValueInput.trim();
    if (trimmed && !company.values.includes(trimmed)) {
      setCompany((prev) => ({ ...prev, values: [...prev.values, trimmed] }));
      setNewValueInput('');
    }
  }

  function handleRemoveValue(indexToRemove: number) {
    setCompany((prev) => ({ ...prev, values: prev.values.filter((_, idx) => idx !== indexToRemove) }));
  }

  function handleOpenAddContact() {
    setEditingContactIndex(null);
    setContactForm({ name: '', role: '', email: '' });
    setIsModalOpen(true);
  }

  function handleOpenEditContact(index: number) {
    const contact = company.contacts[index];
    if (contact) {
      setEditingContactIndex(index);
      setContactForm({ name: contact.name, role: contact.role, email: contact.email });
      setIsModalOpen(true);
    }
  }

  function handleSaveContact(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.role.trim() || !contactForm.email.trim()) return;
    const initial = contactForm.name.trim().split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    const updatedContact: Contact = {
      name: contactForm.name.trim(), role: contactForm.role.trim(),
      email: contactForm.email.trim(), initial: initial || 'C',
    };
    setCompany((prev) => {
      const nextContacts = [...prev.contacts];
      if (editingContactIndex !== null) {
        nextContacts[editingContactIndex] = updatedContact;
      } else {
        nextContacts.push(updatedContact);
      }
      return { ...prev, contacts: nextContacts };
    });
    setIsModalOpen(false);
  }

  function handleDeleteContact() {
    if (editingContactIndex !== null) {
      setCompany((prev) => ({
        ...prev,
        contacts: prev.contacts.filter((_, idx) => idx !== editingContactIndex),
      }));
      setIsModalOpen(false);
    }
  }

  const isEditing = (section: string) => editingSection === section;

  return (
    <div className="bg-canvas">
      {/* Save feedback banner */}
      {saveStatus !== 'idle' && (
        <div className={cn(
          'px-4 py-2 text-center text-xs font-medium',
          saveStatus === 'success' && 'bg-accent/10 text-accent',
          saveStatus === 'error' && 'bg-magenta/10 text-magenta',
        )}>
          <span className="inline-flex items-center gap-1.5">
            {saveStatus === 'success' ? (
              <><CheckCircle2 className="size-3.5" /> {t('hero.save_success')}</>
            ) : (
              <><AlertCircle className="size-3.5" /> {saveError ?? t('hero.save_error')}</>
            )}
          </span>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Left: main sections */}
          <div className="space-y-8 lg:col-span-2">

            {/* ── EMPRENDEDOR: Información General ─────────────────────────────── */}
            {tipo === 'emprendedor' && (
              <>
                <section className="space-y-4">
                  <SectionHeader
                    icon={<Building2 className="size-6 text-primary" />}
                    title={t('sections.general')}
                    sectionId="general"
                    editingSection={editingSection}
                    isSaving={isSaving}
                    onEdit={() => startEditing('general')}
                    onSave={saveSection}
                    onCancel={cancelEditing}
                  />
                  <Card className="space-y-5 border-border bg-surface p-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.project_name')}</label>
                        {isEditing('general') ? (
                          <input type="text" value={company.name}
                            onChange={(e) => setCompany({ ...company, name: e.target.value })}
                            className="w-full border-b border-border bg-transparent py-1 text-sm font-medium text-ink focus:border-primary focus:outline-none"
                          />
                        ) : (
                          <p className="text-sm font-medium text-ink">{company.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.website')}</label>
                        {isEditing('general') ? (
                          <div>
                            <input type="text" value={company.website} placeholder="https://tuproyecto.com"
                              onChange={(e) => {
                                const val = e.target.value;
                                setCompany({ ...company, website: val });
                                setFieldErrors((prev) => {
                                  const next = { ...prev };
                                  if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                                    next['website'] = t('validation.url_invalid');
                                  } else {
                                    delete next['website'];
                                  }
                                  return next;
                                });
                              }}
                              className="w-full border-b border-border bg-transparent py-1 text-sm font-medium text-ink placeholder-ink-muted/50 focus:border-primary focus:outline-none"
                            />
                            {websiteError && <p className="mt-1 flex items-center gap-1 text-[11px] text-magenta"><AlertCircle className="size-3 shrink-0" />{websiteError}</p>}
                          </div>
                        ) : (
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-start gap-1 text-sm font-medium text-primary hover:underline">
                            <Globe className="mt-0.5 size-4 shrink-0" /><span className="break-all">{company.website}</span>
                          </a>
                        )}
                      </div>
                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.country')}</label>
                        <p className="text-sm font-medium text-ink">Costa Rica</p>
                      </div>
                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.provincia')}</label>
                        {isEditing('general') ? (
                          <select value={company.provincia} onChange={(e) => handleProvinciaChange(e.target.value)}
                            className="w-full border-b border-border bg-transparent py-1 text-sm font-medium text-ink focus:border-primary focus:outline-none">
                            {CR_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        ) : <p className="text-sm font-medium text-ink">{company.provincia}</p>}
                      </div>
                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.canton')}</label>
                        {isEditing('general') ? (
                          <select value={company.canton} onChange={(e) => setCompany({ ...company, canton: e.target.value })}
                            className="w-full border-b border-border bg-transparent py-1 text-sm font-medium text-ink focus:border-primary focus:outline-none">
                            {(CR_CANTONS[company.provincia] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : <p className="text-sm font-medium text-ink">{company.canton}</p>}
                      </div>
                    </div>
                  </Card>
                </section>

                <section className="space-y-4">
                  <SectionHeader
                    icon={<Target className="size-6 text-primary" />}
                    title={t('sections.project_description')}
                    sectionId="project_desc"
                    editingSection={editingSection}
                    isSaving={isSaving}
                    onEdit={() => startEditing('project_desc')}
                    onSave={saveSection}
                    onCancel={cancelEditing}
                  />
                  <Card className="border-border bg-surface p-5">
                    {isEditing('project_desc') ? (
                      <textarea
                        rows={6}
                        value={company.projectDescription}
                        onChange={(e) => setCompany({ ...company, projectDescription: e.target.value })}
                        placeholder={t('fields.project_description_placeholder')}
                        className="w-full resize-none rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm leading-relaxed text-ink focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm leading-relaxed text-ink">
                        {company.projectDescription || <span className="italic text-ink-muted/60">{t('fields.project_description_placeholder')}</span>}
                      </p>
                    )}
                  </Card>
                </section>
              </>
            )}

            {/* ── EMPRESA: Información General ──────────────────────────────────── */}
            {tipo === 'empresa' && (
              <>
                <section className="space-y-4">
                  <SectionHeader
                    icon={<Building2 className="size-6 text-primary" />}
                    title={t('sections.general')}
                    sectionId="general"
                    editingSection={editingSection}
                    isSaving={isSaving}
                    onEdit={() => startEditing('general')}
                    onSave={saveSection}
                    onCancel={cancelEditing}
                  />
                  <Card className="space-y-5 border-border bg-surface p-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.comercial_name')}</label>
                        {isEditing('general') ? (
                          <>
                            <input type="text" value={company.comercialName} placeholder={t('placeholders.company_name')}
                              onChange={(e) => setCompany({ ...company, comercialName: e.target.value, name: e.target.value })}
                              className="w-full border-b border-border bg-transparent py-1 text-sm font-medium text-ink placeholder-ink-muted/50 focus:border-primary focus:outline-none"
                            />
                            {fieldErrors['comercialName'] && <p className="mt-1 flex items-center gap-1 text-[11px] text-magenta"><AlertCircle className="size-3 shrink-0" />{fieldErrors['comercialName']}</p>}
                          </>
                        ) : (
                          <p className="text-sm font-medium text-ink">
                            {company.comercialName || <span className="italic text-ink-muted/60">{t('placeholders.company_name')}</span>}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.provincia')}</label>
                        {isEditing('general') ? (
                          <select value={company.provincia} onChange={(e) => handleProvinciaChange(e.target.value)}
                            className="w-full border-b border-border bg-transparent py-1 text-sm font-medium text-ink focus:border-primary focus:outline-none">
                            {CR_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        ) : <p className="text-sm font-medium text-ink">{company.provincia}</p>}
                      </div>

                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.employees')}</label>
                        {isEditing('general') ? (
                          <select value={company.empleados} onChange={(e) => setCompany({ ...company, empleados: e.target.value as EmployeeRange })}
                            className="w-full border-b border-border bg-transparent py-1 text-sm font-medium text-ink focus:border-primary focus:outline-none">
                            {EMPLOYEE_RANGES.map((r) => <option key={r} value={r}>{r} {t('fields.employees_unit')}</option>)}
                          </select>
                        ) : <p className="text-sm font-medium text-ink">{company.empleados} {t('fields.employees_unit')}</p>}
                      </div>

                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.canton')}</label>
                        {isEditing('general') ? (
                          <select value={company.canton} onChange={(e) => setCompany({ ...company, canton: e.target.value })}
                            className="w-full border-b border-border bg-transparent py-1 text-sm font-medium text-ink focus:border-primary focus:outline-none">
                            {(CR_CANTONS[company.provincia] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : <p className="text-sm font-medium text-ink">{company.canton}</p>}
                      </div>

                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.country')}</label>
                        <p className="text-sm font-medium text-ink">Costa Rica</p>
                      </div>

                      <div>
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.website')}</label>
                        {isEditing('general') ? (
                          <div>
                            <input type="text" value={company.website} placeholder="https://tuempresa.com"
                              onChange={(e) => {
                                const val = e.target.value;
                                setCompany({ ...company, website: val });
                                setFieldErrors((prev) => {
                                  const next = { ...prev };
                                  if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                                    next['website'] = t('validation.url_invalid');
                                  } else {
                                    delete next['website'];
                                  }
                                  return next;
                                });
                              }}
                              className="w-full border-b border-border bg-transparent py-1 text-sm font-medium text-ink placeholder-ink-muted/50 focus:border-primary focus:outline-none"
                            />
                            {websiteError && <p className="mt-1 flex items-center gap-1 text-[11px] text-magenta"><AlertCircle className="size-3 shrink-0" />{websiteError}</p>}
                          </div>
                        ) : (
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-start gap-1 text-sm font-medium text-primary hover:underline">
                            <Globe className="mt-0.5 size-4 shrink-0" /><span className="break-all">{company.website}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.description')}</label>
                      {isEditing('general') ? (
                        <>
                          <textarea rows={3} value={company.description} placeholder={t('placeholders.description')}
                            onChange={(e) => setCompany({ ...company, description: e.target.value })}
                            className="mt-1 w-full resize-none rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm leading-relaxed text-ink placeholder-ink-muted/50 focus:border-primary focus:outline-none"
                          />
                          <p className="mt-1 text-right text-[11px] text-ink-muted/60">{company.description.length}/400</p>
                          {fieldErrors['description'] && <p className="flex items-center gap-1 text-[11px] text-magenta"><AlertCircle className="size-3 shrink-0" />{fieldErrors['description']}</p>}
                        </>
                      ) : (
                        <p className="mt-1 text-sm leading-relaxed text-ink">
                          {company.description || <span className="italic text-ink-muted/60">{t('placeholders.description')}</span>}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="mb-3 font-body text-xs font-bold tracking-wide text-ink-muted">{t('sections.business_areas')}</p>
                      {catalogAreas.length === 0 ? (
                        <p className="text-xs text-ink-muted/60">{t('placeholders.loading_areas')}</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {catalogAreas.map((area) => {
                            const isSelected = company.sectors.includes(area.nombre);
                            return (
                              <button key={area.id} type="button" disabled={!isEditing('general')}
                                onClick={() => setCompany((prev) => ({
                                  ...prev,
                                  sectors: isSelected ? prev.sectors.filter((x) => x !== area.nombre) : [...prev.sectors, area.nombre],
                                }))}
                                className={cn(
                                  'rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:cursor-default',
                                  isSelected ? 'border-secondary bg-secondary text-white' : 'border-border bg-canvas text-ink-muted',
                                  isEditing('general') && !isSelected && 'hover:border-border-strong hover:text-ink',
                                )}
                              >
                                {area.nombre}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Card>
                </section>

                {/* Identidad y Cultura */}
                <section className="space-y-4">
                  <SectionHeader
                    icon={<Target className="size-6 text-primary" />}
                    title={t('sections.culture')}
                    sectionId="culture"
                    editingSection={editingSection}
                    isSaving={isSaving}
                    onEdit={() => startEditing('culture')}
                    onSave={saveSection}
                    onCancel={cancelEditing}
                  />
                  <Card className="space-y-5 border-border bg-surface p-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h3 className="font-body text-base font-bold tracking-wide text-secondary">{t('fields.mission')}</h3>
                        {isEditing('culture') ? (
                          <>
                            <textarea rows={4} value={company.mission} placeholder={t('placeholders.mission')}
                              onChange={(e) => setCompany({ ...company, mission: e.target.value })}
                              className="w-full resize-none rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm leading-relaxed text-ink placeholder-ink-muted/50 focus:border-primary focus:outline-none"
                            />
                            <p className="text-right text-[11px] text-ink-muted/60">{company.mission.length}/1000</p>
                          </>
                        ) : (
                          <p className="text-sm leading-relaxed text-ink">
                            {company.mission || <span className="italic text-ink-muted/60">{t('placeholders.mission')}</span>}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-body text-base font-bold tracking-wide text-secondary">{t('fields.vision')}</h3>
                        {isEditing('culture') ? (
                          <>
                            <textarea rows={4} value={company.vision} placeholder={t('placeholders.vision')}
                              onChange={(e) => setCompany({ ...company, vision: e.target.value })}
                              className="w-full resize-none rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm leading-relaxed text-ink placeholder-ink-muted/50 focus:border-primary focus:outline-none"
                            />
                            <p className="text-right text-[11px] text-ink-muted/60">{company.vision.length}/1000</p>
                          </>
                        ) : (
                          <p className="text-sm leading-relaxed text-ink">
                            {company.vision || <span className="italic text-ink-muted/60">{t('placeholders.vision')}</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-border pt-4">
                      <h3 className="font-body text-base font-bold tracking-wide text-secondary">{t('fields.organization')}</h3>
                      {isEditing('culture') ? (
                        <>
                          <textarea rows={3} value={company.culture} placeholder={t('placeholders.culture')}
                            onChange={(e) => setCompany({ ...company, culture: e.target.value })}
                            className="w-full resize-none rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm leading-relaxed text-ink placeholder-ink-muted/50 focus:border-primary focus:outline-none"
                          />
                          <p className="text-right text-[11px] text-ink-muted/60">{company.culture.length}/1000</p>
                        </>
                      ) : (
                        <p className="text-sm leading-relaxed text-ink">
                          {company.culture || <span className="italic text-ink-muted/60">{t('placeholders.culture')}</span>}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 border-t border-border pt-4">
                      <h3 className="font-body text-base font-bold tracking-wide text-secondary">{t('fields.values')}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {company.values.map((v, idx) => (
                          <Badge key={v} variant="secondary"
                            className={cn('flex items-center gap-1 border-secondary/10 bg-secondary/5 px-4 py-1 text-secondary',
                              isEditing('culture') && 'cursor-pointer hover:bg-magenta/10 hover:text-magenta')}
                            onClick={() => isEditing('culture') && handleRemoveValue(idx)}
                          >
                            {v}
                            {isEditing('culture') && <X className="size-3" />}
                          </Badge>
                        ))}
                        {company.values.length === 0 && !isEditing('culture') && (
                          <>
                            {[t('placeholders.values_example_1'), t('placeholders.values_example_2'), t('placeholders.values_example_3')].map((v) => (
                              <Badge key={v} variant="secondary" className="border border-dashed border-secondary/25 bg-transparent px-4 py-1 italic text-secondary/40">{v}</Badge>
                            ))}
                            <p className="w-full text-xs italic text-ink-muted/60">{t('placeholders.values_hint')}</p>
                          </>
                        )}
                        {isEditing('culture') && (
                          <form onSubmit={handleAddValue} className="inline-flex items-center">
                            <input type="text" placeholder={t('culture.add_value_placeholder')}
                              value={newValueInput} onChange={(e) => setNewValueInput(e.target.value)}
                              className="w-32 rounded border border-border bg-surface-sunken px-2 py-1 text-xs text-ink focus:border-primary focus:outline-none"
                            />
                          </form>
                        )}
                      </div>
                    </div>
                  </Card>
                </section>
              </>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="space-y-8">

            {/* Empresa: Necesidades Actuales */}
            {tipo === 'empresa' && (
              <section className="space-y-4">
                <SectionHeader
                  icon={<ShieldCheck className="size-5 text-primary" />}
                  title={t('sections.needs')}
                  sectionId="needs"
                  editingSection={editingSection}
                  isSaving={isSaving}
                  onEdit={() => startEditing('needs')}
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
                <Card className="border-border bg-surface p-4">
                  <div className="flex flex-wrap gap-2">
                    {ALL_PROJECT_TYPES.map((pt) => {
                      const isSelected = company.projectTypes.includes(pt);
                      return (
                        <button key={pt} type="button" disabled={!isEditing('needs')}
                          onClick={() => handleToggleProjectType(pt)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:cursor-default',
                            isSelected ? 'border-primary bg-primary text-white' : 'border-border bg-canvas text-ink-muted',
                            isEditing('needs') && !isSelected && 'hover:border-border-strong hover:text-ink',
                          )}
                        >
                          {tPT(pt)}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </section>
            )}

            {/* Emprendedor: Etapa */}
            {tipo === 'emprendedor' && (
              <section className="space-y-4">
                <SectionHeader
                  icon={<Target className="size-5 text-accent" />}
                  title={t('sections.stage')}
                  sectionId="stage"
                  editingSection={editingSection}
                  isSaving={isSaving}
                  onEdit={() => startEditing('stage')}
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
                <div className="space-y-2">
                  {(['idea', 'mvp', 'validating', 'scaling'] as StartupStage[]).map((s) => {
                    const isSelected = company.stage === s;
                    return (
                      <button key={s} type="button" disabled={!isEditing('stage')}
                        onClick={() => setCompany((prev) => ({ ...prev, stage: s }))}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:cursor-default',
                          isSelected ? 'border-accent bg-accent/10' : 'border-border bg-surface',
                          isEditing('stage') && !isSelected && 'hover:border-border-strong hover:bg-surface-sunken',
                        )}
                      >
                        <span className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border-2', isSelected ? 'border-accent' : 'border-border-strong')}>
                          {isSelected && <span className="size-2 rounded-full bg-accent" />}
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className={cn('text-sm font-bold', isSelected ? 'text-accent' : 'text-ink-strong')}>{tStage(`${s}_label`)}</span>
                          <span className="text-[11px] text-ink-muted">{tStage(`${s}_description`)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Emprendedor: Apoyo Técnico */}
            {tipo === 'emprendedor' && (
              <section className="space-y-4">
                <SectionHeader
                  icon={<ShieldCheck className="size-5 text-primary" />}
                  title={t('sections.tech_support')}
                  sectionId="tech_support"
                  editingSection={editingSection}
                  isSaving={isSaving}
                  onEdit={() => startEditing('tech_support')}
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
                <Card className="border-border bg-surface p-5">
                  <div className="flex flex-wrap gap-2">
                    {(['web', 'mobile', 'backend', 'ai', 'ux', 'data', 'automation', 'other'] as TechSupport[]).map((ts) => {
                      const isSelected = company.neededSupport.includes(ts);
                      return (
                        <button key={ts} type="button" disabled={!isEditing('tech_support')}
                          onClick={() => handleToggleNeededSupport(ts)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:cursor-default',
                            isSelected ? 'border-primary bg-primary text-white' : 'border-border bg-canvas text-ink-muted',
                            isEditing('tech_support') && !isSelected && 'hover:border-border-strong hover:text-ink',
                          )}
                        >
                          {tTechSupport(ts)}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </section>
            )}

            {/* Emprendedor: Presupuesto */}
            {tipo === 'emprendedor' && (
              <section className="space-y-4">
                <SectionHeader
                  icon={<Target className="size-5 text-highlight" />}
                  title={t('sections.budget')}
                  sectionId="budget"
                  editingSection={editingSection}
                  isSaving={isSaving}
                  onEdit={() => startEditing('budget')}
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
                <div className="space-y-2">
                  {(['under_500', 'range_500_1000', 'range_1000_2500', 'flexible'] as BudgetRange[]).map((b) => {
                    const isSelected = company.budget === b;
                    return (
                      <button key={b} type="button" disabled={!isEditing('budget')}
                        onClick={() => setCompany((prev) => ({ ...prev, budget: b }))}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:cursor-default',
                          isSelected ? 'border-highlight bg-highlight/10 font-bold text-secondary' : 'border-border bg-surface text-ink-muted',
                          isEditing('budget') && !isSelected && 'hover:border-border-strong hover:text-ink',
                        )}
                      >
                        {tBudget(b)}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Modalidades y Horarios */}
            <section className="space-y-4">
              <SectionHeader
                icon={<Clock className="size-5 text-warning" />}
                title={t('sections.modalities')}
                sectionId="modalities"
                editingSection={editingSection}
                isSaving={isSaving}
                onEdit={() => startEditing('modalities')}
                onSave={saveSection}
                onCancel={cancelEditing}
              />
              <div className="grid grid-cols-2 gap-3">
                {(['remote', 'hybrid', 'onsite', 'nomad'] as const).map((m) => {
                  const isActive = company.modalities.includes(m);
                  return (
                    <div key={m}
                      onClick={() => isEditing('modalities') && handleToggleModality(m)}
                      className={cn(
                        'select-none rounded-xl border p-3 text-center text-[10px] font-bold uppercase tracking-tighter transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                        isActive ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface text-ink-muted',
                        isEditing('modalities') ? 'cursor-pointer' : 'cursor-default',
                        isEditing('modalities') && !isActive && 'hover:border-ink-muted/55',
                      )}
                    >
                      {t(`modalities.${m}`)}
                    </div>
                  );
                })}
              </div>
              <Card
                onClick={() => isEditing('modalities') && handleToggleSchedule()}
                className={cn(
                  'flex select-none items-center gap-3 border-border bg-surface-sunken p-4 transition-colors',
                  isEditing('modalities') ? 'cursor-pointer hover:bg-surface' : 'cursor-default',
                )}
              >
                <Clock className="size-5 text-warning" />
                <div>
                  <p className="text-xs font-bold text-ink-strong">
                    {company.scheduleType === 'flexible' ? t('schedules.flexible') : t('schedules.fixed')}
                  </p>
                  <p className="text-[10px] text-ink-muted">{t('schedules.timezone')}</p>
                </div>
              </Card>
            </section>

            {/* Contactos */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold tracking-tight text-ink-strong">{t('sections.contacts')}</h2>
                <button type="button"
                  onClick={handleOpenAddContact}
                  className="flex items-center gap-1 rounded-full border border-primary/20 px-3 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  <Plus className="size-3.5" /> {t('contacts.add_btn')}
                </button>
              </div>
              <div className="space-y-3">
                {company.contacts.map((contact, i) => (
                  <Card key={i} onClick={() => handleOpenEditContact(i)}
                    className="flex cursor-pointer items-center gap-4 border-border bg-surface p-4 transition-shadow hover:shadow-[var(--shadow-soft)]"
                  >
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-secondary font-bold text-white">{contact.initial}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-strong">{contact.name}</p>
                      <p className="truncate text-[10px] tracking-wide text-ink-muted">{contact.role}</p>
                      <p className="truncate text-[10px] text-primary underline">{contact.email}</p>
                    </div>
                  </Card>
                ))}
                {company.contacts.length === 0 && (
                  <>
                    <Card className="flex items-center gap-4 border border-dashed border-border bg-surface/50 p-4 opacity-50">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-secondary/20 font-bold text-secondary/50">AR</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold italic text-ink-muted/70">{t('placeholders.contact_example_name')}</p>
                        <p className="truncate text-[10px] tracking-wide text-ink-muted/60">{t('placeholders.contact_example_role')}</p>
                        <p className="truncate text-[10px] italic text-primary/50">{t('placeholders.contact_example_email')}</p>
                      </div>
                    </Card>
                    <p className="text-xs italic text-ink-muted/60">{t('placeholders.contact_hint')}</p>
                  </>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Contact modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/50 p-4 backdrop-blur-xs">
          <Card className="relative w-full max-w-md space-y-6 border-border bg-surface p-4 shadow-[var(--shadow-elevated)]">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-ink-muted transition-colors hover:text-ink">
              <X className="size-5" />
            </button>
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold tracking-tight text-ink-strong">
                {editingContactIndex !== null ? t('contacts.edit_title') : t('contacts.add_title')}
              </h3>
              <p className="text-xs text-ink-muted">{t('contacts.subtitle')}</p>
            </div>
            <form onSubmit={handleSaveContact} className="space-y-4">
              <div className="space-y-1">
                <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('contacts.name_label')}</label>
                <input type="text" required value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink-strong focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('contacts.role_label')}</label>
                <input type="text" required value={contactForm.role}
                  onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink-strong focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('contacts.email_label')}</label>
                <input type="email" required value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink-strong focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex gap-3 border-t border-border pt-4">
                {editingContactIndex !== null && (
                  <Button type="button" variant="ghost" onClick={handleDeleteContact}
                    className="gap-1 border border-transparent font-bold text-magenta hover:border-magenta/20 hover:bg-magenta/5"
                  >
                    <Trash2 className="size-4" /> {t('contacts.delete_btn')}
                  </Button>
                )}
                <div className="flex-1" />
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-border text-ink-strong">
                  {t('contacts.cancel_btn')}
                </Button>
                <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
                  {t('contacts.save_btn')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
