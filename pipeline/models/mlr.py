"""
mlr.py - Multiple Linear Regression (M2, M3, M4, M5) with Closed-Form Matrix OLS.
Solves normal equations β̂ = (XᵀX)⁻¹ XᵀY manually and verifies against statsmodels.OLS.
Computes full inference: Standard Errors, t-values, p-values, 95% CIs, F-statistic,
Variance Inflation Factors (VIF), and Prediction Interval parameters.
"""
import numpy as np
import pandas as pd
from scipy import stats
import statsmodels.api as sm
from .base import BaseRegressionModel

class MultipleLinearRegression(BaseRegressionModel):
    def __init__(self, name: str, feature_names: list):
        super().__init__(name)
        self.feature_names = feature_names
        self.coefficients = None     # [β0 (intercept), β1, ..., βp]
        self.std_errors = None
        self.t_stats = None
        self.p_values = None
        self.ci_95 = None            # [(lo, hi), ...]
        self.r2 = 0.0
        self.adj_r2 = 0.0
        self.f_stat = 0.0
        self.f_pvalue = 0.0
        self.xtx_inv = None          # (XᵀX)⁻¹ for online prediction intervals
        self.sigma2 = 0.0            # Residual variance s² = SSE / (m - p - 1)
        self.df_resid = 0
        self.t_crit_95 = 1.96
        self.condition_number = 0.0
        self.feature_means = {}
        self.feature_stds = {}
        self.vif = {}
        self.statsmodels_max_diff = 0.0

    def fit(self, X: pd.DataFrame, y: np.ndarray):
        m = len(X)
        p = len(self.feature_names)
        if m <= p + 1:
            raise ValueError(f"Insufficient degrees of freedom: {m} rows, {p} features")

        # Feature summary for calculator presets & normalization
        for col in self.feature_names:
            self.feature_means[col] = float(X[col].mean())
            self.feature_stds[col] = float(X[col].std()) if X[col].std() > 0 else 1.0

        # Construct Design Matrix X_mat with column of 1s for intercept
        X_vals = X[self.feature_names].values
        X_mat = np.column_stack([np.ones(m), X_vals])  # Shape (m, p + 1)
        Y_vec = np.asarray(y, dtype=float).reshape(-1, 1)

        # 1. Closed-form OLS via Normal Equations: β̂ = (XᵀX)⁻¹ XᵀY
        XtX = X_mat.T @ X_mat
        XtY = X_mat.T @ Y_vec

        # Condition number: ratio of max to min singular value
        s = np.linalg.svd(XtX, compute_uv=False)
        self.condition_number = float(s[0] / s[-1]) if s[-1] > 0 else np.inf

        # Invert (XᵀX)
        self.xtx_inv = np.linalg.pinv(XtX)
        beta_hat = self.xtx_inv @ XtY
        self.coefficients = beta_hat.ravel()

        # Predictions on training set
        y_pred = (X_mat @ beta_hat).ravel()
        residuals = y - y_pred

        # Sum of Squared Errors (SSE), Total Sum of Squares (SST), Regression (SSR)
        sse = float(np.sum(residuals ** 2))
        y_mean = float(np.mean(y))
        sst = float(np.sum((y - y_mean) ** 2))
        ssr = sst - sse

        self.df_resid = m - p - 1
        self.sigma2 = sse / self.df_resid
        self.r2 = 1.0 - (sse / sst) if sst > 0 else 0.0
        self.adj_r2 = 1.0 - (1.0 - self.r2) * (m - 1) / self.df_resid

        # F-test for overall model significance
        msr = ssr / p if p > 0 else 0.0
        mse = self.sigma2
        self.f_stat = float(msr / mse) if mse > 0 else 0.0
        self.f_pvalue = float(1.0 - stats.f.cdf(self.f_stat, dfn=p, dfd=self.df_resid))

        # Standard errors of coefficients: SE(β̂_j) = √(σ² * (XᵀX)⁻¹_jj)
        cov_matrix = self.sigma2 * self.xtx_inv
        self.std_errors = np.sqrt(np.maximum(0.0, np.diag(cov_matrix)))

        # t-statistic and p-values
        self.t_crit_95 = float(stats.t.ppf(0.975, df=self.df_resid))
        self.t_stats = np.where(self.std_errors > 0, self.coefficients / self.std_errors, 0.0)
        self.p_values = [
            float(2 * (1 - stats.t.cdf(np.abs(t), df=self.df_resid))) for t in self.t_stats
        ]

        # 95% Confidence intervals: β̂ ± t_crit * SE
        self.ci_95 = [
            (float(b - self.t_crit_95 * se), float(b + self.t_crit_95 * se))
            for b, se in zip(self.coefficients, self.std_errors)
        ]

        # 2. Dual Verification against statsmodels.OLS
        sm_X = sm.add_constant(X[self.feature_names])
        sm_model = sm.OLS(y, sm_X).fit()
        self.statsmodels_max_diff = float(np.max(np.abs(self.coefficients - sm_model.params.values)))

        # 3. Variance Inflation Factors (VIF)
        for i, col in enumerate(self.feature_names):
            if p > 1:
                other_cols = [c for c in self.feature_names if c != col]
                sub_X = sm.add_constant(X[other_cols])
                sub_model = sm.OLS(X[col], sub_X).fit()
                sub_r2 = sub_model.rsquared
                vif_val = 1.0 / (1.0 - sub_r2) if sub_r2 < 0.99999 else 999.0
            else:
                vif_val = 1.0
            self.vif[col] = float(vif_val)

        self.fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        m = len(X)
        X_vals = X[self.feature_names].values
        X_mat = np.column_stack([np.ones(m), X_vals])
        return X_mat @ self.coefficients

    def predict_with_interval(self, X: pd.DataFrame, alpha: float = 0.05):
        """
        Computes 100*(1-alpha)% Prediction Interval:
        SE_pred = √(σ² * (1 + xᵀ (XᵀX)⁻¹ x))
        Interval = ŷ ± t_crit * SE_pred
        """
        m = len(X)
        X_vals = X[self.feature_names].values
        X_mat = np.column_stack([np.ones(m), X_vals])
        y_pred = X_mat @ self.coefficients

        # Leverage / variance of prediction
        # For each row x_i: x_iᵀ (XᵀX)⁻¹ x_i
        leverage = np.sum((X_mat @ self.xtx_inv) * X_mat, axis=1)
        se_pred = np.sqrt(np.maximum(0.0, self.sigma2 * (1.0 + leverage)))
        t_val = float(stats.t.ppf(1.0 - alpha / 2.0, df=self.df_resid))

        lo = y_pred - t_val * se_pred
        hi = y_pred + t_val * se_pred
        return y_pred, lo, hi, se_pred

    def get_standardized_coefficients(self) -> dict:
        """Computes standardized beta coefficients: β*_j = β_j * (SD(X_j) / SD(Y))"""
        sd_y = np.sqrt(self.sigma2 * self.df_resid / (len(self.feature_names) + self.df_resid))  # approx SD(y)
        res = {}
        for i, col in enumerate(self.feature_names):
            raw_b = self.coefficients[i + 1]
            sd_x = self.feature_stds[col]
            std_b = raw_b * (sd_x / sd_y) if sd_y > 0 else 0.0
            res[col] = float(std_b)
        return res

    def get_params(self) -> dict:
        names = ["Intercept"] + self.feature_names
        coef_list = []
        for i, name in enumerate(names):
            coef_list.append({
                "feature": name,
                "estimate": float(self.coefficients[i]),
                "std_error": float(self.std_errors[i]),
                "t_stat": float(self.t_stats[i]),
                "p_value": float(self.p_values[i]),
                "ci_lower": float(self.ci_95[i][0]),
                "ci_upper": float(self.ci_95[i][1]),
                "vif": self.vif.get(name, 1.0) if name != "Intercept" else None
            })

        # LaTeX formula formatting with KaTeX-safe variable names
        latex_var_map = {
            "temp_c": "\\text{Temp}",
            "rh_pct": "\\text{RH}",
            "wind_kmh": "\\text{Wind}",
            "rain_mm": "\\text{Rain}",
            "pressure_hpa": "\\text{Pressure}",
            "month_sin": "\\sin(\\theta_m)",
            "month_cos": "\\cos(\\theta_m)",
            "pm25_lag1": "\\text{PM}_{2.5, t-1}",
            "pm10": "\\text{PM}_{10}",
            "no2": "\\text{NO}_2",
            "so2": "\\text{SO}_2",
            "co": "\\text{CO}",
            "o3": "\\text{O}_3"
        }

        terms = [f"{self.coefficients[0]:.2f}"]
        for i, name in enumerate(self.feature_names):
            b = self.coefficients[i + 1]
            sign = "+" if b >= 0 else "-"
            var_tex = latex_var_map.get(name, f"\\text{{{name.replace('_', ' ')}}}")
            terms.append(f"{sign} {abs(b):.2f} \\cdot {var_tex}")
        formula_latex = f"\\widehat{{\\text{{PM}}_{{2.5}}}} = " + " ".join(terms)

        return {
            "name": self.name,
            "feature_names": self.feature_names,
            "coefficients": coef_list,
            "formula_latex": formula_latex,
            "r2": float(self.r2),
            "adj_r2": float(self.adj_r2),
            "f_stat": float(self.f_stat),
            "f_pvalue": float(self.f_pvalue),
            "sigma2": float(self.sigma2),
            "df_resid": int(self.df_resid),
            "t_crit_95": float(self.t_crit_95),
            "condition_number": float(self.condition_number),
            "xtx_inv": self.xtx_inv.tolist(),
            "feature_means": self.feature_means,
            "feature_stds": self.feature_stds,
            "standardized_betas": self.get_standardized_coefficients(),
            "statsmodels_max_diff": self.statsmodels_max_diff
        }
