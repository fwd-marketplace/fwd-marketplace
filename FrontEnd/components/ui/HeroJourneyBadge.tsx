import { Compass, BookOpen, Mountain, Sparkles, Trophy, type LucideIcon } from 'lucide-react';

export type HeroStage = 'llamado' | 'preparacion' | 'desafio' | 'transformacion' | 'reconocimiento';

interface StageConfig {
    Icon: LucideIcon;
    color: string;
    bg: string;
}

const STAGE_CONFIG: Record<HeroStage, StageConfig> = {
    llamado:        { Icon: Compass,   color: 'text-primary',    bg: 'bg-primary/15'    },
    preparacion:    { Icon: BookOpen,  color: 'text-accent',     bg: 'bg-accent/15'     },
    desafio:        { Icon: Mountain,  color: 'text-accent',     bg: 'bg-accent/15'     },
    transformacion: { Icon: Sparkles,  color: 'text-warning',    bg: 'bg-warning/15'    },
    reconocimiento: { Icon: Trophy,    color: 'text-magenta',    bg: 'bg-magenta/15'    },
};

interface Props {
    stage: HeroStage;
    label: string;
    cta: string;
}

export function HeroJourneyBadge({ stage, label, cta }: Props) {
    const { Icon, color, bg } = STAGE_CONFIG[stage];

    return (
        <div className="fixed top-4 right-4 z-50 flex items-start gap-3 rounded-2xl border border-white/15 bg-secondary/60 px-4 py-3 shadow-elevated backdrop-blur-md max-w-[220px]">
            <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
                <p className="text-xs font-bold text-white leading-tight">{label}</p>
                <p className="mt-0.5 text-[11px] text-white/65 leading-snug">{cta}</p>
            </div>
        </div>
    );
}
