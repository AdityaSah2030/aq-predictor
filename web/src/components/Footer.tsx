import React from "react";
import { ShieldCheck, Info, Database } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: "1px solid var(--border-color)",
      backgroundColor: "var(--bg-secondary)",
      padding: "3.5rem 0 2.5rem 0",
      marginTop: "6rem",
      fontSize: "0.875rem",
      color: "var(--text-secondary)"
    }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2.5rem",
          marginBottom: "2.5rem"
        }}>
          <div>
            <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1.125rem", marginBottom: "0.75rem" }}>
              Kolkata Air Quality Predictor
            </div>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              A statistical estimation system modeling ambient PM₂.₅ concentrations and CPCB AQI indices for the Kolkata metropolitan region using Ordinary Least Squares (OLS) closed-form matrix regression.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <ShieldCheck size={16} color="var(--accent)" /> Standards & Environmental Thresholds
            </div>
            <ul style={{ paddingLeft: "1.2rem", margin: 0, lineHeight: 1.6 }}>
              <li>CPCB National Ambient 24-hr PM₂.₅ Standard: <strong>60 µg/m³</strong></li>
              <li>WHO 2021 Global 24-hr Air Quality Guideline: <strong>15 µg/m³</strong></li>
              <li>Calculations: Exact normal equation solver β̂ = (XᵀX)⁻¹XᵀY</li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Info size={16} color="var(--accent)" /> Model Scope & Interpretation
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Displayed AQI values correspond to the official CPCB PM₂.₅ sub-index scale. Predictions represent mathematical estimates based on meteorological relationships, not live governmental advisories.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid var(--border-color)",
          paddingTop: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          fontSize: "0.8125rem",
          color: "var(--text-muted)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={14} color="var(--accent)" />
            <span>Observational Data: Copernicus Atmosphere Monitoring Service (CAMS) & Open-Meteo Meteorological Archive</span>
          </div>
          <div>
            Coordinates: 22.5726° N, 88.3639° E • Kolkata, West Bengal
          </div>
        </div>
      </div>
    </footer>
  );
};
