'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Edit2, Globe, MapPin, Building2, Users, Briefcase, Target, Clock, ShieldCheck, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { FwdGeoBackdrop } from '@/components/ui/fwd-geo-backdrop';
import { cn } from '@/lib/utils';

// Mock data para la interfaz
const COMPANY_MOCK = {
    name: "Global Tech Solutions",
    description: "Líder global en soluciones tecnológicas para la industria 4.0, enfocados en optimizar procesos productivos mediante talento especializado de FWD.",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=GT",
    comercialName: "Global Tech S.A.",
    website: "www.globaltech.solutions",
    location: "San José, Costa Rica",
    sector: "Tecnología / Software",
    mission: "Transformar la industria latinoamericana mediante el acceso a tecnología de punta.",
    vision: "Ser el socio tecnológico #1 para empresas en proceso de digitalización para 2028.",
    values: ["Innovación", "Impacto Social", "Excelencia", "Colaboración"],
    culture: "Promovemos un ambiente de aprendizaje constante y autonomía responsable.",
    technologies: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "Figma"],
    needs: [
        { id: 1, title: "Desarrollo de MVP", active: true },
        { id: 2, title: "Mantenimiento Cloud", active: false },
        { id: 3, title: "Refactorización Legacy", active: true },
        { id: 4, title: "Diseño de Interfaces", active: true }
    ],
    weights: {
        skills: 85,
        experience: 40,
        cultural: 95,
        availability: 70
    },
    contacts: [
        { name: "Carlos Rodríguez", role: "HR Director", email: "c.rodriguez@gt.com", initial: "CR" },
        { name: "Lucía Méndez", role: "Engineering Manager", email: "l.mendez@gt.com", initial: "LM" }
    ]
};

