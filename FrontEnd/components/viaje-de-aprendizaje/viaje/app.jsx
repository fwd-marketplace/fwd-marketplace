/* ====================================================================
   App — orquesta estado, navegación del cielo, encendido y tweaks
   ==================================================================== */
const { useState, useEffect, useRef, useCallback, useMemo } = React;

/* mapeos label (panel) -> clave interna */
const SHAPE_MAP = { '6 puntas': 'sixpoint', 'Punto de luz': 'dot', 'Diamante': 'diamond' };
const PATH_MAP = { 'Automático': 'auto', 'Sólido': 'solid', 'Guiones': 'dashed', 'Punteado': 'dotted', 'Sin líneas': 'none' };
const STATE_MAP = { 'Multicolor': 'multicolor', 'Mono (blanco)': 'mono' };
const DENS_MAP = { 'Completa': 'rich', 'Mínima': 'minimal' };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "starShape": "6 puntas",
  "pathStyle": "Automático",
  "stateLook": "Multicolor",
  "density": "Completa"
}/*EDITMODE-END*/;

/* recalcula disponibilidad: una estrella no-encendida con vecino encendido => disponible */
function recompute(stars) {
  const doneSet = new Set(stars.filter((s) => s.state === 'done').map((s) => s.id));
  const adj = {};
  window.JOURNEY.EDGES.forEach(([a, b]) => {
    (adj[a] = adj[a] || []).push(b);
    (adj[b] = adj[b] || []).push(a);
  });
  return stars.map((s) => {
    if (s.state === 'done') return s;
    const open = (adj[s.id] || []).some((n) => doneSet.has(n));
    return { ...s, state: open ? 'available' : 'locked' };
  });
}

/* starfield ambiental (decorativo, no panea con el board) */
function Starfield() {
  const dots = useMemo(() => {
    const arr = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 70; i++) {
      arr.push({
        x: rnd() * 100, y: rnd() * 100,
        s: 1 + rnd() * 2.2,
        o: 0.15 + rnd() * 0.5,
        d: rnd() * 5000,
      });
    }
    return arr;
  }, []);
  return (
    <div className="starfield" aria-hidden="true">
      {dots.map((d, i) => (
        <span key={i} style={{
          left: `${d.x}%`, top: `${d.y}%`,
          width: d.s, height: d.s,
          opacity: d.o, animationDelay: `${d.d}ms`,
        }} />
      ))}
    </div>
  );
}

