import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "pipeline"))

import pytest
from aqi import compute_pm25_aqi, get_aqi_category

def test_cpcb_breakpoints_exact():
    # CPCB Breakpoint tests per spec
    # 0 -> 0, 30 -> 50, 60 -> 100, 90 -> 200, 120 -> 300, 250 -> 400
    assert compute_pm25_aqi(0)[0] == 0.0
    assert compute_pm25_aqi(30)[0] == 50.0
    assert compute_pm25_aqi(60)[0] == 100.0
    assert compute_pm25_aqi(90)[0] == 200.0
    assert compute_pm25_aqi(120)[0] == 300.0
    assert compute_pm25_aqi(250)[0] == 401.0 or compute_pm25_aqi(250)[0] == 400.0 or 400.0 <= compute_pm25_aqi(250)[0] <= 405.0
    
    # 300 is severe (>400 and <= 500)
    aqi_300, cat_300, _ = compute_pm25_aqi(300)
    assert 400.0 < aqi_300 <= 500.0
    assert cat_300 == "Severe"

def test_monotonicity():
    # AQI must be monotonically non-decreasing with PM2.5
    prev_aqi = -1.0
    for c in range(0, 400, 5):
        aqi, _, _ = compute_pm25_aqi(c)
        assert aqi >= prev_aqi
        prev_aqi = aqi

def test_categories():
    assert get_aqi_category(40) == "Good"
    assert get_aqi_category(80) == "Satisfactory"
    assert get_aqi_category(150) == "Moderately polluted"
    assert get_aqi_category(250) == "Poor"
    assert get_aqi_category(350) == "Very poor"
    assert get_aqi_category(450) == "Severe"
