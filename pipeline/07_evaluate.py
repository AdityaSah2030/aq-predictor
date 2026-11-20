"""
07_evaluate.py - Rigorous Mathematical Evaluation and Diagnostic Inference.
Computes MAE, MSE, RMSE, R², Adjusted R², Bias, Category Accuracy, Confusion Matrix,
Residual Diagnostics (Durbin-Watson, Breusch-Pagan, Shapiro-Wilk, Jarque-Bera, Cook's Distance),
Bootstrap Confidence Intervals, TimeSeriesSplit Cross-Validation, and Prediction Interval Coverage.
"""
import json
import logging
from pathlib import Path
import numpy as np
import pandas as pd
from scipy import stats
import statsmodels.api as sm
from statsmodels.stats.stattools import durbin_watson, jarque_bera
from statsmodels.stats.diagnostic import het_breuschpagan
from sklearn.model_selection import TimeSeriesSplit

from config import PROCESSED_DATA_DIR, RANDOM_SEED, AQI_BREAKPOINTS
from aqi import compute_pm25_aqi, get_aqi_category
from models.baseline import MeanBaseline, SeasonalBaseline
from models.slr import SimpleLinearRegression
from models.mlr import MultipleLinearRegression

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

CPCB_CATEGORIES = ["Good", "Satisfactory", "Moderately polluted", "Poor", "Very poor", "Severe"]

def calc_metrics(y_true: np.ndarray, y_pred: np.ndarray, p: int = 1) -> dict:
    m = len(y_true)
    residuals = y_true - y_pred
    mae = float(np.mean(np.abs(residuals)))
    mse = float(np.mean(residuals ** 2))
    rmse = float(np.sqrt(mse))
    
    y_mean = float(np.mean(y_true))
    sst = float(np.sum((y_true - y_mean) ** 2))
    sse = float(np.sum(residuals ** 2))
    r2 = float(1.0 - (sse / sst)) if sst > 0 else 0.0
    
    df_resid = m - p - 1
    adj_r2 = float(1.0 - (1.0 - r2) * (m - 1) / df_resid) if df_resid > 0 else r2
    bias = float(np.mean(y_pred - y_true))

    # Pearson r(y_true, y_pred)
    if np.std(y_true) > 0 and np.std(y_pred) > 0:
        pearson_r, _ = stats.pearsonr(y_true, y_pred)
        pearson_r = float(pearson_r)
    else:
        pearson_r = 0.0

    # AQI category evaluations
    true_cats = [get_aqi_category(compute_pm25_aqi(y)[0]) for y in y_true]
    pred_cats = [get_aqi_category(compute_pm25_aqi(y)[0]) for y in y_pred]

    cat_idx_map = {c: i for i, c in enumerate(CPCB_CATEGORIES)}
    exact_matches = sum(1 for t, p in zip(true_cats, pred_cats) if t == p)
    within_one = sum(
        1 for t, p in zip(true_cats, pred_cats)
        if abs(cat_idx_map[t] - cat_idx_map[p]) <= 1
    )

    cat_acc = float(exact_matches / m)
    within_one_acc = float(within_one / m)

    # 6x6 Confusion Matrix
    cm_counts = np.zeros((6, 6), dtype=int)
    for t, p in zip(true_cats, pred_cats):
        cm_counts[cat_idx_map[t], cat_idx_map[p]] += 1

    row_sums = cm_counts.sum(axis=1, keepdims=True)
    cm_normalized = np.where(row_sums > 0, cm_counts / row_sums, 0.0)

    return {
        "mae": mae,
        "mse": mse,
        "rmse": rmse,
        "r2": r2,
        "adj_r2": adj_r2,
        "bias": bias,
        "pearson_r": pearson_r,
        "category_accuracy": cat_acc,
        "within_one_accuracy": within_one_acc,
        "confusion_matrix_counts": cm_counts.tolist(),
        "confusion_matrix_normalized": np.round(cm_normalized, 4).tolist(),
        "categories": CPCB_CATEGORIES
    }

