import React, { useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Line,
  ComposedChart
} from "recharts";

interface ResidualPlotsProps {
  predictions: any[];
  qqData: any[];
  histogram: any[];
  diagnostics: any;
}

export const ResidualPlots: React.FC<ResidualPlotsProps> = ({
  predictions,
  qqData,
  histogram,
  diagnostics
}) => {
  const [activeTab, setActiveTab] = useState<"rvf" | "hist" | "qq">("rvf");

  const rvfData = predictions.map((p) => ({
    fitted: p.predicted,
    residual: p.residual
  }));

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", backgroundColor: "var(--bg-tertiary)", padding: "4px", borderRadius: "var(--radius-pill)", width: "fit-content" }}>
        <button
          onClick={() => setActiveTab("rvf")}
          style={{
            background: activeTab === "rvf" ? "var(--bg-secondary)" : "transparent",
            color: activeTab === "rvf" ? "var(--text-primary)" : "var(--text-secondary)",
            border: "none",
            padding: "0.4rem 0.9rem",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.8125rem",
            fontWeight: activeTab === "rvf" ? 700 : 500,
            cursor: "pointer",
            boxShadow: activeTab === "rvf" ? "var(--shadow-sm)" : "none"
          }}
        >
          Residuals vs Fitted (Homoscedasticity)
        </button>

        <button
          onClick={() => setActiveTab("hist")}
          style={{
            background: activeTab === "hist" ? "var(--bg-secondary)" : "transparent",
            color: activeTab === "hist" ? "var(--text-primary)" : "var(--text-secondary)",
            border: "none",
            padding: "0.4rem 0.9rem",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.8125rem",
            fontWeight: activeTab === "hist" ? 700 : 500,
            cursor: "pointer",
            boxShadow: activeTab === "hist" ? "var(--shadow-sm)" : "none"
          }}
        >
          Residual Histogram
        </button>

        <button
          onClick={() => setActiveTab("qq")}
          style={{
            background: activeTab === "qq" ? "var(--bg-secondary)" : "transparent",
            color: activeTab === "qq" ? "var(--text-primary)" : "var(--text-secondary)",
            border: "none",
            padding: "0.4rem 0.9rem",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.8125rem",
            fontWeight: activeTab === "qq" ? 700 : 500,
            cursor: "pointer",
            boxShadow: activeTab === "qq" ? "var(--shadow-sm)" : "none"
          }}
        >
          Q–Q Normal Probability Plot
        </button>
      </div>

      <div style={{ width: "100%", height: "280px" }}>
        {activeTab === "rvf" && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
              <XAxis
                dataKey="fitted"
                type="number"
                unit=" µg"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border-color)" }}
                name="Fitted PM2.5"
              />
              <YAxis
                dataKey="residual"
                type="number"
                unit=" µg"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border-color)" }}
                name="Residual (e = Y - Ŷ)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem"
                }}
              />
              <ReferenceLine y={0} stroke="var(--text-primary)" strokeWidth={1.5} />
              <Scatter data={rvfData} fill="var(--chart-6)" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {activeTab === "hist" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="bin_center"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                unit=" µg"
                axisLine={{ stroke: "var(--border-color)" }}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border-color)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem"
                }}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === "qq" && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
              <XAxis
                dataKey="theoretical"
                type="number"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border-color)" }}
                name="Theoretical Standard Normal Quantiles"
              />
              <YAxis
                dataKey="sample"
                type="number"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border-color)" }}
                name="Sample Standardized Residuals"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem"
                }}
              />
              <Scatter data={qqData} fill="var(--chart-2)" fillOpacity={0.7} />
              <ReferenceLine segment={[{ x: -3, y: -3 }, { x: 3, y: 3 }]} stroke="var(--text-primary)" strokeWidth={1.5} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
        <span>Durbin-Watson d = <strong>{diagnostics.durbin_watson_test.toFixed(2)}</strong> (Autocorrelation test)</span>
        <span>Breusch-Pagan p = <strong>{diagnostics.breusch_pagan_pvalue < 0.001 ? "< 0.001" : diagnostics.breusch_pagan_pvalue.toFixed(3)}</strong></span>
      </div>
    </div>
  );
};
