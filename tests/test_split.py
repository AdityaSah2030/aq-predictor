import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "pipeline"))

import json
import pytest
from config import PROCESSED_DATA_DIR

def test_split_integrity():
    chrono_file = PROCESSED_DATA_DIR / "split_chrono.json"
    random_file = PROCESSED_DATA_DIR / "split_random.json"

    if not chrono_file.exists():
        pytest.skip("Split files not generated yet")

    with open(chrono_file, "r") as f:
        c_split = json.load(f)
    with open(random_file, "r") as f:
        r_split = json.load(f)

    # No overlap between train and test
    c_train = set(c_split["train_indices"])
    c_test = set(c_split["test_indices"])
    assert len(c_train.intersection(c_test)) == 0

    r_train = set(r_split["train_indices"])
    r_test = set(r_split["test_indices"])
    assert len(r_train.intersection(r_test)) == 0

    # Approximate 80/20 ratio
    total_c = len(c_train) + len(c_test)
    assert 0.78 <= len(c_train) / total_c <= 0.82
