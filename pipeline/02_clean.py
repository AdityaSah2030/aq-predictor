"""
02_clean.py - Preprocess and clean raw air quality and meteorological observations.
Follows CPCB completeness standards (>=16/24 hourly records per day).
"""
import json
import logging
from pathlib import Path
import numpy as np
import pandas as pd

from config import RAW_DATA_DIR, INTERIM_DATA_DIR, MIN_CLEAN_ROWS, DROP_OUTLIERS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def clean_data():
    INTERIM_DATA_DIR.mkdir(parents=True, exist_ok=True)
    aq_file = RAW_DATA_DIR / "raw_air_quality.json"
    w_file = RAW_DATA_DIR / "raw_weather.json"

    if not aq_file.exists() or not w_file.exists():
        raise FileNotFoundError(f"Raw data files not found in {RAW_DATA_DIR}")

    with open(aq_file, "r", encoding="utf-8") as f:
        aq_json = json.load(f)["hourly"]
    with open(w_file, "r", encoding="utf-8") as f:
        w_json = json.load(f)["daily"]

    # Build hourly DataFrame for Air Quality
    df_hourly = pd.DataFrame({
        "timestamp": pd.to_datetime(aq_json["time"]),
        "pm25": aq_json.get("pm2_5"),
        "pm10": aq_json.get("pm10"),
        "co": aq_json.get("carbon_monoxide"),
        "no2": aq_json.get("nitrogen_dioxide"),
        "so2": aq_json.get("sulphur_dioxide"),
        "o3": aq_json.get("ozone")
    })

    cleaning_report = {
        "total_hourly_records": len(df_hourly),
        "invalid_pm25_hourly_dropped": 0,
        "days_insufficient_hourly_readings": 0,
        "outliers_flagged": 0,
        "imputed_predictor_days": 0,
        "dropped_missing_target_days": 0
    }

    # Hourly instrument plausibility filter (PM2.5 must be > 0 and <= 1000 ug/m3)
    invalid_mask = (df_hourly["pm25"] <= 0) | (df_hourly["pm25"] > 1000)
    cleaning_report["invalid_pm25_hourly_dropped"] = int(invalid_mask.sum())
    df_hourly.loc[invalid_mask, "pm25"] = np.nan

    # Group by calendar date (IST)
    df_hourly["date"] = df_hourly["timestamp"].dt.strftime("%Y-%m-%d")

    # Daily aggregation with CPCB >= 16 hourly readings rule
    daily_groups = df_hourly.groupby("date")
    daily_rows = []

    for date, group in daily_groups:
        valid_count = group["pm25"].count()
        if valid_count >= 16:
            daily_rows.append({
                "date": date,
                "pm25": group["pm25"].mean(),
                "pm10": group["pm10"].mean(),
                "co": group["co"].mean() / 1000.0 if group["co"].count() >= 16 else np.nan,  # convert µg/m³ to mg/m³
                "no2": group["no2"].mean(),
                "so2": group["so2"].mean(),
                "o3": group["o3"].mean(),
                "n_obs": int(valid_count)
            })
        else:
            cleaning_report["days_insufficient_hourly_readings"] += 1

    df_daily_aq = pd.DataFrame(daily_rows)

    # Weather daily DataFrame
    df_daily_w = pd.DataFrame({
        "date": w_json["time"],
        "temp_c": w_json["temperature_2m_mean"],
        "rh_pct": w_json["relative_humidity_2m_mean"],
        "wind_kmh": w_json["wind_speed_10m_mean"],
        "rain_mm": w_json["precipitation_sum"],
        "pressure_hpa": w_json["surface_pressure_mean"]
    })

    # Validate weather physical ranges (-5..50 C, 0..100% RH, >= 0 wind)
    df_daily_w.loc[(df_daily_w["temp_c"] < -5) | (df_daily_w["temp_c"] > 50), "temp_c"] = np.nan
    df_daily_w.loc[(df_daily_w["rh_pct"] < 0) | (df_daily_w["rh_pct"] > 100), "rh_pct"] = np.nan
    df_daily_w.loc[df_daily_w["wind_kmh"] < 0, "wind_kmh"] = np.nan

    # Merge AQ and Weather on date
    df_merged = pd.merge(df_daily_aq, df_daily_w, on="date", how="inner")
    df_merged["station"] = "Kolkata (Central)"
    df_merged["is_synthetic"] = False

    # Outlier detection: Q3 + 3*IQR per month-of-year
    df_merged["month"] = pd.to_datetime(df_merged["date"]).dt.month
    df_merged["is_outlier_pm25"] = False
    for m in range(1, 13):
        m_mask = df_merged["month"] == m
        if m_mask.sum() > 0:
            q1 = df_merged.loc[m_mask, "pm25"].quantile(0.25)
            q3 = df_merged.loc[m_mask, "pm25"].quantile(0.75)
            iqr = q3 - q1
            threshold = q3 + 3.0 * iqr
            outlier_idx = df_merged[m_mask & (df_merged["pm25"] > threshold)].index
            df_merged.loc[outlier_idx, "is_outlier_pm25"] = True
            cleaning_report["outliers_flagged"] += len(outlier_idx)

    if DROP_OUTLIERS:
        df_merged = df_merged[~df_merged["is_outlier_pm25"]].copy()

    # Handle missing predictor values via linear interpolation (gap <= 2 days)
    weather_cols = ["temp_c", "rh_pct", "wind_kmh", "rain_mm", "pressure_hpa"]
    for col in weather_cols:
        missing_count = df_merged[col].isna().sum()
        if missing_count > 0:
            df_merged[col] = df_merged[col].interpolate(method="linear", limit=2)
            cleaning_report["imputed_predictor_days"] += int(missing_count)

    df_merged.drop(columns=["month"], inplace=True)
    df_merged.sort_values("date", inplace=True)
    df_merged.reset_index(drop=True, inplace=True)

    cleaning_report["total_clean_days"] = len(df_merged)
    cleaning_report["date_range_start"] = df_merged["date"].min()
    cleaning_report["date_range_end"] = df_merged["date"].max()

    logging.info(f"Cleaned dataset: {len(df_merged)} days from {cleaning_report['date_range_start']} to {cleaning_report['date_range_end']}")

    if len(df_merged) < MIN_CLEAN_ROWS:
        raise ValueError(f"Clean rows ({len(df_merged)}) below minimum requirement ({MIN_CLEAN_ROWS})")

    out_csv = INTERIM_DATA_DIR / "cleaned_daily.csv"
    df_merged.to_csv(out_csv, index=False)
    
    out_report = INTERIM_DATA_DIR / "cleaning_report.json"
    with open(out_report, "w", encoding="utf-8") as f:
        json.dump(cleaning_report, f, indent=2)

    logging.info(f"Saved cleaned data to {out_csv} and report to {out_report}")

if __name__ == "__main__":
    clean_data()
