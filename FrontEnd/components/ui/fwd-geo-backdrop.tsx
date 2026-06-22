export function FwdGeoBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <polygon
        points="1200,-100 1350,-100 1500,400 1350,900 1200,900 1350,400"
        fill="var(--secondary)"
        fillOpacity={0.04}
      />
      <polygon
        points="1320,-100 1470,-100 1620,400 1470,900 1320,900 1470,400"
        fill="var(--secondary)"
        fillOpacity={0.07}
      />
      <polygon
        points="1440,-100 1590,-100 1740,400 1590,900 1440,900 1590,400"
        fill="var(--secondary)"
        fillOpacity={0.10}
      />
    </svg>
  );
}