export function CompanyProfile() {
    const t = useTranslations('mi_empresa');
    const tNav = useTranslations('empresa_subnav');
    const tDash = useTranslations('empresa_dashboard');

    // Estado local reactivo
    const [isEditing, setIsEditing] = React.useState(false);
    const [company, setCompany] = React.useState({
        ...COMPANY_MOCK,
        modalities: ["remote"],
        scheduleType: "flexible" as "flexible" | "fixed"
    });

    // Inputs temporales para añadir valores y tecnologías
    const [newValueInput, setNewValueInput] = React.useState("");
    const [newTechInput, setNewTechInput] = React.useState("");

    // Estado del modal de reclutadores
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingContactIndex, setEditingContactIndex] = React.useState<number | null>(null);
    const [contactForm, setContactForm] = React.useState({ name: "", role: "", email: "" });

    // Handlers para Valores
    const handleRemoveValue = (indexToRemove: number) => {
        setCompany(prev => ({
            ...prev,
            values: prev.values.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleAddValue = (e: React.FormEvent) => {
        e.preventDefault();
        const valueTrimmed = newValueInput.trim();
        if (valueTrimmed && !company.values.includes(valueTrimmed)) {
            setCompany(prev => ({
                ...prev,
                values: [...prev.values, valueTrimmed]
            }));
            setNewValueInput("");
        }
    };

    // Handlers para Tecnologías
    const handleRemoveTech = (techToRemove: string) => {
        setCompany(prev => ({
            ...prev,
            technologies: prev.technologies.filter(tech => tech !== techToRemove)
        }));
    };

    const handleAddTech = (e: React.FormEvent) => {
        e.preventDefault();
        const techTrimmed = newTechInput.trim();
        if (techTrimmed && !company.technologies.includes(techTrimmed)) {
            setCompany(prev => ({
                ...prev,
                technologies: [...prev.technologies, techTrimmed]
            }));
            setNewTechInput("");
        }
    };

    // Handler para Necesidades Actuales
    const handleToggleNeed = (id: number) => {
        setCompany(prev => ({
            ...prev,
            needs: prev.needs.map(need => need.id === id ? { ...need, active: !need.active } : need)
        }));
    };

    // Handler para Pesos del Algoritmo
    const handleWeightChange = (key: keyof typeof COMPANY_MOCK.weights, val: number[]) => {
        const numVal = val[0];
        if (numVal !== undefined) {
            setCompany(prev => ({
                ...prev,
                weights: {
                    ...prev.weights,
                    [key]: numVal
                }
            }));
        }
    };

    // Handler para Modalidades de Colaboración
    const handleToggleModality = (m: string) => {
        setCompany(prev => {
            const exists = prev.modalities.includes(m);
            const nextModalities = exists
                ? prev.modalities.filter(mod => mod !== m)
                : [...prev.modalities, m];
            return {
                ...prev,
                modalities: nextModalities
            };
        });
    };

    // Handler para Horarios
    const handleToggleSchedule = () => {
        setCompany(prev => ({
            ...prev,
            scheduleType: prev.scheduleType === 'flexible' ? 'fixed' : 'flexible'
        }));
    };

    // Handlers para Reclutadores (Modal)
    const handleOpenAddContact = () => {
        setEditingContactIndex(null);
        setContactForm({ name: "", role: "", email: "" });
        setIsModalOpen(true);
    };

    const handleOpenEditContact = (index: number) => {
        const contact = company.contacts[index];
        if (contact) {
            setEditingContactIndex(index);
            setContactForm({ name: contact.name, role: contact.role, email: contact.email });
            setIsModalOpen(true);
        }
    };

    const handleSaveContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactForm.name.trim() || !contactForm.role.trim() || !contactForm.email.trim()) return;

        const initial = contactForm.name.trim().split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        const updatedContact = {
            name: contactForm.name.trim(),
            role: contactForm.role.trim(),
            email: contactForm.email.trim(),
            initial: initial || "C"
        };

        setCompany(prev => {
            const nextContacts = [...prev.contacts];
            if (editingContactIndex !== null) {
                nextContacts[editingContactIndex] = updatedContact;
            } else {
                nextContacts.push(updatedContact);
            }
            return { ...prev, contacts: nextContacts };
        });
        setIsModalOpen(false);
    };

    const handleDeleteContact = () => {
        if (editingContactIndex !== null) {
            setCompany(prev => ({
                ...prev,
                contacts: prev.contacts.filter((_, idx) => idx !== editingContactIndex)
            }));
            setIsModalOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-canvas font-sans relative">
            {/* 1. Hero Empresa (Brand Expresivo) */}
            <div className="relative bg-secondary pt-32 pb-16 px-6 overflow-hidden">
                <FwdGeoBackdrop />
                <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-8">
                    <Avatar className="h-32 w-32 border-4 border-white/20 shadow-xl rounded-2xl">
                        <AvatarImage src={company.logo} alt={company.name} />
                        <AvatarFallback className="bg-primary text-white text-3xl font-bold">GT</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <Badge className="bg-highlight text-secondary font-bold border-none">
                                {tDash('tag_socio').toUpperCase()}
                            </Badge>
                            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                                {company.name}<span className="text-primary">.</span>
                            </h1>
                        </div>
                        <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
                            {company.description}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/60 text-sm">
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {company.location}</span>
                            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {tDash('tag_size')}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={() => setIsEditing(!isEditing)}
                            variant="outline" 
                            className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm gap-2"
                        >
                            <Edit2 className="h-4 w-4" /> {isEditing ? "Guardar" : t('hero.edit_profile')}
                        </Button>
                        <Button className="rounded-full bg-highlight text-secondary hover:bg-highlight/90 font-bold border-none">
                            {t('hero.view_projects')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. Tabs Navigation */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-6xl mx-auto flex overflow-x-auto no-scrollbar px-6">
                    {[
                        { id: 'proyectos', label: tNav('mis_proyectos') },
                        { id: 'matches', label: tNav('matches') },
                        { id: 'postulaciones', label: tNav('postulaciones') },
                        { id: 'empresa', label: tNav('mi_empresa'), active: true },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            className={cn(
                                "py-5 px-6 font-heading text-sm font-bold tracking-wider whitespace-nowrap transition-colors border-b-2",
                                tab.active
                                    ? "text-primary border-primary"
                                    : "text-ink-muted border-transparent hover:text-ink hover:border-border"
                            )}
                        >
                            {tab.label.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    <div className="lg:col-span-2 space-y-12">
                        {/* 3. Información General */}
                        <section className="space-y-6">
                            <h2 className="font-heading text-2xl font-extrabold text-ink-strong uppercase tracking-tight flex items-center gap-3">
                                <Building2 className="text-primary h-6 w-6" /> {t('sections.general')}<span className="text-primary">.</span>
                            </h2>
                            <Card className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-border bg-surface">
                                <div>
                                    <label className="text-ink-subtle text-xs font-bold uppercase tracking-widest">{t('fields.comercial_name')}</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={company.comercialName}
                                            onChange={(e) => setCompany({ ...company, comercialName: e.target.value })}
                                            className="text-ink font-medium text-lg w-full bg-transparent border-b border-border focus:border-primary focus:outline-none py-1"
                                        />
                                    ) : (
                                        <p className="text-ink font-medium text-lg">{company.comercialName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-ink-subtle text-xs font-bold uppercase tracking-widest">{t('fields.website')}</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={company.website}
                                            onChange={(e) => setCompany({ ...company, website: e.target.value })}
                                            className="text-primary font-medium text-lg w-full bg-transparent border-b border-border focus:border-primary focus:outline-none py-1"
                                        />
                                    ) : (
                                        <p className="text-primary font-medium text-lg flex items-center gap-2">
                                            <Globe className="h-4 w-4" /> {company.website}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-ink-subtle text-xs font-bold uppercase tracking-widest">{t('fields.location')}</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={company.location}
                                            onChange={(e) => setCompany({ ...company, location: e.target.value })}
                                            className="text-ink font-medium text-lg w-full bg-transparent border-b border-border focus:border-primary focus:outline-none py-1"
                                        />
                                    ) : (
                                        <p className="text-ink font-medium text-lg">{company.location}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-ink-subtle text-xs font-bold uppercase tracking-widest">{t('fields.sector')}</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={company.sector}
                                            onChange={(e) => setCompany({ ...company, sector: e.target.value })}
                                            className="text-ink font-medium text-lg w-full bg-transparent border-b border-border focus:border-primary focus:outline-none py-1"
                                        />
                                    ) : (
                                        <p className="text-ink font-medium text-lg">{company.sector}</p>
                                    )}
                                </div>
                            </Card>
                        </section>

                        {/* 4. Identidad y Cultura */}
                        <section className="space-y-6">
                            <h2 className="font-heading text-2xl font-extrabold text-ink-strong uppercase tracking-tight flex items-center gap-3">
                                <Target className="text-primary h-6 w-6" /> {t('sections.culture')}<span className="text-primary">.</span>
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <Card className="p-8 border-border bg-surface space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-secondary text-sm uppercase tracking-widest">{t('fields.mission')}</h3>
                                            {isEditing ? (
                                                <textarea
                                                    rows={3}
                                                    value={company.mission}
                                                    onChange={(e) => setCompany({ ...company, mission: e.target.value })}
                                                    className="text-ink leading-relaxed italic w-full bg-transparent border border-border rounded p-2 focus:border-primary focus:outline-none"
                                                />
                                            ) : (
                                                <p className="text-ink leading-relaxed italic">&ldquo;{company.mission}&rdquo;</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-secondary text-sm uppercase tracking-widest">{t('fields.vision')}</h3>
                                            {isEditing ? (
                                                <textarea
                                                    rows={3}
                                                    value={company.vision}
                                                    onChange={(e) => setCompany({ ...company, vision: e.target.value })}
                                                    className="text-ink leading-relaxed italic w-full bg-transparent border border-border rounded p-2 focus:border-primary focus:outline-none"
                                                />
                                            ) : (
                                                <p className="text-ink leading-relaxed italic">&ldquo;{company.vision}&rdquo;</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-6 border-t border-border">
                                        <h3 className="font-bold text-secondary text-sm uppercase tracking-widest">{t('fields.organization')}</h3>
                                        {isEditing ? (
                                            <textarea
                                                rows={2}
                                                value={company.culture}
                                                onChange={(e) => setCompany({ ...company, culture: e.target.value })}
                                                className="text-ink leading-relaxed w-full bg-transparent border border-border rounded p-2 focus:border-primary focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-ink leading-relaxed">{company.culture}</p>
                                        )}
                                    </div>
                                    <div className="space-y-4 pt-6 border-t border-border">
                                        <h3 className="font-bold text-secondary text-sm uppercase tracking-widest">{t('fields.values')}</h3>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {company.values.map((v, idx) => (
                                                <Badge 
                                                    key={v} 
                                                    variant="secondary" 
                                                    className={cn(
                                                        "bg-secondary/5 text-secondary border-secondary/10 px-4 py-1 flex items-center gap-1",
                                                        isEditing && "cursor-pointer hover:bg-magenta/10 hover:text-magenta"
                                                    )}
                                                    onClick={() => isEditing && handleRemoveValue(idx)}
                                                >
                                                    {v}
                                                    {isEditing && <X className="h-3 w-3" />}
                                                </Badge>
                                            ))}
                                            {isEditing && (
                                                <form onSubmit={handleAddValue} className="inline-flex items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Nuevo valor..."
                                                        value={newValueInput}
                                                        onChange={(e) => setNewValueInput(e.target.value)}
                                                        className="text-xs bg-transparent border border-border rounded px-2 py-1 text-ink focus:outline-none w-28"
                                                    />
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </section>

                        {/* 5. Intereses de Contratación */}
                        <section className="space-y-6">
                            <h2 className="font-heading text-2xl font-extrabold text-ink-strong uppercase tracking-tight flex items-center gap-3">
                                <Briefcase className="text-primary h-6 w-6" /> {t('sections.interests')}<span className="text-primary">.</span>
                            </h2>
                            <Card className="p-8 border-border bg-surface">
                                <div className="flex flex-wrap gap-3 items-center">
                                    {company.technologies.map(tech => (
                                        <Badge 
                                            key={tech} 
                                            className={cn(
                                                "bg-canvas text-ink-strong border-border-strong px-5 py-2 text-sm rounded-lg transition-all cursor-default flex items-center gap-2",
                                                isEditing ? "hover:bg-magenta hover:text-white cursor-pointer" : "hover:bg-primary hover:text-white"
                                            )}
                                            onClick={() => isEditing && handleRemoveTech(tech)}
                                        >
                                            {tech}
                                            {isEditing && <X className="h-3.5 w-3.5" />}
                                        </Badge>
                                    ))}
                                    {isEditing && (
                                        <form onSubmit={handleAddTech} className="inline-flex items-center">
                                            <input
                                                type="text"
                                                placeholder="Añadir stack..."
                                                value={newTechInput}
                                                onChange={(e) => setNewTechInput(e.target.value)}
                                                className="bg-transparent border border-border rounded px-4 py-2 text-sm text-ink-strong focus:outline-none w-36"
                                            />
                                        </form>
                                    )}
                                </div>
                            </Card>
                        </section>

                        {/* 6. Necesidades Actuales */}
                        <section className="space-y-6">
                            <h2 className="font-heading text-2xl font-extrabold text-ink-strong uppercase tracking-tight flex items-center gap-3">
                                <ShieldCheck className="text-primary h-6 w-6" /> {t('sections.needs')}<span className="text-primary">.</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {company.needs.map(need => (
                                    <Card 
                                        key={need.id} 
                                        onClick={() => handleToggleNeed(need.id)}
                                        className={cn(
                                            "p-4 flex flex-col items-center justify-center text-center gap-2 border-2 transition-all cursor-pointer select-none",
                                            need.active ? "border-primary bg-primary/5" : "border-border bg-surface opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <div className={cn("h-3 w-3 rounded-full", need.active ? "bg-primary" : "bg-border")} />
                                        <span className="text-xs font-bold text-ink uppercase tracking-tight">{need.title}</span>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-12">
                        {/* 9. Pesos del Algoritmo Matching */}
                        <section className="space-y-6">
                            <h2 className="font-heading text-xl font-extrabold text-ink-strong uppercase tracking-tight">
                                {t('sections.matching')}
                            </h2>
                            <Card className="p-6 border-border bg-surface space-y-8">
                                {[
                                    { key: 'skills', label: t('matching_weights.skills'), value: company.weights.skills },
                                    { key: 'experience', label: t('matching_weights.experience'), value: company.weights.experience },
                                    { key: 'cultural', label: t('matching_weights.cultural'), value: company.weights.cultural },
                                    { key: 'availability', label: t('matching_weights.availability'), value: company.weights.availability },
                                ].map((item) => (
                                    <div key={item.key} className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-ink-muted uppercase tracking-widest">{item.label}</span>
                                            <span className="text-sm font-heading font-black text-primary">{item.value}%</span>
                                        </div>
                                        <Slider 
                                            value={[item.value]} 
                                            onValueChange={(val) => handleWeightChange(item.key as keyof typeof COMPANY_MOCK.weights, val)}
                                            max={100} 
                                            step={5} 
                                            className="cursor-pointer" 
                                        />
                                    </div>
                                ))}
                            </Card>
                        </section>

                        {/* 7 & 8. Modalidades y Horarios */}
                        <section className="space-y-6">
                            <h2 className="font-heading text-xl font-extrabold text-ink-strong uppercase tracking-tight">
                                {t('sections.modalities')}
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {['remote', 'hybrid', 'onsite', 'nomad'].map(m => {
                                    const isActive = company.modalities.includes(m);
                                    return (
                                        <div 
                                            key={m} 
                                            onClick={() => handleToggleModality(m)}
                                            className={cn(
                                                "p-3 rounded-xl border text-center font-bold text-[10px] uppercase tracking-tighter cursor-pointer select-none transition-colors",
                                                isActive ? "bg-accent/10 border-accent text-accent" : "bg-surface border-border text-ink-muted hover:border-ink-muted/55"
                                            )}
                                        >
                                            {t(`modalities.${m}`)}
                                        </div>
                                    );
                                })}
                            </div>
                            <Card 
                                onClick={handleToggleSchedule}
                                className="p-4 border-border bg-surface-sunken flex items-center gap-3 cursor-pointer select-none hover:bg-surface transition-colors"
                            >
                                <Clock className="text-warning h-5 w-5" />
                                <div>
                                    <p className="text-xs font-bold text-ink-strong uppercase">
                                        {company.scheduleType === 'flexible' ? t('schedules.flexible') : t('schedules.fixed')}
                                    </p>
                                    <p className="text-[10px] text-ink-muted uppercase">{t('schedules.timezone')}</p>
                                </div>
                            </Card>
                        </section>

                        {/* 10. Contactos de Reclutamiento */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-heading text-xl font-extrabold text-ink-strong uppercase tracking-tight">
                                    {t('sections.contacts')}
                                </h2>
                                <Button
                                    onClick={handleOpenAddContact}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-full border-primary/20 text-primary hover:bg-primary/5 gap-1 text-xs"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Reclutador
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {company.contacts.map((contact, i) => (
                                    <Card 
                                        key={i} 
                                        onClick={() => handleOpenEditContact(i)}
                                        className="p-4 border-border bg-surface hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer"
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-secondary text-white font-bold">{contact.initial}</AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden flex-1">
                                            <p className="text-sm font-bold text-ink-strong truncate">{contact.name}</p>
                                            <p className="text-[10px] text-ink-muted uppercase tracking-wider truncate">{contact.role}</p>
                                            <p className="text-[10px] text-primary underline truncate">{contact.email}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>

            {/* Recruiter Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
                    <Card className="w-full max-w-md p-6 bg-surface border-border shadow-2xl relative space-y-6">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 text-ink-muted hover:text-ink transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        
                        <div className="space-y-2">
                            <h3 className="font-heading text-xl font-extrabold text-ink-strong uppercase tracking-tight">
                                {editingContactIndex !== null ? "Editar Reclutador" : "Agregar Reclutador"}
                            </h3>
                            <p className="text-xs text-ink-muted">
                                Completa los datos de contacto del encargado de reclutamiento.
                            </p>
                        </div>

                        <form onSubmit={handleSaveContact} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-ink-subtle text-xs font-bold uppercase tracking-widest">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                    className="w-full bg-canvas border border-border rounded px-3 py-2 text-sm text-ink-strong focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-ink-subtle text-xs font-bold uppercase tracking-widest">Rol / Puesto</label>
                                <input
                                    type="text"
                                    required
                                    value={contactForm.role}
                                    onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                                    className="w-full bg-canvas border border-border rounded px-3 py-2 text-sm text-ink-strong focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-ink-subtle text-xs font-bold uppercase tracking-widest">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                    className="w-full bg-canvas border border-border rounded px-3 py-2 text-sm text-ink-strong focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-border">
                                {editingContactIndex !== null && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleDeleteContact}
                                        className="text-magenta hover:bg-magenta/5 border border-transparent hover:border-magenta/20 font-bold"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                    </Button>
                                )}
                                <div className="flex-1" />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="border-border text-ink-strong"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primary text-white hover:bg-primary/90"
                                >
                                    Guardar
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}