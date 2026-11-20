"""
run_pipeline.py - Orchestrates the full pipeline from 01_acquire to 09_export_json.
"""
import subprocess
import sys
from pathlib import Path

PYTHON_EXE = sys.executable
BASE_DIR = Path(__file__).resolve().parent

scripts = [
    "pipeline/01_acquire.py",
    "pipeline/02_clean.py",
    "pipeline/03_features.py",
    "pipeline/05_split.py",
    "pipeline/06_models.py",
    "pipeline/07_evaluate.py",
    "pipeline/08_insights.py",
    "pipeline/09_export_json.py"
]

print("=== Starting Full Kolkata Air Quality Predictor Pipeline ===")
for script in scripts:
    print(f"\n---> Running {script}...")
    res = subprocess.run([PYTHON_EXE, str(BASE_DIR / script)], cwd=str(BASE_DIR / "pipeline"))
    if res.returncode != 0:
        print(f"FAILED: {script} exited with code {res.returncode}")
        sys.exit(res.returncode)

print("\n=== Pipeline Execution Completed Successfully! ===")
