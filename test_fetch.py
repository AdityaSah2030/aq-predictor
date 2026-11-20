import requests

print("Testing Open-Meteo Weather API...")
try:
    url = "https://archive-api.open-meteo.com/v1/archive?latitude=22.5726&longitude=88.3639&start_date=2021-01-01&end_date=2021-01-07&daily=temperature_2m_mean,relative_humidity_2m_mean,wind_speed_10m_mean,precipitation_sum,surface_pressure_mean&timezone=Asia/Kolkata"
    r = requests.get(url, timeout=10)
    print("Open-Meteo Weather status:", r.status_code)
    if r.status_code == 200:
        print("Weather variables:", list(r.json().get("daily", {}).keys()))
except Exception as e:
    print("Open-Meteo Weather error:", e)

print("\nTesting Open-Meteo Air Quality API...")
try:
    url2 = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=22.5726&longitude=88.3639&start_date=2021-01-01&end_date=2021-01-07&hourly=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=Asia/Kolkata"
    r2 = requests.get(url2, timeout=10)
    print("Open-Meteo Air Quality status:", r2.status_code)
    if r2.status_code == 200:
        print("Air quality variables:", list(r2.json().get("hourly", {}).keys()))
except Exception as e:
    print("Open-Meteo Air Quality error:", e)

print("\nTesting OpenCity dataset page...")
try:
    r3 = requests.get("https://data.opencity.in/dataset/kolkata-hourly-air-quality-reports", timeout=10)
    print("OpenCity status:", r3.status_code)
except Exception as e:
    print("OpenCity error:", e)
