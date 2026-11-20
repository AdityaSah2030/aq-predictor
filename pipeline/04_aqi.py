"""
04_aqi.py - Indian CPCB National AQI sub-index computation for PM2.5.
Piecewise linear interpolation according to official CPCB breakpoints.
"""
from typing import Tuple
from config import AQI_BREAKPOINTS

def compute_pm25_aqi(pm25: float) -> Tuple[float, str, str]:
    """
    Computes Indian CPCB AQI sub-index for a given 24-hr PM2.5 concentration (µg/m³).
    Returns (aqi_value, category_name, color_token).
    """
    if pm25 is None or pm25 < 0:
        return (0.0, "Good", "--aqi-good")
    
    c = round(float(pm25), 1)
    
    # Handle values exceeding highest breakpoint (250 µg/m³)
    if c >= 250.0:
        # CPCB linear continuation up to 500 (or capped at 500 AQI)
        # 250 -> 400, 380 -> 500 (standard CPCB formula: 400 + (c - 250) * (100 / 130))
        # Or standard formula within [250, 500]: (500 - 401)/(500 - 250)*(c - 250) + 401
        # Following config breakpoints [250, 500] -> [401, 500]:
        aqi = 401.0 + ((500.0 - 401.0) / (500.0 - 250.0)) * (c - 250.0)
        aqi = min(500.0, max(401.0, aqi))
        return (round(aqi, 1), "Severe", "--aqi-severe")

    for bp_lo, bp_hi, i_lo, i_hi, cat, token in AQI_BREAKPOINTS:
        if bp_lo <= c <= bp_hi:
            if bp_hi == bp_lo:
                aqi = float(i_lo)
            else:
                aqi = ((i_hi - i_lo) / (bp_hi - bp_lo)) * (c - bp_lo) + i_lo
            return (round(aqi, 1), cat, token)

    return (500.0, "Severe", "--aqi-severe")

def get_aqi_category(aqi: float) -> str:
    """Returns the CPCB AQI category string for a given AQI index value."""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderately polluted"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very poor"
    else:
        return "Severe"

if __name__ == "__main__":
    test_vals = [0, 15, 30, 45, 60, 75, 90, 105, 120, 180, 250, 300]
    for v in test_vals:
        aqi, cat, tok = compute_pm25_aqi(v)
        print(f"PM2.5: {v:5.1f} µg/m³ -> AQI: {aqi:5.1f} | Category: {cat}")
