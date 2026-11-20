import React from "react";
import { AlertTriangle, Info, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";

interface InsightCardProps {
  title: string;
  text: string;
  severity: "alert" | "info" | "good";
  metric?: { value: number; unit?: string; compare_value?: number };
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, text, severity, metric }) => {
  const stripeColor =
    severity === "alert" ? "var(--aqi-poor)" : severity === "good" ? "var(--aqi-good)" : "var(--accent)";

  const IconComponent =
    severity === "alert" ? AlertTriangle : severity === "good" ? CheckCircle2 : Info;

  return (
    <div style={{
      backgroundColor: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderLeft: `4px solid ${stripeColor}`,
      borderRadius: "var(--radius-card)",
      padding: "1.5rem 1.75rem",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      alignItems: "flex-start",
      gap: "1.25rem"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "var(--accent-light)",
        color: stripeColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}>
        <IconComponent size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{
          fontSize: "1.0625rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          margin: "0 0 0.35rem 0",
          letterSpacing: "-0.01em"
        }}>
          {title}
        </h4>
        <p style={{
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
          margin: 0,
          lineHeight: 1.55
        }}>
          {text}
        </p>
      </div>

      {metric && (
        <div style={{
          backgroundColor: "var(--bg-tertiary)",
          padding: "0.5rem 0.85rem",
          borderRadius: "var(--radius-sm)",
          textAlign: "right",
          flexShrink: 0
        }}>
          <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)" }} className="tabular">
            {metric.value} {metric.unit}
          </div>
          {metric.compare_value !== undefined && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              vs {metric.compare_value}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
