import { Compass, BookOpen, Mountain, Sparkles, Trophy, type LucideIcon } from 'lucide-react';

export type HeroStage = 'llamado' | 'preparacion' | 'desafio' | 'transformacion' | 'reconocimiento';

interface StageConfig {
    Icon: LucideIcon;
    colorClass: string;
    bgClass: string;
    borderClass: string;
}

const STAGE_CONFIG: Record<HeroStage, StageConfig> = {
    llamado:        { Icon: Compass,   colorClass: 'text-primary',  bgClass: 'bg-primary/20',  borderClass: 'border-primary/50'  },
    preparacion:    { Icon: BookOpen,  colorClass: 'text-accent',   bgClass: 'bg-accent/20',   borderClass: 'border-accent/50'   },
    desafio:        { Icon: Mountain,  colorClass: 'text-accent',   bgClass: 'bg-accent/20',   borderClass: 'border-accent/50'   },
    transformacion: { Icon: Sparkles,  colorClass: 'text-warning',  bgClass: 'bg-warning/20',  borderClass: 'border-warning/50'  },
    reconocimiento: { Icon: Trophy,    colorClass: 'text-magenta',  bgClass: 'bg-magenta/20',  borderClass: 'border-magenta/50'  },
};

interface Props {
    stage: HeroStage;
    label: string;
    cta: string;
    achievedCta?: string;
    achieved?: boolean;
}

export function HeroJourneyBadge({ stage, label, cta, achievedCta, achieved = false }: Props) {
    const { Icon, colorClass, bgClass, borderClass } = STAGE_CONFIG[stage];

    return (
        <div className={`inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 backdrop-blur-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] ${
            achieved
                ? `${bgClass} ${borderClass}`
                : 'border-transparent bg-transparent'
        }`}>
            <div className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-[var(--duration-base)] ${
                achieved
                    ? `${bgClass} ${borderClass} ${colorClass}`
                    : 'border-transparent text-white/60'
            }`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <div>
                <p className={`text-xs font-bold leading-none ${achieved ? colorClass : 'text-white/60'}`}>
                    {label}
                </p>
                <p className="mt-0.5 text-[10px] text-white/50 leading-tight">
                    {achieved && achievedCta ? achievedCta : cta}
                </p>
            </div>
        </div>
    );
}
