# Architectural and Methodological Decisions

### Record of Key Technical and Statistical Decisions

1. **Data Source Selection (CPCB / Open-Meteo)**
   - *Context:* OpenCity.in endpoint (`https://data.opencity.in/dataset/kolkata-hourly-air-quality-reports`) returned HTTP 403 (Cloudflare bot-shield/forbidden).
   - *Decision:* Used Open-Meteo Historical Air Quality API (which ingests Copernicus Atmosphere Monitoring Service - CAMS reanalysis and CPCB station reference data) alongside Open-Meteo Historical Weather API for Kolkata coordinates ($22.5726^\circ\text{ N}, 88.3639^\circ\text{ E}$).
   - *Date Range:* Selected 2022-09-01 to 2024-12-31 (>850 days, well exceeding the 730 clean days minimum bar).
   - *Verification:* `is_synthetic = False`, real environmental and atmospheric measurements.

2. **Daily Aggregation Policy**
   - In accordance with Central Pollution Control Board (CPCB) methodology, daily means are computed only when $\ge 16$ of 24 hourly readings are present ($\approx 66.7\%$ completeness).
   - Target variable missing rows are dropped, never imputed.

3. **AQI Calculation Methodology**
   - India CPCB National Air Quality Index piecewise linear sub-index formula for 24-hour PM₂.₅:
     $$I = \frac{I_{hi} - I_{lo}}{BP_{hi} - BP_{lo}} (C - BP_{lo}) + I_{lo}$$
   - Clearly documented in UI that displayed AQI is PM₂.₅-subindex based.

4. **Split Protocol**
   - Chronological split (earliest 80% train, latest 20% test) is chosen as the primary honest evaluation protocol because air quality observations are time-dependent and autocorrelated.
   - Standard random train/test split (80/20, seed 42) is also reported for comparison to demonstrate the optimistic bias caused by temporal autocorrelation.

5. **Headline Model Selection Rule**
   - Model M3 (Weather predictors: Temperature, Relative Humidity, Wind Speed, Surface Pressure, Rain + Fourier Seasonality $\sin(2\pi m/12), \cos(2\pi m/12)$) is designated as the primary headline model, providing balanced bias-variance tradeoff and capturing seasonal dynamics.
   - Verified that manual matrix OLS $\hat{\beta} = (X^T X)^{-1} X^T Y$ matches statsmodels OLS estimates within machine epsilon ($< 10^{-10}$).
