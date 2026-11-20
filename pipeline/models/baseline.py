"""
baseline.py - Baseline benchmark models M0 and M0b.
M0: Global Train Mean Ŷ = Ȳ_train.
M0b: Calendar Month Mean Ŷ = Mean_m(train).
"""
import numpy as np
import pandas as pd
from .base import BaseRegressionModel

class MeanBaseline(BaseRegressionModel):
    """M0: Global train mean floor baseline."""
    def __init__(self):
        super().__init__("M0 (Mean Baseline)")
        self.mean_y = 0.0

    def fit(self, X, y):
        self.mean_y = float(np.mean(y))
        self.fitted = True
        return self

    def predict(self, X):
        return np.full(shape=(len(X),), fill_value=self.mean_y)

    def get_params(self):
        return {"mean_pm25": self.mean_y}

class SeasonalBaseline(BaseRegressionModel):
    """M0b: Calendar month mean baseline."""
    def __init__(self):
        super().__init__("M0b (Monthly Baseline)")
        self.monthly_means = {}
        self.global_mean = 0.0

    def fit(self, df_train: pd.DataFrame, y):
        # expects df_train with 'month' column
        self.global_mean = float(np.mean(y))
        df_copy = df_train.copy()
        df_copy["_target"] = y
        self.monthly_means = df_copy.groupby("month")["_target"].mean().to_dict()
        self.fitted = True
        return self

    def predict(self, df_test: pd.DataFrame):
        months = df_test["month"].values
        preds = np.array([self.monthly_means.get(m, self.global_mean) for m in months])
        return preds

    def get_params(self):
        return {"monthly_means": self.monthly_means, "global_mean": self.global_mean}
