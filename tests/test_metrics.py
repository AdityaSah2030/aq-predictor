import sys
import importlib
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "pipeline"))

import numpy as np
import pytest

eval_module = importlib.import_module("07_evaluate")
calc_metrics = eval_module.calc_metrics

def test_metrics_calculation():
    y_true = np.array([20.0, 30.0, 40.0, 50.0, 60.0])
    y_pred = np.array([22.0, 28.0, 41.0, 49.0, 60.0])

    res = calc_metrics(y_true, y_pred, p=1)

    assert "mae" in res
    assert "rmse" in res
    assert "r2" in res
    assert "confusion_matrix_counts" in res
    assert res["mae"] > 0
    assert 0.0 <= res["r2"] <= 1.0
    assert res["rmse"] >= res["mae"]
