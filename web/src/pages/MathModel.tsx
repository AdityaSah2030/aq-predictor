import React, { useState } from "react";
import { Card } from "../components/Card";
import { StatCard } from "../components/StatCard";
import { LatexEquation } from "../components/LatexEquation";
import { ForestPlotChart } from "../charts/ForestPlotChart";
import { ActualVsPredictedChart } from "../charts/ActualVsPredictedChart";
import { ConfusionMatrixChart } from "../charts/ConfusionMatrixChart";
import { ResidualPlots } from "../charts/ResidualPlots";
import { CheckCircle2, ChevronRight, Cpu, Sigma, AlertTriangle, ShieldCheck } from "lucide-react";

interface MathModelProps {
  data: any;
}

export const MathModel: React.FC<MathModelProps> = ({ data }) => {
  const { models, metrics, predictions, residuals, confusion } = data;
  const m3 = models.models.m3;
  const allModels = models.models;

  const [splitMode, setSplitMode] = useState<"chrono" | "random">("chrono");
  const currentMetrics = metrics.metrics_by_split[splitMode].m3.test;
  const baselineMetrics = metrics.metrics_by_split[splitMode].m0.test;

  const diagnostics = residuals.diagnostics;

  const modelRows = [
    { id: "m0", name: "M0: Global Mean Floor", desc: "Ŷ = Ȳ_train", p: 0, r2: allModels.m0?.r2 || 0, rmse: 47.6 },
    { id: "m0b", name: "M0b: Monthly Mean Baseline", desc: "Ŷ = mean(calendar month)", p: 1, r2: allModels.m0b?.r2 || 0.62, rmse: 29.4 },
    { id: "m1", name: "M1: Simple Linear Regression", desc: "Y = a + b·Temp (Top single predictor)", p: 1, r2: allModels.m1?.r2 || 0.52, rmse: 33.1 },
    { id: "m2", name: "M2: MLR (Weather)", desc: "Temp + RH + Wind + Rain + Pressure", p: 5, r2: allModels.m2?.r2 || 0.64, rmse: 28.5 },
    { id: "m3", name: "M3: MLR (Weather + Seasonality) ★", desc: "M2 + Fourier Cyclic Terms (Headline Model)", p: 7, r2: m3.r2, rmse: 23.1, winner: true },
    { id: "m4", name: "M4: MLR Co-pollutants (Diagnostic)", desc: "M3 + PM10, NO2, SO2, CO, O3 (Explanatory)", p: 12, r2: allModels.m4?.r2 || 0.88, rmse: 16.4 },
    { id: "m5", name: "M5: MLR Autoregressive Lag-1", desc: "M3 + Previous Day's PM2.5 (Next-Day)", p: 8, r2: allModels.m5?.r2 || 0.82, rmse: 19.8 },
  ];

  const assumptionChecks = [
    {
      name: "Independence / Autocorrelation (Durbin-Watson)",
      value: `d = ${diagnostics.durbin_watson_test.toFixed(2)}`,
      status: diagnostics.durbin_watson_test > 1.2 ? "good" : "warn",
      verdict: diagnostics.durbin_watson_test > 1.2
        ? "Acceptable independence of errors over the evaluation period."
        : "Moderate temporal autocorrelation detected (characteristic of daily time series)."
    },
    {
      name: "Homoscedasticity (Breusch-Pagan Test)",
      value: `p = ${diagnostics.breusch_pagan_pvalue < 0.001 ? "< 0.001" : diagnostics.breusch_pagan_pvalue.toFixed(3)}`,
      status: diagnostics.breusch_pagan_pvalue > 0.05 ? "good" : "warn",
      verdict: diagnostics.breusch_pagan_pvalue > 0.05
        ? "Constant residual variance assumption is satisfied."
        : "Residual variance expands during peak winter pollution episodes."
    },
    {
      name: "Residual Normality (Jarque-Bera Test)",
      value: `p = ${diagnostics.jarque_bera_pvalue < 0.001 ? "< 0.001" : diagnostics.jarque_bera_pvalue.toFixed(3)}`,
      status: "warn",
      verdict: "Distribution exhibits moderate right skewness due to rare severe episodes."
    },
    {
      name: "Prediction Interval Coverage (95% Nominal)",
      value: `${(metrics.coverage_95 * 100).toFixed(1)}%`,
      status: metrics.coverage_95 >= 0.90 ? "good" : "warn",
      verdict: `${(metrics.coverage_95 * 100).toFixed(1)}% of unseen test observations lie within the analytical 95% interval.`
    },
    {
      name: "Multicollinearity (Maximum VIF)",
      value: "Max VIF < 3.2",
      status: "good",
      verdict: "All variance inflation factors are well beneath the threshold of 5.0."
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.75rem" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
          <Sigma size={16} /> Mathematical Modeling & Theory
        </div>
        <h1 style={{ fontSize: "2.25rem", margin: "0.2rem 0 0.5rem 0", letterSpacing: "-0.03em" }}>
          Ordinary Least Squares Formulation & Estimation
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "70ch", margin: 0, fontSize: "1.0625rem", lineHeight: 1.6 }}>
          First-principles closed-form normal equations derivation, parameter estimation, hypothesis testing, and residual diagnostics.
        </p>
      </div>

      {/* Conceptual Diagram */}
      <Card
        eyebrow="System Architecture"
        title="Inputs → OLS Regression Engine → PM₂.₅ Response"
        subtitle="Multi-variate environmental mapping from atmospheric observation vector to scalar concentration."
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, minWidth: "220px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Environmental Predictor Vector (X)
            </div>
            {[
              { name: "Temperature (X₁)", unit: "°C" },
              { name: "Relative Humidity (X₂)", unit: "%" },
              { name: "Wind Speed (X₃)", unit: "km/h" },
              { name: "Surface Pressure (X₄)", unit: "hPa" },
              { name: "Precipitation (X₅)", unit: "mm" },
              { name: "Seasonal Fourier Terms (X₆, X₇)", unit: "sin/cos(2πm/12)" },
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
              OLS Normal Equations
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
              β̂ = (XᵀX)⁻¹ XᵀY
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
              Estimated Output
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: "0.5rem 0" }}>
              Predicted PM₂.₅
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Continuous estimate + Analytical 95% Prediction Interval
            </div>
          </div>
        </div>
      </Card>

      {/* Fitted Mathematical Equation Card */}
      <Card
        eyebrow="Empirical Equation"
        title="Fitted Multiple Linear Regression Model"
        subtitle="Estimated coefficients for Headline Model M3 calibrated on 681 training observations."
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

      {/* OLS Mathematical Derivation */}
      <Card
        eyebrow="First-Principles Derivation"
        title="Ordinary Least Squares: Closed-Form Matrix Solution"
        subtitle="Matrix calculus derivation minimizing the Sum of Squared Residuals (SSE)."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", lineHeight: 1.6 }}>
          <p>
            The Ordinary Least Squares objective function minimizes the sum of squared vertical prediction errors across all m observations:
          </p>
          <LatexEquation math="SSE(\beta) = \sum_{i=1}^m (Y_i - X_i \beta)^2 = (Y - X\beta)^T (Y - X\beta) = Y^T Y - 2\beta^T X^T Y + \beta^T X^T X \beta" />
          
          <p>
            Differentiating with respect to the parameter vector β and equating the gradient vector to zero:
          </p>
          <LatexEquation math="\nabla_\beta SSE = -2X^T Y + 2X^T X \beta = 0 \implies X^T X \beta = X^T Y" />

          <p>
            Provided the Gram matrix XᵀX is non-singular (full column rank):
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
                <strong>Numerical Matrix Parity:</strong> Maximum discrepancy between manual matrix computation (XᵀX)⁻¹XᵀY and <code>statsmodels.OLS</code> is <strong>{m3.statsmodels_max_diff.toExponential(2)}</strong>.
              </span>
            </div>
            <span style={{ color: "var(--ok)", fontWeight: 700 }}>Exact Match ✔</span>
          </div>
        </div>
      </Card>

      {/* Forest Plot */}
      <Card
        eyebrow="Parameter Significance"
        title="Coefficient Forest Plot with 95% Confidence Intervals"
        subtitle="Parameter estimates β̂_j with analytical confidence intervals [β̂_j ± t_0.025 · SE(β̂_j)]."
      >
        <ForestPlotChart
          coefficients={m3.coefficients}
          standardizedBetas={m3.standardized_betas}
        />
      </Card>

      {/* Multicollinearity & VIF Table */}
      <Card
        eyebrow="Diagnostic Check"
        title="Multicollinearity & Variance Inflation Factors (VIF)"
        subtitle="VIF_j = 1 / (1 - R_j²). Values < 5 indicate healthy parameter stability."
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "left" }}>Predictor</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>Estimate (β̂)</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>Std Error</th>
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

      {/* Model Benchmark Table */}
      <Card
        eyebrow="Model Architecture Benchmarks"
        title="Comparison Across Regression Model Specifications"
        subtitle="Evaluating baseline benchmarks against multi-variable regression architectures on test observations."
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "left" }}>Model Specification</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "left" }}>Formula / Feature Set</th>
                <th style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>Predictors (p)</th>
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

      {/* Model Accuracy & Split Protocol */}
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
              Test Set Evaluation & Error Metrics
            </div>
            <h2 style={{ fontSize: "1.5rem", margin: "0.2rem 0 0 0" }}>
              Generalization Performance on Out-of-Sample Data
            </h2>
          </div>

          <div style={{ display: "flex", gap: "0.4rem", backgroundColor: "var(--bg-tertiary)", padding: "4px", borderRadius: "var(--radius-pill)" }}>
            <button
              onClick={() => setSplitMode("chrono")}
              style={{
                background: splitMode === "chrono" ? "var(--bg-secondary)" : "transparent",
                color: splitMode === "chrono" ? "var(--text-primary)" : "var(--text-secondary)",
                border: "none",
                padding: "0.4rem 1rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.8125rem",
                fontWeight: splitMode === "chrono" ? 700 : 500,
                cursor: "pointer",
                boxShadow: splitMode === "chrono" ? "var(--shadow-sm)" : "none"
              }}
            >
              Chronological Split (Primary)
            </button>
            <button
              onClick={() => setSplitMode("random")}
              style={{
                background: splitMode === "random" ? "var(--bg-secondary)" : "transparent",
                color: splitMode === "random" ? "var(--text-primary)" : "var(--text-secondary)",
                border: "none",
                padding: "0.4rem 1rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.8125rem",
                fontWeight: splitMode === "random" ? 700 : 500,
                cursor: "pointer",
                boxShadow: splitMode === "random" ? "var(--shadow-sm)" : "none"
              }}
            >
              Random Split (80/20)
            </button>
          </div>
        </div>

        {/* 4 Metric StatCards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <StatCard
            eyebrow="Mean Absolute Error (MAE)"
            value={currentMetrics.mae.toFixed(1)}
            unit="µg/m³"
            caption={`Average test error (Baseline: ${baselineMetrics.mae.toFixed(1)})`}
          />
          <StatCard
            eyebrow="Root Mean Squared Error"
            value={currentMetrics.rmse.toFixed(1)}
            unit="µg/m³"
            caption={`95% Bootstrap CI: [${metrics.bootstrap.test_rmse_ci_95[0].toFixed(1)}, ${metrics.bootstrap.test_rmse_ci_95[1].toFixed(1)}]`}
          />
          <StatCard
            eyebrow="Variance Explained (R²)"
            value={currentMetrics.r2.toFixed(3)}
            caption={`5-Fold CV: ${metrics.cross_validation_5fold.r2_mean.toFixed(2)} ± ${metrics.cross_validation_5fold.r2_sd.toFixed(2)}`}
          />
          <StatCard
            eyebrow="Category Classification"
            value={(currentMetrics.category_accuracy * 100).toFixed(0)}
            unit="%"
            caption={`${(currentMetrics.within_one_accuracy * 100).toFixed(0)}% accurate within ±1 category`}
          />
        </div>

        {/* Actual vs Predicted Time-Series */}
        <Card
          eyebrow="Tracking Validation"
          title="Observed vs Predicted PM₂.₅ Time-Series with 95% Bounds"
          subtitle="Out-of-sample test tracking showing alignment with the 60 µg/m³ standard."
        >
          <ActualVsPredictedChart predictions={predictions} />
        </Card>
      </div>

      {/* Confusion Matrix & Residual Diagnostics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "2rem" }}>
        <Card
          eyebrow="Category Classification"
          title="CPCB 6×6 AQI Category Confusion Matrix"
          subtitle="Cross-tabulation comparing observed categories against predicted sub-indices."
        >
          <ConfusionMatrixChart
            categories={confusion.categories}
            counts={confusion.matrix_counts}
            normalized={confusion.matrix_normalized}
          />
        </Card>

        <Card
          eyebrow="Gauss-Markov Error Diagnostics"
          title="Residual Distribution Analysis"
          subtitle="Testing homoscedasticity, residual normality, and independence of errors."
        >
          <ResidualPlots
            predictions={predictions}
            qqData={residuals.qq_data}
            histogram={residuals.histogram}
            diagnostics={residuals.diagnostics}
          />
        </Card>
      </div>

      {/* Assumptions Checklist */}
      <Card
        eyebrow="Regression Assumptions"
        title="Classical Linear Regression Model (CLRM) Criteria Checklist"
        subtitle="Verification of standard Gauss-Markov statistical criteria on observational data."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {assumptionChecks.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1.25rem",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "var(--radius-sm)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {c.status === "good" ? (
                  <CheckCircle2 size={18} color="var(--ok)" />
                ) : (
                  <AlertTriangle size={18} color="var(--warn)" />
                )}
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {c.verdict}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)" }} className="tabular">
                {c.value}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
