import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend
} from "recharts";
import { formatDate } from "../lib/format";

interface ActualVsPredictedChartProps {
  predictions: any[];
}

export const ActualVsPredictedChart: React.FC<ActualVsPredictedChartProps> = ({ predictions }) => {
  // Downsample to max 120 points for clean rendering if needed
  const step = Math.max(1, Math.floor(predictions.length / 100));
  const data = predictions.filter((_, i) => i % step === 0);

  return (
    <div style={{ width: "100%", height: "320px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
          
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDate(d).slice(0, 6)}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border-color)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border-color)" }}
            tickLine={false}
            unit=" µg"
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-md)",
              fontSize: "0.8125rem",
              color: "var(--text-primary)"
            }}
            formatter={(value: any, name: any) => [
              `${Number(value).toFixed(1)} µg/m³`,
              name === "actual" ? "Observed PM2.5" : name === "predicted" ? "Predicted PM2.5" : name
            ]}
            labelFormatter={(label) => formatDate(String(label || ""))}
          />

          {/* CPCB 24-h standard reference line (60 µg/m³) */}
          <ReferenceLine
            y={60}
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
            label={{ value: "CPCB Standard (60 µg/m³)", position: "insideTopRight", fill: "var(--text-muted)", fontSize: 11 }}
          />

          {/* 95% Prediction Interval Band */}
          <Area
            type="monotone"
            dataKey="hi95"
            stroke="none"
            fill="var(--chart-2)"
            fillOpacity={0.15}
            name="95% Prediction Interval"
          />

          {/* Actual line */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            name="Observed PM₂.₅"
          />

          {/* Predicted line */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="var(--chart-2)"
            strokeWidth={2.5}
            dot={false}
            name="Predicted PM₂.₅ (M3)"
          />

          <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.5rem" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