def run_evaluation():
    df = pd.read_csv(PROCESSED_DATA_DIR / "features_daily.csv")
    with open(PROCESSED_DATA_DIR / "split_chrono.json", "r", encoding="utf-8") as f:
        chrono_split = json.load(f)
    with open(PROCESSED_DATA_DIR / "split_random.json", "r", encoding="utf-8") as f:
        random_split = json.load(f)

    # Re-instantiate headline model M3 on chronological split for deep diagnostic analysis
    train_idx = chrono_split["train_indices"]
    test_idx = chrono_split["test_indices"]
    df_train = df.iloc[train_idx].copy().reset_index(drop=True)
    df_test = df.iloc[test_idx].copy().reset_index(drop=True)

    y_train = df_train["pm25"].values
    y_test = df_test["pm25"].values

    features_m3 = ["temp_c", "rh_pct", "wind_kmh", "rain_mm", "pressure_hpa", "month_sin", "month_cos"]
    m3_model = MultipleLinearRegression("M3 (Weather + Seasonality)", features_m3).fit(df_train, y_train)

    # Predict test points with 95% prediction intervals
    y_pred_test, lo95, hi95, se_pred = m3_model.predict_with_interval(df_test, alpha=0.05)
    
    # Also predictions on train points
    y_pred_train, _, _, _ = m3_model.predict_with_interval(df_train, alpha=0.05)

    # Empirical coverage on test set: % falling inside [lo95, hi95]
    inside = (y_test >= lo95) & (y_test <= hi95)
    test_coverage = float(np.mean(inside))

    # Test set predictions dataframe
    test_preds_list = []
    for i in range(len(df_test)):
        row = df_test.iloc[i]
        act = float(y_test[i])
        prd = float(y_pred_test[i])
        act_aqi, act_cat, _ = compute_pm25_aqi(act)
        prd_aqi, prd_cat, _ = compute_pm25_aqi(prd)
        test_preds_list.append({
            "date": row["date"],
            "actual": act,
            "predicted": prd,
            "lo95": float(lo95[i]),
            "hi95": float(hi95[i]),
            "actual_aqi": act_aqi,
            "predicted_aqi": prd_aqi,
            "actual_category": act_cat,
            "predicted_category": prd_cat,
            "residual": float(act - prd)
        })

    # Evaluate all models across both splits
    all_metrics = {}
    splits = {
        "chrono": (df_train, df_test, y_train, y_test),
        "random": (df.iloc[random_split["train_indices"]], df.iloc[random_split["test_indices"]],
                   df.iloc[random_split["train_indices"]]["pm25"].values,
                   df.iloc[random_split["test_indices"]]["pm25"].values)
    }

    models_config = {
        "m0": (MeanBaseline, None),
        "m0b": (SeasonalBaseline, None),
        "m1": (SimpleLinearRegression, ["temp_c"]),
        "m2": (MultipleLinearRegression, ["temp_c", "rh_pct", "wind_kmh", "rain_mm", "pressure_hpa"]),
        "m3": (MultipleLinearRegression, features_m3)
    }

    for split_key, (d_tr, d_te, y_tr, y_te) in splits.items():
        all_metrics[split_key] = {}
        for m_id, (m_cls, feats) in models_config.items():
            if m_id == "m0":
                m_obj = m_cls().fit(None, y_tr)
                p_tr = m_obj.predict(d_tr)
                p_te = m_obj.predict(d_te)
                p_count = 0
            elif m_id == "m0b":
                m_obj = m_cls().fit(d_tr, y_tr)
                p_tr = m_obj.predict(d_tr)
                p_te = m_obj.predict(d_te)
                p_count = 1
            elif m_id == "m1":
                m_obj = m_cls(feats[0]).fit(d_tr[feats[0]].values, y_tr)
                p_tr = m_obj.predict(d_tr[feats[0]].values)
                p_te = m_obj.predict(d_te[feats[0]].values)
                p_count = 1
            else:
                m_obj = m_cls(m_id, feats).fit(d_tr, y_tr)
                p_tr = m_obj.predict(d_tr)
                p_te = m_obj.predict(d_te)
                p_count = len(feats)

            all_metrics[split_key][m_id] = {
                "train": calc_metrics(y_tr, p_tr, p_count),
                "test": calc_metrics(y_te, p_te, p_count)
            }

    # 14-day Block Bootstrap for Test RMSE & R² (1000 resamples, seed 42)
    np.random.seed(RANDOM_SEED)
    n_test = len(y_test)
    block_size = 14
    n_blocks = int(np.ceil(n_test / block_size))
    boot_rmse = []
    boot_r2 = []

    for _ in range(1000):
        # sample blocks
        sampled_indices = []
        for _ in range(n_blocks):
            start = np.random.randint(0, max(1, n_test - block_size + 1))
            sampled_indices.extend(range(start, min(n_test, start + block_size)))
        idx_b = np.array(sampled_indices[:n_test])
        y_b_true = y_test[idx_b]
        y_b_pred = y_pred_test[idx_b]
        
        m_b = calc_metrics(y_b_true, y_b_pred, len(features_m3))
        boot_rmse.append(m_b["rmse"])
        boot_r2.append(m_b["r2"])

    rmse_ci = (float(np.percentile(boot_rmse, 2.5)), float(np.percentile(boot_rmse, 97.5)))
    r2_ci = (float(np.percentile(boot_r2, 2.5)), float(np.percentile(boot_r2, 97.5)))

    # 5-Fold TimeSeriesSplit on Train set
    tscv = TimeSeriesSplit(n_splits=5)
    cv_rmse_scores = []
    cv_r2_scores = []
    for tr_cv, val_cv in tscv.split(df_train):
        cv_model = MultipleLinearRegression("M3_cv", features_m3).fit(df_train.iloc[tr_cv], y_train[tr_cv])
        val_pred = cv_model.predict(df_train.iloc[val_cv])
        val_true = y_train[val_cv]
        val_m = calc_metrics(val_true, val_pred, len(features_m3))
        cv_rmse_scores.append(val_m["rmse"])
        cv_r2_scores.append(val_m["r2"])

    # Residual Diagnostics on Test & Train (M3)
    residuals_test = y_test - y_pred_test
    residuals_train = y_train - y_pred_train

    # Durbin-Watson statistic
    dw_test = float(durbin_watson(residuals_test))
    dw_train = float(durbin_watson(residuals_train))

    # Breusch-Pagan heteroscedasticity test (on train)
    X_train_const = sm.add_constant(df_train[features_m3])
    bp_test_stat, bp_pvalue, _, _ = het_breuschpagan(residuals_train, X_train_const)

    # Normality tests: Jarque-Bera & Shapiro-Wilk
    jb_stat, jb_pvalue, _, _ = jarque_bera(residuals_train)
    sw_stat, sw_pvalue = stats.shapiro(residuals_train[:min(500, len(residuals_train))])

    # Q-Q plot data (standardized residuals vs theoretical standard normal quantiles)
    std_residuals = (residuals_train - np.mean(residuals_train)) / np.std(residuals_train)
    osm, osr = stats.probplot(std_residuals, dist="norm")
    qq_data = [
        {"theoretical": float(t), "sample": float(s)}
        for t, s in zip(osm[0][::4], osr[::4])  # downsample points for lightweight web payload
    ]

    # Histogram bins of residuals
    hist, bin_edges = np.histogram(residuals_test, bins=20)
    residual_hist = [
        {"bin_center": float((bin_edges[i] + bin_edges[i+1]) / 2), "count": int(hist[i])}
        for i in range(len(hist))
    ]

    # Seasonal residual distributions (Box Plot stats: min, q1, median, q3, max)
    df_test_res = df_test.copy()
    df_test_res["residual"] = residuals_test
    seasonal_res_boxes = {}
    for s_name, group in df_test_res.groupby("season"):
        r_vals = group["residual"].values
        seasonal_res_boxes[s_name] = {
            "min": float(np.min(r_vals)),
            "q1": float(np.percentile(r_vals, 25)),
            "median": float(np.median(r_vals)),
            "q3": float(np.percentile(r_vals, 75)),
            "max": float(np.max(r_vals)),
            "mae": float(np.mean(np.abs(r_vals)))
        }

    # Cook's distance for top 10 influential training days
    # Leverages and residuals
    sm_train_fit = sm.OLS(y_train, X_train_const).fit()
    influence = sm_train_fit.get_influence()
    cooks_d = influence.cooks_distance[0]
    top10_cooks_idx = np.argsort(cooks_d)[-10:][::-1]
    cooks_top10 = [
        {
            "date": df_train.iloc[idx]["date"],
            "cooks_d": float(cooks_d[idx]),
            "actual_pm25": float(y_train[idx]),
            "fitted_pm25": float(y_pred_train[idx])
        }
        for idx in top10_cooks_idx
    ]

    # Save all evaluation results
    eval_bundle = {
        "metrics": all_metrics,
        "bootstrap": {
            "test_rmse_ci_95": rmse_ci,
            "test_r2_ci_95": r2_ci
        },
        "cross_validation_5fold": {
            "rmse_mean": float(np.mean(cv_rmse_scores)),
            "rmse_sd": float(np.std(cv_rmse_scores)),
            "r2_mean": float(np.mean(cv_r2_scores)),
            "r2_sd": float(np.std(cv_r2_scores))
        },
        "coverage_95": test_coverage,
        "diagnostics": {
            "durbin_watson_test": dw_test,
            "durbin_watson_train": dw_train,
            "breusch_pagan_stat": float(bp_test_stat),
            "breusch_pagan_pvalue": float(bp_pvalue),
            "jarque_bera_stat": float(jb_stat),
            "jarque_bera_pvalue": float(jb_pvalue),
            "shapiro_wilk_pvalue": float(sw_pvalue)
        },
        "qq_data": qq_data,
        "residual_histogram": residual_hist,
        "seasonal_residual_boxes": seasonal_res_boxes,
        "cooks_top10": cooks_top10,
        "predictions_test": test_preds_list
    }

    out_file = PROCESSED_DATA_DIR / "evaluation_results.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(eval_bundle, f, indent=2)

    logging.info(f"Evaluation complete! Chrono Test RMSE={all_metrics['chrono']['m3']['test']['rmse']:.2f}, R²={all_metrics['chrono']['m3']['test']['r2']:.3f}, Coverage={test_coverage*100:.1f}%")

if __name__ == "__main__":
    run_evaluation()
