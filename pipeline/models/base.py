"""
base.py - Abstract base class for regression models.
Defines common interface: fit, predict, and statistical summary.
"""
from abc import ABC, abstractmethod
import numpy as np

class BaseRegressionModel(ABC):
    def __init__(self, name: str):
        self.name = name
        self.fitted = False

    @abstractmethod
    def fit(self, X: np.ndarray, y: np.ndarray):
        pass

    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        pass

    @abstractmethod
    def get_params(self) -> dict:
        pass
