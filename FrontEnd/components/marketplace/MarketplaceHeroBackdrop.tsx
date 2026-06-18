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
    // extra density
    { top: '3%', left: '60%', size: 4, color: 'white', kind: 'dot', opacity: 0.45 },
    { top: '8%', left: '38%', size: 5, color: 'white', kind: 'dot', opacity: 0.5 },
    { top: '50%', left: '58%', size: 12, color: 'white', kind: 'sparkle', opacity: 0.8 },
    { top: '4%', left: '82%', size: 4, color: 'white', kind: 'dot', opacity: 0.4 },
    { top: '19%', left: '15%', size: 5, color: 'gold', kind: 'dot', opacity: 0.65 },
    { top: '27%', left: '72%', size: 4, color: 'white', kind: 'dot', opacity: 0.5 },
    { top: '56%', left: '44%', size: 12, color: 'gold', kind: 'sparkle', opacity: 0.75 },
    { top: '36%', left: '20%', size: 4, color: 'white', kind: 'dot', opacity: 0.4 },
    { top: '38%', left: '52%', size: 5, color: 'white', kind: 'dot', opacity: 0.55 },
    { top: '45%', left: '78%', size: 12, color: 'white', kind: 'sparkle', opacity: 0.8 },
    { top: '52%', left: '14%', size: 4, color: 'gold', kind: 'dot', opacity: 0.6 },
    { top: '57%', left: '32%', size: 5, color: 'white', kind: 'dot', opacity: 0.45 },
    { top: '59%', left: '56%', size: 4, color: 'white', kind: 'dot', opacity: 0.5 },
    { top: '66%', left: '46%', size: 12, color: 'gold', kind: 'sparkle', opacity: 0.8 },
    { top: '70%', left: '85%', size: 4, color: 'white', kind: 'dot', opacity: 0.45 },
    { top: '77%', left: '39%', size: 5, color: 'white', kind: 'dot', opacity: 0.55 },
    { top: '80%', left: '65%', size: 4, color: 'gold', kind: 'dot', opacity: 0.6 },
    { top: '88%', left: '22%', size: 12, color: 'white', kind: 'sparkle', opacity: 0.75 },
    { top: '95%', left: '48%', size: 4, color: 'white', kind: 'dot', opacity: 0.4 },
    { top: '91%', left: '94%', size: 5, color: 'gold', kind: 'dot', opacity: 0.6 },
    // bordes seguros — sin chocar con texto central
    { top: '2%',  left: '4%',  size: 12, color: 'white', kind: 'sparkle', opacity: 0.7 },
    { top: '9%',  left: '88%', size: 5,  color: 'white', kind: 'dot',     opacity: 0.5 },
    { top: '18%', left: '95%', size: 12, color: 'gold',  kind: 'sparkle', opacity: 0.8 },
    { top: '23%', left: '3%',  size: 4,  color: 'gold',  kind: 'dot',     opacity: 0.6 },
    { top: '30%', left: '14%', size: 12, color: 'gold',  kind: 'sparkle', opacity: 0.75 },
    { top: '33%', left: '87%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.45 },
    { top: '41%', left: '97%', size: 5,  color: 'white', kind: 'dot',     opacity: 0.5 },
    { top: '44%', left: '5%',  size: 4,  color: 'white', kind: 'dot',     opacity: 0.4 },
    { top: '60%', left: '3%',  size: 12, color: 'white', kind: 'sparkle', opacity: 0.8 },
    { top: '63%', left: '91%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.45 },
    { top: '72%', left: '35%', size: 5,  color: 'gold',  kind: 'dot',     opacity: 0.55 },
    { top: '76%', left: '68%', size: 12, color: 'white', kind: 'sparkle', opacity: 0.8 },
    { top: '83%', left: '49%', size: 4,  color: 'white', kind: 'dot',     opacity: 0.4 },
    { top: '96%', left: '14%', size: 5,  color: 'white', kind: 'dot',     opacity: 0.5 },
    { top: '97%', left: '60%', size: 12, color: 'gold',  kind: 'sparkle', opacity: 0.75 },
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
