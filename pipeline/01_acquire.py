"""
01_acquire.py - Acquire real atmospheric and air quality data for Kolkata.
Fetches official Copernicus/CAMS air quality reanalysis and historical meteorological data.
"""
import json
import logging
from pathlib import Path
import requests
import sys

from config import LATITUDE, LONGITUDE, TIMEZONE, RAW_DATA_DIR

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

START_DATE = "2022-09-01"
END_DATE = "2024-12-31"

def acquire_air_quality() -> Path:
    logging.info(f"Fetching air quality data for Kolkata ({LATITUDE}, {LONGITUDE}) from {START_DATE} to {END_DATE}...")
    url = (
        f"https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={LATITUDE}&longitude={LONGITUDE}"
        f"&start_date={START_DATE}&end_date={END_DATE}"
        f"&hourly=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone"
        f"&timezone={TIMEZONE}"
    )
    resp = requests.get(url, timeout=45)
    resp.raise_for_status()
    data = resp.json()
    
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_file = RAW_DATA_DIR / "raw_air_quality.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    logging.info(f"Saved air quality data to {out_file} ({len(data.get('hourly', {}).get('time', []))} hourly records)")
    return out_file

def acquire_weather() -> Path:
    logging.info(f"Fetching historical weather data for Kolkata from {START_DATE} to {END_DATE}...")
    url = (
        f"https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={LATITUDE}&longitude={LONGITUDE}"
        f"&start_date={START_DATE}&end_date={END_DATE}"
        f"&daily=temperature_2m_mean,relative_humidity_2m_mean,wind_speed_10m_mean,precipitation_sum,surface_pressure_mean"
        f"&timezone={TIMEZONE}"
    )
    resp = requests.get(url, timeout=45)
    resp.raise_for_status()
    data = resp.json()
    
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_file = RAW_DATA_DIR / "raw_weather.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    logging.info(f"Saved weather data to {out_file} ({len(data.get('daily', {}).get('time', []))} daily records)")
    return out_file

def main():
    try:
        acquire_air_quality()
        acquire_weather()
        logging.info("Data acquisition complete!")
    except Exception as e:
        logging.error(f"Data acquisition failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
