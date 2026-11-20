import React from "react";
import { getCategoryBadgeStyle } from "../lib/aqi";

interface AQIBadgeProps {
  category: string;
  aqi?: number;
  size?: "sm" | "md" | "lg";
}

export const AQIBadge: React.FC<AQIBadgeProps> = ({ category, aqi, size = "md" }) => {
  const { bg, color } = getCategoryBadgeStyle(category);

  const padding = size === "sm" ? "0.2rem 0.5rem" : size === "lg" ? "0.4rem 1rem" : "0.25rem 0.75rem";
  const fontSize = size === "sm" ? "0.75rem" : size === "lg" ? "0.9375rem" : "0.8125rem";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem",
      backgroundColor: bg,
      color: color,
      padding: padding,
      borderRadius: "var(--radius-pill)",
      fontSize: fontSize,
      fontWeight: 700,
      whiteSpace: "nowrap"
    }}>
      <span style={{
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: color === "#FFFFFF" ? "#FFFFFF" : "#0F172A"
      }} />
      <span>{category}</span>
      {aqi !== undefined && (
        <span style={{ opacity: 0.9, fontWeight: 500 }} className="tabular">
          ({aqi})
        </span>
      )}
    </span>
  );
};
