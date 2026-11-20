import React from "react";
import { Database, Filter, Cpu, Target, CheckCircle2, ChevronRight } from "lucide-react";

interface PipelineStripProps {
  stats?: {
    collected: string;
    cleaned: string;
    model: string;
    predicted: string;
    error: string;
  };
}

export const PipelineStrip: React.FC<PipelineStripProps> = ({ stats }) => {
  const steps = [
    { num: "01", name: "Data Collection", desc: stats?.collected || "853 days logs", icon: Database },
    { num: "02", name: "Pre-processing", desc: stats?.cleaned || "CPCB >=16h completeness", icon: Filter },
    { num: "03", name: "Regression Modeling", desc: stats?.model || "OLS Normal Equations", icon: Cpu },
    { num: "04", name: "Prediction", desc: stats?.predicted || "171 test days (Chrono)", icon: Target },
    { num: "05", name: "Error Analysis", desc: stats?.error || "RMSE 23.1 µg/m³ (R² 0.76)", icon: CheckCircle2 },
  ];

  return (
    <div style={{
      backgroundColor: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "var(--radius-card)",
      padding: "1.5rem 2rem",
      boxShadow: "var(--shadow-sm)"
    }}>
      <div style={{
        fontSize: "0.75rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--accent)",
        marginBottom: "1rem"
      }}>
        Five-Step Statistical Workflow (Presentation Slide 4)
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem",
        alignItems: "center"
      }}>
        {steps.map((s, idx) => (
          <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "var(--accent-light)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <s.icon size={20} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                STEP {s.num}
              </div>
              <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {s.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                {s.desc}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <ChevronRight size={18} color="var(--border-color)" className="strip-arrow" style={{ flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .strip-arrow { display: none !important; }
        }
      `}</style>
    </div>
  );
};
