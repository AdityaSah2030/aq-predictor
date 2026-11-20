import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ComposedChart
} from "recharts";

interface WeatherScatterChartProps {
  data: any[];
  xKey: string;
  xLabel: string;
  xUnit: string;
  slrParams: {
    slope_b: number;
    intercept_a: number;
    pearson_r: number;
    r2: number;
  };
}

export const WeatherScatterChart: React.FC<WeatherScatterChartProps> = ({
  data,
  xKey,
  xLabel,
  xUnit,
  slrParams
}) => {
  // Subsample 150 points for clean scatter visualization
  const step = Math.max(1, Math.floor(data.length / 150));
  const scatterData = data.filter((_, i) => i % step === 0).map((d) => ({
    x: d[xKey],
    y: d.pm25
  }));

  // Min and max of x
  const xVals = scatterData.map((d) => d.x);
  const minX = Math.min(...xVals);
  const maxX = Math.max(...xVals);

  // SLR Line points
  const linePoints = [
    { x: minX, y_line: slrParams.intercept_a + slrParams.slope_b * minX },
    { x: maxX, y_line: slrParams.intercept_a + slrParams.slope_b * maxX }
  ];

  return (
    <div>
      <div style={{ width: "100%", height: "240px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              domain={["auto", "auto"]}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              unit={` ${xUnit}`}
              axisLine={{ stroke: "var(--border-color)" }}
            />
            <YAxis
              dataKey="y"
              type="number"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              unit=" µg"
              axisLine={{ stroke: "var(--border-color)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem"
              }}
              formatter={(val: any, name: any) => [
                `${Number(val).toFixed(1)} ${name === "y" ? "µg/m³ PM2.5" : xUnit}`,
                name === "y" ? "Observed" : "Fitted line"
              ]}
            />
            <Scatter
              data={scatterData}
              fill="var(--chart-1)"
              fillOpacity={0.55}
              name="Observations"
            />
            <Line
              data={linePoints}
              type="linear"
              dataKey="y_line"
              stroke="var(--chart-2)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        marginTop: "0.6rem",
        padding: "0.5rem 0.75rem",
        backgroundColor: "var(--bg-tertiary)",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.75rem",
        display: "flex",
        justifyContent: "space-between",
        color: "var(--text-secondary)"
      }}>
        <span>Equation: <strong>Ŷ = {slrParams.intercept_a.toFixed(1)} + ({slrParams.slope_b.toFixed(2)})·X</strong></span>
        <span>r = <strong>{slrParams.pearson_r.toFixed(2)}</strong> | R² = <strong>{slrParams.r2.toFixed(2)}</strong></span>
      </div>
    </div>
  );
};
