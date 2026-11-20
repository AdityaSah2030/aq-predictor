import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from "recharts";

interface SeasonalBoxChartProps {
  seasonalData: Record<string, any>;
}

export const SeasonalBoxChart: React.FC<SeasonalBoxChartProps> = ({ seasonalData }) => {
  const seasonsOrder = ["Winter", "Pre-monsoon", "Monsoon", "Post-monsoon"];
  const colorMap: Record<string, string> = {
    Winter: "var(--season-winter)",
    "Pre-monsoon": "var(--season-pre)",
    Monsoon: "var(--season-monsoon)",
    "Post-monsoon": "var(--season-post)"
  };

  const data = seasonsOrder.map((s) => {
    const info = seasonalData[s] || { mean: 0, median: 0, q1: 0, q3: 0, n_days: 0 };
    return {
      season: s,
      mean: info.mean,
      median: info.median,
      q1: info.q1,
      q3: info.q3,
      n_days: info.n_days,
      color: colorMap[s] || "var(--chart-1)"
    };
  });

  return (
    <div style={{ width: "100%", height: "280px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="season"
            tick={{ fill: "var(--text-primary)", fontSize: 12, fontWeight: 600 }}
            axisLine={{ stroke: "var(--border-color)" }}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border-color)" }}
            unit=" µg"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem"
            }}
            formatter={(val: any, name: any, item: any) => [
              `${val} µg/m³ (Median: ${item.payload.median} µg/m³, n=${item.payload.n_days} days)`,
              "Average PM2.5"
            ]}
          />
          <ReferenceLine
            y={60}
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
            label={{ value: "CPCB Standard (60 µg/m³)", position: "insideTopRight", fill: "var(--text-muted)", fontSize: 11 }}
          />
          <Bar dataKey="mean" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.season} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
