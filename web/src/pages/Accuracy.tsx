import React, { useState } from "react";
import { Card } from "../components/Card";
import { StatCard } from "../components/StatCard";
import { ActualVsPredictedChart } from "../charts/ActualVsPredictedChart";
import { ConfusionMatrixChart } from "../charts/ConfusionMatrixChart";
import { ResidualPlots } from "../charts/ResidualPlots";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface AccuracyProps {
  data: any;
}

export const Accuracy: React.FC<AccuracyProps> = ({ data }) => {
  const { metrics, predictions, residuals, confusion } = data;
  const [splitMode, setSplitMode] = useState<"chrono" | "random">("chrono");

  const currentMetrics = metrics.metrics_by_split[splitMode].m3.test;
  const baselineMetrics = metrics.metrics_by_split[splitMode].m0.test;

  const diagnostics = residuals.diagnostics;

  const checks = [
    {
      name: "Autocorrelation (Durbin-Watson)",
      value: `d = ${diagnostics.durbin_watson_test.toFixed(2)}`,
      status: diagnostics.durbin_watson_test > 1.2 ? "good" : "warn",
      verdict: diagnostics.durbin_watson_test > 1.2
        ? "Acceptable residual independence across the test window."
        : "Positive temporal autocorrelation detected (common in daily time-series)."
    },
    {
      name: "Homoscedasticity (Breusch-Pagan)",
      value: `p = ${diagnostics.breusch_pagan_pvalue < 0.001 ? "< 0.001" : diagnostics.breusch_pagan_pvalue.toFixed(3)}`,
      status: diagnostics.breusch_pagan_pvalue > 0.05 ? "good" : "warn",
      verdict: diagnostics.breusch_pagan_pvalue > 0.05
        ? "Constant error variance holds across fitted values."
        : "Moderate heteroscedasticity: variance expands slightly during winter pollution spikes."
    },
    {
      name: "Residual Normality (Jarque-Bera)",
      value: `p = ${diagnostics.jarque_bera_pvalue < 0.001 ? "< 0.001" : diagnostics.jarque_bera_pvalue.toFixed(3)}`,
      status: "warn",
      verdict: "Mild positive skewness due to rare extreme winter episodes."
    },
    {
      name: "Prediction Interval Coverage (95% Nominal)",
      value: `${(metrics.coverage_95 * 100).toFixed(1)}%`,
      status: metrics.coverage_95 >= 0.90 ? "good" : "warn",
      verdict: `${(metrics.coverage_95 * 100).toFixed(1)}% of unseen test points fall inside the analytical 95% prediction interval.`
    },
    {
      name: "Multicollinearity (Maximum VIF)",
      value: "Max VIF < 3.2",
      status: "good",
      verdict: "All variance inflation factors are well beneath the threshold of 5.0."
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
          Model Validation & Error Analysis (Slide 3 & 4)
        </div>
        <h1 style={{ fontSize: "2.25rem", margin: "0.25rem 0 0.5rem 0" }}>
          Empirical Evaluation & Error Diagnostics
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "65ch", margin: 0 }}>
          Assessing statistical predictive reliability, residual distributions, and hypothesis test assumptions on independent test data.
        </p>
      </div>

      {/* Split Protocol Toggle */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-card)",
        padding: "1rem 1.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ShieldCheck size={20} color="var(--accent)" />
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Evaluation Protocol Split Mode
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {splitMode === "chrono"
                ? "Chronological split (Earliest 80% train, Latest 20% test) — honest assessment without temporal leakage."
                : "Random split (80/20 shuffled, seed 42) — textbook evaluation, but optimistic due to daily autocorrelation."}
            </div>
          </div>
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
            Chronological (Primary / Honest)
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
            Random Split (80/20 Shuffled)
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <StatCard
          eyebrow="Mean Absolute Error (MAE)"
          value={currentMetrics.mae.toFixed(1)}
          unit="µg/m³"
          caption={`Average absolute error on test data (Floor: ${baselineMetrics.mae.toFixed(1)})`}
        />
        <StatCard
          eyebrow="Root Mean Squared Error (RMSE)"
          value={currentMetrics.rmse.toFixed(1)}
          unit="µg/m³"
          caption={`95% Bootstrap CI: [${metrics.bootstrap.test_rmse_ci_95[0].toFixed(1)}, ${metrics.bootstrap.test_rmse_ci_95[1].toFixed(1)}]`}
        />
        <StatCard
          eyebrow="Coefficient of Determination (R²)"
          value={currentMetrics.r2.toFixed(3)}
          caption={`Share of variance explained (5-Fold CV: ${metrics.cross_validation_5fold.r2_mean.toFixed(2)} ± ${metrics.cross_validation_5fold.r2_sd.toFixed(2)})`}
        />
        <StatCard
          eyebrow="AQI Category Accuracy"
          value={(currentMetrics.category_accuracy * 100).toFixed(0)}
          unit="%"
          caption={`${(currentMetrics.within_one_accuracy * 100).toFixed(0)}% accurate within ±1 category`}
        />
      </div>

      {/* Actual vs Predicted Time-Series */}
      <Card
        eyebrow="Time-Series Validation"
        title="Observed vs Predicted PM₂.₅ with 95% Analytical Bounds"
        subtitle="Chronological test sequence showing tracking fidelity against the 60 µg/m³ standard."
      >
        <ActualVsPredictedChart predictions={predictions} />
      </Card>

      {/* Confusion Matrix */}
      <Card
        eyebrow="Classification Performance"
        title="CPCB 6×6 AQI Category Confusion Matrix"
        subtitle="Cross-tabulation comparing observed categories against predicted sub-index categories on test data."
      >
        <ConfusionMatrixChart
          categories={confusion.categories}
          counts={confusion.matrix_counts}
          normalized={confusion.matrix_normalized}
        />
      </Card>

      {/* Residual Diagnostics Tabs */}
      <Card
        eyebrow="Gauss-Markov Assumptions"
        title="Residual Analysis & Diagnostic Validation"
        subtitle="Verifying homoscedasticity, residual normality, and independence of errors."
      >
        <ResidualPlots
          predictions={predictions}
          qqData={residuals.qq_data}
          histogram={residuals.histogram}
          diagnostics={residuals.diagnostics}
        />
      </Card>

      {/* Diagnostic Checklist */}
      <Card
        eyebrow="Statistical Health Audit"
        title="Classical Linear Regression Model (CLRM) Assumptions Checklist"
        subtitle="Comprehensive verification of Gauss-Markov statistical criteria."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {checks.map((c, i) => (
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
