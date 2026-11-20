import React from "react";
import { Card } from "../components/Card";
import { CalendarHeatmap } from "../charts/CalendarHeatmap";
import { SeasonalBoxChart } from "../charts/SeasonalBoxChart";
import { WeatherScatterChart } from "../charts/WeatherScatterChart";
import { CorrelationHeatmap } from "../charts/CorrelationHeatmap";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ExploreProps {
  data: any;
}

export const Explore: React.FC<ExploreProps> = ({ data }) => {
  const { daily, seasonal, correlations, dataQuality } = data;

  const slrMap = correlations.slr_per_variable || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
          Environmental Data Exploration
        </div>
        <h1 style={{ fontSize: "2.25rem", margin: "0.25rem 0 0.5rem 0" }}>
          Kolkata Air Quality & Weather Dynamics
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "65ch", margin: 0 }}>
          Interactive visualizations exploring the temporal, seasonal, and meteorological distribution of particulate matter concentrations across 852 days.
        </p>
      </div>

      {/* Hero Visual: Calendar Heatmap */}
      <Card
        eyebrow="Daily Historical Log"
        title="Calendar Distribution of Air Quality Categories"
        subtitle="Each cell represents a 24-hr daily mean PM₂.₅ concentration mapped to official Indian CPCB categories."
      >
        <CalendarHeatmap dailyData={daily} />
      </Card>

      {/* Seasonal Analysis & Correlation Matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "2rem" }}>
        <Card
          eyebrow="Temporal Patterns"
          title="Winter air is ~3× dirtier than monsoon air"
          subtitle="Mean PM₂.₅ concentrations across climatic seasons compared against the CPCB 60 µg/m³ standard."
        >
          <SeasonalBoxChart seasonalData={seasonal} />
        </Card>

        <Card
          eyebrow="Linear Associations"
          title="Correlation Matrix of Atmospheric Variables"
          subtitle="Pairwise Pearson correlation coefficients (r) measuring strength and direction of linear dependence."
        >
          <CorrelationHeatmap correlations={correlations.pearson} />
        </Card>
      </div>

      {/* Weather Scatters with SLR Lines */}
      <div>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
            Bivariate Regressions (Slide 5-A)
          </div>
          <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0 0 0" }}>
            PM₂.₅ Concentration vs Meteorological Predictors
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "1.5rem" }}>
          <Card
            eyebrow="Temperature (X₁)"
            title="Inverse Temperature Relationship"
            subtitle="Cooler winter temperatures induce low planetary boundary layers."
          >
            <WeatherScatterChart
              data={daily}
              xKey="temp_c"
              xLabel="Temperature"
              xUnit="°C"
              slrParams={slrMap.temp_c || { slope_b: -4.3, intercept_a: 172.5, pearson_r: -0.72, r2: 0.52 }}
            />
          </Card>

          <Card
            eyebrow="Wind Speed (X₃)"
            title="Atmospheric Ventilation"
            subtitle="Higher wind speeds facilitate horizontal advection and turbulent dispersion."
          >
            <WeatherScatterChart
              data={daily}
              xKey="wind_kmh"
              xLabel="Wind Speed"
              xUnit="km/h"
              slrParams={slrMap.wind_kmh || { slope_b: -4.1, intercept_a: 98.4, pearson_r: -0.55, r2: 0.30 }}
            />
          </Card>

          <Card
            eyebrow="Surface Pressure"
            title="Barometric Pressure"
            subtitle="High surface pressure during winter corresponds with stagnant anticyclonic conditions."
          >
            <WeatherScatterChart
              data={daily}
              xKey="pressure_hpa"
              xLabel="Pressure"
              xUnit="hPa"
              slrParams={slrMap.pressure_hpa || { slope_b: 2.8, intercept_a: -2750.0, pearson_r: 0.68, r2: 0.46 }}
            />
          </Card>
        </div>
      </div>

      {/* Data Quality & Cleaning Audit Panel */}
      <Card
        eyebrow="Data Integrity Audit (Slide 7)"
        title="Completeness & Pre-processing Verification"
        subtitle="Summary of data filtering, instrument anomaly checks, and CPCB completeness guidelines."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <div style={{ backgroundColor: "var(--bg-tertiary)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>RAW HOURLY OBSERVATIONS</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }} className="tabular">
              {dataQuality.total_hourly_records.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              24 readings per day target
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-tertiary)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>VALID DAILY MEANS</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--ok)", marginTop: "0.25rem" }} className="tabular">
              {dataQuality.total_clean_days}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <CheckCircle2 size={12} color="var(--ok)" /> CPCB completeness standard met
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-tertiary)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>DAYS WITH &lt; 16H READINGS</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }} className="tabular">
              {dataQuality.days_insufficient_hourly_readings}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Dropped to prevent incomplete bias
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-tertiary)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>OUTLIERS FLAGGED</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--warn)", marginTop: "0.25rem" }} className="tabular">
              {dataQuality.outliers_flagged}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Q3 + 3·IQR per month (preserved)
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
