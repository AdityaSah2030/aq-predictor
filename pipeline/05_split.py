"""
05_split.py - Train / Test Splitting protocols.
Implements both Chronological Split (honest, no temporal leakage)
and Random Split (80/20, seed 42) for statistical comparison.
"""
import json
import logging
from pathlib import Path
import numpy as np
import pandas as pd

from config import PROCESSED_DATA_DIR, RANDOM_SEED, TRAIN_RATIO

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def split_dataset():
    in_csv = PROCESSED_DATA_DIR / "features_daily.csv"
    if not in_csv.exists():
        raise FileNotFoundError(f"Feature dataset not found at {in_csv}")

    df = pd.read_csv(in_csv)
    n = len(df)
    n_train = int(n * TRAIN_RATIO)
    n_test = n - n_train

    # 1. Chronological Split (Earliest 80% -> Train, Latest 20% -> Test)
    chrono_train_idx = list(range(0, n_train))
    chrono_test_idx = list(range(n_train, n))

    chrono_split = {
        "protocol": "chronological",
        "train_size": len(chrono_train_idx),
        "test_size": len(chrono_test_idx),
        "train_ratio": round(len(chrono_train_idx) / n, 4),
        "test_ratio": round(len(chrono_test_idx) / n, 4),
        "train_start_date": df.iloc[0]["date"],
        "train_end_date": df.iloc[n_train - 1]["date"],
        "test_start_date": df.iloc[n_train]["date"],
        "test_end_date": df.iloc[-1]["date"],
        "train_indices": chrono_train_idx,
        "test_indices": chrono_test_idx
    }

    # 2. Random Split (80/20 Shuffled, Seed 42)
    np.random.seed(RANDOM_SEED)
    shuffled_idx = np.random.permutation(n).tolist()
    random_train_idx = shuffled_idx[:n_train]
    random_test_idx = shuffled_idx[n_train:]

    random_split = {
        "protocol": "random",
        "train_size": len(random_train_idx),
        "test_size": len(random_test_idx),
        "random_seed": RANDOM_SEED,
        "train_indices": random_train_idx,
        "test_indices": random_test_idx
    }

    with open(PROCESSED_DATA_DIR / "split_chrono.json", "w", encoding="utf-8") as f:
        json.dump(chrono_split, f, indent=2)

    with open(PROCESSED_DATA_DIR / "split_random.json", "w", encoding="utf-8") as f:
        json.dump(random_split, f, indent=2)

    logging.info(f"Splits saved: {n_train} train rows, {n_test} test rows. Chrono test period: {chrono_split['test_start_date']} to {chrono_split['test_end_date']}")

if __name__ == "__main__":
    split_dataset()
