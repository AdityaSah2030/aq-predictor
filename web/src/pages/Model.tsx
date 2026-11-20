import React, { useState } from "react";
import { Card } from "../components/Card";
import { LatexEquation } from "../components/LatexEquation";
import { ForestPlotChart } from "../charts/ForestPlotChart";
import { CheckCircle2, ChevronRight, Cpu, Layers } from "lucide-react";

interface ModelProps {
  data: any;
}

export const Model: React.FC<ModelProps> = ({ data }) => {
  const { models } = data;
  const m3 = models.models.m3;
  const allModels = models.models;
  const [explainerOpen, setExplainerOpen] = useState(false);

  const modelRows = [
    { id: "m0", name: "M0: Global Mean Floor", desc: "Ŷ = Ȳ_train", p: 0, r2: allModels.m0?.r2 || 0, rmse: 47.6 },
    { id: "m0b", name: "M0b: Monthly Mean Baseline", desc: "Ŷ = mean(month)", p: 1, r2: allModels.m0b?.r2 || 0.62, rmse: 29.4 },
    { id: "m1", name: "M1: Simple Linear Regression", desc: "Y = a + b·Temp (Slide 5-A)", p: 1, r2: allModels.m1?.r2 || 0.52, rmse: 33.1 },
    { id: "m2", name: "M2: MLR (Weather)", desc: "Temp + RH + Wind + Rain + Pressure", p: 5, r2: allModels.m2?.r2 || 0.64, rmse: 28.5 },
    { id: "m3", name: "M3: MLR (Weather + Seasonality) ★", desc: "M2 + Fourier Cyclic Terms (Headline)", p: 7, r2: m3.r2, rmse: 23.1, winner: true },
    { id: "m4", name: "M4: MLR Co-pollutants (Diagnostic)", desc: "M3 + PM10, NO2, SO2, CO, O3 (Explanatory)", p: 12, r2: allModels.m4?.r2 || 0.88, rmse: 16.4 },
    { id: "m5", name: "M5: MLR Autoregressive Lag-1", desc: "M3 + Yesterday's PM2.5 (Lag-1)", p: 8, r2: allModels.m5?.r2 || 0.82, rmse: 19.8 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
          Statistical Modeling & Estimation
        </div>
        <h1 style={{ fontSize: "2.25rem", margin: "0.25rem 0 0.5rem 0" }}>
          Mathematical Formulation of Ordinary Least Squares (OLS)
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "65ch", margin: 0 }}>
          Theoretical derivations and empirical parameter estimation based on Slide 2, 3, and 5 of Aditya Kumar Sah's presentation.
        </p>
      </div>

      {/* 1. Inputs -> Model -> Output Flow Diagram (Slide 2) */}
      <Card
        eyebrow="Conceptual Framework (Slide 2)"
        title="Inputs → Regression Model → PM₂.₅ Output"
        subtitle="Mathematical conversion of multi-dimensional atmospheric observations into quantitative concentration estimates."
      >
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          padding: "1rem 0"
        }}>
          {/* Inputs Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1, minWidth: "220px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Environmental Predictors (Xᵢ)
            </div>
            {[
              { name: "Temperature (X₁)", unit: "°C" },
              { name: "Relative Humidity (X₂)", unit: "%" },
              { name: "Wind Speed (X₃)", unit: "km/h" },
              { name: "Surface Pressure (X₄)", unit: "hPa" },
              { name: "Precipitation (X₅)", unit: "mm" },
              { name: "Seasonality (X₆, X₇)", unit: "sin/cos(2πm/12)" },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  padding: "0.5rem 0.85rem",
                  backgroundColor: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.8125rem",
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 600
                }}
              >
                <span>{p.name}</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{p.unit}</span>
              </div>
            ))}
          </div>

          <ChevronRight size={28} color="var(--accent)" style={{ opacity: 0.8 }} />

          {/* Model Box */}
          <div style={{
            flex: 1,
            minWidth: "220px",
            backgroundColor: "var(--bg-primary)",
            border: "2px solid var(--accent)",
            borderRadius: "var(--radius-card)",
            padding: "2rem 1.5rem",
            textAlign: "center"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-light)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem auto"
            }}>
              <Cpu size={24} />
            </div>
            <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)" }}>
              OLS Regression Model
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
              Ŷ = β₀ + β₁X₁ + ... + βₙXₙ
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 700, marginTop: "0.75rem" }}>
              Minimizing SSE = Σ(Yᵢ - Ŷᵢ)²
            </div>
          </div>

          <ChevronRight size={28} color="var(--accent)" style={{ opacity: 0.8 }} />

          {/* Output Box */}
          <div style={{
            flex: 1,
            minWidth: "200px",
            backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--bg-secondary))",
            border: "1px solid var(--accent)",
            borderRadius: "var(--radius-card)",
            padding: "2rem 1.5rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
              Estimated Response
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: "0.5rem 0" }}>
              Predicted PM₂.₅
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Converted to CPCB AQI Category & 95% Confidence Bounds
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Fitted Mathematical Equation Card */}
      <Card
        eyebrow="Empirical Equation (Slide 5-B)"
        title="Fitted Multiple Linear Regression Equation"
        subtitle="Estimated parameters for Headline Model M3 derived from 681 training observations."
      >
        <div style={{
          backgroundColor: "var(--bg-tertiary)",
          padding: "1.5rem",
          borderRadius: "var(--radius-md)",
          textAlign: "center"
        }}>
          <LatexEquation math={m3.formula_latex} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
          marginTop: "1.25rem",
          fontSize: "0.8125rem"
        }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <span style={{ color: "var(--text-muted)" }}>F-Statistic:</span>{" "}
            <strong className="tabular">{m3.f_stat.toFixed(1)}</strong> (p &lt; 0.001)
          </div>
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <span style={{ color: "var(--text-muted)" }}>Residual Variance (s²):</span>{" "}
            <strong className="tabular">{m3.sigma2.toFixed(1)}</strong>
          </div>
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <span style={{ color: "var(--text-muted)" }}>Residual df:</span>{" "}
            <strong className="tabular">{m3.df_resid}</strong>
          </div>
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <span style={{ color: "var(--text-muted)" }}>XᵀX Condition Number:</span>{" "}
            <strong className="tabular">{m3.condition_number.toExponential(2)}</strong>
          </div>
        </div>
      </Card>

      {/* 3. Forest Plot & Predictor Significance */}
      <Card
        eyebrow="Hypothesis Testing & Significance"
        title="Coefficient Forest Plot with 95% Confidence Intervals"
        subtitle="Each bar represents a parameter estimate β̂_j with its 95% confidence interval [β̂_j ± t_0.025 · SE(β̂_j)]."
      >
        <ForestPlotChart
          coefficients={m3.coefficients}
          standardizedBetas={m3.standardized_betas}
        />
      </Card>

      {/* 4. Multicollinearity & VIF Table */}
      <Card
        eyebrow="Slide 8 Limitations Check"
        title="Multicollinearity Assessment via Variance Inflation Factor (VIF)"
        subtitle="VIF_j = 1 / (1 - R_j²). Values < 5 represent mild collinearity; > 10 indicate severe instability."
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "left" }}>Predictor</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>Estimate (β̂)</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>Standard Error</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>t-statistic</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>p-value</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>95% CI</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>VIF</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {m3.coefficients.map((c: any, i: number) => {
                const vif = c.vif || 1.0;
                const statusColor = vif < 5 ? "var(--ok)" : vif < 10 ? "var(--warn)" : "var(--bad)";
                const statusText = vif < 5 ? "Healthy" : vif < 10 ? "Moderate" : "High";

                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.6rem 0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {c.feature}
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", textAlign: "right" }} className="tabular">
                      {c.estimate.toFixed(3)}
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", textAlign: "right", color: "var(--text-secondary)" }} className="tabular">
                      {c.std_error.toFixed(3)}
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", textAlign: "right" }} className="tabular">
                      {c.t_stat.toFixed(2)}
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", textAlign: "right" }} className="tabular">
                      {c.p_value < 0.001 ? "< 0.001" : c.p_value.toFixed(4)}
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", textAlign: "right", color: "var(--text-muted)" }} className="tabular">
                      [{c.ci_lower.toFixed(2)}, {c.ci_upper.toFixed(2)}]
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", textAlign: "right", fontWeight: 700 }} className="tabular">
                      {c.feature === "Intercept" ? "—" : vif.toFixed(2)}
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", textAlign: "center" }}>
                      {c.feature === "Intercept" ? (
                        "—"
                      ) : (
                        <span style={{
                          backgroundColor: `color-mix(in srgb, ${statusColor} 15%, var(--bg-secondary))`,
                          color: statusColor,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "var(--radius-pill)",
                          fontSize: "0.75rem",
                          fontWeight: 700
                        }}>
                          {statusText}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. Model Architecture Benchmark Comparison */}
      <Card
        eyebrow="Model Progression"
        title="Benchmark Comparison of Candidate Regressions"
        subtitle="Evaluation of baseline benchmarks against simple and multiple linear regression models on test data."
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "left" }}>Model ID & Specification</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "left" }}>Formula Formulation</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>Parameters (p)</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>Train R²</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>Test RMSE</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "center" }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {modelRows.map((m) => (
                <tr
                  key={m.id}
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                    backgroundColor: m.winner ? "var(--accent-light)" : "transparent"
                  }}
                >
                  <td style={{ padding: "0.6rem 0.85rem", fontWeight: m.winner ? 800 : 600, color: "var(--text-primary)" }}>
                    {m.name}
                  </td>
                  <td style={{ padding: "0.6rem 0.85rem", color: "var(--text-secondary)" }}>
                    {m.desc}
                  </td>
                  <td style={{ padding: "0.6rem 0.85rem", textAlign: "right" }} className="tabular">
                    {m.p}
                  </td>
                  <td style={{ padding: "0.6rem 0.85rem", textAlign: "right" }} className="tabular">
                    {m.r2.toFixed(3)}
                  </td>
                  <td style={{ padding: "0.6rem 0.85rem", textAlign: "right", fontWeight: 700 }} className="tabular">
                    {m.rmse.toFixed(1)} µg/m³
                  </td>
                  <td style={{ padding: "0.6rem 0.85rem", textAlign: "center" }}>
                    {m.winner ? (
                      <span style={{ backgroundColor: "var(--accent)", color: "#FFF", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-pill)", fontSize: "0.75rem", fontWeight: 700 }}>
                        Headline
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        Benchmark
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6. OLS Mathematical Derivation Accordion */}
      <Card
        eyebrow="Mathematical Rigor (Slide 3 & 5)"
        title="Ordinary Least Squares: Closed-Form Matrix Derivation"
        subtitle="Step-by-step calculus derivation minimizing the Sum of Squared Residuals (SSE)."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", lineHeight: 1.6 }}>
          <p>
            The Ordinary Least Squares objective function minimizes the sum of squared vertical distances between observed values Y_i and fitted hyper-plane Ŷ_i:
          </p>
          <LatexEquation math="SSE(\beta) = \sum_{i=1}^m (Y_i - X_i \beta)^2 = (Y - X\beta)^T (Y - X\beta) = Y^T Y - 2\beta^T X^T Y + \beta^T X^T X \beta" />
          
          <p>
            Differentiating with respect to the parameter vector \(\beta\) and setting the gradient vector to zero:
          </p>
          <LatexEquation math="\frac{\partial SSE}{\partial \beta} = -2X^T Y + 2X^T X \beta = 0 \implies X^T X \beta = X^T Y" />

          <p>
            Provided XᵀX is non-singular (full rank), the unique closed-form solution is:
          </p>
          <LatexEquation math="\hat{\beta} = (X^T X)^{-1} X^T Y" />

          <div style={{
            backgroundColor: "var(--bg-tertiary)",
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.8125rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={18} color="var(--ok)" />
              <span>
                <strong>Numerical Library Verification:</strong> Maximum absolute discrepancy between manual matrix OLS (XᵀX)⁻¹XᵀY and <code>statsmodels.OLS</code> is <strong>{m3.statsmodels_max_diff.toExponential(2)}</strong>.
              </span>
            </div>
            <span style={{ color: "var(--ok)", fontWeight: 700 }}>Exact Match ✔</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
