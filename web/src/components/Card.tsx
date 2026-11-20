import React, { useState } from "react";
import { Table, ChevronDown } from "lucide-react";

interface CardProps {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
  dataTable?: { headers: string[]; rows: (string | number)[][] };
}

export const Card: React.FC<CardProps> = ({
  children,
  eyebrow,
  title,
  subtitle,
  className = "",
  style,
  interactive = false,
  dataTable
}) => {
  const [tableOpen, setTableOpen] = useState(false);

  return (
    <div
      className={className}
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-card)",
        padding: "2rem",
        boxShadow: "var(--shadow-sm)",
        transition: interactive ? "transform var(--t-hover), box-shadow var(--t-hover), border-color var(--t-hover)" : "border-color var(--t-hover)",
        cursor: interactive ? "pointer" : "default",
        ...style
      }}
    >
      {(eyebrow || title || subtitle) && (
        <div style={{ marginBottom: "1.25rem" }}>
          {eyebrow && (
            <div style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--accent)",
              marginBottom: "0.35rem"
            }}>
              {eyebrow}
            </div>
          )}
          {title && (
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-0.02em"
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              margin: "0.25rem 0 0 0"
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}

      {dataTable && (
        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem" }}>
          <button
            onClick={() => setTableOpen(!tableOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "0.8125rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: "pointer",
              padding: "0.25rem 0"
            }}
          >
            <Table size={14} />
            {tableOpen ? "Hide data table" : "View underlying data table"}
            <ChevronDown size={14} style={{ transform: tableOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {tableOpen && (
            <div style={{ overflowX: "auto", marginTop: "0.75rem", maxHeight: "280px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    {dataTable.headers.map((h, i) => (
                      <th key={i} style={{ padding: "0.5rem 0.75rem", textAlign: i === 0 ? "left" : "right", borderBottom: "1px solid var(--border-color)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataTable.rows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: "0.4rem 0.75rem", textAlign: cIdx === 0 ? "left" : "right" }} className="tabular">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
