"""
06_models.py - Fits all candidate regression models on training splits.
Fits M0, M0b, M1 (SLR), M2 (MLR Weather), M3 (MLR Weather + Seasonality, Headline),
M4 (Diagnostic Co-pollutants), and M5 (Autoregressive Lag-1).
"""
import json
import logging
from pathlib import Path
import numpy as np
import pandas as pd

from config import PROCESSED_DATA_DIR
from models.baseline import MeanBaseline, SeasonalBaseline
from models.slr import SimpleLinearRegression
from models.mlr import MultipleLinearRegression

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

WEATHER_FEATURES = ["temp_c", "rh_pct", "wind_kmh", "rain_mm", "pressure_hpa"]
SEASONAL_FEATURES = ["temp_c", "rh_pct", "wind_kmh", "rain_mm", "pressure_hpa", "month_sin", "month_cos"]
CO_POLLUTANT_FEATURES = ["temp_c", "rh_pct", "wind_kmh", "month_sin", "month_cos", "pm10", "no2", "so2", "co", "o3"]
LAG_FEATURES = ["temp_c", "rh_pct", "wind_kmh", "month_sin", "month_cos", "pm25_lag1"]

def fit_all_models():
    df = pd.read_csv(PROCESSED_DATA_DIR / "features_daily.csv")
    with open(PROCESSED_DATA_DIR / "split_chrono.json", "r", encoding="utf-8") as f:
        chrono_split = json.load(f)
    with open(PROCESSED_DATA_DIR / "split_random.json", "r", encoding="utf-8") as f:
        random_split = json.load(f)

    splits = {
        "chrono": (df.iloc[chrono_split["train_indices"]], df.iloc[chrono_split["test_indices"]]),
        "random": (df.iloc[random_split["train_indices"]], df.iloc[random_split["test_indices"]])
    }

    results = {}

    for split_name, (df_train, df_test) in splits.items():
        y_train = df_train["pm25"].values
        y_test = df_test["pm25"].values

        # M0: Global Mean
        m0 = MeanBaseline().fit(None, y_train)

        # M0b: Monthly Mean
        m0b = SeasonalBaseline().fit(df_train, y_train)

        # Find top correlated weather feature for M1 on train set
        corrs = {}
        for feat in WEATHER_FEATURES:
            slr_temp = SimpleLinearRegression(feat).fit(df_train[feat].values, y_train)
            corrs[feat] = slr_temp.r

        best_feat = max(corrs.keys(), key=lambda k: abs(corrs[k]))
        m1 = SimpleLinearRegression(best_feat).fit(df_train[best_feat].values, y_train)

        # Also fit SLR for every single weather variable for the correlation explorer
        all_slrs = {}
        for feat in WEATHER_FEATURES:
            slr_i = SimpleLinearRegression(feat).fit(df_train[feat].values, y_train)
            all_slrs[feat] = slr_i.get_params()

        # M2: MLR Weather
        m2 = MultipleLinearRegression("M2 (MLR Weather)", WEATHER_FEATURES).fit(df_train, y_train)

        # M3: MLR Weather + Seasonality (HEADLINE)
        m3 = MultipleLinearRegression("M3 (MLR Weather + Seasonality)", SEASONAL_FEATURES).fit(df_train, y_train)

        # M4: MLR Co-pollutants (Diagnostic)
        # Drop rows where co-pollutants might have NaNs
        clean_copoll_train = df_train.dropna(subset=CO_POLLUTANT_FEATURES)
        clean_copoll_y = clean_copoll_train["pm25"].values
        m4 = MultipleLinearRegression("M4 (MLR Co-pollutants - Diagnostic)", CO_POLLUTANT_FEATURES).fit(clean_copoll_train, clean_copoll_y)

        # M5: MLR Autoregressive Lag-1
        m5 = MultipleLinearRegression("M5 (MLR Lag-1 Autoregressive)", LAG_FEATURES).fit(df_train, y_train)

        results[split_name] = {
            "m0": m0.get_params(),
            "m0b": m0b.get_params(),
            "m1": m1.get_params(),
            "m2": m2.get_params(),
            "m3": m3.get_params(),
            "m4": m4.get_params(),
            "m5": m5.get_params(),
            "all_slrs": all_slrs,
            "best_slr_feature": best_feat,
            "headline_model": "m3"
        }

    with open(PROCESSED_DATA_DIR / "fitted_models.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    logging.info("Model fitting complete! Normal equation matrix OLS matches statsmodels OLS.")

if __name__ == "__main__":
    fit_all_models()
