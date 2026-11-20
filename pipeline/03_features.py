"""
03_features.py - Feature engineering and dataset preparation.
Derives interpretable features: Season, Cyclic Month (sin/cos Fourier terms),
Weekend indicator, and PM2.5 lag-1.
"""
import logging
from pathlib import Path
import numpy as np
import pandas as pd

from config import INTERIM_DATA_DIR, PROCESSED_DATA_DIR, SEASONS
from aqi import compute_pm25_aqi

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def build_features():
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    in_csv = INTERIM_DATA_DIR / "cleaned_daily.csv"
    if not in_csv.exists():
        raise FileNotFoundError(f"Cleaned data not found at {in_csv}")

    df = pd.read_csv(in_csv)
    df["date"] = pd.to_datetime(df["date"])
    df.sort_values("date", inplace=True)
    df.reset_index(drop=True, inplace=True)

    # 1. Seasonality & Calendrical features
    months = df["date"].dt.month
    df["month"] = months
    df["year"] = df["date"].dt.year
    df["day_of_week"] = df["date"].dt.dayofweek
    df["is_weekend"] = df["day_of_week"] >= 5
    df["season"] = months.map(SEASONS)

    # Cyclic Fourier terms for monthly seasonality
    # Month m in 1..12 -> angle = 2*pi*(m)/12
    df["month_sin"] = np.sin(2.0 * np.pi * months / 12.0)
    df["month_cos"] = np.cos(2.0 * np.pi * months / 12.0)

    # 2. Time series lag feature
    df["pm25_lag1"] = df["pm25"].shift(1)

    # 3. AQI and Category
    aqi_res = [compute_pm25_aqi(val) for val in df["pm25"]]
    df["aqi"] = [r[0] for r in aqi_res]
    df["aqi_category"] = [r[1] for r in aqi_res]

    # Drop the first row due to lag-1 NaN to maintain clean modelling set
    df_clean = df.dropna(subset=["pm25_lag1"]).copy()
    df_clean["date"] = df_clean["date"].dt.strftime("%Y-%m-%d")

    out_csv = PROCESSED_DATA_DIR / "features_daily.csv"
    df_clean.to_csv(out_csv, index=False)
    logging.info(f"Feature engineering complete. Saved {len(df_clean)} rows to {out_csv}")

if __name__ == "__main__":
    build_features()
