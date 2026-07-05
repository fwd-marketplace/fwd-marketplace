interface Star {
  x: string;
  y: string;
  size: number;
  opacity: number;
  rotate?: number;
}

interface Props {
  stars: Star[];
}

export function StarDecoration({ stars }: Props) {
  return (
    <>
      {stars.map((star, i) => (
        <svg
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            transform: `rotate(${star.rotate ?? 0}deg)`,
            color: "#FFCB05",
            pointerEvents: "none",
            zIndex: 0,
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 1 L13.3 10.7 L23 12 L13.3 13.3 L12 23 L10.7 13.3 L1 12 L10.7 10.7 Z" />
        </svg>
      ))}
    </>
  );
}
