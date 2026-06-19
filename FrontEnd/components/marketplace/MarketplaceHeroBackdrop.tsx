/**
 * Decorative sky backdrop for the marketplace hero: two translucent FWD parallelograms
 * plus a scatter of twinkling stars (white + gold). Purely visual, no interactivity.
 * The vertical gradient lives on the section via the `bg-marketplace-sky` utility.
 */

import { buildSparklePoints } from "@/lib/logo-constellation";

/** 8-point star polygon matching the logo-constellation sparkle shape, on a 24x24 viewBox. */
const SPARKLE_POINTS = buildSparklePoints(12, 12, 12);

type StarColor = 'white' | 'gold';
type StarKind = 'sparkle' | 'dot';

interface SkyStar {
    top: string;
    left: string;
    size: number;
    color: StarColor;
    kind: StarKind;
    opacity: number;
}

/** Star scatter — densidad uniforme de arriba a abajo, sin acumulación en la cima. */
const SKY_STARS: readonly SkyStar[] = [
    // 0–20 %
    { top: '4%',  left: '11%', size: 16, color: 'white', kind: 'sparkle', opacity: 0.9  },
    { top: '7%',  left: '68%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.5  },
    { top: '10%', left: '84%', size: 14, color: 'gold',  kind: 'sparkle', opacity: 0.85 },
    { top: '14%', left: '38%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.45 },
    { top: '18%', left: '6%',  size: 5,  color: 'gold',  kind: 'dot',     opacity: 0.65 },
    // 20–40 %
    { top: '22%', left: '72%', size: 14, color: 'gold',  kind: 'sparkle', opacity: 0.9  },
    { top: '25%', left: '29%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.45 },
    { top: '30%', left: '55%', size: 5,  color: 'white', kind: 'dot',     opacity: 0.5  },
    { top: '35%', left: '89%', size: 5,  color: 'gold',  kind: 'dot',     opacity: 0.6  },
    { top: '38%', left: '14%', size: 14, color: 'white', kind: 'sparkle', opacity: 0.85 },
    // 40–60 %
    { top: '42%', left: '45%', size: 12, color: 'gold',  kind: 'sparkle', opacity: 0.8  },
    { top: '46%', left: '78%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.45 },
    { top: '50%', left: '22%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.4  },
    { top: '55%', left: '63%', size: 14, color: 'white', kind: 'sparkle', opacity: 0.9  },
    { top: '58%', left: '35%', size: 5,  color: 'gold',  kind: 'dot',     opacity: 0.6  },
    // 60–80 %
    { top: '62%', left: '91%', size: 20, color: 'gold',  kind: 'sparkle', opacity: 0.9  },
    { top: '66%', left: '10%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.5  },
    { top: '70%', left: '50%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.4  },
    { top: '74%', left: '28%', size: 12, color: 'gold',  kind: 'sparkle', opacity: 0.85 },
    { top: '78%', left: '74%', size: 5,  color: 'white', kind: 'dot',     opacity: 0.5  },
    // 80–100 %
    { top: '82%', left: '8%',  size: 14, color: 'white', kind: 'sparkle', opacity: 0.85 },
    { top: '86%', left: '57%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.4  },
    { top: '90%', left: '82%', size: 6,  color: 'gold',  kind: 'dot',     opacity: 0.65 },
    { top: '94%', left: '40%', size: 12, color: 'gold',  kind: 'sparkle', opacity: 0.8  },
    { top: '97%', left: '18%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.45 },
];

function resolveStarFill(color: StarColor): string {
    return color === 'gold' ? 'var(--highlight)' : 'var(--surface)';
}

export function MarketplaceHeroBackdrop() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {/* Translucent FWD parallelograms (top-right + bottom-left) */}
            <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1600 900"
                preserveAspectRatio="xMidYMid slice"
            >
                <polygon points="1080,-100 1700,-100 1320,640 700,640" fill="var(--surface)" fillOpacity="0.06" />
                <polygon points="-200,520 420,520 240,1120 -380,1120" fill="var(--surface)" fillOpacity="0.05" />
            </svg>

            {/* Twinkling stars */}
            {SKY_STARS.map((star, idx) => {
                const fill = resolveStarFill(star.color);
                const duration = `${2.5 + (idx % 4) * 0.7}s`;
                const delay = `${(idx % 7) * 0.4}s`;

                if (star.kind === 'dot') {
                    return (
                        <span
                            key={idx}
                            className="absolute rounded-full"
                            style={{
                                top: star.top,
                                left: star.left,
                                width: star.size,
                                height: star.size,
                                background: fill,
                                ['--star-opacity' as string]: star.opacity,
                                animation: `constellation-twinkle ${duration} ease-in-out ${delay} infinite`,
                            }}
                        />
                    );
                }

                return (
                    <span
                        key={idx}
                        className="absolute"
                        style={{ top: star.top, left: star.left, opacity: star.opacity }}
                    >
                        <svg
                            width={star.size}
                            height={star.size}
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{
                                display: 'block',
                                filter: `drop-shadow(0 0 3px ${fill})`,
                                animation: `constellation-spark-twinkle ${duration} ease-in-out ${delay} infinite`,
                            }}
                        >
                            <polygon points={SPARKLE_POINTS} fill={fill} />
                        </svg>
                    </span>
                );
            })}
        </div>
    );
}
