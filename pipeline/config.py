"""
Configuration constants for Kolkata Air Quality Predictor.
All thresholds, paths, standards, and breakpoints defined here.
"""
from pathlib import Path

# Random seed for reproducibility
RANDOM_SEED = 42

# Geographic configuration for Kolkata, West Bengal
LATITUDE = 22.5726
LONGITUDE = 88.3639
TIMEZONE = "Asia/Kolkata"
CITY_NAME = "Kolkata"

# CPCB and WHO Standards for PM2.5 (24-hour average in µg/m³)
CPCB_STANDARD_24H = 60.0    # Indian National Ambient Air Quality Standard
WHO_GUIDELINE_24H = 15.0     # WHO 2021 Air Quality Guideline

# CPCB PM2.5 AQI Breakpoints: (BP_lo, BP_hi, I_lo, I_hi, category_name, color_token)
# Category ranges for PM2.5 (24-h average, µg/m³):
# Good: 0-30 -> AQI 0-50
# Satisfactory: 31-60 -> AQI 51-100
# Moderately polluted: 61-90 -> AQI 101-200
# Poor: 91-120 -> AQI 201-300
# Very poor: 121-250 -> AQI 301-400
# Severe: 250+ -> AQI 401-500
AQI_BREAKPOINTS = [
    (0.0, 30.0, 0, 50, "Good", "--aqi-good"),
    (30.0, 60.0, 51, 100, "Satisfactory", "--aqi-satisfactory"),
    (60.0, 90.0, 101, 200, "Moderately polluted", "--aqi-moderate"),
    (90.0, 120.0, 201, 300, "Poor", "--aqi-poor"),
    (120.0, 250.0, 301, 400, "Very poor", "--aqi-verypoor"),
    (250.0, 500.0, 401, 500, "Severe", "--aqi-severe"),
]

# Seasons definition for Eastern India / Kolkata
# Winter: Dec-Feb, Pre-monsoon: Mar-May, Monsoon: Jun-Sep, Post-monsoon: Oct-Nov
SEASONS = {
    12: "Winter", 1: "Winter", 2: "Winter",
    3: "Pre-monsoon", 4: "Pre-monsoon", 5: "Pre-monsoon",
    6: "Monsoon", 7: "Monsoon", 8: "Monsoon", 9: "Monsoon",
    10: "Post-monsoon", 11: "Post-monsoon"
}

# Directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
INTERIM_DATA_DIR = DATA_DIR / "interim"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
WEB_DIR = BASE_DIR / "web"
EXPORT_DATA_DIR = WEB_DIR / "public" / "data"
DOCS_DIR = BASE_DIR / "docs"

# Quality & cleaning criteria
MIN_CLEAN_ROWS = 730  # ~2 years of daily data required
DROP_OUTLIERS = False
STATION_MODE = "city"  # "city" or "station"

# Training / Test Split
TRAIN_RATIO = 0.80
TEST_RATIO = 0.20
CV_FOLDS = 5
