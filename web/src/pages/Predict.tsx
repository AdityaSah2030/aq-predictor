import React, { useState } from "react";
import { Card } from "../components/Card";
import { Gauge } from "../components/Gauge";
import { StatCard } from "../components/StatCard";
import { computePM25AQI } from "../lib/aqi";
import { computePrediction, CalculatorParams } from "../lib/predict";
import { AlertTriangle, Sliders, Activity, Info, ArrowRight } from "lucide-react";

interface PredictProps {
  data: any;
  navigate: (route: string) => void;
}

export const Predict: React.FC<PredictProps> = ({ data, navigate }) => {
  const { models, metrics, daily } = data;
  const calcParams: CalculatorParams = models.calculator_params;
  const chronoM3 = metrics.metrics_by_split.chrono.m3.test;

  // Predictor initial state based on training averages
  const [temp, setTemp] = useState<number>(27.0);
  const [rh, setRh] = useState<number>(70.0);
  const [wind, setWind] = useState<number>(10.0);
  const [rain, setRain] = useState<number>(0.0);
  const [pressure, setPressure] = useState<number>(1010.0);
  const [month, setMonth] = useState<number>(1); // 1 = January

  // Calculate cyclic Fourier terms for month
  const monthSin = Math.sin((2.0 * Math.PI * month) / 12.0);
  const monthCos = Math.cos((2.0 * Math.PI * month) / 12.0);

  const inputs: Record<string, number> = {
    temp_c: temp,
    rh_pct: rh,
    wind_kmh: wind,
    rain_mm: rain,
    pressure_hpa: pressure,
    month_sin: monthSin,
    month_cos: monthCos,
  };

  const predResult = computePrediction(inputs, calcParams);
  const aqiInfo = computePM25AQI(predResult.pm25);

  // Baseline data stats
  const allPm25 = daily.map((d: any) => d.pm25);
  const avgPm25 = (allPm25.reduce((a: number, b: number) => a + b, 0) / allPm25.length).toFixed(1);
  const goodSatCount = daily.filter((d: any) => d.category === "Good" || d.category === "Satisfactory").length;
  const goodSatPct = ((goodSatCount / daily.length) * 100).toFixed(0);

  // Presets
  const applyPreset = (preset: "winter" | "monsoon" | "summer") => {
    if (preset === "winter") {
      setTemp(16.5);
      setRh(62.0);
      setWind(6.5);
      setRain(0.0);
      setPressure(1016.0);
      setMonth(1);
    } else if (preset === "monsoon") {
      setTemp(29.0);
      setRh(86.0);
      setWind(14.0);
      setRain(12.5);
      setPressure(1001.0);
      setMonth(7);
    } else {
      setTemp(36.0);
      setRh(55.0);
      setWind(12.0);
      setRain(0.0);
      setPressure(1006.0);
      setMonth(4);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.75rem" }}>
      {/* Top Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
          <Activity size={16} /> Real-Time Statistical Estimation
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", margin: "0.2rem 0 0.6rem 0", letterSpacing: "-0.03em" }}>
          Kolkata Air Quality Predictor
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "70ch", margin: 0, fontSize: "1.0625rem", lineHeight: 1.6 }}>
          Estimate 24-hour ambient PM₂.₅ concentrations and CPCB Air Quality Index categories in real-time using closed-form Ordinary Least Squares regression calibrated on Kolkata atmospheric data.
        </p>
      </div>

      {/* Preset Buttons */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.75rem",
        backgroundColor: "var(--bg-secondary)",
        padding: "0.85rem 1.25rem",
        borderRadius: "var(--radius-pill)",
        border: "1px solid var(--border-color)",
        width: "fit-content"
      }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-secondary)" }}>
          Quick Scenarios:
        </span>
        <button onClick={() => applyPreset("winter")} className="btn btn-secondary btn-sm">
          ❄️ Stagnant Winter Morning (Jan)
        </button>
        <button onClick={() => applyPreset("monsoon")} className="btn btn-secondary btn-sm">
          🌧️ Monsoon Washout (Jul)
        </button>
        <button onClick={() => applyPreset("summer")} className="btn btn-secondary btn-sm">
          ☀️ Pre-Monsoon Heat (Apr)
        </button>
      </div>

      {/* Main Interactive Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
        gap: "2rem",
        alignItems: "start"
      }}>
        {/* Left Column: Sliders */}
        <Card
          eyebrow="Model Parameters"
          title="Atmospheric Predictor Controls"
          subtitle="Adjust current or hypothesized weather conditions to recalculate expected particulate concentration."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Temperature */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.875rem", fontWeight: 600 }}>
                <span>Ambient Air Temperature</span>
                <span className="tabular">{temp.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="0.5"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                <span>5 °C (Cool inversion)</span>
                <span>45 °C (High heat)</span>
              </div>
            </div>

            {/* Relative Humidity */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.875rem", fontWeight: 600 }}>
                <span>Relative Humidity</span>
                <span className="tabular">{rh.toFixed(0)} %</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={rh}
                onChange={(e) => setRh(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                <span>10% (Dry air)</span>
                <span>100% (High moisture)</span>
              </div>
            </div>

            {/* Wind Speed */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.875rem", fontWeight: 600 }}>
                <span>Wind Speed</span>
                <span className="tabular">{wind.toFixed(1)} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="0.5"
                value={wind}
                onChange={(e) => setWind(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                <span>0 km/h (Calm / Stagnant)</span>
                <span>40 km/h (Breezy / Dispersing)</span>
              </div>
            </div>

            {/* Surface Pressure */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.875rem", fontWeight: 600 }}>
                <span>Barometric Atmospheric Pressure</span>
                <span className="tabular">{pressure.toFixed(1)} hPa</span>
              </div>
              <input
                type="range"
                min="990"
                max="1030"
                step="0.5"
                value={pressure}
                onChange={(e) => setPressure(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                <span>990 hPa (Depression)</span>
                <span>1030 hPa (High winter ridge)</span>
              </div>
            </div>

            {/* Precipitation */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.875rem", fontWeight: 600 }}>
                <span>Daily Accumulated Precipitation</span>
                <span className="tabular">{rain.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="1"
                value={rain}
                onChange={(e) => setRain(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                <span>0 mm (Dry)</span>
                <span>80 mm (Heavy rain)</span>
              </div>
            </div>

            {/* Calendar Month */}
            <div>
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.875rem", fontWeight: 600 }}>
                Calendar Month (Seasonal Fourier Cycle)
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem"
                }}
              >
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((mName, i) => (
                  <option key={i + 1} value={i + 1}>
                    {mName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Right Column: Live Output Result Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <Card
            eyebrow="Estimation Result"
            title="Expected Air Quality Index & Concentration"
            subtitle="Closed-form matrix prediction with analytical 95% confidence bounds."
            style={{ textAlign: "center" }}
          >
            {/* Extrapolation Warning */}
            {predResult.isExtrapolated && (
              <div style={{
                backgroundColor: "color-mix(in srgb, var(--warn) 15%, var(--bg-secondary))",
                border: "1px solid var(--warn)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.8125rem",
                textAlign: "left"
              }}>
                <AlertTriangle size={18} color="var(--warn)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Extrapolation Note:</strong> Specified atmospheric conditions fall outside the training distribution range (&gt;3σ). Analytical uncertainty bounds are widened.
                </span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0 1rem 0" }}>
              <Gauge
                aqi={aqiInfo.aqi}
                category={aqiInfo.category}
                size={300}
              />
            </div>

            <div style={{
              backgroundColor: "var(--bg-tertiary)",
              padding: "1.5rem",
              borderRadius: "var(--radius-md)",
              marginTop: "0.5rem"
            }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                EXPECTED 24-HR PM₂.₅ CONCENTRATION
              </div>
              <div style={{
                fontSize: "2.75rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.04em",
                margin: "0.25rem 0"
              }} className="tabular">
                {predResult.pm25.toFixed(1)}{" "}
                <span style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--text-muted)" }}>µg/m³</span>
              </div>

              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                95% Prediction Interval:{" "}
                <strong className="tabular">[{predResult.pm25Lower.toFixed(1)}, {predResult.pm25Upper.toFixed(1)}] µg/m³</strong>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                Forecast Standard Error: SE_pred = {predResult.sePred.toFixed(2)} µg/m³
              </div>
            </div>

            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.75rem" }}>
              <button
                onClick={() => navigate("math")}
                className="btn btn-secondary btn-sm"
              >
                Inspect Mathematical Model <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate("data")}
                className="btn btn-secondary btn-sm"
              >
                View Historical Data <ArrowRight size={14} />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* 4 Baseline StatCards */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.25rem"
      }}>
        <StatCard
          eyebrow="Historical Mean"
          value={avgPm25}
          unit="µg/m³"
          caption="Daily average across 852 observations"
        />
        <StatCard
          eyebrow="CPCB Compliance"
          value={goodSatPct}
          unit="%"
          caption="Share of Good/Satisfactory days (≤ 60 µg/m³)"
        />
        <StatCard
          eyebrow="Model Accuracy"
          value={chronoM3.rmse.toFixed(1)}
          unit="µg/m³"
          caption={`Test RMSE on unseen periods (R² = ${chronoM3.r2.toFixed(2)})`}
        />
        <StatCard
          eyebrow="Interval Coverage"
          value={(metrics.coverage_95 * 100).toFixed(0)}
          unit="%"
          caption="Actual test points within 95% interval"
        />
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
        <strong style={{ color: "var(--accent)" }}>Summary: </strong>
        Ambient air pollution in Kolkata follows pronounced seasonal atmospheric dynamics. Atmospheric ventilation (wind speed) and temperature-induced planetary boundary layer compression represent the strongest physical drivers of daily particulate loading.
      </div>
    </div>
  );
};
