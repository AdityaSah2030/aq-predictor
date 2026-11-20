import React from "react";

interface ConfusionMatrixChartProps {
  categories: string[];
  counts: number[][];
  normalized: number[][];
}

export const ConfusionMatrixChart: React.FC<ConfusionMatrixChartProps> = ({ categories, counts, normalized }) => {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: "480px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "0.8125rem" }}>
          <thead>
            <tr>
              <th style={{ padding: "0.5rem", borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                Actual \ Predicted
              </th>
              {categories.map((cat, i) => (
                <th key={i} style={{ padding: "0.5rem", borderBottom: "1px solid var(--border-color)", fontWeight: 700, color: "var(--text-primary)" }}>
                  {cat}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((actCat, r) => (
              <tr key={r}>
                <td style={{ padding: "0.6rem 0.5rem", fontWeight: 700, textAlign: "left", borderRight: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                  {actCat}
                </td>
                {categories.map((prdCat, c) => {
                  const cnt = counts[r][c];
                  const norm = normalized[r][c];
                  const isDiag = r === c;
                  
                  // Color intensity based on row normalization
                  const bg = isDiag
                    ? `color-mix(in srgb, var(--ok) ${Math.round(norm * 65) + 15}%, var(--bg-secondary))`
                    : cnt > 0
                    ? `color-mix(in srgb, var(--accent) ${Math.round(norm * 45) + 5}%, var(--bg-secondary))`
                    : "transparent";

                  return (
                    <td
                      key={c}
                      style={{
                        padding: "0.6rem 0.4rem",
                        backgroundColor: bg,
                        border: "1px solid var(--border-color)",
                        borderRadius: "4px"
                      }}
                    >
                      <div style={{ fontWeight: isDiag ? 800 : 500, color: "var(--text-primary)" }} className="tabular">
                        {cnt}
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        {(norm * 100).toFixed(0)}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
          <span>Green cells highlight accurate classifications along the diagonal.</span>
          <span>Percentages show row-wise sensitivity (recall).</span>
        </div>
      </div>
    </div>
  );
};
