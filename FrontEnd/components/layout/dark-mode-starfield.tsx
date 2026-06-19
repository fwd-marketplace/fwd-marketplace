import type { CSSProperties } from "react";
import { createSeededRandom } from "@/lib/logo-constellation";

type StarStyle = CSSProperties & Record<`--${string}`, string | number>;

const STAR_COUNT = 70;
const STAR_SEED = 7;

interface SkyStar {
  readonly leftPercent: number;
  readonly topPercent: number;
  readonly sizePx: number;
  readonly opacity: number;
  readonly delayMs: number;
}

/** Estrellas deterministas (sin desajuste de hidratación) repartidas por el cielo. */
function buildSkyStars(): SkyStar[] {
  const next = createSeededRandom(STAR_SEED);
  const stars: SkyStar[] = [];
  for (let index = 0; index < STAR_COUNT; index++) {
    stars.push({
      leftPercent: next() * 100,
      topPercent: next() * 100,
      sizePx: 1 + next() * 1.8,
      opacity: Number((0.2 + next() * 0.45).toFixed(2)),
      delayMs: next() * 5000,
    });
  }
  return stars;
}

const SKY_STARS = buildSkyStars();

/**
 * Cielo estrellado de fondo para el modo oscuro: ocupa toda la ventana, queda
 * detrás del contenido y solo se muestra cuando `<html>` tiene la clase `dark`
 * (se controla con CSS en globals.css, sin JS). Las estrellas titilan.
 */
export function DarkModeStarfield() {
  return (
    <div className="dark-starfield" aria-hidden="true">
      {SKY_STARS.map((star, index) => {
        const style: StarStyle = {
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
  );
}
