import React from "react";
import { Gauge } from "../components/Gauge";
import { StatCard } from "../components/StatCard";
import { InsightCard } from "../components/InsightCard";
import { PipelineStrip } from "../components/PipelineStrip";
import { Card } from "../components/Card";
import { formatDate } from "../lib/format";
import { ArrowRight, Calculator, Sparkles, BookOpen } from "lucide-react";

interface HomeProps {
  data: any;
  navigate: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({ data, navigate }) => {
  const { meta, daily, monthly, metrics, insights } = data;

  // Latest observation
  const latestObs = daily[daily.length - 1];

  // All time average
  const allPm25 = daily.map((d: any) => d.pm25);
  const avgPm25 = (allPm25.reduce((a: number, b: number) => a + b, 0) / allPm25.length).toFixed(1);

  // Good + satisfactory %
  const goodSatCount = daily.filter((d: any) => d.category === "Good" || d.category === "Satisfactory").length;
  const goodSatPct = ((goodSatCount / daily.length) * 100).toFixed(0);

  // Chrono test RMSE
  const chronoM3 = metrics.metrics_by_split.chrono.m3.test;

  // Top 3 insights
  const topInsights = insights.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
      {/* Hero Section */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
        gap: "4rem",
        alignItems: "center",
        paddingTop: "2rem"
      }}>
        {/* Left Visual: Gauge Card */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Card style={{ padding: "2.5rem 2rem", width: "100%", maxWidth: "420px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Gauge
              aqi={latestObs.aqi}
              category={latestObs.category}
              dateStr={`Latest Observation: ${formatDate(latestObs.date)}`}
              size={300}
            />
          </Card>
        </div>

        {/* Right Content */}
        <div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            backgroundColor: "var(--accent-light)",
            color: "var(--accent)",
            padding: "0.35rem 0.85rem",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.8125rem",
            fontWeight: 700,
            marginBottom: "1rem"
          }}>
            <Sparkles size={14} /> PCCAIML501 • PROBABILITY & STATISTICS PROJECT
          </div>

          <h1 style={{
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "1.25rem"
          }}>
            Regression-Based Air Quality Prediction
          </h1>

          <p style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "2rem",
            maxWidth: "540px"
          }}>
            A rigorous statistical and mathematical modeling framework estimating Kolkata's PM₂.₅ concentrations from atmospheric variables using Ordinary Least Squares (OLS) closed-form matrix estimation.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <button
              onClick={() => navigate("explore")}
              className="btn btn-primary"
            >
              Explore the Data <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate("predict")}
              className="btn btn-secondary"
            >
              <Calculator size={16} /> Try the Predictor
            </button>

            <button
              onClick={() => navigate("learn")}
              className="btn btn-secondary"
            >
              <BookOpen size={16} /> Slide 6 Worked Example
            </button>
          </div>
        </div>
      </section>

      {/* 4 StatCards */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.25rem"
      }}>
        <StatCard
          eyebrow="Mean Concentration"
          value={avgPm25}
          unit="µg/m³"
          caption="Daily average across 852 days"
        />
        <StatCard
          eyebrow="Acceptable Days"
          value={goodSatPct}
          unit="%"
          caption="Good or Satisfactory AQI share"
        />
        <StatCard
          eyebrow="Peak Month"
          value="January"
          caption="Highest seasonal pollution loading"
        />
        <StatCard
          eyebrow="Test Set Accuracy"
          value={chronoM3.rmse.toFixed(1)}
          unit="µg/m³"
          caption={`RMSE on unseen data (R² = ${chronoM3.r2.toFixed(2)})`}
        />
      </section>

      {/* 5-Step Pipeline Strip */}
      <PipelineStrip
        stats={{
          collected: `${daily.length} days (${meta.date_range_start} to ${meta.date_range_end})`,
          cleaned: "CPCB ≥16h completeness threshold",
          model: "M3: MLR + Fourier terms (β̂ = (XᵀX)⁻¹XᵀY)",
          predicted: "171 chronological test days",
          error: `RMSE ${chronoM3.rmse.toFixed(1)} µg/m³ (Coverage: ${(metrics.coverage_95 * 100).toFixed(0)}%)`
        }}
      />

      {/* Top 3 Insights */}
      <section>
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
            Empirical Findings
          </div>
          <h2 style={{ fontSize: "1.75rem", margin: "0.25rem 0 0 0" }}>
            Key Statistical Insights at a Glance
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {topInsights.map((ins: any) => (
            <InsightCard
              key={ins.id}
              title={ins.title}
              text={ins.text}
              severity={ins.severity}
              metric={ins.metric}
            />
          ))}
        </div>
      </section>

      {/* Takeaway bar */}
      <div style={{
        backgroundColor: "var(--accent-light)",
        borderLeft: "4px solid var(--accent)",
        borderRadius: "0 var(--radius-md) var(--radius-md) 0",
        padding: "1.25rem 1.75rem",
        fontSize: "0.9375rem",
        color: "var(--text-primary)",
        lineHeight: 1.6
      }}>
        <strong style={{ color: "var(--accent)" }}>Takeaway: </strong>
        Atmospheric dispersion and seasonal thermal inversions heavily regulate Kolkata’s air quality. Closed-form OLS regression converts meteorological readings into reliable, quantitative PM₂.₅ estimates while capturing macroscopic seasonal shifts.
      </div>
    </div>
  );
};
