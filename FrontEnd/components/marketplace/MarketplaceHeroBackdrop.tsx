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

/** Star scatter, positioned to echo the reference image (denser at the top). */
const SKY_STARS: readonly SkyStar[] = [
    { top: '5%', left: '11%', size: 6, color: 'gold', kind: 'dot', opacity: 0.9 },
    { top: '10%', left: '21%', size: 18, color: 'white', kind: 'sparkle', opacity: 0.95 },
    { top: '16%', left: '6%', size: 4, color: 'white', kind: 'dot', opacity: 0.6 },
    { top: '6%', left: '29%', size: 4, color: 'white', kind: 'dot', opacity: 0.4 },
    { top: '5%', left: '48%', size: 5, color: 'white', kind: 'dot', opacity: 0.7 },
    { top: '21%', left: '40%', size: 6, color: 'gold', kind: 'dot', opacity: 0.8 },
    { top: '17%', left: '51%', size: 4, color: 'white', kind: 'dot', opacity: 0.4 },
    { top: '11%', left: '75%', size: 16, color: 'white', kind: 'sparkle', opacity: 0.95 },
    { top: '7%', left: '68%', size: 4, color: 'white', kind: 'dot', opacity: 0.5 },
    { top: '15%', left: '84%', size: 6, color: 'gold', kind: 'dot', opacity: 0.85 },
    { top: '21%', left: '67%', size: 14, color: 'gold', kind: 'sparkle', opacity: 0.9 },
    { top: '24%', left: '28%', size: 4, color: 'white', kind: 'dot', opacity: 0.5 },
    { top: '31%', left: '57%', size: 5, color: 'gold', kind: 'dot', opacity: 0.7 },
    { top: '43%', left: '9%', size: 15, color: 'white', kind: 'sparkle', opacity: 0.9 },
    { top: '34%', left: '89%', size: 5, color: 'gold', kind: 'dot', opacity: 0.7 },
    { top: '40%', left: '82%', size: 4, color: 'white', kind: 'dot', opacity: 0.45 },
    { top: '61%', left: '92%', size: 22, color: 'gold', kind: 'sparkle', opacity: 0.95 },
    { top: '46%', left: '62%', size: 16, color: 'white', kind: 'sparkle', opacity: 0.9 },
    { top: '55%', left: '43%', size: 14, color: 'gold', kind: 'sparkle', opacity: 0.9 },
    { top: '49%', left: '34%', size: 4, color: 'white', kind: 'dot', opacity: 0.5 },
    { top: '62%', left: '17%', size: 5, color: 'gold', kind: 'dot', opacity: 0.7 },
    { top: '67%', left: '73%', size: 4, color: 'white', kind: 'dot', opacity: 0.5 },
    { top: '68%', left: '63%', size: 16, color: 'gold', kind: 'sparkle', opacity: 0.9 },
    { top: '64%', left: '28%', size: 4, color: 'white', kind: 'dot', opacity: 0.45 },
    { top: '71%', left: '6%', size: 4, color: 'white', kind: 'dot', opacity: 0.5 },
    { top: '82%', left: '10%', size: 16, color: 'gold', kind: 'sparkle', opacity: 0.9 },
    { top: '74%', left: '27%', size: 4, color: 'white', kind: 'dot', opacity: 0.45 },
    { top: '75%', left: '54%', size: 4, color: 'white', kind: 'dot', opacity: 0.4 },
    { top: '90%', left: '76%', size: 6, color: 'gold', kind: 'dot', opacity: 0.7 },
    { top: '93%', left: '78%', size: 14, color: 'white', kind: 'sparkle', opacity: 0.85 },
    { top: '86%', left: '86%', size: 4, color: 'white', kind: 'dot', opacity: 0.4 },
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
