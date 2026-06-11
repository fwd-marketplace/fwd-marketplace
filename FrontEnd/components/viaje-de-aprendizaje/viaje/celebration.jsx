/* ====================================================================
   Celebration — destello al encender una estrella nueva
   Exporta: window.Celebration
   ==================================================================== */
const { useEffect: useCelebEffect, useMemo: useCelebMemo } = React;

function Celebration({ star, area, xpGain, onDone }) {
  if (!star) return null;

  // partículas-estrella que salen disparadas
  const particles = useCelebMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => {
      const ang = (i / 16) * Math.PI * 2 + (i % 2) * 0.2;
      const dist = 90 + (i % 4) * 26;
      return {
        x: Math.cos(ang) * dist,
        y: Math.sin(ang) * dist,
        delay: 120 + (i % 5) * 40,
        size: 7 + (i % 3) * 4,
        color: i % 3 === 0 ? '#FFCB05' : i % 3 === 1 ? area.color : '#FFFFFF',
      };
    });
  }, [star.id]);

  // rayos
  const rays = useCelebMemo(() => Array.from({ length: 12 }).map((_, i) => i * 30), [star.id]);

  return (
    <div className="celeb-scrim" onClick={onDone} role="dialog" aria-label={`Encendiste ${star.label}`}>
      <div className="celeb-stage" onClick={(e) => e.stopPropagation()}>
        <div className="celeb-burst">
          {/* rayos */}
          <svg className="celeb-rays" width="320" height="320" viewBox="-160 -160 320 320" aria-hidden="true">
            {rays.map((deg, i) => (
              <line key={i} x1="0" y1="0" x2="0" y2="-150"
                stroke={i % 2 === 0 ? '#FFCB05' : area.color}
                strokeWidth={i % 2 === 0 ? 3 : 2}
                strokeLinecap="round"
                transform={`rotate(${deg})`}
                style={{ animationDelay: `${100 + i * 18}ms` }} />
            ))}
          </svg>

          {/* halo */}
          <span className="celeb-halo" style={{
            filter: `drop-shadow(0 0 24px ${area.color}) drop-shadow(0 0 60px ${area.color})`,
          }} />

          {/* la estrella encendida */}
          <span className="celeb-star" style={{
            filter: `drop-shadow(0 0 10px #fff) drop-shadow(0 0 28px ${area.color}) drop-shadow(0 0 56px ${area.color})`,
          }}>
            <svg width="96" height="96" viewBox="0 0 100 100" aria-hidden="true">
              <polygon points={window.starPolygon(6, 48, 20)} fill="#FFFFFF"
                stroke={area.color} strokeWidth="3" strokeLinejoin="round" />
            </svg>
          </span>

          {/* partículas */}
          {particles.map((p, i) => (
            <span key={i} className="celeb-particle" style={{
              '--px': `${p.x}px`, '--py': `${p.y}px`,
              animationDelay: `${p.delay}ms`,
            }}>
              <svg width={p.size} height={p.size} viewBox="0 0 100 100" aria-hidden="true">
                <polygon points={window.starPolygon(4, 49, 18)} fill={p.color} />
              </svg>
            </span>
          ))}
        </div>

        <div className="celeb-copy">
          <p className="eyebrow celeb-eyebrow">Nueva habilidad</p>
          <h2 className="celeb-title font-heading">
            {star.label}<span style={{ color: '#FFCB05' }}>.</span>
          </h2>
          <p className="celeb-sub">
            Encendiste una estrella en <strong style={{ color: area.color }}>{area.name}</strong>.
          </p>
          <div className="celeb-xp">
            <span className="celeb-xp-pill font-heading">+{xpGain} XP</span>
          </div>
          <button type="button" className="btn btn-highlight celeb-btn" onClick={onDone}>
            Seguí explorando
          </button>
        </div>
      </div>
    </div>
  );
}

window.Celebration = Celebration;
