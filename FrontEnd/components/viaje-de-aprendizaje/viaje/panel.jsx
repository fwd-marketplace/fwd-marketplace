/* ====================================================================
   UI chrome — Header, GoalBar, Legend, DetailPanel
   Exporta: window.HeaderBar, window.GoalBar, window.Legend, window.DetailPanel
   ==================================================================== */

/* ---------- iconos lucide-outline inline ---------- */
function Ico({ d, size = 15, stroke = 'currentColor', sw = 2, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {children || <path d={d} />}
    </svg>
  );
}
const IcoStar = (p) => <Ico {...p}><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" /></Ico>;
const IcoSpark = (p) => <Ico {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></Ico>;
const IcoFlame = (p) => <Ico {...p}><path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-1-4 2 1 3 3 3 5a6 6 0 1 1-12 0c0-5 6-6 6-10z" /></Ico>;
const IcoChevL = (p) => <Ico {...p}><path d="M15 18l-6-6 6-6" /></Ico>;
const IcoX = (p) => <Ico {...p}><path d="M18 6 6 18M6 6l12 12" /></Ico>;
const IcoLock = (p) => <Ico {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Ico>;
const IcoArrow = (p) => <Ico {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Ico>;

/* ---------- chip de stat (header) ---------- */
function StatChip({ icon, value, label, color, unit }) {
  return (
    <div className="stat-chip">
      <span className="stat-chip-ico" style={{ color }}>{icon}</span>
      <span className="stat-chip-val font-heading">
        {value}{unit && label ? <span className="stat-chip-unit">{label}</span> : null}
      </span>
      {label && !unit ? <span className="stat-chip-label">{label}</span> : null}
    </div>
  );
}

/* ---------- Header ---------- */
function HeaderBar({ progress, xp, streak, level }) {
  const pct = Math.round((progress.lit / progress.total) * 100);
  return (
    <header className="hdr">
      <div className="hdr-row">
        <button type="button" className="hdr-back" aria-label="Volver al perfil">
          <IcoChevL size={20} />
        </button>
        <div className="hdr-titles">
          <p className="eyebrow hdr-eyebrow">Viaje de aprendizaje</p>
          <h1 className="font-heading hdr-h1">
            Tu cielo<span style={{ color: '#FFCB05' }}>.</span>
          </h1>
        </div>
        <div className="hdr-stats">
          <StatChip icon={<IcoStar size={14} />} value={`${progress.lit}/${progress.total}`} label="" color="#20BEC6" />
          <StatChip icon={<IcoSpark size={14} />} value={`${xp.toLocaleString('de-DE')}`} label="XP" unit color="#FFCB05" />
          <StatChip icon={<IcoFlame size={14} />} value={`${streak}`} label="días" unit color="#F7901E" />
        </div>
      </div>
      <div className="hdr-progress">
        <div className="hdr-progress-meta">
          <span className="hdr-level eyebrow">{level}</span>
          <span className="hdr-pct">{pct}% del cielo iluminado</span>
        </div>
        <div className="hdr-bar-track">
          <div className="hdr-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </header>
  );
}

/* ---------- Barra de próxima meta (abajo) ---------- */
function GoalBar({ nextStar, area, onOpen }) {
  if (!nextStar) {
    return (
      <div className="goalbar goalbar-done">
        <div className="goalbar-text">
          <p className="eyebrow" style={{ color: '#20BEC6' }}>Cielo completo</p>
          <p className="goalbar-title font-heading">Encendiste todas las estrellas.</p>
        </div>
      </div>
    );
  }
  return (
    <button type="button" className="goalbar" onClick={() => onOpen(nextStar.id)}>
      <span className="goalbar-dot" style={{ background: '#FFCB05' }} />
      <div className="goalbar-text">
        <p className="eyebrow" style={{ color: '#FFCB05' }}>Tu próxima estrella</p>
        <p className="goalbar-title font-heading">{nextStar.label}<span style={{ color: area.color }}>.</span></p>
      </div>
      <span className="goalbar-cta">
        Ver cómo <IcoArrow size={15} />
      </span>
    </button>
  );
}

/* ---------- Leyenda ---------- */
function Legend() {
  const items = [
    { c: '#20BEC6', t: 'Encendida' },
    { c: '#FFCB05', t: 'Disponible' },
    { c: 'rgba(255,255,255,0.30)', t: 'Bloqueada', outline: true },
  ];
  return (
    <div className="legend">
      {items.map((it) => (
        <span key={it.t} className="legend-item">
          <span className="legend-dot" style={{
            background: it.outline ? 'transparent' : it.c,
            border: it.outline ? `2px solid ${it.c}` : 'none',
          }} />
          {it.t}
        </span>
      ))}
    </div>
  );
}

/* ---------- Pips de maestría (panel) ---------- */
function MasteryPips({ value, color }) {
  return (
    <span className="pips-row">
      {[0, 1, 2].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 100 100" aria-hidden="true">
          <polygon points={window.starPolygon(5, 48, 20)}
            fill={i < value ? color : 'transparent'}
            stroke={i < value ? color : 'var(--border-strong)'}
            strokeWidth="7" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

/* ---------- Panel / hoja de detalle ---------- */
function DetailPanel({ star, area, onClose, onLight }) {
  if (!star) return null;
  const isDone = star.state === 'done';
  const isAvailable = star.state === 'available';
  const isLocked = star.state === 'locked';

  const statePill = isDone
    ? { t: 'Encendida', bg: '#E8F9FA', fg: '#0e8a90' }
    : isAvailable
    ? { t: 'Disponible', bg: '#FFFBE6', fg: '#8a6e00' }
    : { t: 'Bloqueada', bg: '#F0F1F6', fg: '#6B6F85' };

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <aside className={'sheet' + (isAvailable ? ' sheet-available' : '')} role="dialog" aria-label={star.label}>
        <div className="sheet-grip" />
        <button type="button" className="sheet-close" onClick={onClose} aria-label="Cerrar">
          <IcoX size={18} />
        </button>

        <div className="sheet-head">
          <span className="area-chip" style={{ color: area.color, borderColor: area.color }}>
            <span className="area-chip-dot" style={{ background: area.color }} />
            {area.name}
          </span>
          <span className="state-pill" style={{ background: statePill.bg, color: statePill.fg }}>
            {isLocked && <IcoLock size={11} stroke={statePill.fg} />}
            {statePill.t}
          </span>
        </div>

        <h2 className="sheet-title font-heading">
          {star.label}<span style={{ color: area.color }}>.</span>
        </h2>

        <p className="sheet-what">{star.whatItIs}</p>

        {/* maestría */}
        <div className="sheet-mastery">
          <div className="sheet-mastery-head">
            <span className="eyebrow sheet-meyebrow">Maestría</span>
            <span className="sheet-mval font-heading" style={{ color: isDone ? area.color : 'var(--ink-subtle)' }}>
              {star.mastery} / 3
            </span>
          </div>
          <MasteryPips value={star.mastery} color={isDone ? area.color : 'var(--border-strong)'} />
        </div>

        {/* estado / cómo desbloquear */}
        {isDone && (
          <div className="sheet-note sheet-note-done">
            <span className="eyebrow" style={{ color: '#0e8a90' }}>Encendida</span>
            <p className="sheet-note-body">
              La encendiste el <strong>{star.unlockedDate}</strong> completando <strong>{star.via}</strong>.
            </p>
          </div>
        )}

        {isAvailable && (
          <>
            <div className="sheet-note sheet-note-available">
              <span className="eyebrow" style={{ color: '#8a6e00' }}>Cómo encenderla</span>
              <p className="sheet-note-body">{star.howToUnlock}</p>
            </div>
            <div className="sheet-actions">
              <button type="button" className="btn btn-primary" onClick={() => onLight(star.id)}>
                Encender estrella
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Más tarde</button>
            </div>
          </>
        )}

        {isLocked && (
          <div className="sheet-note sheet-note-locked">
            <span className="eyebrow" style={{ color: '#6B6F85' }}>Cómo desbloquearla</span>
            <p className="sheet-note-body">{star.howToUnlock}</p>
            <p className="sheet-via">Te espera en <strong>{star.via}</strong>.</p>
          </div>
        )}
      </aside>
    </>
  );
}

window.HeaderBar = HeaderBar;
window.GoalBar = GoalBar;
window.Legend = Legend;
window.DetailPanel = DetailPanel;
