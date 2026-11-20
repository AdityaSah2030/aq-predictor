import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "pipeline"))

import numpy as np
import pytest
from models.slr import SimpleLinearRegression
from models.mlr import MultipleLinearRegression
import pandas as pd

def test_slide6_worked_example():
    """
    Validates Slide 6 of Aditya Kumar Sah's presentation:
    Observations (X, Y): (10, 20), (20, 30), (30, 40), (40, 50), (50, 60)
    Step 1: means X̄ = 30, Ȳ = 40
    Step 2: slope b = Σ(X_i - X̄)(Y_i - Ȳ) / Σ(X_i - X̄)² = 1000 / 1000 = 1
    Step 3: intercept a = Ȳ - b·X̄ = 40 - 30 = 10
    Step 4: prediction Ŷ = 10 + X
    Metrics: MAE = 0, MSE = 0, RMSE = 0, R² = 1
    """
    X = np.array([10, 20, 30, 40, 50], dtype=float)
    Y = np.array([20, 30, 40, 50, 60], dtype=float)

    # 1. SLR Scalar Computation
    slr = SimpleLinearRegression("X").fit(X, Y)

    assert pytest.approx(slr.x_mean, 1e-12) == 30.0
    assert pytest.approx(slr.y_mean, 1e-12) == 40.0
    assert pytest.approx(slr.ss_xx, 1e-12) == 1000.0
    assert pytest.approx(slr.ss_xy, 1e-12) == 1000.0
    assert pytest.approx(slr.slope, 1e-12) == 1.0
    assert pytest.approx(slr.intercept, 1e-12) == 10.0
    assert pytest.approx(slr.r, 1e-12) == 1.0
    assert pytest.approx(slr.r2, 1e-12) == 1.0

    preds = slr.predict(X)
    resids = Y - preds
    mae = np.mean(np.abs(resids))
    mse = np.mean(resids ** 2)
    rmse = np.sqrt(mse)

    assert pytest.approx(mae, 1e-12) == 0.0
    assert pytest.approx(mse, 1e-12) == 0.0
    assert pytest.approx(rmse, 1e-12) == 0.0

    # 2. Matrix OLS Computation (Normal Equations β̂ = (XᵀX)⁻¹ XᵀY)
    df_ex = pd.DataFrame({"X": X})
    mlr = MultipleLinearRegression("Slide6_MLR", ["X"]).fit(df_ex, Y)

    # Intercept = 10, Slope = 1
    assert pytest.approx(mlr.coefficients[0], 1e-10) == 10.0
    assert pytest.approx(mlr.coefficients[1], 1e-10) == 1.0
    assert pytest.approx(mlr.r2, 1e-10) == 1.0
