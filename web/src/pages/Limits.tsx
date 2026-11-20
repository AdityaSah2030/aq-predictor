import React from "react";
import { Card } from "../components/Card";
import { AlertTriangle, ArrowRight, ShieldAlert, Cpu, Sparkles, Radio } from "lucide-react";

export const Limits: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
          Scope, Boundaries & Research Roadmap (Slide 8)
        </div>
        <h1 style={{ fontSize: "2.25rem", margin: "0.25rem 0 0.5rem 0" }}>
          Practical Scope, Model Limitations & Future Roadmap
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "65ch", margin: 0 }}>
          Rigorous statistical evaluation of current model assumptions, physical boundaries, and the planned multi-stage research extensions.
        </p>
      </div>

      {/* 3 Current Limitations Cards (Slide 8) */}
      <div>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--warn)" }}>
            Current Model Limitations (Slide 8)
          </div>
          <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>
            Inherent Constraints of Linear Atmospheric Estimation
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "1.5rem" }}>
          <Card
            eyebrow="Limitation 01"
            title="Non-Linear Atmospheric Dynamics"
            subtitle="Planetary boundary layer mechanics and aerosol hygroscopic growth are non-linear."
          >
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Linear hyper-planes assume constant marginal effects. In reality, aerosol particulate growth accelerates non-linearly at relative humidity &gt; 80%, and nocturnal thermal inversions trap pollutants abruptly rather than smoothly.
            </p>
            <div style={{
              backgroundColor: "var(--bg-tertiary)",
              padding: "0.6rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.75rem",
              color: "var(--text-primary)",
              fontWeight: 600
            }}>
              Dataset evidence: Residual spread fans out during peak winter days (&gt;150 µg/m³).
            </div>
          </Card>

          <Card
            eyebrow="Limitation 02"
            title="Multicollinearity Between Variables"
            subtitle="Strong inter-dependence among meteorological predictors."
          >
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Meteorological parameters are physically linked: surface pressure and temperature exhibit strong negative correlation (r = -0.72 in Kolkata), which can inflate parameter variance if unconstrained.
            </p>
            <div style={{
              backgroundColor: "var(--bg-tertiary)",
              padding: "0.6rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.75rem",
              color: "var(--text-primary)",
              fontWeight: 600
            }}>
              Dataset evidence: Monitored via VIF (kept &lt; 3.2 for headline model M3).
            </div>
          </Card>

          <Card
            eyebrow="Limitation 03"
            title="Data Representativeness & Exogenous Shocks"
            subtitle="Weather models cannot foresee episodic human emission events."
          >
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Meteorological regression models atmospheric dispersion, not primary source emissions. Sudden anthropogenic spikes (e.g. Diwali fireworks, festival processions, or localized municipal waste burning) escape weather-only models.
            </p>
            <div style={{
              backgroundColor: "var(--bg-tertiary)",
              padding: "0.6rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.75rem",
              color: "var(--text-primary)",
              fontWeight: 600
            }}>
              Dataset evidence: Unexplained residual peaks on specific festive dates.
            </div>
          </Card>
        </div>
      </div>

      {/* 3-Stage Future Research Roadmap (Slide 8) */}
      <div>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
            Future Research Roadmap (Slide 8)
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
          {/* Stage 1: Polynomial Regression */}
          <div style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-card)",
            padding: "2rem",
            boxShadow: "var(--shadow-sm)",
            position: "relative"
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
              Polynomial Regression
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Expand research into polynomial basis functions (degree 2 and 3) and interaction terms (e.g. X_temp · X_wind) to model non-linear boundary layer transitions and seasonal interaction thresholds across multi-year regional data.
            </p>
          </div>

          {/* Stage 2: Regularization */}
          <div style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-card)",
            padding: "2rem",
            boxShadow: "var(--shadow-sm)",
            position: "relative"
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
              Implement L2 Ridge penalty to stabilize ill-conditioned (XᵀX) matrices under multicollinearity, and L1 Lasso penalty for sparse predictor selection when adding auxiliary sensor streams.
            </p>
          </div>

          {/* Stage 3: Real-Time Dynamic Integration */}
          <div style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-card)",
            padding: "2rem",
            boxShadow: "var(--shadow-sm)",
            position: "relative"
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
              Real-Time Sensor Integration
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              Combine time-series dynamic regression models (ARIMAX / State-Space Kalman filters) with live IoT sensor network streams to enable continuous online parameter updates and real-time pollution tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Honesty & Ethical Disclosures */}
      <Card
        eyebrow="Methodological Disclosures"
        title="Mandatory Project Disclosures & Boundaries"
        subtitle="Adhering to Section 17 guidelines on scientific integrity and responsible communication."
      >
        <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          <li>
            <strong>PM₂.₅-only AQI:</strong> The displayed Air Quality Index is derived exclusively from 24-hr PM₂.₅ concentrations using the official Indian CPCB piecewise linear sub-index formula. Comprehensive official AQI reports additionally measure PM₁₀, NO₂, SO₂, CO, and O₃.
          </li>
          <li>
            <strong>Association vs Causation:</strong> Meteorological variables exhibit strong statistical associations with particulate concentrations; however, regression equations model correlation and dispersion physics, not causal proof of pollutant generation.
          </li>
          <li>
            <strong>Statistical Estimate vs Forecast:</strong> Model outputs represent point estimates from fitted linear parameters, not official governmental meteorological forecasts or pollution advisories.
          </li>
          <li>
            <strong>Splitting Protocols:</strong> The random split overstates accuracy due to serial autocorrelation in daily time-ordered observations. The chronological split provides the primary, honest assessment of real-world generalization.
          </li>
        </ul>
      </Card>
    </div>
  );
};
