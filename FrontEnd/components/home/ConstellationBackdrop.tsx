import type { CSSProperties } from "react";
import { createSeededRandom } from "@/lib/logo-constellation";

type StyleWithCustomProps = CSSProperties & Record<`--${string}`, string | number>;

const AMBIENT_STAR_COUNT = 80;
const INITIAL_SEED = 11;

interface AmbientStar {
  readonly leftPercent: number;
  readonly topPercent: number;
  readonly sizePx: number;
  readonly opacity: number;
  readonly delayMs: number;
}

/**
 * Genera estrellas deterministas (mismo resultado en servidor y cliente para
 * evitar desajustes de hidratacion) con un generador congruencial sembrado.
 */
function buildAmbientStars(): AmbientStar[] {
  const next = createSeededRandom(INITIAL_SEED);
  const stars: AmbientStar[] = [];
  for (let index = 0; index < AMBIENT_STAR_COUNT; index++) {
    const sizePx = 1 + next() * 2.4;
    const leftPercent = next() * 100;
    const topPercent = next() * 100;
    const opacity = Number((0.15 + next() * 0.5).toFixed(2));
    const delayMs = next() * 5000;
    stars.push({ leftPercent, topPercent, sizePx, opacity, delayMs });
  }
  return stars;
}

const AMBIENT_STARS = buildAmbientStars();

/**
 * Fondo del logo en constelacion: cielo morado radial mas un campo de estrellas
 * ambiente que titila. Pensado para envolver al heroe en la pantalla de inicio.
 */
export function ConstellationBackdrop() {
  return (
    <div
      className="bg-constellation-sky pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div className="constellation-starfield">
        {AMBIENT_STARS.map((star, index) => {
          const style: StyleWithCustomProps = {
            left: `${star.leftPercent}%`,
            top: `${star.topPercent}%`,
            width: `${star.sizePx}px`,
            height: `${star.sizePx}px`,
            opacity: star.opacity,
            animationDelay: `${star.delayMs}ms`,
            "--star-opacity": star.opacity,
          };
          return <span key={index} style={style} />;
        })}
      </div>
    </div>
  );
}
