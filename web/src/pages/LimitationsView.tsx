import React from "react";
import { Card } from "../components/Card";
import { AlertCircle, Cpu, Sparkles, Radio, ShieldCheck } from "lucide-react";

export const LimitationsView: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.75rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
          <AlertCircle size={16} /> Scope & Boundaries
        </div>
        <h1 style={{ fontSize: "2.25rem", margin: "0.2rem 0 0.5rem 0", letterSpacing: "-0.03em" }}>
          Practical Limitations & Future Research Roadmap
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "70ch", margin: 0, fontSize: "1.0625rem", lineHeight: 1.6 }}>
          A rigorous examination of model assumptions, physical meteorological constraints, and the planned multi-stage extensions for enhanced atmospheric prediction.
        </p>
      </div>

      {/* 3 Core Limitations Cards */}
      <div>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--warn)" }}>
            Physical & Statistical Boundaries
          </div>
          <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>
            Inherent Constraints of Linear Atmospheric Modeling
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "1.5rem" }}>
          <Card
            eyebrow="Constraint 01"
            title="Non-Linear Atmospheric Mechanics"
            subtitle="Planetary boundary layer dynamics and aerosol hygroscopic growth exhibit non-linear behavior."
          >
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Linear regression assumes constant marginal sensitivity across the entire predictor domain. In reality, aerosol particulate growth accelerates sharply when relative humidity exceeds 80%, and nocturnal thermal inversions trap surface emissions abruptly rather than smoothly.
            </p>
            <div style={{
              backgroundColor: "var(--bg-tertiary)",
              padding: "0.6rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.75rem",
              color: "var(--text-primary)",
              fontWeight: 600
            }}>
              Observational evidence: Residual variance widens on severe winter days (&gt;150 µg/m³).
            </div>
          </Card>

          <Card
            eyebrow="Constraint 02"
            title="Meteorological Multicollinearity"
            subtitle="Strong physical interdependence among meteorological explanatory variables."
          >
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Atmospheric variables are inherently interdependent: surface pressure and temperature exhibit strong negative correlation (r = -0.72 in Kolkata), which can destabilize unregularized parameter estimation if condition numbers are high.
            </p>
            <div style={{
              backgroundColor: "var(--bg-tertiary)",
              padding: "0.6rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.75rem",
              color: "var(--text-primary)",
              fontWeight: 600
            }}>
              Mitigation: Monitored via Variance Inflation Factors (kept &lt; 3.2 in Headline Model M3).
            </div>
          </Card>

          <Card
            eyebrow="Constraint 03"
            title="Spatial Generalization & Exogenous Events"
            subtitle="Meteorological models cannot anticipate episodic anthropogenic emissions."
          >
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Weather-driven regression models atmospheric transport and dispersion, not emission source generation. Localized combustion episodes (e.g. festival fireworks, municipal solid waste burning, or crop residue transport) occur independently of local weather and escape weather-only formulas.
            </p>
            <div style={{
              backgroundColor: "var(--bg-tertiary)",
              padding: "0.6rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.75rem",
              color: "var(--text-primary)",
              fontWeight: 600
            }}>
              Mitigation: Requires incorporation of real-time emission inventories and IoT sensor nodes.
            </div>
          </Card>
        </div>
      </div>

      {/* 3-Stage Future Roadmap */}
      <div>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
            Architecture Progression
          </div>
          <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>
            Three Planned Stages of Mathematical Extension
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "1.5rem"
        }}>
          {/* Stage 1 */}
          <div style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-card)",
            padding: "2rem",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "var(--accent-light)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem"
            }}>
              <Sparkles size={20} />
            </div>

            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
              STAGE 1
            </div>
            <h3 style={{ fontSize: "1.25rem", margin: "0.25rem 0 0.75rem 0" }}>
              Polynomial & Interaction Regression
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Incorporate polynomial basis functions and cross-feature interaction terms (e.g. Temperature · Wind Speed) to model non-linear boundary layer transitions and threshold-driven hygroscopic aerosol growth.
            </p>
          </div>

          {/* Stage 2 */}
          <div style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-card)",
            padding: "2rem",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "var(--accent-light)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem"
            }}>
              <Cpu size={20} />
            </div>

            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
              STAGE 2
            </div>
            <h3 style={{ fontSize: "1.25rem", margin: "0.25rem 0 0.75rem 0" }}>
              Ridge & Lasso Regularization
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Apply L2 Ridge regularization to stabilize ill-conditioned (XᵀX) matrices and prevent variance inflation under collinear atmospheric predictors, along with L1 Lasso penalties to perform automated sparse feature selection.
            </p>
          </div>

          {/* Stage 3 */}
          <div style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-card)",
            padding: "2rem",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "var(--accent-light)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem"
            }}>
              <Radio size={20} />
            </div>

            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
              STAGE 3
            </div>
            <h3 style={{ fontSize: "1.25rem", margin: "0.25rem 0 0.75rem 0" }}>
              Real-Time Dynamic Time-Series Integration
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Combine static regression models with autoregressive dynamic time-series algorithms (ARIMAX / Kalman filter state-space estimation) coupled with live IoT station sensor feeds for continuous online parameter re-calibration.
            </p>
          </div>
        </div>
      </div>

      {/* Model Disclosures */}
      <Card
        eyebrow="Scientific Standards"
        title="Scientific & Methodological Disclosures"
        subtitle="Operational standards for data interpretation and model usage."
      >
        <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          <li>
            <strong>CPCB PM₂.₅ Scale:</strong> Air Quality Index figures represent the 24-hr PM₂.₅ sub-index. Official regulatory AQI declarations also incorporate secondary pollutants (PM₁₀, NO₂, SO₂, CO, and O₃).
          </li>
          <li>
            <strong>Statistical Estimation:</strong> Outputs represent expected mathematical values derived from historical atmospheric regression, not official meteorological forecasts.
          </li>
          <li>
            <strong>Evaluation Protocol:</strong> The chronological split serves as the primary honest metric to prevent serial autocorrelation leakage, while random split benchmarks are provided for textbook comparison.
          </li>
        </ul>
      </Card>
    </div>
  );
};
