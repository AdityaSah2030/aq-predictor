/**
 * CPCB Air Quality Index calculation for PM2.5.
 * Piecewise linear interpolation according to official Indian National AQI standards.
 */

export interface AQIResult {
  aqi: number;
  category: string;
  colorToken: string;
  textColor: string;
}

export const CPCB_BREAKPOINTS = [
  { bpLo: 0.0, bpHi: 30.0, iLo: 0, iHi: 50, category: "Good", colorToken: "--aqi-good", textColor: "#FFFFFF" },
  { bpLo: 30.0, bpHi: 60.0, iLo: 51, iHi: 100, category: "Satisfactory", colorToken: "--aqi-satisfactory", textColor: "#0F172A" },
  { bpLo: 60.0, bpHi: 90.0, iLo: 101, iHi: 200, category: "Moderately polluted", colorToken: "--aqi-moderate", textColor: "#0F172A" },
  { bpLo: 90.0, bpHi: 120.0, iLo: 201, iHi: 300, category: "Poor", colorToken: "--aqi-poor", textColor: "#0F172A" },
  { bpLo: 120.0, bpHi: 250.0, iLo: 301, iHi: 400, category: "Very poor", colorToken: "--aqi-verypoor", textColor: "#FFFFFF" },
  { bpLo: 250.0, bpHi: 500.0, iLo: 401, iHi: 500, category: "Severe", colorToken: "--aqi-severe", textColor: "#FFFFFF" },
];

export function computePM25AQI(pm25: number): AQIResult {
  if (pm25 === null || pm25 === undefined || isNaN(pm25) || pm25 < 0) {
    return { aqi: 0, category: "Good", colorToken: "--aqi-good", textColor: "#FFFFFF" };
  }

  const c = Math.round(pm25 * 10) / 10;

  if (c >= 250.0) {
    const aqi = Math.min(500, Math.max(401, 401.0 + ((500.0 - 401.0) / (500.0 - 250.0)) * (c - 250.0)));
    return { aqi: Math.round(aqi), category: "Severe", colorToken: "--aqi-severe", textColor: "#FFFFFF" };
  }

  for (const bp of CPCB_BREAKPOINTS) {
    if (c >= bp.bpLo && c <= bp.bpHi) {
      const aqi = ((bp.iHi - bp.iLo) / (bp.bpHi - bp.bpLo)) * (c - bp.bpLo) + bp.iLo;
      return { aqi: Math.round(aqi), category: bp.category, colorToken: bp.colorToken, textColor: bp.textColor };
    }
  }

  return { aqi: 500, category: "Severe", colorToken: "--aqi-severe", textColor: "#FFFFFF" };
}

export function getCategoryBadgeStyle(category: string): { bg: string; color: string } {
  switch (category) {
    case "Good":
      return { bg: "var(--aqi-good)", color: "var(--aqi-good-ink)" };
    case "Satisfactory":
      return { bg: "var(--aqi-satisfactory)", color: "var(--aqi-satisfactory-ink)" };
    case "Moderately polluted":
      return { bg: "var(--aqi-moderate)", color: "var(--aqi-moderate-ink)" };
    case "Poor":
      return { bg: "var(--aqi-poor)", color: "var(--aqi-poor-ink)" };
    case "Very poor":
      return { bg: "var(--aqi-verypoor)", color: "var(--aqi-verypoor-ink)" };
    case "Severe":
      return { bg: "var(--aqi-severe)", color: "var(--aqi-severe-ink)" };
    default:
      return { bg: "var(--bg-tertiary)", color: "var(--text-primary)" };
  }
}
