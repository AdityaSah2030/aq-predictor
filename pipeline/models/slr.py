"""
slr.py - Simple Linear Regression (M1) from First Principles.
Y = a + bX + ε
Calculates exact means, sums of squares, slope, intercept, Pearson r, and R².
"""
import numpy as np
from scipy import stats
from .base import BaseRegressionModel

class SimpleLinearRegression(BaseRegressionModel):
    def __init__(self, feature_name: str = "X"):
        super().__init__(f"M1 (SLR: {feature_name})")
        self.feature_name = feature_name
        self.x_mean = 0.0
        self.y_mean = 0.0
        self.slope = 0.0      # b
        self.intercept = 0.0  # a
        self.r = 0.0          # Pearson correlation
        self.r2 = 0.0         # Coefficient of determination
        self.ss_xy = 0.0
        self.ss_xx = 0.0
        self.ss_yy = 0.0
        self.se_slope = 0.0
        self.p_value = 0.0

    def fit(self, x: np.ndarray, y: np.ndarray):
        x = np.asarray(x, dtype=float).ravel()
        y = np.asarray(y, dtype=float).ravel()
        n = len(x)
        if n < 2:
            raise ValueError("SLR requires at least 2 observations")

        self.x_mean = float(np.mean(x))
        self.y_mean = float(np.mean(y))

        # Deviation products from slide 6:
        # SS_xx = Σ(X - X̄)², SS_yy = Σ(Y - Ȳ)², SS_xy = Σ(X - X̄)(Y - Ȳ)
        dx = x - self.x_mean
        dy = y - self.y_mean

        self.ss_xx = float(np.sum(dx * dx))
        self.ss_yy = float(np.sum(dy * dy))
        self.ss_xy = float(np.sum(dx * dy))

        if self.ss_xx == 0:
            raise ValueError("Zero variance in predictor X")

        # Slope b = Σ(X - X̄)(Y - Ȳ) / Σ(X - X̄)²
        self.slope = self.ss_xy / self.ss_xx
        # Intercept a = Ȳ - bX̄
        self.intercept = self.y_mean - self.slope * self.x_mean

        # Correlation r = SS_xy / sqrt(SS_xx * SS_yy)
        if self.ss_xx * self.ss_yy > 0:
            self.r = self.ss_xy / np.sqrt(self.ss_xx * self.ss_yy)
            self.r2 = self.r ** 2
        else:
            self.r = 0.0
            self.r2 = 0.0

        # Residual variance and standard error of slope
        y_pred = self.intercept + self.slope * x
        residuals = y - y_pred
        sse = np.sum(residuals ** 2)
        s2 = sse / (n - 2) if n > 2 else 0.0
        self.se_slope = np.sqrt(s2 / self.ss_xx) if self.ss_xx > 0 else 0.0

        if self.se_slope > 0:
            t_stat = self.slope / self.se_slope
            self.p_value = float(2 * (1 - stats.t.cdf(np.abs(t_stat), df=n - 2)))
        else:
            self.p_value = 0.0

        self.fitted = True
        return self

    def predict(self, x: np.ndarray) -> np.ndarray:
        x = np.asarray(x, dtype=float).ravel()
        return self.intercept + self.slope * x

    def get_params(self) -> dict:
        return {
            "feature": self.feature_name,
            "x_mean": self.x_mean,
            "y_mean": self.y_mean,
            "slope_b": self.slope,
            "intercept_a": self.intercept,
            "pearson_r": self.r,
            "r2": self.r2,
            "ss_xx": self.ss_xx,
            "ss_xy": self.ss_xy,
            "ss_yy": self.ss_yy,
            "se_slope": self.se_slope,
            "p_value": self.p_value,
            "equation": f"Ŷ = {self.intercept:.2f} + {self.slope:.2f}·{self.feature_name}"
        }
