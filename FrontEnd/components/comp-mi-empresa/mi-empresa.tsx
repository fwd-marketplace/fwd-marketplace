'use client';

import { useState, useTransition, useRef, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import {
  Edit2,
  Globe,
  MapPin,
  Building2,
  Users,
  Target,
  Clock,
  ShieldCheck,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FwdGeoBackdrop } from '@/components/ui/fwd-geo-backdrop';
import { cn } from '@/lib/utils';
import type { ApiMeProfile } from '@/lib/api/types';
import { updateEmpresarioProfile, uploadEmpresarioLogo } from '@/lib/actions/perfil';

type ProjectType =
  | 'web'
  | 'mobile'
  | 'ai'
  | 'automation'
  | 'dashboards'
  | 'integrations'
  | 'ux'
  | 'data'
  | 'other';

type StartupStage = 'idea' | 'mvp' | 'validating' | 'scaling';

type TechSupport =
  | 'web'
  | 'mobile'
  | 'backend'
  | 'ai'
  | 'ux'
  | 'data'
  | 'automation'
  | 'other';

type BudgetRange = 'under_500' | 'range_500_1000' | 'range_1000_2500' | 'flexible';

const ALL_PROJECT_TYPES: ProjectType[] = [
  'web',
  'mobile',
  'ai',
  'automation',
  'dashboards',
  'integrations',
  'ux',
  'data',
  'other',
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

type Sector =
  | 'tech'
  | 'fintech'
  | 'health'
  | 'logistics'
  | 'education'
  | 'energy'
  | 'retail'
  | 'manufacturing'
  | 'consulting'
  | 'other';

type CompanyData = {
  // compartido
  name: string;
  description: string;
  comercialName: string;
  website: string;
  provincia: string;
  canton: string;
  logoUrl: string | null;
  modalities: string[];
  scheduleType: 'flexible' | 'fixed';
  contacts: Contact[];
  // empresa
  empleados: EmployeeRange;
  sector: string;
  sectors: Sector[];
  mission: string;
  vision: string;
  values: string[];
  culture: string;
  projectTypes: ProjectType[];
  // emprendedor
  stage: StartupStage;
  neededSupport: TechSupport[];
  budget: BudgetRange;
  projectDescription: string;
};

const MOCK_DATA: CompanyData = {
  name: 'Global Tech Solutions',
  description: 'Líderes en transformación digital y manufactura inteligente para la región centroamericana.',
  comercialName: 'Global Tech Solutions S.A.',
  website: 'www.globaltechsolutions.cr',
  provincia: 'San José',
  canton: 'Escazú',
  logoUrl: null,
  modalities: ['remote', 'hybrid'],
  scheduleType: 'flexible',
  contacts: [
    { name: 'Andrea Villalobos', role: 'Talent Acquisition Manager', email: 'a.villalobos@gt.com', initial: 'AV' },
    { name: 'Roberto Méndez', role: 'Technical Recruiter', email: 'r.mendez@gt.com', initial: 'RM' },
  ],
  // empresa
  empleados: '51-200',
  sector: 'Tecnología e Industria 4.0',
  sectors: ['tech', 'manufacturing'],
  mission: 'Acelerar la competitividad industrial a través de soluciones de software de alta precisión.',
  vision: 'Ser el socio tecnológico preferido para el sector productivo de Latam en 2030.',
  values: ['Integridad', 'Innovación Disruptiva', 'Excelencia en la ejecución'],
  culture:
    'Fomentamos un ambiente de aprendizaje continuo donde la curiosidad tecnológica es premiada. Creemos en la autonomía, el trabajo por objetivos y el balance vida-trabajo genuino.',
  projectTypes: ['web', 'ai', 'dashboards'],
  // emprendedor
  stage: 'mvp',
  neededSupport: ['web', 'ux'],
  budget: 'range_500_1000',
  projectDescription: '',
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
    // fallback: "Canton, Provincia" format
    const parts = direccion.split(', ');
    return {
      canton: parts[0] ?? MOCK_DATA.canton,
      provincia: parts[1] ?? MOCK_DATA.provincia,
    };
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

function parseSector(raw: string | null | undefined): string {
  if (!raw) return MOCK_DATA.sector;
  try {
    const parsed = JSON.parse(raw) as string[];
    return parsed[0] ?? MOCK_DATA.sector;
  } catch {
    return raw;
  }
}

function buildInitialData(profile: ApiMeProfile | null): CompanyData {
  const emp = profile?.empresario;
  const { provincia, canton } = parseLocation(emp?.direccion);

  const projectTypes = parseJsonArray<ProjectType>(emp?.tipos_proyecto, MOCK_DATA.projectTypes);
  const neededSupport = parseJsonArray<TechSupport>(emp?.apoyo_tecnico_necesario, MOCK_DATA.neededSupport);

  return {
    ...MOCK_DATA,
    name: emp?.nombre_comercial ?? MOCK_DATA.name,
    description: emp?.descripcion ?? MOCK_DATA.description,
    comercialName: emp?.nombre_comercial ?? MOCK_DATA.comercialName,
    website: emp?.url_sitio_web ?? MOCK_DATA.website,
    sector: parseSector(emp?.sector),
    logoUrl: emp?.url_logo ?? null,
    provincia,
    canton,
    projectTypes,
    stage: (emp?.etapa as StartupStage | null) ?? MOCK_DATA.stage,
    neededSupport,
    budget: (emp?.presupuesto as BudgetRange | null) ?? MOCK_DATA.budget,
    projectDescription: emp?.descripcion ?? MOCK_DATA.projectDescription,
  };
}

export function CompanyProfile({
  initialProfile,
  tipo = 'empresa',
}: {
  initialProfile: ApiMeProfile | null;
  tipo?: 'empresa' | 'emprendedor';
}) {
  const t = useTranslations('mi_empresa');
  const tSector = useTranslations('mi_empresa.sector_labels');
  const tStage = useTranslations('register.emprendedor.step2');
  const tTechSupport = useTranslations('register.emprendedor.step3');
  const tBudget = useTranslations('register.emprendedor.step4');
  const tDash = useTranslations('empresa_dashboard');
  const tPT = useTranslations('register.empresa.step5');

  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState<CompanyData>(() => buildInitialData(initialProfile));
  const [newValueInput, setNewValueInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', role: '', email: '' });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const MAX_LOGO_BYTES = 5 * 1024 * 1024;

  function handleRemoveValue(indexToRemove: number) {
    setCompany((prev) => ({
      ...prev,
      values: prev.values.filter((_, idx) => idx !== indexToRemove),
    }));
  }

  function handleAddValue(e: FormEvent) {
    e.preventDefault();
    const trimmed = newValueInput.trim();
    if (trimmed && !company.values.includes(trimmed)) {
      setCompany((prev) => ({ ...prev, values: [...prev.values, trimmed] }));
      setNewValueInput('');
    }
  }

  function handleSave() {
    setSaveStatus('idle');
    setSaveError(null);
    startSaveTransition(async () => {
      const direccion = JSON.stringify({ provincia: company.provincia, canton: company.canton });
      const payload = tipo === 'empresa'
        ? {
            nombre_comercial: company.comercialName,
            sector: [company.sector],
            descripcion: company.description,
            url_sitio_web: company.website,
            direccion,
            tipos_proyecto: company.projectTypes,
          }
        : {
            nombre_comercial: company.name,
            descripcion: company.projectDescription,
            url_sitio_web: company.website,
            direccion,
            etapa: company.stage,
            soporte_tecnico: company.neededSupport,
            presupuesto: company.budget,
          };

      const result = await updateEmpresarioProfile(payload);
      if (result.ok) {
        setSaveStatus('success');
        setIsEditing(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setSaveError(result.error);
      }
    });
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (logoInputRef.current) logoInputRef.current.value = '';
    if (!file) return;
    setLogoError(null);
    if (!file.type.startsWith('image/')) {
      setLogoError(t('logo.invalid_type'));
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError(t('logo.too_large'));
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setIsUploadingLogo(true);
    const result = await uploadEmpresarioLogo(formData);
    setIsUploadingLogo(false);
    if (!result.ok) {
      setLogoError(result.error);
      return;
    }
    setCompany((prev) => ({ ...prev, logoUrl: result.data.url_logo }));
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

  function handleSaveContact(e: FormEvent) {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.role.trim() || !contactForm.email.trim()) return;
    const initial = contactForm.name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    const updatedContact: Contact = {
      name: contactForm.name.trim(),
      role: contactForm.role.trim(),
      email: contactForm.email.trim(),
      initial: initial || 'C',
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

  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero */}
      <div className="relative overflow-hidden bg-secondary px-6 pb-16 pt-10">
        <FwdGeoBackdrop />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 md:flex-row md:items-center">
          {/* Logo con upload */}
          <div className="shrink-0 space-y-1">
            <div className="relative">
              <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-secondary-foreground/10 shadow-[var(--shadow-elevated)]">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={t('logo.alt')} className="size-full object-cover" />
                ) : (
                  <Building2 className="size-14 text-highlight" />
                )}
              </div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                aria-label={t('logo.change')}
                className="absolute -bottom-2 -right-2 flex size-9 cursor-pointer items-center justify-center rounded-full bg-highlight text-secondary shadow-soft transition-opacity duration-[var(--duration-fast)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingLogo ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
            {logoError && (
              <p className="flex max-w-24 items-center gap-1 text-[10px] font-medium text-highlight">
                <AlertCircle className="size-3 shrink-0" /> {logoError}
              </p>
            )}
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <Badge className="border-none bg-highlight font-bold text-secondary">
                {t(`badge.${tipo}`).toUpperCase()}
              </Badge>
              {isEditing ? (
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  aria-label={t('fields.company_name')}
                  className="w-full border-b-2 border-white/40 bg-transparent font-heading text-4xl font-extrabold tracking-tight text-white placeholder-white/40 focus:border-highlight focus:outline-none md:text-5xl"
                />
              ) : (
                <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  {company.name}<span className="text-primary">.</span>
                </h1>
              )}
            </div>
            <p className="max-w-2xl text-lg leading-relaxed text-white/80">{company.description}</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60 md:justify-start">
              {isEditing ? (
                <>
                  <span className="flex flex-wrap items-center gap-1">
                    <MapPin className="size-4 shrink-0" />
                    <select
                      value={company.provincia}
                      onChange={(e) => handleProvinciaChange(e.target.value)}
                      aria-label={t('fields.provincia')}
                      className="border-b border-white/30 bg-transparent text-sm text-white/80 focus:border-highlight focus:outline-none"
                    >
                      {CR_PROVINCES.map((p) => (
                        <option key={p} value={p} className="bg-secondary text-white">{p}</option>
                      ))}
                    </select>
                    <span className="text-white/40">/</span>
                    <select
                      value={company.canton}
                      onChange={(e) => setCompany({ ...company, canton: e.target.value })}
                      aria-label={t('fields.canton')}
                      className="border-b border-white/30 bg-transparent text-sm text-white/80 focus:border-highlight focus:outline-none"
                    >
                      {(CR_CANTONS[company.provincia] ?? []).map((c) => (
                        <option key={c} value={c} className="bg-secondary text-white">{c}</option>
                      ))}
                    </select>
                  </span>
                  {tipo === 'empresa' && (
                    <span className="flex items-center gap-1">
                      <Users className="size-4 shrink-0" />
                      <select
                        value={company.empleados}
                        onChange={(e) => setCompany({ ...company, empleados: e.target.value as EmployeeRange })}
                        aria-label={t('fields.employees')}
                        className="border-b border-white/30 bg-transparent text-sm text-white/80 focus:border-highlight focus:outline-none"
                      >
                        {EMPLOYEE_RANGES.map((r) => (
                          <option key={r} value={r} className="bg-secondary text-white">{r}</option>
                        ))}
                      </select>
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {company.canton}, {company.provincia}, Costa Rica
                  </span>
                  {tipo === 'empresa' && (
                    <span className="flex items-center gap-1">
                      <Users className="size-4" /> {company.empleados} {t('fields.employees_unit')}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Save feedback banner */}
      {saveStatus !== 'idle' && (
        <div className={cn(
          'px-6 py-3 text-center text-sm font-medium transition-all duration-[var(--duration-base)]',
          saveStatus === 'success' && 'bg-accent/10 text-accent',
          saveStatus === 'error' && 'bg-magenta/10 text-magenta',
        )}>
          <span className="inline-flex items-center gap-2">
            {saveStatus === 'success' ? (
              <><CheckCircle2 className="size-4" /> {t('hero.save_success')}</>
            ) : (
              <><AlertCircle className="size-4" /> {saveError ?? t('hero.save_error')}</>
            )}
          </span>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

          {/* Left: main sections */}
          <div className="space-y-12 lg:col-span-2">
            {tipo === 'emprendedor' && (
              <>
                {/* Información General — Emprendedor */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="flex items-center gap-3 font-heading text-2xl font-extrabold uppercase tracking-tight text-ink-strong">
                      <Building2 className="size-6 text-primary" />
                      {t('sections.general')}<span className="text-primary">.</span>
                    </h2>
                    <div className="flex shrink-0 gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            size="sm"
                            className="gap-1.5 rounded-full bg-primary font-bold text-white hover:bg-primary/90 disabled:opacity-60"
                          >
                            {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                            {isSaving ? t('hero.saving') : t('hero.save')}
                          </Button>
                          <Button
                            onClick={() => { setIsEditing(false); setSaveStatus('idle'); setSaveError(null); }}
                            variant="outline"
                            size="sm"
                            disabled={isSaving}
                            className="rounded-full disabled:opacity-40"
                          >
                            {t('hero.cancel')}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => { setIsEditing(true); setSaveStatus('idle'); }}
                          variant="outline"
                          size="sm"
                          className="gap-1.5 rounded-full border-primary/30 text-primary hover:bg-primary/5"
                        >
                          <Edit2 className="size-3.5" />
                          {t('hero.edit_profile')}
                        </Button>
                      )}
                    </div>
                  </div>
                  <Card className="space-y-8 border-border bg-surface p-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                          {t('fields.project_name')}
                        </label>
                        {isEditing ? (
                          <input type="text" value={company.name}
                            onChange={(e) => setCompany({ ...company, name: e.target.value })}
                            className="w-full border-b border-border bg-transparent py-1 text-lg font-medium text-ink focus:border-primary focus:outline-none"
                          />
                        ) : (
                          <p className="text-lg font-medium text-ink">{company.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                          {t('fields.website')}
                        </label>
                        {isEditing ? (
                          <input type="text" value={company.website}
                            onChange={(e) => setCompany({ ...company, website: e.target.value })}
                            className="w-full border-b border-border bg-transparent py-1 text-lg font-medium text-ink focus:border-primary focus:outline-none"
                          />
                        ) : (
                          <p className="text-lg font-medium text-primary">
                            <Globe className="mr-1 inline size-4" />{company.website}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                          {t('fields.country')}
                        </label>
                        <p className="text-lg font-medium text-ink">Costa Rica</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                          {t('fields.provincia')}
                        </label>
                        {isEditing ? (
                          <select value={company.provincia} onChange={(e) => handleProvinciaChange(e.target.value)}
                            className="w-full border-b border-border bg-transparent py-1 text-lg font-medium text-ink focus:border-primary focus:outline-none"
                          >
                            {CR_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        ) : (
                          <p className="text-lg font-medium text-ink">{company.provincia}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                          {t('fields.canton')}
                        </label>
                        {isEditing ? (
                          <select value={company.canton} onChange={(e) => setCompany({ ...company, canton: e.target.value })}
                            className="w-full border-b border-border bg-transparent py-1 text-lg font-medium text-ink focus:border-primary focus:outline-none"
                          >
                            {(CR_CANTONS[company.provincia] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <p className="text-lg font-medium text-ink">{company.canton}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </section>

                {/* Acerca del Proyecto — Emprendedor */}
                <section className="space-y-6">
                  <h2 className="flex items-center gap-3 font-heading text-2xl font-extrabold uppercase tracking-tight text-ink-strong">
                    <Target className="size-6 text-primary" />
                    {t('sections.project_description')}<span className="text-primary">.</span>
                  </h2>
                  <Card className="border-border bg-surface p-8">
                    <textarea
                      rows={6}
                      value={company.projectDescription}
                      onChange={(e) => setCompany({ ...company, projectDescription: e.target.value })}
                      placeholder={t('fields.project_description_placeholder')}
                      className="w-full resize-none rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm leading-relaxed text-ink focus:border-primary focus:outline-none"
                    />
                  </Card>
                </section>
              </>
            )}

            {tipo === 'empresa' && (
            <>
            {/* Información General */}
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 font-heading text-2xl font-extrabold uppercase tracking-tight text-ink-strong">
                  <Building2 className="size-6 text-primary" />
                  {t('sections.general')}<span className="text-primary">.</span>
                </h2>
                <div className="flex shrink-0 gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="sm"
                        className="gap-1.5 rounded-full bg-primary font-bold text-white hover:bg-primary/90 disabled:opacity-60"
                      >
                        {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                        {isSaving ? t('hero.saving') : t('hero.save')}
                      </Button>
                      <Button
                        onClick={() => { setIsEditing(false); setSaveStatus('idle'); setSaveError(null); }}
                        variant="outline"
                        size="sm"
                        disabled={isSaving}
                        className="rounded-full disabled:opacity-40"
                      >
                        {t('hero.cancel')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => { setIsEditing(true); setSaveStatus('idle'); }}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-full border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <Edit2 className="size-3.5" />
                      {t('hero.edit_profile')}
                    </Button>
                  )}
                </div>
              </div>
              <Card className="space-y-8 border-border bg-surface p-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

                  {/* Nombre comercial */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                      {t('fields.comercial_name')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={company.comercialName}
                        onChange={(e) => setCompany({ ...company, comercialName: e.target.value })}
                        className="w-full border-b border-border bg-transparent py-1 text-lg font-medium text-ink focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <p className="text-lg font-medium text-ink">{company.comercialName}</p>
                    )}
                  </div>

                  {/* Sitio web */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                      {t('fields.website')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={company.website}
                        onChange={(e) => setCompany({ ...company, website: e.target.value })}
                        className="w-full border-b border-border bg-transparent py-1 text-lg font-medium text-ink focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <p className="text-lg font-medium text-primary">
                        <Globe className="mr-1 inline size-4" />{company.website}
                      </p>
                    )}
                  </div>

                  {/* País (fijo) */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                      {t('fields.country')}
                    </label>
                    <p className="text-lg font-medium text-ink">Costa Rica</p>
                  </div>

                  {/* Provincia */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                      {t('fields.provincia')}
                    </label>
                    {isEditing ? (
                      <select
                        value={company.provincia}
                        onChange={(e) => handleProvinciaChange(e.target.value)}
                        className="w-full border-b border-border bg-transparent py-1 text-lg font-medium text-ink focus:border-primary focus:outline-none"
                      >
                        {CR_PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-lg font-medium text-ink">{company.provincia}</p>
                    )}
                  </div>

                  {/* Cantón */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                      {t('fields.canton')}
                    </label>
                    {isEditing ? (
                      <select
                        value={company.canton}
                        onChange={(e) => setCompany({ ...company, canton: e.target.value })}
                        className="w-full border-b border-border bg-transparent py-1 text-lg font-medium text-ink focus:border-primary focus:outline-none"
                      >
                        {(CR_CANTONS[company.provincia] ?? []).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-lg font-medium text-ink">{company.canton}</p>
                    )}
                  </div>

                  {/* Número de empleados */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                      {t('fields.employees')}
                    </label>
                    {isEditing ? (
                      <select
                        value={company.empleados}
                        onChange={(e) => setCompany({ ...company, empleados: e.target.value as EmployeeRange })}
                        className="w-full border-b border-border bg-transparent py-1 text-lg font-medium text-ink focus:border-primary focus:outline-none"
                      >
                        {EMPLOYEE_RANGES.map((r) => (
                          <option key={r} value={r}>{r} {t('fields.employees_unit')}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-lg font-medium text-ink">
                        {company.empleados} {t('fields.employees_unit')}
                      </p>
                    )}
                  </div>

                  {/* Sector */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                      {t('fields.sector')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={company.sector}
                        onChange={(e) => setCompany({ ...company, sector: e.target.value })}
                        className="w-full border-b border-border bg-transparent py-1 text-lg font-medium text-ink focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <p className="text-lg font-medium text-ink">{company.sector}</p>
                    )}
                  </div>
                </div>

                {/* Áreas de negocio */}
                <div className="border-t border-border pt-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-subtle">
                    {t('sections.business_areas')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        'tech', 'fintech', 'health', 'logistics', 'education',
                        'energy', 'retail', 'manufacturing', 'consulting', 'other',
                      ] as Sector[]
                    ).map((s) => {
                      const isSelected = company.sectors.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setCompany((prev) => ({
                              ...prev,
                              sectors: isSelected
                                ? prev.sectors.filter((x) => x !== s)
                                : [...prev.sectors, s],
                            }))
                          }
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                            isSelected
                              ? 'border-secondary bg-secondary text-white'
                              : 'border-border bg-canvas text-ink-muted hover:border-border-strong hover:text-ink',
                          )}
                        >
                          {tSector(s)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </section>

            {/* Identidad y Cultura — siempre editable */}
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 font-heading text-2xl font-extrabold uppercase tracking-tight text-ink-strong">
                <Target className="size-6 text-primary" />
                {t('sections.culture')}<span className="text-primary">.</span>
              </h2>
              <Card className="space-y-8 border-border bg-surface p-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">{t('fields.mission')}</h3>
                    <textarea
                      rows={4}
                      value={company.mission}
                      onChange={(e) => setCompany({ ...company, mission: e.target.value })}
                      className="w-full resize-none rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm leading-relaxed text-ink focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">{t('fields.vision')}</h3>
                    <textarea
                      rows={4}
                      value={company.vision}
                      onChange={(e) => setCompany({ ...company, vision: e.target.value })}
                      className="w-full resize-none rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm leading-relaxed text-ink focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">{t('fields.organization')}</h3>
                  <textarea
                    rows={3}
                    value={company.culture}
                    onChange={(e) => setCompany({ ...company, culture: e.target.value })}
                    className="w-full resize-none rounded-lg border border-border bg-surface-sunken px-3 py-2 text-sm leading-relaxed text-ink focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">{t('fields.values')}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {company.values.map((v, idx) => (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="flex cursor-pointer items-center gap-1 border-secondary/10 bg-secondary/5 px-4 py-1 text-secondary hover:bg-magenta/10 hover:text-magenta"
                        onClick={() => handleRemoveValue(idx)}
                      >
                        {v}
                        <X className="size-3" />
                      </Badge>
                    ))}
                    <form onSubmit={handleAddValue} className="inline-flex items-center">
                      <input
                        type="text"
                        placeholder={t('culture.add_value_placeholder')}
                        value={newValueInput}
                        onChange={(e) => setNewValueInput(e.target.value)}
                        className="w-32 rounded border border-border bg-surface-sunken px-2 py-1 text-xs text-ink focus:border-primary focus:outline-none"
                      />
                    </form>
                  </div>
                </div>
              </Card>
            </section>
            </>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="space-y-12">

            {/* Empresa: Necesidades Actuales */}
            {tipo === 'empresa' && (
              <section className="space-y-6">
                <h2 className="flex items-center gap-2 font-heading text-xl font-extrabold uppercase tracking-tight text-ink-strong">
                  <ShieldCheck className="size-5 text-primary" />
                  {t('sections.needs')}
                </h2>
                <Card className="border-border bg-surface p-6">
                  <div className="flex flex-wrap gap-2">
                    {ALL_PROJECT_TYPES.map((pt) => {
                      const isSelected = company.projectTypes.includes(pt);
                      return (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => handleToggleProjectType(pt)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-border bg-canvas text-ink-muted hover:border-border-strong hover:text-ink',
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

            {/* Emprendedor: Etapa del Proyecto */}
            {tipo === 'emprendedor' && (
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 font-heading text-xl font-extrabold uppercase tracking-tight text-ink-strong">
                  <Target className="size-5 text-accent" />
                  {t('sections.stage')}<span className="text-accent">.</span>
                </h2>
                <div className="space-y-2">
                  {(['idea', 'mvp', 'validating', 'scaling'] as StartupStage[]).map((s) => {
                    const isSelected = company.stage === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCompany((prev) => ({ ...prev, stage: s }))}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                          isSelected
                            ? 'border-accent bg-accent/10'
                            : 'border-border bg-surface hover:border-border-strong hover:bg-surface-sunken',
                        )}
                      >
                        <span className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                          isSelected ? 'border-accent' : 'border-border-strong',
                        )}>
                          {isSelected && <span className="size-2 rounded-full bg-accent" />}
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className={cn('text-sm font-bold', isSelected ? 'text-accent' : 'text-ink-strong')}>
                            {tStage(`${s}_label`)}
                          </span>
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
                <h2 className="flex items-center gap-2 font-heading text-xl font-extrabold uppercase tracking-tight text-ink-strong">
                  <ShieldCheck className="size-5 text-primary" />
                  {t('sections.tech_support')}<span className="text-primary">.</span>
                </h2>
                <Card className="border-border bg-surface p-5">
                  <div className="flex flex-wrap gap-2">
                    {(['web', 'mobile', 'backend', 'ai', 'ux', 'data', 'automation', 'other'] as TechSupport[]).map((ts) => {
                      const isSelected = company.neededSupport.includes(ts);
                      return (
                        <button
                          key={ts}
                          type="button"
                          onClick={() => handleToggleNeededSupport(ts)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-border bg-canvas text-ink-muted hover:border-border-strong hover:text-ink',
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
                <h2 className="font-heading text-xl font-extrabold uppercase tracking-tight text-ink-strong">
                  {t('sections.budget')}
                </h2>
                <div className="space-y-2">
                  {(['under_500', 'range_500_1000', 'range_1000_2500', 'flexible'] as BudgetRange[]).map((b) => {
                    const isSelected = company.budget === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setCompany((prev) => ({ ...prev, budget: b }))}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                          isSelected
                            ? 'border-highlight bg-highlight/10 font-bold text-secondary'
                            : 'border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink',
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
            <section className="space-y-6">
              <h2 className="font-heading text-xl font-extrabold uppercase tracking-tight text-ink-strong">
                {t('sections.modalities')}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(['remote', 'hybrid', 'onsite', 'nomad'] as const).map((m) => {
                  const isActive = company.modalities.includes(m);
                  return (
                    <div
                      key={m}
                      onClick={() => handleToggleModality(m)}
                      className={cn(
                        'cursor-pointer select-none rounded-xl border p-3 text-center text-[10px] font-bold uppercase tracking-tighter transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                        isActive
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border bg-surface text-ink-muted hover:border-ink-muted/55',
                      )}
                    >
                      {t(`modalities.${m}`)}
                    </div>
                  );
                })}
              </div>
              <Card
                onClick={handleToggleSchedule}
                className="flex cursor-pointer select-none items-center gap-3 border-border bg-surface-sunken p-4 transition-colors hover:bg-surface"
              >
                <Clock className="size-5 text-warning" />
                <div>
                  <p className="text-xs font-bold uppercase text-ink-strong">
                    {company.scheduleType === 'flexible' ? t('schedules.flexible') : t('schedules.fixed')}
                  </p>
                  <p className="text-[10px] uppercase text-ink-muted">{t('schedules.timezone')}</p>
                </div>
              </Card>
            </section>

            {/* Contactos de Reclutamiento */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-extrabold uppercase tracking-tight text-ink-strong">
                  {t('sections.contacts')}
                </h2>
                <Button
                  onClick={handleOpenAddContact}
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 rounded-full border-primary/20 text-xs text-primary hover:bg-primary/5"
                >
                  <Plus className="size-3.5" /> {t('contacts.add_btn')}
                </Button>
              </div>
              <div className="space-y-3">
                {company.contacts.map((contact, i) => (
                  <Card
                    key={i}
                    onClick={() => handleOpenEditContact(i)}
                    className="flex cursor-pointer items-center gap-4 border-border bg-surface p-4 transition-shadow hover:shadow-[var(--shadow-soft)]"
                  >
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-secondary font-bold text-white">{contact.initial}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-strong">{contact.name}</p>
                      <p className="truncate text-[10px] uppercase tracking-wider text-ink-muted">{contact.role}</p>
                      <p className="truncate text-[10px] text-primary underline">{contact.email}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Contact modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/50 p-4 backdrop-blur-xs">
          <Card className="relative w-full max-w-md space-y-6 border-border bg-surface p-6 shadow-[var(--shadow-elevated)]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-ink-muted transition-colors hover:text-ink"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-2">
              <h3 className="font-heading text-xl font-extrabold uppercase tracking-tight text-ink-strong">
                {editingContactIndex !== null ? t('contacts.edit_title') : t('contacts.add_title')}
              </h3>
              <p className="text-xs text-ink-muted">{t('contacts.subtitle')}</p>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                  {t('contacts.name_label')}
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink-strong focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                  {t('contacts.role_label')}
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.role}
                  onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink-strong focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
                  {t('contacts.email_label')}
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink-strong focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex gap-3 border-t border-border pt-4">
                {editingContactIndex !== null && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDeleteContact}
                    className="gap-1 border border-transparent font-bold text-magenta hover:border-magenta/20 hover:bg-magenta/5"
                  >
                    <Trash2 className="size-4" /> {t('contacts.delete_btn')}
                  </Button>
                )}
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-border text-ink-strong"
                >
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
