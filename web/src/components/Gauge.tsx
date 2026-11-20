import React from "react";
import { AQIBadge } from "./AQIBadge";

interface GaugeProps {
  aqi: number;
  category: string;
  dateStr?: string;
  size?: number;
}

export const Gauge: React.FC<GaugeProps> = ({ aqi, category, dateStr, size = 260 }) => {
  // Semicircle gauge: 180 degrees. 6 arcs corresponding to CPCB categories.
  // Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401-500)
  // Each category occupies an equal 30-degree arc slice for balanced visualization.

  const radius = size * 0.42;
  const strokeWidth = size * 0.08;
  const center = size / 2;

  const categories = [
    { name: "Good", color: "var(--aqi-good)" },
    { name: "Satisfactory", color: "var(--aqi-satisfactory)" },
    { name: "Moderately polluted", color: "var(--aqi-moderate)" },
    { name: "Poor", color: "var(--aqi-poor)" },
    { name: "Very poor", color: "var(--aqi-verypoor)" },
    { name: "Severe", color: "var(--aqi-severe)" },
  ];

  // Map AQI (0 to 500) to angle (-180 to 0 degrees)
  // Map linearly within category slices
  const categoryBounds = [0, 50, 100, 200, 300, 400, 500];
  let sliceIndex = 0;
  for (let i = 0; i < 6; i++) {
    if (aqi >= categoryBounds[i] && aqi <= categoryBounds[i + 1]) {
      sliceIndex = i;
      break;
    }
  }
  if (aqi > 500) sliceIndex = 5;

  const loVal = categoryBounds[sliceIndex];
  const hiVal = categoryBounds[sliceIndex + 1];
  const frac = hiVal > loVal ? (Math.min(hiVal, Math.max(loVal, aqi)) - loVal) / (hiVal - loVal) : 0;
  const targetAngleDeg = 180 + (sliceIndex + frac) * 30; // 180 to 360 deg (or -180 to 0)

  // Arcs generation
  const createArc = (startAngleDeg: number, endAngleDeg: number) => {
    const startRad = (startAngleDeg * Math.PI) / 180;
    const endRad = (endAngleDeg * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };

  // Needle tip coordinates
  const needleAngleRad = (targetAngleDeg * Math.PI) / 180;
  const needleLength = radius - strokeWidth / 2 - 4;
  const nx = center + needleLength * Math.cos(needleAngleRad);
  const ny = center + needleLength * Math.sin(needleAngleRad);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: size }}>
      <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`}>
        <defs>
          <filter id="needle-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 6 colored arcs with 4px gap */}
        {categories.map((cat, i) => {
          const start = 180 + i * 30 + 1.5;
          const end = 180 + (i + 1) * 30 - 1.5;
          return (
            <path
              key={cat.name}
              d={createArc(start, end)}
              fill="none"
              stroke={cat.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        })}

        {/* Needle */}
        <line
          x1={center}
          y1={center}
          x2={nx}
          y2={ny}
          stroke="var(--text-primary)"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#needle-shadow)"
          style={{ transition: "all 0.8s cubic-bezier(.2,.8,.2,1)" }}
        />

        {/* Needle center hub */}
        <circle cx={center} cy={center} r="7" fill="var(--text-primary)" />
        <circle cx={center} cy={center} r="3.5" fill="var(--bg-secondary)" />
      </svg>

      <div style={{ marginTop: "-1.5rem", textAlign: "center" }}>
        <div style={{
          fontSize: "2.5rem",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "var(--text-primary)",
          lineHeight: 1
        }} className="tabular">
          {aqi}
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
          PM₂.₅ AQI Sub-index
        </div>
        <div style={{ marginTop: "0.6rem" }}>
          <AQIBadge category={category} />
        </div>
        {dateStr && (
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            {dateStr}
          </div>
        )}
      </div>
    </div>
  );
};
