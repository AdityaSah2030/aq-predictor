import React from "react";

interface CorrelationHeatmapProps {
  correlations: Record<string, Record<string, number>>;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ correlations }) => {
  const variables = Object.keys(correlations);
  const labels: Record<string, string> = {
    pm25: "PM2.5",
    temp_c: "Temp",
    rh_pct: "Humidity",
    wind_kmh: "Wind",
    rain_mm: "Rain",
    pressure_hpa: "Pressure"
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: "400px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "0.8125rem" }}>
          <thead>
            <tr>
              <th style={{ padding: "0.5rem", borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                r
              </th>
              {variables.map((v) => (
                <th key={v} style={{ padding: "0.5rem", borderBottom: "1px solid var(--border-color)", fontWeight: 700, color: "var(--text-primary)" }}>
                  {labels[v] || v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variables.map((rowV) => (
              <tr key={rowV}>
                <td style={{ padding: "0.5rem", textAlign: "left", fontWeight: 700, borderRight: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                  {labels[rowV] || rowV}
                </td>
                {variables.map((colV) => {
                  const r = correlations[rowV]?.[colV] ?? 0;
                  // Color scale: Negative (-1 to 0): Indigo/Accent; Positive (0 to 1): Amber/Orange
                  const absR = Math.abs(r);
                  const isPos = r >= 0;
                  const bg = isPos
                    ? `color-mix(in srgb, var(--chart-4) ${Math.round(absR * 60)}%, var(--bg-tertiary))`
                    : `color-mix(in srgb, var(--chart-2) ${Math.round(absR * 60)}%, var(--bg-tertiary))`;

                  return (
                    <td
                      key={colV}
                      style={{
                        padding: "0.6rem 0.35rem",
                        backgroundColor: bg,
                        border: "1px solid var(--border-color)",
                        borderRadius: "3px",
                        fontWeight: absR > 0.4 ? 700 : 500,
                        color: "var(--text-primary)"
                      }}
                      className="tabular"
                    >
                      {r.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
          <span>Indigo: Negative linear association (r &lt; 0)</span>
          <span>Amber: Positive linear association (r &gt; 0)</span>
        </div>
      </div>
    </div>
  );
};
