export function FwdGeoBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Right chevron group — fast-forward >> pointing right */}
      <polygon
        points="1160,-100 1310,-100 1460,450 1310,1000 1160,1000 1310,450"
        fill="white"
        fillOpacity={0.04}
      />
      <polygon
        points="1310,-100 1460,-100 1610,450 1460,1000 1310,1000 1460,450"
        fill="white"
        fillOpacity={0.07}
      />
      <polygon
        points="1460,-100 1610,-100 1760,450 1610,1000 1460,1000 1610,450"
        fill="white"
        fillOpacity={0.11}
      />

    </svg>
  );
}
