/* ====================================================================
   Sky — el cielo navegable de constelaciones
   Exporta: window.Sky
   ==================================================================== */
const { useMemo: useSkyMemo } = React;

/* Genera los puntos de una estrella de N puntas (SVG, viewBox 100x100) */
function starPolygon(points, outerR, innerR, cx = 50, cy = 50) {
  const step = Math.PI / points;
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    d += `${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return d.trim();
}

const STAR_SHAPES = {
  sixpoint: starPolygon(6, 48, 20),
  diamond: starPolygon(4, 49, 16),
};

/* Una estrella individual */
function StarNode({ star, area, tweaks, selected, onSelect }) {
  const isDone = star.state === 'done';
  const isAvailable = star.state === 'available';
  const isLocked = star.state === 'locked';
  const mono = tweaks.stateStyle === 'mono';
  const rich = tweaks.density === 'rich';

  // color base de la estrella según estado
  let core, glow, stroke;
  if (isAvailable) {
    core = '#FFCB05'; glow = '#FFCB05'; stroke = '#FFCB05';
  } else if (isDone) {
    core = mono ? '#FFFFFF' : '#FFFFFF';
    glow = mono ? 'rgba(255,255,255,0.9)' : area.color;
    stroke = mono ? 'rgba(255,255,255,0.9)' : area.color;
  } else {
    core = 'transparent';
    glow = 'transparent';
    stroke = 'rgba(255,255,255,0.30)';
  }

  // tamaño del nodo
  const baseSize = isAvailable ? 40 : isDone ? 34 : 24;
  const size = baseSize;

  // glow mediante drop-shadows en capas (no gradientes)
  let filter = 'none';
  if (isAvailable) {
    filter = `drop-shadow(0 0 6px ${glow}) drop-shadow(0 0 18px ${glow}) drop-shadow(0 0 34px ${glow})`;
  } else if (isDone) {
    filter = `drop-shadow(0 0 5px ${glow}) drop-shadow(0 0 14px ${glow})`;
  }

  // forma SVG
  const shape = tweaks.starShape;
  let shapeEl;
  if (shape === 'dot') {
    shapeEl = (
      <circle cx="50" cy="50" r={isLocked ? 22 : 30}
        fill={core} stroke={stroke}
        strokeWidth={isLocked ? 4 : core === 'transparent' ? 4 : 0} />
    );
  } else {
    const pts = STAR_SHAPES[shape] || STAR_SHAPES.sixpoint;
    shapeEl = (
      <polygon points={pts}
        fill={core} stroke={stroke}
        strokeWidth={isLocked ? 4 : core === 'transparent' ? 4 : 3}
        strokeLinejoin="round" />
    );
  }

  // animación de parpadeo / pulso
  const twinkleDelay = (star.x * 13 + star.y * 7) % 4000;
  const nodeClass =
    'star-node' +
    (isAvailable ? ' star-available' : '') +
    (isDone ? ' star-done' : '') +
    (selected ? ' star-selected' : '');

  // pips de maestría
  const showPips = (rich && (isDone || isAvailable)) || selected;
  const pipColor = mono ? '#FFFFFF' : isAvailable ? '#FFCB05' : area.color;

  // label visible?
  const showLabel = rich || isAvailable || selected;

  return (
    <button
      type="button"
      className={nodeClass}
      onClick={(e) => { e.stopPropagation(); onSelect(star.id); }}
      style={{
        left: star.x, top: star.y,
        '--twinkle-delay': `${twinkleDelay}ms`,
      }}
      aria-label={star.label}
    >
      {/* anillo de selección */}
      {selected && (
        <span className="star-ring" style={{
          width: size + 26, height: size + 26,
          borderColor: isAvailable ? '#FFCB05' : isDone ? (mono ? '#fff' : area.color) : 'rgba(255,255,255,0.5)',
        }} />
      )}

      {/* pips de maestría */}
      {showPips && (
        <span className="star-pips" style={{ top: -16 }}>
          {[0, 1, 2].map((i) => (
            <svg key={i} width="9" height="9" viewBox="0 0 100 100" aria-hidden="true">
              <polygon points={starPolygon(5, 48, 20)}
                fill={i < star.mastery ? pipColor : 'transparent'}
                stroke={i < star.mastery ? pipColor : 'rgba(255,255,255,0.35)'}
                strokeWidth="6" strokeLinejoin="round" />
            </svg>
          ))}
        </span>
      )}

      {/* la estrella */}
      <span className="star-glyph" style={{ width: size, height: size, filter }}>
        <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
          {shapeEl}
        </svg>
      </span>

      {/* candado para bloqueadas */}
      {isLocked && (
        <span className="star-lock" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.55)" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
      )}

      {/* etiqueta */}
      {showLabel && (
        <span className={'star-label' + (isLocked ? ' star-label-locked' : '')}
          style={{ top: size + 6 }}>
          {star.label}
        </span>
      )}
    </button>
  );
}

function Sky({ stars, tweaks, selectedId, onSelectStar, justLit }) {
  const board = window.JOURNEY.BOARD;
  const edges = window.JOURNEY.EDGES;
  const cons = window.JOURNEY.CONSTELLATIONS;
  const starById = useSkyMemo(() => {
    const m = {};
    stars.forEach((s) => { m[s.id] = s; });
    return m;
  }, [stars]);

  const showLines = tweaks.pathStyle !== 'none';
  const dashFor = (kind) => {
    if (tweaks.pathStyle === 'dashed') return '10 9';
    if (tweaks.pathStyle === 'dotted') return '2 8';
    if (tweaks.pathStyle === 'solid') return 'none';
    // auto: depende del estado del tramo
    return kind === 'locked' ? '2 9' : kind === 'active' ? '9 8' : 'none';
  };

  return (
    <div className="sky-board" style={{ width: board.w, height: board.h }}
      onClick={() => onSelectStar(null)}>

      {/* geometría FWD fast-forward, flotando a la derecha */}
      <svg className="fwd-geo" viewBox="0 0 1500 1150" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="1150,-100 1300,-100 1480,500 1300,1250 1150,1250 1330,500" fill="rgba(255,255,255,0.04)" />
        <polygon points="1290,-100 1440,-100 1620,500 1440,1250 1290,1250 1470,500" fill="rgba(255,255,255,0.07)" />
        <polygon points="1430,-100 1580,-100 1760,500 1580,1250 1430,1250 1610,500" fill="rgba(255,255,255,0.10)" />
      </svg>

      {/* líneas del camino */}
      {showLines && (
        <svg className="edge-layer" viewBox={`0 0 ${board.w} ${board.h}`} aria-hidden="true">
          {edges.map(([a, b], i) => {
            const sa = starById[a], sb = starById[b];
            if (!sa || !sb) return null;
            const aDone = sa.state === 'done', bDone = sb.state === 'done';
            const aAvail = sa.state === 'available', bAvail = sb.state === 'available';
            let kind = 'locked';
            if (aDone && bDone) kind = 'traced';
            else if ((aDone && bAvail) || (bDone && aAvail)) kind = 'active';

            const mono = tweaks.stateStyle === 'mono';
            const areaColor = mono ? 'rgba(255,255,255,0.8)' : (cons[sa.area]?.color || '#fff');
            let stroke, width, opacity, glow;
            if (kind === 'traced') {
              stroke = areaColor; width = 2.5; opacity = 0.55;
              glow = mono ? 'rgba(255,255,255,0.5)' : areaColor;
            } else if (kind === 'active') {
              stroke = '#FFCB05'; width = 2.5; opacity = 0.95; glow = '#FFCB05';
            } else {
              stroke = 'rgba(255,255,255,0.9)'; width = 1.5; opacity = 0.16; glow = 'transparent';
            }
            return (
              <line key={i}
                className={'edge edge-' + kind}
                x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
                stroke={stroke} strokeWidth={width}
                strokeOpacity={opacity}
                strokeDasharray={dashFor(kind)}
                strokeLinecap="round"
                style={glow !== 'transparent' ? { filter: `drop-shadow(0 0 4px ${glow})` } : undefined}
              />
            );
          })}
        </svg>
      )}

      {/* etiquetas de constelación */}
      {Object.values(cons).map((c) => {
        const mono = tweaks.stateStyle === 'mono';
        return (
          <div key={c.id} className="cons-label" style={{ left: c.label.x, top: c.label.y }}>
            <span className="cons-name eyebrow" style={{ color: mono ? 'rgba(255,255,255,0.92)' : c.color }}>
              {c.name}
            </span>
            {tweaks.density === 'rich' && (
              <span className="cons-tagline">{c.tagline}</span>
            )}
          </div>
        );
      })}

      {/* estrellas */}
      {stars.map((s) => (
        <StarNode key={s.id} star={s} area={cons[s.area]}
          tweaks={tweaks} selected={selectedId === s.id}
          onSelect={onSelectStar} />
      ))}
    </div>
  );
}

window.Sky = Sky;
window.starPolygon = starPolygon;
