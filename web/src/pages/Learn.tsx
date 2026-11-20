import React, { useState } from "react";
import { Card } from "../components/Card";
import { LatexEquation } from "../components/LatexEquation";
import { ResponsiveContainer, ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { RotateCcw, CheckCircle2, GraduationCap } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

const DEFAULT_POINTS: Point[] = [
  { x: 10, y: 20 },
  { x: 20, y: 30 },
  { x: 30, y: 40 },
  { x: 40, y: 50 },
  { x: 50, y: 60 }
];

export const Learn: React.FC = () => {
  const [points, setPoints] = useState<Point[]>(DEFAULT_POINTS);

  // Compute live OLS from points
  const n = points.length;
  const xMean = points.reduce((acc, p) => acc + p.x, 0) / n;
  const yMean = points.reduce((acc, p) => acc + p.y, 0) / n;

  let ssXX = 0;
  let ssYY = 0;
  let ssXY = 0;

  points.forEach((p) => {
    const dx = p.x - xMean;
    const dy = p.y - yMean;
    ssXX += dx * dx;
    ssYY += dy * dy;
    ssXY += dx * dy;
  });

  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = yMean - slope * xMean;

  // Residual metrics
  let sse = 0;
  let sae = 0;
  points.forEach((p) => {
    const yHat = intercept + slope * p.x;
    const err = p.y - yHat;
    sse += err * err;
    sae += Math.abs(err);
  });

  const mae = sae / n;
  const mse = sse / n;
  const rmse = Math.sqrt(mse);
  const r2 = ssYY !== 0 ? 1.0 - sse / ssYY : 1.0;

  // Update specific point
  const handlePointChange = (idx: number, field: "x" | "y", valStr: string) => {
    const val = parseFloat(valStr) || 0;
    const updated = [...points];
    updated[idx] = { ...updated[idx], [field]: val };
    setPoints(updated);
  };

  // Reset to original
  const handleReset = () => {
    setPoints(DEFAULT_POINTS);
  };

  // Chart data
  const minX = Math.min(...points.map((p) => p.x), 0);
  const maxX = Math.max(...points.map((p) => p.x), 60);
  const linePoints = [
    { x: minX, y_line: intercept + slope * minX },
    { x: maxX, y_line: intercept + slope * maxX }
  ];

  const scatterData = points.map((p) => ({ x: p.x, y: p.y }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "var(--accent-light)", color: "var(--accent)", padding: "0.35rem 0.85rem", borderRadius: "var(--radius-pill)", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          <GraduationCap size={15} /> PROBABILITY & STATISTICS • SLIDE 6 VERIFICATION
        </div>
        <h1 style={{ fontSize: "2.25rem", margin: "0.25rem 0 0.5rem 0" }}>
          Interactive Worked Example: OLS from First Principles
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "70ch", margin: 0 }}>
          Interactive step-by-step reproduction of the sample dataset from Slide 6 of Aditya Kumar Sah's project presentation.
        </p>
      </div>

      {/* Problem Statement Box */}
      <div style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderLeft: "4px solid var(--accent)",
        borderRadius: "var(--radius-card)",
        padding: "1.5rem 2rem",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
          Presentation Slide 6 Problem Statement
        </div>
        <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", margin: "0.4rem 0" }}>
          Observations (X, Y): (10, 20), (20, 30), (30, 40), (40, 50), (50, 60)
        </div>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          "Using the Least Squares Method, calculate the slope, intercept, and regression equation for the given dataset. Evaluate the model using MAE, MSE, RMSE, and R² and interpret the results."
        </p>
      </div>

      {/* 4 Interactive Step Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
        <Card eyebrow="Step 1" title="Sample Means">
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.5rem" }} className="tabular">
            X̄ = {xMean.toFixed(1)}, Ȳ = {yMean.toFixed(1)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Centroid of the dataset: ({xMean.toFixed(1)}, {yMean.toFixed(1)})
          </div>
        </Card>

        <Card eyebrow="Step 2" title="Slope (b)">
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.5rem" }} className="tabular">
            b = {slope.toFixed(3)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            b = Σ(X - X̄)(Y - Ȳ) / Σ(X - X̄)² = {ssXY.toFixed(0)} / {ssXX.toFixed(0)}
          </div>
        </Card>

        <Card eyebrow="Step 3" title="Intercept (a)">
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.5rem" }} className="tabular">
            a = {intercept.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            a = Ȳ - b·X̄ = {yMean.toFixed(0)} - ({slope.toFixed(0)}·{xMean.toFixed(0)})
          </div>
        </Card>

        <Card eyebrow="Step 4" title="Prediction Equation">
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)", marginTop: "0.5rem" }}>
            Ŷ = {intercept.toFixed(1)} + {slope.toFixed(2)}·X
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Exact linear best-fit line
          </div>
        </Card>
      </div>

      {/* Main Interactive Table & Chart */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
        gap: "2rem",
        alignItems: "start"
      }}>
        {/* Left: Editable 5-point Table */}
        <Card
          eyebrow="Interactive Experimentation"
          title="Editable Observation Points (X, Y)"
          subtitle="Modify any value to observe real-time parameter changes."
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "0.6rem", textAlign: "center" }}>#</th>
                  <th style={{ padding: "0.6rem", textAlign: "center" }}>Predictor X</th>
                  <th style={{ padding: "0.6rem", textAlign: "center" }}>Response Y</th>
                  <th style={{ padding: "0.6rem", textAlign: "right" }}>Fitted Ŷ</th>
                  <th style={{ padding: "0.6rem", textAlign: "right" }}>Residual (e)</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p, idx) => {
                  const yHat = intercept + slope * p.x;
                  const e = p.y - yHat;

                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.5rem", textAlign: "center", color: "var(--text-muted)", fontWeight: 700 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "0.5rem", textAlign: "center" }}>
                        <input
                          type="number"
                          value={p.x}
                          onChange={(e) => handlePointChange(idx, "x", e.target.value)}
                          style={{
                            width: "70px",
                            padding: "0.35rem 0.5rem",
                            textAlign: "center",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "var(--bg-primary)",
                            color: "var(--text-primary)",
                            fontWeight: 700
                          }}
                        />
                      </td>
                      <td style={{ padding: "0.5rem", textAlign: "center" }}>
                        <input
                          type="number"
                          value={p.y}
                          onChange={(e) => handlePointChange(idx, "y", e.target.value)}
                          style={{
                            width: "70px",
                            padding: "0.35rem 0.5rem",
                            textAlign: "center",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "var(--bg-primary)",
                            color: "var(--text-primary)",
                            fontWeight: 700
                          }}
                        />
                      </td>
                      <td style={{ padding: "0.5rem", textAlign: "right", color: "var(--text-secondary)" }} className="tabular">
                        {yHat.toFixed(2)}
                      </td>
                      <td style={{ padding: "0.5rem", textAlign: "right", fontWeight: Math.abs(e) < 1e-4 ? 700 : 500, color: Math.abs(e) < 1e-4 ? "var(--ok)" : "var(--warn)" }} className="tabular">
                        {Math.abs(e) < 1e-6 ? "0.00" : e.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={handleReset} className="btn btn-secondary btn-sm">
              <RotateCcw size={14} /> Reset to Slide 6 Original
            </button>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {Math.abs(rmse) < 1e-6 ? "All points lie exactly on the line ✔" : "Points deviate from line"}
            </span>
          </div>
        </Card>

        {/* Right: Live Fitted Chart */}
        <Card
          eyebrow="Dynamic Plot"
          title="Fitted Regression Line Ŷ = a + bX"
          subtitle="Real-time ordinary least squares line through observed points."
        >
          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={["dataMin - 5", "dataMax + 5"]}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border-color)" }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  domain={["auto", "auto"]}
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
                <Scatter data={scatterData} fill="var(--chart-1)" name="Observations" />
                <Line
                  data={linePoints}
                  type="linear"
                  dataKey="y_line"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                  name="Best-Fit Line"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Metric Badges */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.5rem",
            marginTop: "1rem",
            textAlign: "center"
          }}>
            <div style={{ backgroundColor: "var(--bg-tertiary)", padding: "0.5rem", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontWeight: 700 }}>MAE</div>
              <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)" }} className="tabular">
                {mae.toFixed(2)}
              </div>
            </div>
            <div style={{ backgroundColor: "var(--bg-tertiary)", padding: "0.5rem", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontWeight: 700 }}>MSE</div>
              <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)" }} className="tabular">
                {mse.toFixed(2)}
              </div>
            </div>
            <div style={{ backgroundColor: "var(--bg-tertiary)", padding: "0.5rem", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontWeight: 700 }}>RMSE</div>
              <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)" }} className="tabular">
                {rmse.toFixed(2)}
              </div>
            </div>
            <div style={{ backgroundColor: "var(--bg-tertiary)", padding: "0.5rem", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontWeight: 700 }}>R²</div>
              <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--accent)" }} className="tabular">
                {r2.toFixed(3)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Takeaway */}
      <div style={{
        backgroundColor: "var(--accent-light)",
        borderLeft: "4px solid var(--accent)",
        borderRadius: "0 var(--radius-md) var(--radius-md) 0",
        padding: "1.25rem 1.75rem",
        fontSize: "0.9375rem",
        color: "var(--text-primary)",
        lineHeight: 1.6
      }}>
        <strong style={{ color: "var(--accent)" }}>Takeaway from Slide 6: </strong>
        The sample dataset demonstrates exact linear estimation (all 5 points lie perfectly on the line Ŷ = 10 + X with MAE = MSE = RMSE = 0 and R² = 1), validating the theoretical correctness of the least squares algorithm before applying it to stochastic, real-world atmospheric data.
      </div>
    </div>
  );
};
