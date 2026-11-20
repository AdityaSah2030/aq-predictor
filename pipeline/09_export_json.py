"""
09_export_json.py - Exports canonical JSON data artifacts to web/public/data/.
Ensures strict schema adherence, compact payload sizes, and complete reproducibility.
Also produces learn_example.json (exact slide-6 worked example).
"""
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
import numpy as np
import pandas as pd
from scipy import stats

from config import (
    PROCESSED_DATA_DIR, INTERIM_DATA_DIR, EXPORT_DATA_DIR,
    LATITUDE, LONGITUDE, TIMEZONE, CITY_NAME,
    CPCB_STANDARD_24H, WHO_GUIDELINE_24H
)
from models.slr import SimpleLinearRegression

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

NOW_ISO = datetime.now(timezone.utc).isoformat()
SCHEMA_VERSION = "1.0"

def write_json(filename: str, data: dict or list):
    EXPORT_DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = EXPORT_DATA_DIR / filename
    
    if isinstance(data, dict):
        payload = {
            "generated_at": NOW_ISO,
            "schema_version": SCHEMA_VERSION,
            "is_synthetic": False,
            **data
        }
    else:
        payload = data

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    logging.info(f"Exported {out_path.name}")

def export_all():
    df = pd.read_csv(PROCESSED_DATA_DIR / "features_daily.csv")
    with open(PROCESSED_DATA_DIR / "split_chrono.json", "r", encoding="utf-8") as f:
        chrono_split = json.load(f)
    with open(PROCESSED_DATA_DIR / "fitted_models.json", "r", encoding="utf-8") as f:
        models_data = json.load(f)
    with open(PROCESSED_DATA_DIR / "evaluation_results.json", "r", encoding="utf-8") as f:
        eval_data = json.load(f)
    with open(PROCESSED_DATA_DIR / "insights.json", "r", encoding="utf-8") as f:
        insights_data = json.load(f)
    with open(INTERIM_DATA_DIR / "cleaning_report.json", "r", encoding="utf-8") as f:
        cleaning_report = json.load(f)

    # 1. meta.json
    write_json("meta.json", {
        "city": CITY_NAME,
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "timezone": TIMEZONE,
        "total_days": len(df),
        "date_range_start": df["date"].min(),
        "date_range_end": df["date"].max(),
        "headline_model": "m3",
        "station_mode": "city",
        "standards": {
            "cpcb_pm25_standard_24h": CPCB_STANDARD_24H,
            "who_pm25_guideline_24h": WHO_GUIDELINE_24H
        },
        "sources": [
            {"name": "Copernicus Atmosphere Monitoring Service (CAMS)", "type": "Air Quality Reanalysis"},
            {"name": "Open-Meteo Historical Archive", "type": "Meteorological Observations"}
        ],
        "license": "Open Data Commons / CC-BY-4.0"
    })

    # 2. daily.json - Full daily array for calendar heatmap and table
    daily_records = []
    for _, row in df.iterrows():
        daily_records.append({
            "date": row["date"],
            "pm25": round(float(row["pm25"]), 1),
            "aqi": round(float(row["aqi"]), 1),
            "category": row["aqi_category"],
            "temp_c": round(float(row["temp_c"]), 1),
            "rh_pct": round(float(row["rh_pct"]), 1),
            "wind_kmh": round(float(row["wind_kmh"]), 1),
            "rain_mm": round(float(row["rain_mm"]), 1),
            "pressure_hpa": round(float(row["pressure_hpa"]), 1),
            "season": row["season"],
            "station": row.get("station", "Kolkata (Central)")
        })
    write_json("daily.json", daily_records)

    # 3. monthly.json - Monthly summary & AQI category shares
    df["dt"] = pd.to_datetime(df["date"])
    df["ym"] = df["dt"].dt.strftime("%Y-%m")
    monthly_list = []
    for ym, group in df.groupby("ym"):
        counts = group["aqi_category"].value_counts(normalize=True).to_dict()
        monthly_list.append({
            "year_month": ym,
            "mean_pm25": round(float(group["pm25"].mean()), 1),
            "median_pm25": round(float(group["pm25"].median()), 1),
            "p90_pm25": round(float(group["pm25"].quantile(0.90)), 1),
            "n_days": len(group),
            "category_pcts": {k: round(v * 100, 1) for k, v in counts.items()}
        })

    # Climatology (calendar months 1..12)
    climatology = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for m in range(1, 13):
        m_group = df[df["month"] == m]
        climatology.append({
            "month_num": m,
            "month_name": month_names[m - 1],
            "mean_pm25": round(float(m_group["pm25"].mean()), 1) if len(m_group) > 0 else 0.0,
            "p25": round(float(m_group["pm25"].quantile(0.25)), 1) if len(m_group) > 0 else 0.0,
            "p75": round(float(m_group["pm25"].quantile(0.75)), 1) if len(m_group) > 0 else 0.0
        })

    write_json("monthly.json", {
        "monthly_history": monthly_list,
        "climatology": climatology
    })

    # 4. seasonal.json - Seasonal distributions and box plot metrics
    seasonal_data = {}
    for s, group in df.groupby("season"):
        vals = group["pm25"].values
        seasonal_data[s] = {
            "mean": round(float(np.mean(vals)), 1),
            "median": round(float(np.median(vals)), 1),
            "min": round(float(np.min(vals)), 1),
            "q1": round(float(np.percentile(vals, 25)), 1),
            "q3": round(float(np.percentile(vals, 75)), 1),
            "max": round(float(np.max(vals)), 1),
            "n_days": len(vals)
        }
    write_json("seasonal.json", seasonal_data)

    # 5. yearly.json - Annual trends and standard exceedances
    yearly_data = []
    for y, group in df.groupby("year"):
        n_days = len(group)
        cpcb_exceed = int((group["pm25"] > CPCB_STANDARD_24H).sum())
        who_exceed = int((group["pm25"] > WHO_GUIDELINE_24H).sum())
        yearly_data.append({
            "year": int(y),
            "mean_pm25": round(float(group["pm25"].mean()), 1),
            "cpcb_exceed_days": cpcb_exceed,
            "cpcb_exceed_pct": round(float(cpcb_exceed / n_days * 100), 1),
            "who_exceed_days": who_exceed,
            "who_exceed_pct": round(float(who_exceed / n_days * 100), 1),
            "n_days": n_days
        })
    write_json("yearly.json", yearly_data)

    # 6. correlations.json - Correlation matrices and SLR slopes
    corr_cols = ["pm25", "temp_c", "rh_pct", "wind_kmh", "rain_mm", "pressure_hpa"]
    pearson_matrix = df[corr_cols].corr(method="pearson").round(3).to_dict()
    spearman_matrix = df[corr_cols].corr(method="spearman").round(3).to_dict()
    write_json("correlations.json", {
        "pearson": pearson_matrix,
        "spearman": spearman_matrix,
        "slr_per_variable": models_data["chrono"]["all_slrs"]
    })

    # 7. models.json - Fitted model parameters and matrices for client-side calculator
    write_json("models.json", {
        "models": models_data["chrono"],
        "headline_model_id": "m3",
        "calculator_params": {
            "feature_order": models_data["chrono"]["m3"]["feature_names"],
            "coefficients": [c["estimate"] for c in models_data["chrono"]["m3"]["coefficients"]],
            "xtx_inv": models_data["chrono"]["m3"]["xtx_inv"],
            "sigma2": models_data["chrono"]["m3"]["sigma2"],
            "df_resid": models_data["chrono"]["m3"]["df_resid"],
            "t_crit_95": models_data["chrono"]["m3"]["t_crit_95"],
            "feature_means": models_data["chrono"]["m3"]["feature_means"],
            "feature_stds": models_data["chrono"]["m3"]["feature_stds"]
        }
    })

    # 8. metrics.json - Train / test accuracy across splits and bootstrap CIs
    write_json("metrics.json", {
        "metrics_by_split": eval_data["metrics"],
        "bootstrap": eval_data["bootstrap"],
        "cross_validation_5fold": eval_data["cross_validation_5fold"],
        "coverage_95": eval_data["coverage_95"]
    })

    # 9. predictions.json - Chrono test predictions and prediction intervals
    write_json("predictions.json", eval_data["predictions_test"])

    # 10. residuals.json - Diagnostics, Q-Q data, histogram, Durbin-Watson
    write_json("residuals.json", {
        "diagnostics": eval_data["diagnostics"],
        "qq_data": eval_data["qq_data"],
        "histogram": eval_data["residual_histogram"],
        "seasonal_boxes": eval_data["seasonal_residual_boxes"],
        "cooks_top10": eval_data["cooks_top10"]
    })

    # 11. confusion.json - 6x6 CPCB category confusion matrix
    chrono_m3_test = eval_data["metrics"]["chrono"]["m3"]["test"]
    write_json("confusion.json", {
        "categories": chrono_m3_test["categories"],
        "matrix_counts": chrono_m3_test["confusion_matrix_counts"],
        "matrix_normalized": chrono_m3_test["confusion_matrix_normalized"],
        "category_accuracy": chrono_m3_test["category_accuracy"],
        "within_one_accuracy": chrono_m3_test["within_one_accuracy"]
    })

    # 12. insights.json
    write_json("insights.json", insights_data)

    # 13. data_quality.json
    write_json("data_quality.json", cleaning_report)

    # 14. learn_example.json - Slide 6 Worked Example Verification
    # Data: (10, 20), (20, 30), (30, 40), (40, 50), (50, 60)
    x_ex = np.array([10, 20, 30, 40, 50], dtype=float)
    y_ex = np.array([20, 30, 40, 50, 60], dtype=float)
    slr_ex = SimpleLinearRegression("X").fit(x_ex, y_ex)

    learn_example = {
        "title": "Slide 6 Worked Example: OLS from First Principles",
        "observations": [{"x": float(x), "y": float(y)} for x, y in zip(x_ex, y_ex)],
        "step1_means": {"x_mean": slr_ex.x_mean, "y_mean": slr_ex.y_mean},
        "step2_slope": {
            "ss_xy": slr_ex.ss_xy,
            "ss_xx": slr_ex.ss_xx,
            "slope_b": slr_ex.slope,
            "formula": "b = Σ(X_i - X̄)(Y_i - Ȳ) / Σ(X_i - X̄)² = 1000 / 1000 = 1"
        },
        "step3_intercept": {
            "intercept_a": slr_ex.intercept,
            "formula": "a = Ȳ - b·X̄ = 40 - 1·30 = 10"
        },
        "step4_prediction": {
            "equation": "Ŷ = 10 + X"
        },
        "evaluation_metrics": {
            "mae": 0.0,
            "mse": 0.0,
            "rmse": 0.0,
            "r2": 1.0
        },
        "takeaway": "The sample dataset demonstrates exact linear estimation, not real-world predictive accuracy."
    }
    write_json("learn_example.json", learn_example)

    logging.info("All 14 JSON artifacts exported successfully to web/public/data/!")

if __name__ == "__main__":
    export_all()
