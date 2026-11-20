import React from "react";

interface StatCardProps {
  eyebrow: string;
  value: string | number;
  unit?: string;
  caption?: string;
  badge?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ eyebrow, value, unit, caption, badge }) => {
  return (
    <div style={{
      backgroundColor: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "var(--radius-card)",
      padding: "1.5rem",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--accent)",
          marginBottom: "0.5rem"
        }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
          <span style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            lineHeight: 1
          }} className="tabular">
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-muted)" }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.75rem" }}>
        {caption && (
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            {caption}
          </span>
        )}
        {badge}
      </div>
    </div>
  );
};