function ZoomControls({ onIn, onOut, onFit }) {
  return (
    <div className="zoom-ctrls">
      <button type="button" onClick={onIn} aria-label="Acercar">+</button>
      <button type="button" onClick={onFit} aria-label="Ver todo el cielo">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" />
        </svg>
      </button>
      <button type="button" onClick={onOut} aria-label="Alejar">−</button>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const tweaks = {
    starShape: SHAPE_MAP[t.starShape] || 'sixpoint',
    pathStyle: PATH_MAP[t.pathStyle] || 'auto',
    stateStyle: STATE_MAP[t.stateLook] || 'multicolor',
    density: DENS_MAP[t.density] || 'rich',
  };

  const [stars, setStars] = useState(() => recompute(window.JOURNEY.STARS.map((s) => ({ ...s }))));
  const [selectedId, setSelectedId] = useState(null);
  const [celeb, setCeleb] = useState(null);
  const [xp, setXp] = useState(() =>
    window.JOURNEY.STARS.filter((s) => s.state === 'done').reduce((a, s) => a + s.mastery * 100, 0)
  );

  const cons = window.JOURNEY.CONSTELLATIONS;
  const board = window.JOURNEY.BOARD;

  const progress = useMemo(() => ({
    lit: stars.filter((s) => s.state === 'done').length,
    total: stars.length,
  }), [stars]);

  const nextStar = useMemo(() => stars.find((s) => s.state === 'available') || null, [stars]);
  const selected = stars.find((s) => s.id === selectedId) || null;

  /* -------- pan / zoom -------- */
  const [tf, setTf] = useState({ x: 0, y: 0, scale: 0.7 });
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef(null);
  const drag = useRef(null);

  const clamp = useCallback((nx, ny, scale) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const bw = board.w * scale, bh = board.h * scale;
    const margin = 160;
    const minX = Math.min(margin, vw - bw - margin);
    const maxX = Math.max(vw - bw - margin, margin) === margin ? margin : margin;
    const lo_x = vw - bw - margin, hi_x = margin;
    const lo_y = vh - bh - margin, hi_y = margin;
    return {
      x: Math.max(Math.min(nx, hi_x), lo_x),
      y: Math.max(Math.min(ny, hi_y), lo_y),
    };
  }, [board]);

  const fitAll = useCallback(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const scale = Math.min((vw - 60) / board.w, (vh - 220) / board.h);
    const s = Math.max(Math.min(scale, 1), 0.18);
    setTf({ x: (vw - board.w * s) / 2, y: (vh - board.h * s) / 2 + 12, scale: s });
  }, [board]);

  const initFit = useCallback(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const isMobile = vw < 760;
    const s = isMobile ? 0.6 : Math.max(Math.min(Math.min(vw / 1520, vh / 1180), 0.9), 0.6);
    const focusX = 660, focusY = 540;
    let x = vw / 2 - focusX * s;
    let y = vh / 2 - focusY * s;
    const c = clamp(x, y, s);
    setTf({ x: c.x, y: c.y, scale: s });
  }, [clamp]);

  useEffect(() => { initFit(); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    const onR = () => initFit();
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, [initFit]);

  const onPointerDown = (e) => {
    if (e.target.closest('.star-node')) return; // dejar que la estrella maneje el click
    drag.current = { sx: e.clientX, sy: e.clientY, ox: tf.x, oy: tf.y, moved: false };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true;
    const c = clamp(drag.current.ox + dx, drag.current.oy + dy, tf.scale);
    setTf((p) => ({ ...p, x: c.x, y: c.y }));
  };
  const onPointerUp = () => {
    const wasDrag = drag.current;
    drag.current = null;
    setDragging(false);
    // solo deseleccionar si fue un tap en vacío (no sobre una estrella) sin arrastre
    if (wasDrag && !wasDrag.moved) setSelectedId(null);
  };

  const zoom = (factor) => {
    setTf((p) => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const ns = Math.max(Math.min(p.scale * factor, 1.5), 0.18);
      // zoom hacia el centro de viewport
      const cx = vw / 2, cy = vh / 2;
      const bx = (cx - p.x) / p.scale, by = (cy - p.y) / p.scale;
      let nx = cx - bx * ns, ny = cy - by * ns;
      const c = clamp(nx, ny, ns);
      return { x: c.x, y: c.y, scale: ns };
    });
  };

  const centerOn = useCallback((x, y) => {
    setTf((p) => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const isMobile = vw < 760;
      const targetSX = isMobile ? vw / 2 : (vw - 412) / 2;
      const targetSY = isMobile ? vh * 0.32 : vh * 0.46;
      let nx = targetSX - x * p.scale;
      let ny = targetSY - y * p.scale;
      const c = clamp(nx, ny, p.scale);
      return { ...p, x: c.x, y: c.y };
    });
  }, [clamp]);

  /* -------- acciones -------- */
  const selectStar = (id) => setSelectedId(id);

  const openFromGoal = (id) => {
    const s = stars.find((x) => x.id === id);
    if (s) centerOn(s.x, s.y);
    setTimeout(() => setSelectedId(id), 60);
  };

  const lightStar = (id) => {
    const s = stars.find((x) => x.id === id);
    if (!s) return;
    setSelectedId(null);
    const lit = { ...s, state: 'done', mastery: 1, unlockedDate: 'hoy', via: s.via };
    setCeleb({ star: lit, area: cons[s.area], xpGain: 100 });
    setStars((prev) => recompute(prev.map((x) => (x.id === id ? lit : x))));
    setXp((v) => v + 100);
  };

  const closeCeleb = () => setCeleb(null);

  return (
    <>
      <Starfield />

      <div
        ref={stageRef}
        className={'stage' + (dragging ? ' dragging' : '')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="sky-pan"
          style={{
            transform: `translate(${tf.x}px, ${tf.y}px) scale(${tf.scale})`,
            transition: dragging ? 'none' : 'transform var(--duration-slow) var(--ease-out)',
          }}
        >
          <Sky
            stars={stars}
            tweaks={tweaks}
            selectedId={selectedId}
            onSelectStar={selectStar}
          />
        </div>
      </div>

      <HeaderBar progress={progress} xp={xp} streak={window.JOURNEY.META.streakDays} level={window.JOURNEY.META.level} />

      <Legend />
      <ZoomControls onIn={() => zoom(1.25)} onOut={() => zoom(0.8)} onFit={fitAll} />

      <GoalBar nextStar={nextStar} area={nextStar ? cons[nextStar.area] : null} onOpen={openFromGoal} />

      {selected && (
        <DetailPanel
          star={selected}
          area={cons[selected.area]}
          onClose={() => setSelectedId(null)}
          onLight={lightStar}
        />
      )}

      {celeb && (
        <Celebration star={celeb.star} area={celeb.area} xpGain={celeb.xpGain} onDone={closeCeleb} />
      )}

      <TweaksPanel>
        <TweakSection label="Estrellas" />
        <TweakRadio label="Forma" value={t.starShape}
          options={['6 puntas', 'Punto de luz', 'Diamante']}
          onChange={(v) => setTweak('starShape', v)} />
        <TweakSection label="Camino" />
        <TweakSelect label="Trazado" value={t.pathStyle}
          options={['Automático', 'Sólido', 'Guiones', 'Punteado', 'Sin líneas']}
          onChange={(v) => setTweak('pathStyle', v)} />
        <TweakSection label="Lectura" />
        <TweakRadio label="Estados" value={t.stateLook}
          options={['Multicolor', 'Mono (blanco)']}
          onChange={(v) => setTweak('stateLook', v)} />
        <TweakRadio label="Densidad" value={t.density}
          options={['Completa', 'Mínima']}
          onChange={(v) => setTweak('density', v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
