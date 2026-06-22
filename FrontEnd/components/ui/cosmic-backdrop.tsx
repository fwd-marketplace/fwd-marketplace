export function CosmicBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0.8;
          animation: twinkle var(--duration, 3s) infinite ease-in-out;
        }
        .meteor {
          position: absolute;
          width: 2px;
          height: 100px;
          background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));
          transform: rotate(45deg);
          animation: meteor var(--duration, 4s) linear infinite;
          opacity: 0;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes meteor {
          0% { top: -20%; left: var(--start-x); opacity: 1; height: 50px; }
          100% { top: 120%; left: calc(var(--start-x) - 140%); opacity: 0; height: 150px; }
        }
        .constellation {
          position: absolute;
          opacity: 0.4;
          animation: twinkle 6s infinite ease-in-out alternate;
        }
      `}</style>
      
      {/* Constelación 1: Osa Mayor simulada */}
      <svg className="constellation" style={{ top: '15%', left: '15%', width: '180px', height: '180px', animationDelay: '0s' }} viewBox="0 0 100 100">
        <polyline points="10,20 30,30 50,20 70,50 90,60 80,80 60,70 70,50" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        <circle cx="10" cy="20" r="1.5" fill="white" />
        <circle cx="30" cy="30" r="1.5" fill="white" />
        <circle cx="50" cy="20" r="1.5" fill="white" />
        <circle cx="70" cy="50" r="1.5" fill="white" />
        <circle cx="90" cy="60" r="1.5" fill="white" />
        <circle cx="80" cy="80" r="1.5" fill="white" />
        <circle cx="60" cy="70" r="1.5" fill="white" />
      </svg>

      {/* Constelación 2: Casiopea simulada */}
      <svg className="constellation" style={{ top: '65%', left: '75%', width: '150px', height: '150px', animationDelay: '1.5s' }} viewBox="0 0 100 100">
        <polyline points="10,50 30,20 50,40 70,15 90,60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        <circle cx="10" cy="50" r="1.5" fill="white" />
        <circle cx="30" cy="20" r="1.5" fill="white" />
        <circle cx="50" cy="40" r="1.5" fill="white" />
        <circle cx="70" cy="15" r="1.5" fill="white" />
        <circle cx="90" cy="60" r="1.5" fill="white" />
      </svg>

      {/* Constelación 3: Orión simulado */}
      <svg className="constellation" style={{ top: '45%', left: '5%', width: '220px', height: '220px', animationDelay: '3s' }} viewBox="0 0 100 100">
        <polyline points="20,10 80,15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <polyline points="20,10 35,45 65,50 80,15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        <polyline points="35,45 45,50 55,48 65,50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
        <polyline points="35,45 25,90 75,85 65,50" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        <circle cx="20" cy="10" r="1.5" fill="white" />
        <circle cx="80" cy="15" r="1.5" fill="white" />
        <circle cx="35" cy="45" r="1.5" fill="white" />
        <circle cx="45" cy="50" r="1.5" fill="white" />
        <circle cx="55" cy="48" r="1.5" fill="white" />
        <circle cx="65" cy="50" r="1.5" fill="white" />
        <circle cx="25" cy="90" r="1.5" fill="white" />
        <circle cx="75" cy="85" r="1.5" fill="white" />
      </svg>

      {/* Constelación 4: Aleatoria */}
      <svg className="constellation" style={{ top: '25%', left: '75%', width: '120px', height: '120px', animationDelay: '4.5s' }} viewBox="0 0 100 100">
        <polyline points="10,80 30,50 60,60 80,20 90,40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        <circle cx="10" cy="80" r="1.5" fill="white" />
        <circle cx="30" cy="50" r="1.5" fill="white" />
        <circle cx="60" cy="60" r="1.5" fill="white" />
        <circle cx="80" cy="20" r="1.5" fill="white" />
        <circle cx="90" cy="40" r="1.5" fill="white" />
      </svg>

      {/* Generate some stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className="star"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            ['--duration' as any]: `${Math.random() * 4 + 2}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      {/* Generate some meteors */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`meteor-${i}`}
          className="meteor"
          style={{
            ['--start-x' as any]: `${Math.random() * 150 + 50}%`,
            ['--duration' as any]: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}
