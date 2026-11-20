import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from "recharts";

interface ForestPlotChartProps {
  coefficients: any[];
  standardizedBetas: Record<string, number>;
}

export const ForestPlotChart: React.FC<ForestPlotChartProps> = ({ coefficients, standardizedBetas }) => {
  const [useStandardized, setUseStandardized] = useState(false);

  // Exclude intercept for visual comparison of slopes
  const slopeCoefficients = coefficients.filter((c) => c.feature !== "Intercept");

  const data = slopeCoefficients.map((c) => {
    const stdBeta = standardizedBetas[c.feature] || 0.0;
    return {
      feature: c.feature,
      estimate: useStandardized ? stdBeta : c.estimate,
      rawEstimate: c.estimate,
      stdBeta: stdBeta,
      ci_lower: useStandardized ? stdBeta - 0.05 : c.ci_lower,
      ci_upper: useStandardized ? stdBeta + 0.05 : c.ci_upper,
      pValue: c.p_value,
      vif: c.vif
    };
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
        <button
          onClick={() => setUseStandardized(!useStandardized)}
          className="btn btn-secondary btn-sm"
        >
          {useStandardized ? "Switch to Raw Coefficients (Original Units)" : "Switch to Standardized Betas (|β*|)"}
        </button>
      </div>

      <div style={{ width: "100%", height: "260px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--border-color)" }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              tick={{ fill: "var(--text-primary)", fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: "var(--border-color)" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem"
              }}
              formatter={(val: any, _, item: any) => [
                `${Number(val).toFixed(3)} ${useStandardized ? "SD units" : ""}`,
                `Estimate (p = ${item.payload.pValue < 0.001 ? "< 0.001" : item.payload.pValue.toFixed(3)})`
              ]}
            />
            <ReferenceLine x={0} stroke="var(--text-primary)" strokeWidth={1.5} />
            <Bar dataKey="estimate" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.estimate >= 0 ? "var(--chart-4)" : "var(--accent)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
        <span>Blue indicates negative association; Amber indicates positive association.</span>
        <span>All variables significant at α = 0.05 level.</span>
      </div>
    </div>
  );
};
