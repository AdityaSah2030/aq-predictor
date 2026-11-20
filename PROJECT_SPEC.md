# PROJECT_SPEC.md — Kolkata Air Quality Predictor (Phase 1)

> **Audience:** an AI coding agent that will build this project end to end.
> **Companion file:** `design.md` (visual design system). Read BOTH files fully before writing any code.
> **Origin:** Academic project for *Probability & Statistics (PCCAIML501)*, titled **"Regression-Based Air Quality Prediction — Mathematical Modeling & Statistical Estimation of PM₂.₅ Concentrations"**. The 8-slide deck defines the mathematical scope (SLR, MLR, OLS, correlation, MAE/MSE/RMSE/R²). This document turns that deck into a working data product.

---

## 0. Rules for the agent (read first)

1. **Never fabricate data.** All numbers shown to users must come from a real dataset or from a computation on it. If a dataset cannot be downloaded (no network, blocked, schema mismatch), **stop and report** which file is missing and how the human should fetch it (Section 4.5). You may build UI against a clearly labelled synthetic file (`is_synthetic = true`, visible banner in the UI) *only* so development can continue, and it must never be presented as real.
2. **Statistics are computed offline in Python**, written to JSON, and the frontend only renders them (the one exception is the live prediction calculator, Section 13.6, which uses exported coefficients).
3. **Every claim in the UI must be traceable** to a field in a JSON artifact. No hardcoded insight text with hardcoded numbers; insight sentences are templates filled from data (Section 12).
4. **Be honest about accuracy.** Show test-set metrics only, label the split, show baselines, and show limitations (Section 17). Do not tune on the test set.
5. **Reproducibility:** fixed random seed `42`, pinned dependency versions, one command to regenerate all artifacts (`make pipeline`).
6. **Work in the order of the milestones in Section 16** and tick the checklist as you go. After each milestone, run the tests for it.
7. If any instruction here conflicts with reality (a column does not exist, a URL changed), **adapt, document the change in `docs/DECISIONS.md`, and continue**; do not silently skip.

---

## 1. Product summary

A web app that:

1. Uses a **real, India-based dataset, focused on Kolkata**, of daily PM₂.₅ (and related pollutants / weather).
2. Converts PM₂.₅ into an **Air Quality Index (AQI)** using the Indian **CPCB** scale.
3. Fits **simple and multiple linear regression (OLS)** to predict PM₂.₅ from environmental variables, using a **train/test split**.
4. **Evaluates** the models with MAE, MSE, RMSE, R², adjusted R², plus statistical tests and residual diagnostics.
5. Presents **insights to ordinary users through infographics** (charts, calendar heatmaps, gauges, plain-language insight cards), not raw tables.

Target users: (a) the examiner/professor, who wants to see correct maths; (b) a lay user, who wants to understand Kolkata's air quality in 30 seconds.

### 1.1 Mapping from the deck to features

| Deck slide | Concept | Where it appears in the app |
|---|---|---|
| 2 | Y = f(X₁…Xₙ); predictors: temperature, humidity, wind speed, sensor location | Model page "Inputs → Model → Output" diagram; station is a categorical predictor if multi-station |
| 3 | Minimise SSE; correlation analysis; SLR & MLR; OLS; accuracy evaluation; limitations | Method page, Model page, Accuracy page, Limitations page |
| 4 | 5-step pipeline: collect → preprocess → model → predict → error analysis | Animated pipeline strip on Home + Method page; also the order of the Python pipeline |
| 5 | SLR `Y=a+bX+ε`, MLR, `β̂=(XᵀX)⁻¹XᵀY`, correlation `−1≤r≤1`, residual plot | Model page (equations rendered with KaTeX) and Residuals chart |
| 6 | Worked example: points (10,20)…(50,60) ⇒ `Ŷ=10+X`, MAE=MSE=RMSE=0, R²=1 | **Learn page** + a unit test that the pipeline reproduces these exact numbers (Section 14) |
| 7 | Data quality and feature selection determine reliability | Data Quality panel (missingness, outliers removed) |
| 8 | Limitations (non-linearity, multicollinearity, data quality) and roadmap (Polynomial → Ridge/Lasso → real-time) | Limitations page + "Phase 2 roadmap" card; **Phase 1 only computes VIF and a simple polynomial/log comparison as a teaser (optional)** |

---

## 2. Scope

### 2.1 In scope — Phase 1
- Data acquisition script(s), cleaning, feature engineering, AQI computation.
- Chronological **and** random train/test splits (both reported, Section 8).
- Baseline, simple linear, and multiple linear regression via OLS.
- Evaluation metrics + hypothesis tests + diagnostics.
- JSON artifact export.
- Responsive static web dashboard with infographics, light/dark mode, per `design.md`.
- Prediction calculator (weather inputs → predicted PM₂.₅ → AQI category, with prediction interval).
- Automated tests and a README.

### 2.2 Out of scope — Phase 1 (do NOT build)
- Live/real-time sensor feeds, accounts/login, databases/servers, push notifications.
- Ridge/Lasso/polynomial *as primary models* (Phase 2 roadmap from slide 8). A single clearly-labelled "teaser" comparison is allowed only if time permits (Section 10.5).
- Health advice beyond generic, CPCB-category-based wording.
- Mobile native apps.

### 2.3 Phase 2 (future, for context only)
Polynomial regression → Ridge/Lasso → real-time time-series integration (deck slide 8). Keep the code modular so these slot in (`models/` folder with a common `fit/predict/evaluate` interface).

---

## 3. Tech stack and repository layout

### 3.1 Stack
| Layer | Choice | Notes |
|---|---|---|
| Pipeline | **Python 3.11+**, `pandas`, `numpy`, `scipy`, `statsmodels`, `scikit-learn`, `requests`, `pytest` | `statsmodels` gives p-values, CIs, DW, BP, VIF |
| Artifacts | JSON files in `web/public/data/` | Single source of truth for the UI |
| Frontend | **Vite + React + TypeScript**, **Recharts** (charts), **KaTeX** (equations), plain CSS using variables from `design.md` | No UI framework with its own theme; use `design.md` tokens. Tailwind is NOT used |
| Hosting | Static build (`npm run build`), deployable on GitHub Pages / Netlify / Vercel | No backend |
| Task runner | `Makefile` (`make setup`, `make data`, `make pipeline`, `make test`, `make web`) | |

If the human prefers a different stack, they will say so. Otherwise use the above.

### 3.2 Repository tree
```
kolkata-aqi-predictor/
├── PROJECT_SPEC.md              # this file
├── design.md                    # design system
├── README.md
├── Makefile
├── requirements.txt             # pinned
├── docs/
│   ├── DECISIONS.md             # every deviation / assumption
│   └── DATA_DICTIONARY.md       # generated by pipeline
├── data/
│   ├── raw/                     # untouched downloads (gitignored if large)
│   ├── interim/                 # after cleaning
│   └── processed/               # modelling table(s)
├── pipeline/
│   ├── config.py                # constants: seed, paths, thresholds, AQI breakpoints
│   ├── 01_acquire.py
│   ├── 02_clean.py
│   ├── 03_features.py
│   ├── 04_aqi.py
│   ├── 05_split.py
│   ├── 06_models.py
│   ├── 07_evaluate.py
│   ├── 08_insights.py
│   ├── 09_export_json.py
│   └── models/                  # base.py, baseline.py, slr.py, mlr.py (Phase 2: poly.py, ridge.py, lasso.py)
├── tests/
│   ├── test_aqi.py
│   ├── test_ols_sample.py       # slide-6 example
│   ├── test_split.py
│   ├── test_metrics.py
│   └── test_export_schema.py
└── web/
    ├── index.html
    ├── package.json
    ├── public/data/*.json       # produced by pipeline
    └── src/
        ├── styles/tokens.css    # CSS variables from design.md
        ├── styles/global.css
        ├── components/          # Card, StatCard, InsightCard, AQIBadge, Gauge, CalendarHeatmap, Tabs, Toggle, ...
        ├── charts/              # one file per chart
        ├── pages/               # Home, Explore, Model, Accuracy, Predict, Learn, Limitations
        ├── lib/                 # aqi.ts, format.ts, predict.ts, insightTemplates.ts
        └── App.tsx
```

---

## 4. Data

### 4.1 Geographic focus
**Kolkata, West Bengal.** Coordinates used for weather: **22.5726° N, 88.3639° E**. If Kolkata data is too sparse, use "West Bengal / Eastern India" as a documented fallback, but Kolkata is the target.

### 4.2 Target variable
**Y = daily mean PM₂.₅ (µg/m³)**. AQI is *derived* from it (Section 7).

### 4.3 Candidate sources (agent must check what is actually reachable, then pick; record the choice in `docs/DECISIONS.md`)

| Priority | Source | What it provides | How to get it |
|---|---|---|---|
| **A (primary)** | **OpenCity.in — "Kolkata Hourly Air Quality Reports"** (CPCB/WBPCB station data, 2017–2023; per-station CSVs such as Ballygunge, Jadavpur, Rabindra Sarobar, Bidhannagar) | Station-level air-quality readings; license listed as public domain; originates from `airquality.cpcb.gov.in` | Page: `https://data.opencity.in/dataset/kolkata-hourly-air-quality-reports` → download each station CSV into `data/raw/opencity/` |
| **A2** | **CPCB CCR portal** (`https://app.cpcbccr.com/`) | Most granular and recent official data (15-min/hourly/daily) per station, incl. Kolkata | Manual download (the human exports CSV) into `data/raw/cpcb/`; this portal is interactive so the agent should not scrape it aggressively |
| **B (fallback / supplement)** | **Kaggle "Air Quality Data in India (2015–2020)"** (`city_day.csv` includes a `Kolkata` city with PM2.5, PM10, NO, NO2, NOx, NH3, CO, SO2, O3, AQI, AQI_Bucket) | Daily city-level data | Human downloads from Kaggle (needs login) into `data/raw/kaggle/` |
| **C (weather predictors)** | **Open-Meteo Historical Weather API** (no key needed): `https://archive-api.open-meteo.com/v1/archive` | Daily temperature, relative humidity, wind speed, precipitation, pressure for lat/lon | Script `01_acquire.py` calls it with `latitude=22.5726&longitude=88.3639&timezone=Asia/Kolkata` and a date range matching the pollutant data. **Verify the daily variable names against the current Open-Meteo docs before coding** (e.g. `temperature_2m_mean`, `relative_humidity_2m_mean`, `wind_speed_10m_mean`, `precipitation_sum`, `surface_pressure_mean`) |
| **D (sanity reference, do not train on it)** | CSE (Centre for Science and Environment) Kolkata analyses of CPCB data; AQLI/UChicago Kolkata page | Published seasonal/annual figures | Use only to sanity-check that your computed winter vs monsoon pattern is plausible |

> **Important unknown:** the exact column names/units of the OpenCity station CSVs were not verified when this spec was written. `01_acquire.py` must first **inspect** each file (print columns, dtypes, date range, % missing) and write `docs/DATA_DICTIONARY.md`; then `02_clean.py` maps real column names to the canonical schema in 4.4. If the OpenCity files lack PM₂.₅ or are AQI-only, switch to source B and say so in `DECISIONS.md`.

### 4.4 Canonical schema (after cleaning) — one row per `(station, date)`
| Column | Type | Unit | Notes |
|---|---|---|---|
| `date` | date | — | IST calendar day |
| `station` | category | — | e.g. `Ballygunge`, `Jadavpur`, `Rabindra Sarobar`, `Bidhannagar`, or `Kolkata (city)` |
| `pm25` | float | µg/m³ | **target** |
| `pm10` | float | µg/m³ | optional |
| `no2`, `so2`, `co`, `o3` | float | µg/m³ (CO mg/m³) | optional, used only in "diagnostic" model C |
| `temp_c` | float | °C | from Open-Meteo or station |
| `rh_pct` | float | % | relative humidity |
| `wind_kmh` | float | km/h | convert m/s → km/h (×3.6) if needed |
| `rain_mm` | float | mm | optional |
| `pressure_hpa` | float | hPa | optional |
| `n_obs` | int | — | number of hourly/sub-daily readings that formed the daily mean |
| `is_synthetic` | bool | — | must be `False` for real data |

### 4.5 If the agent cannot download data
Create `data/README_DATA.md` with: exact URLs, which button to press, target filenames, and expected folder. Then **halt the pipeline** with a clear error. Do not proceed with invented values.

---

## 5. Cleaning and preprocessing (deck slide 4, step 2)

Implement in `02_clean.py`; log every decision with counts into `data/interim/cleaning_report.json` (rendered later in the Data Quality panel).

1. **Parse dates**; convert to IST; floor to calendar day.
2. **Standardise units** (see schema). Convert wind m/s → km/h if needed.
3. **Daily aggregation** if input is hourly/sub-hourly: daily mean per pollutant **only if ≥ 16 of 24 hourly readings exist** (≈ 67 %, CPCB-style completeness); otherwise set to NaN. Store `n_obs`.
4. **Invalid values:** PM₂.₅ ≤ 0 or > 1000 µg/m³ → NaN (instrument errors). Record counts. Temperature outside −5…50 °C, RH outside 0…100, wind < 0 → NaN.
5. **Outliers:** flag (do not delete) values beyond Q3 + 3·IQR *within each month-of-year* using `is_outlier_pm25`. Real severe winter events are legitimate; keep them, but show the count. Provide config flag `DROP_OUTLIERS=False` default.
6. **Missing values:**
   - Report % missing per column per year.
   - **Target (`pm25`) missing → drop the row** (never impute the target).
   - Predictors: if gap ≤ 2 consecutive days → linear interpolation; otherwise drop the row. Predictors imputed this way must be counted in the report.
7. **Duplicates:** drop exact duplicates on `(station, date)` (keep the one with larger `n_obs`).
8. **Minimum data guard:** require at least **730 clean rows** (≈ 2 years) overall; otherwise raise an error recommending another source.
9. **Station policy:** run in two modes, selectable via `config.STATION_MODE`:
   - `"city"` (default): average stations per day (require ≥ 2 stations reporting) → one Kolkata series.
   - `"station"`: keep stations separate and use `station` as a categorical predictor (one-hot, drop-first). This mirrors predictor **X₄ "Sensor location"** on deck slide 2.

---

## 6. Feature engineering (`03_features.py`)

Keep features **interpretable** (this is a statistics course; each coefficient must be explainable).

| Feature | Definition | Used in |
|---|---|---|
| `temp_c`, `rh_pct`, `wind_kmh` | raw weather | A, B |
| `rain_mm`, `pressure_hpa` | raw | B (if available) |
| `month_sin`, `month_cos` | `sin/cos(2π·month/12)` | B |
| `season` | categorical: **Winter** (Dec–Feb), **Pre-monsoon** (Mar–May), **Monsoon** (Jun–Sep), **Post-monsoon** (Oct–Nov) | Explore charts, dummies in B (optional) |
| `is_weekend` | bool | Explore |
| `pm25_lag1` | previous day's PM₂.₅ (same station) | model D only (clearly labelled "uses yesterday's PM₂.₅") |
| `pm10`, `no2`, `so2`, `co`, `o3` | co-pollutants | model C only |
| `log_pm25` | `ln(pm25)` | diagnostic only (Section 10.5) |

Drop the first row per station after creating lags. Standardisation: **not required for OLS interpretation**; export coefficients in original units. (A z-scored copy may be created only for the "relative importance" chart, using standardised coefficients.)

---

## 7. AQI computation (`04_aqi.py`, mirrored in `web/src/lib/aqi.ts`)

Use the Indian **CPCB National AQI** scale. We compute a **PM₂.₅ sub-index AQI** from daily-mean PM₂.₅ (the official AQI is the max of pollutant sub-indices over a 24-h average with ≥ 3 pollutants incl. PM; state this simplification in the UI: *"AQI shown is based on PM₂.₅ only"*).

**PM₂.₅ breakpoints (µg/m³, 24-h) → AQI sub-index:**
| Category | PM₂.₅ range | AQI range | Colour token |
|---|---|---|---|
| Good | 0 – 30 | 0 – 50 | `--aqi-good` |
| Satisfactory | 31 – 60 | 51 – 100 | `--aqi-satisfactory` |
| Moderately polluted | 61 – 90 | 101 – 200 | `--aqi-moderate` |
| Poor | 91 – 120 | 201 – 300 | `--aqi-poor` |
| Very poor | 121 – 250 | 301 – 400 | `--aqi-verypoor` |
| Severe | 250+ | 401 – 500 | `--aqi-severe` |

**Linear interpolation:**
`I = (I_hi − I_lo) / (BP_hi − BP_lo) · (C − BP_lo) + I_lo`, where C is the concentration, rounded to 1 decimal before lookup; cap at 500.
Handle the gaps between integer breakpoints (e.g. 30.5) by treating ranges as half-open intervals `[BP_lo, BP_hi)` with the lower bound of the next category as the upper bound of the previous.

Also store `aqi` (number) and `aqi_category` (string) for observed and predicted values.

Tests (`test_aqi.py`) must include: C=0→0, C=30→50, C=60→100, C=90→200, C=120→300, C=250→400, C=300→>400 and ≤500, monotonicity over a sweep, and category boundaries.

---

## 8. Train / test split (`05_split.py`)

Report **two** protocols; present both honestly.

1. **Random split (textbook, matches the syllabus):** 80 % train / 20 % test, `random_state=42`, shuffled. Warn in the UI that daily data are autocorrelated, so this is optimistic.
2. **Chronological split (primary for honesty):** train = earliest 80 % of dates, test = latest 20 %. **This is the headline result.** No shuffling. No row from the test period may appear in train. If the data span multiple stations, split by date, not by row.

Additionally compute **5-fold `TimeSeriesSplit`** cross-validation on the training portion for RMSE/R² mean ± sd.

All preprocessing parameters (e.g. imputation, scaling) are **fit on train only** and applied to test. Save split indices to `data/processed/split_{random,chrono}.json`. `test_split.py` asserts: no overlap, sizes ≈ 80/20, chronological ordering holds.

---

## 9. Models (`pipeline/models/`, `06_models.py`)

Common interface: `fit(X_train, y_train)`, `predict(X)`, `summary()`.

| ID | Name | Formula | Purpose |
|---|---|---|---|
| **M0** | Baseline (train mean) | `Ŷ = Ȳ_train` | Floor to beat; R² on test ≤ 0 expected |
| **M0b** | Seasonal-mean baseline | `Ŷ = mean PM₂.₅ for that calendar month in train` | Stronger, still simple benchmark |
| **M1** | **Simple Linear Regression** | `Y = a + bX + ε` with X = the single weather variable most correlated (|r|) with PM₂.₅ **in the training set**. Also fit one SLR per weather variable for the correlation chart | Deck slide 5-A |
| **M2** | **Multiple Linear Regression (weather)** | `Y = β₀ + β₁·temp + β₂·rh + β₃·wind (+ rain + pressure)` | Deck slide 2/5-B; the "core" model |
| **M3** | MLR + seasonality | M2 + `month_sin`, `month_cos` | Shows how much seasonality adds |
| **M4 (diagnostic)** | MLR + co-pollutants | M3 + PM10, NO₂, SO₂, CO, O₃ | Labelled **"Explanatory, not forecasting"**: pollutants are measured simultaneously, so it is not usable for prediction from weather alone |
| **M5 (optional)** | MLR + `pm25_lag1` | M3 + yesterday's PM₂.₅ | Labelled "Next-day estimate"; usually much better; explain autocorrelation |

Implementation notes:
- Fit using `statsmodels.OLS` (with `add_constant`) so inference is available. **Also** compute `β̂ = (XᵀX)⁻¹XᵀY` manually with NumPy (`np.linalg.solve`/`pinv`) and assert it matches statsmodels to `1e-8`. Show this manual computation on the Learn page (deck slide 5-C).
- Check `XᵀX` is non-singular (condition number); if not, report it.
- Station mode: add station dummies (drop-first).
- **Headline model for the dashboard = M3** (weather + seasonality) unless M2 is within 0.01 test-R² of it, in which case prefer the simpler M2 and say why. Record the choice rule in `DECISIONS.md`.

---

## 10. Evaluation and statistical analysis (`07_evaluate.py`)

### 10.1 Accuracy metrics (computed on train and test separately, for both split protocols)
| Metric | Formula | Notes |
|---|---|---|
| MAE | `(1/m) Σ |Yᵢ − Ŷᵢ|` | µg/m³ |
| MSE | `(1/m) Σ (Yᵢ − Ŷᵢ)²` | (µg/m³)² |
| RMSE | `√MSE` | µg/m³ |
| R² | `1 − Σ(Yᵢ−Ŷᵢ)² / Σ(Yᵢ−Ȳ)²` | Use the standard scikit-learn definition (denominator uses the mean of the set being scored). Also report the baseline M0's R² on the same set; on a chronological test set it can be negative, and that is expected |
| Adjusted R² | `1 − (1−R²)(m−1)/(m−p−1)` | train only |
| Bias (mean error) | `mean(Ŷ − Y)` | detects systematic over/under-prediction |
| MAPE / sMAPE | optional; warn that low PM₂.₅ days inflate MAPE | |
| **AQI category accuracy** | % of test days where predicted category == observed category | Plus **within-one-category accuracy** |
| **Confusion matrix** | 6×6 over CPCB categories | Used in infographic |
| Pearson r (Ŷ vs Y) | | |

### 10.2 Statistical inference (train fit; M1–M3)
- Overall **F-test** (`H₀: all slopes = 0`): F, df, p.
- Per-coefficient: estimate, **standard error, t, p-value, 95 % CI**.
- **Correlation matrix** (Pearson) and **Spearman** for weather variables vs PM₂.₅, with p-values.
- **VIF** for each predictor (flag > 5 moderate, > 10 severe). This addresses *multicollinearity* from slide 8.
- Report **standardised coefficients** to rank predictor influence.

### 10.3 Residual diagnostics (test and train)
- Residuals vs fitted (check homoscedasticity); **Breusch–Pagan** p.
- **Q–Q plot** data and **Shapiro–Wilk** (on a ≤ 5000 sample) / Jarque–Bera.
- **Durbin–Watson** for autocorrelation (expect < 2 → positive autocorrelation; explain).
- **Cook's distance** top-10 influential days.
- Residual histogram bins.
- Seasonal residual box plots (is error larger in winter?).

### 10.4 Uncertainty
- 95 % **prediction interval** for each test point (statsmodels `get_prediction(...).summary_frame(alpha=0.05)`), and the **empirical coverage** on the test set (what % of actual values fall inside). Report honestly even if it is below 95 %.
- Bootstrap (1000 resamples, seed 42) 95 % CI for test RMSE and R² (block bootstrap with 14-day blocks for chronological data).

### 10.5 Optional teaser for Phase 2 (only after everything else passes)
Compare M3 against (i) log-transformed target OLS (`ln PM₂.₅`), (ii) degree-2 polynomial in the 3 weather variables, evaluated on the chrono test set. Present as a small **"What next? (Phase 2 preview)"** card with ΔRMSE. Do not add Ridge/Lasso in Phase 1.

---

## 11. JSON artifacts (written by `09_export_json.py` to `web/public/data/`)

Every file has the header `{ "generated_at": ISO-8601, "schema_version": "1.0", "is_synthetic": false, ... }`. Keep files small (< 1 MB each; downsample plot points to ≤ 2 000 where needed, but never downsample the daily series used for the calendar heatmap).

| File | Contents |
|---|---|
| `meta.json` | dataset name, source(s), URLs, licence note, date range, n rows, stations, geographic bounds, STATION_MODE, split protocol info, headline model ID, software versions |
| `daily.json` | array of `{date, pm25, aqi, category, temp_c, rh_pct, wind_kmh, rain_mm?, season, station?}` |
| `monthly.json` | per `(year, month)` mean/median/p90 PM₂.₅, % days in each AQI category, n days |
| `seasonal.json` | per season stats + distribution (min, q1, median, q3, max, mean, n); monthly climatology (mean PM₂.₅ by calendar month) |
| `yearly.json` | per year mean PM₂.₅, % days exceeding the **CPCB 24-h standard (60 µg/m³)** and the **WHO 24-h guideline (15 µg/m³ per 2021 guideline; read the figure from `config.py` constants and label it)** |
| `correlations.json` | Pearson/Spearman matrix, per-variable SLR results (a, b, r, R², p) |
| `models.json` | for each model: formula string (LaTeX), coefficients with SE/t/p/CI, F-test, VIF, adj R², n_train, condition number, `xtx_inv`, `sigma2`, `df_resid`, `t_crit_95`, feature order and means (for the calculator) |
| `metrics.json` | all Section-10.1 metrics for train/test × random/chrono × models; bootstrap CIs; CV mean±sd; coverage |
| `predictions.json` | test rows: `{date, actual, predicted, lo95, hi95, actual_category, predicted_category}` (chrono test is the default; include random-split test under another key) |
| `residuals.json` | fitted, residual, standardised residual, QQ data, histogram bins, DW, BP, SW/JB, Cook's top-10, seasonal residual box stats |
| `confusion.json` | 6×6 counts and row-normalised matrix, category accuracy, within-one accuracy |
| `insights.json` | list of generated insight objects (Section 12) |
| `data_quality.json` | the cleaning report (counts of missing, removed, imputed, flagged) |
| `learn_example.json` | the slide-6 worked example with every step's numbers (Section 14) |

`test_export_schema.py` validates every file against a JSON Schema (store schemas in `pipeline/schemas/`).

---

## 12. Insights engine (`08_insights.py`)

Goal: turn statistics into **plain-language, verifiable sentences** and a visual hint.

Each insight object:
```json
{
  "id": "worst_season",
  "title": "Winter is Kolkata's worst season",
  "text": "Average PM2.5 in winter was 78 µg/m³, about 3.1× the monsoon average (25 µg/m³).",
  "metric": { "value": 78.0, "unit": "µg/m³", "compare_value": 25.0 },
  "severity": "alert | info | good",
  "chart_ref": "seasonal_bar",
  "evidence": ["seasonal.json#/winter/mean", "seasonal.json#/monsoon/mean"]
}
```

**Required insights (compute all; skip any whose data is insufficient, and log why):**
1. Best and worst **season** (mean PM₂.₅ and ratio).
2. Best and worst **month**.
3. **% of days per AQI category** overall and for the latest full year.
4. **Days exceeding the CPCB 24-h standard (60 µg/m³)** — count and share, latest full year vs earliest full year → trend sentence ("improved / worsened by X %"). Use a simple linear trend with slope and p-value; only say "improved/worsened" if p < 0.05, else "no clear trend".
5. **Weekday vs weekend** difference (Welch t-test; report only if p < 0.05).
6. **Wind effect:** "each +1 km/h of wind is associated with −b µg/m³ PM₂.₅, holding other factors fixed" (from M2/M3; use CI; wording must say *associated with*, never *causes*).
7. **Humidity effect** and **temperature effect**, same wording.
8. **Rain effect:** mean PM₂.₅ on rainy (> 2.5 mm) vs dry days.
9. **Model quality summary:** headline model's chrono-test RMSE, R², category accuracy, and a one-line plain verdict ("Good at tracking seasonal swings; weaker on sudden spikes").
10. **Hardest days to predict:** season with the largest mean absolute error.
11. **Worst 5 days** on record (date, PM₂.₅, category).
12. **Longest streak** of consecutive "Poor or worse" days.
13. **Data caveat insight** (`severity: info`): % of rows missing/dropped.

Wording rules: no medical claims; no causal language; round sensibly; every number in text must be derived from the data fields in `evidence`; text templates live in `pipeline/insight_templates.py`. English only in Phase 1; keep strings externalised so Bengali/Hindi can be added later.

---

## 13. Frontend (web/) — pages, infographics, behaviour

Follow `design.md` strictly for tokens, spacing, components, and motion. Single-page app with hash routes (`#/`, `#/explore`, `#/model`, `#/accuracy`, `#/predict`, `#/learn`, `#/limits`). Fixed glass header with: logo (left), nav (centre), theme toggle (right). On mobile, nav collapses into a bottom sheet/menu.

Global behaviour:
- Load all JSON on start with a skeleton shimmer; show friendly error state with the failing file name if a fetch fails.
- A persistent but unobtrusive **banner** if `is_synthetic` is true.
- A **"Data & method"** footer line: source, date range, "AQI shown is PM₂.₅-based (CPCB scale)", and "Statistical model, not a forecast service".
- Charts: each has a one-line plain-English **title as a takeaway** (e.g. "Winter air is roughly 3× dirtier than monsoon air") plus a small caption with the data source. Add a **"View data"** disclosure that shows the underlying numbers in a table (accessibility).
- Tooltips on all charts; all colours via CSS variables; chart colours must also work in dark mode.
- Every chart is accessible: `role="img"` with an `aria-label` summarising the takeaway, and the "View data" table for screen readers.

### 13.1 Home (`#/`) — "Kolkata air at a glance"
1. **Hero**: title, subtitle, date range of data, primary button "Explore the data", secondary "Try the predictor". (Hero layout per `design.md`.)
2. **AQI Gauge** (semicircle, 6 coloured arcs) showing the **latest available day's** AQI and category, labelled with the date ("Latest data: 12 Mar 2023", never implying "live").
3. **4 StatCards**: average PM₂.₅ (all time / latest year), % of "good + satisfactory" days, worst month, headline model RMSE.
4. **Top 3 insight cards** (from `insights.json`: worst season, wind effect, model quality).
5. **Pipeline strip** (5 steps from slide 4) with a one-line stat under each step (e.g. "Collected: 2,140 days", "Cleaned: 37 removed", "Model: MLR", "Predicted: 428 test days", "Error: RMSE 18 µg/m³").

### 13.2 Explore (`#/explore`) — infographics about the data
Use a **segmented control** (Year selector) and **tabs**. Required visuals:
1. **Calendar heatmap** (GitHub-style, one square per day, CPCB category colours, month labels, year selector). Hover shows date, PM₂.₅, AQI, category. **Hero visual of the app.**
2. **Monthly climatology**: bar/line of mean PM₂.₅ by calendar month with the 60 µg/m³ standard as a dashed line.
3. **Seasonal comparison**: box plots or violin-like range bars for four seasons.
4. **AQI category stacked bar by month** (share of days per category).
5. **Year-over-year trend** line with a linear trend overlay and the % days above the standard.
6. **Weather relationships**: three small scatter plots (temp, humidity, wind vs PM₂.₅) each with SLR line, r, R², and slope sentence.
7. **Correlation heatmap** (variables × variables) with a diverging scale built from design tokens.
8. **Weekday pattern** bar chart (only if the insight is significant; otherwise show with the note "no significant difference").
9. **Data Quality panel**: donut or bar of kept vs dropped rows, and a missingness-by-year strip.

### 13.3 Model (`#/model`) — maths made visual
1. **Inputs → Model → Output diagram** (slide 2 style) populated with the actual predictors.
2. **Equation card** (KaTeX): fitted equation with real coefficients, e.g. `PM̂₂.₅ = 112.4 − 1.3·Temp + 0.4·RH − 6.2·Wind + …`.
3. **Coefficient forest plot**: estimate ± 95 % CI per predictor (standardised toggle), zero line, significance badge.
4. **Predictor importance** bar (|standardised β|).
5. **VIF table** with colour flags.
6. **Model comparison table/bars**: M0, M0b, M1, M2, M3 (and M4/M5 if built) on chrono-test RMSE and R², with the winner highlighted and the headline-model rule explained.
7. **OLS explainer accordion**: SSE definition, `β̂=(XᵀX)⁻¹XᵀY`, manual-vs-library check ("Difference: 3e-12 ✔").

### 13.4 Accuracy (`#/accuracy`) — "How much can we trust it?"
1. **Metric cards**: MAE, RMSE, R², category accuracy (chrono test), each with a plain-language caption ("On a typical day we are off by about X µg/m³") and the baseline's value for comparison.
2. **Split toggle**: *Time-based (recommended)* vs *Random* with a note about autocorrelation and optimism.
3. **Actual vs Predicted time series** over the test period (line, with the 95 % interval band).
4. **Predicted-vs-actual scatter** with the 45° line and R².
5. **Confusion matrix heatmap** across the six AQI categories + "within one category" accuracy.
6. **Residual panel** (tabs): residuals vs fitted, histogram, Q–Q plot, residuals by season, with a one-line verdict each (e.g. "Errors fan out at high pollution: model is less reliable on severe days").
7. **Test results table**: metric × (train, test) × (random, chrono) with bootstrap CIs.
8. **Diagnostics checklist** (✔ / ⚠ chips): normality, homoscedasticity, autocorrelation (DW), multicollinearity (VIF), interval coverage, each with a plain sentence.

### 13.5 Insights on Home and Explore
Render `insights.json` as **InsightCards** (icon, title, one sentence, small sparkline or mini-bar, severity colour stripe). Provide a filter chips row: *All · Seasons · Weather · Model · Data*.

### 13.6 Predict (`#/predict`) — calculator
Inputs (with sensible ranges from the training data min/max): temperature (slider + number), relative humidity, wind speed, month (select), optional rain. Show:
- **Predicted PM₂.₅** with 95 % prediction interval, **AQI value** and **category badge**, and a gauge.
- Interval calculation in the browser: `ŷ = xᵀβ̂`; `se_pred = √(σ²·(1 + xᵀ(XᵀX)⁻¹x))`; `PI = ŷ ± t_crit·se_pred`. Use the exported `xtx_inv`, `sigma2`, `t_crit_95`, and feature order. A unit test must compare this against the Python output for 5 fixed examples (tolerance 1e-6).
- **Extrapolation warning** if any input is outside the training range.
- A **"typical day"** preset buttons: *Winter morning, Monsoon day, Pre-monsoon heat*, using seasonal medians from the data (not hardcoded).
- A short **"What would change this?"** sensitivity bar: effect on the prediction of +1 SD in each input.
- Disclaimer: *"Estimate from a statistical model fitted to historical data; not an official forecast. For official AQI, see CPCB/WBPCB."*

### 13.7 Learn (`#/learn`) — the deck's worked example
Interactive walkthrough of slide 6: dataset (10,20)…(50,60); Step 1 means (X̄=30, Ȳ=40); Step 2 slope `b = 1000/1000 = 1`; Step 3 intercept `a = 40 − 1·30 = 10`; Step 4 `Ŷ = 10 + X`; metrics MAE = MSE = RMSE = 0, R² = 1. Include a small editable table where the user can change a point and watch the line, slope, and metrics update (computed client-side with simple formulas, validated by the same unit test values). Label: **"Illustrative values only, not actual PM₂.₅ model performance."**

### 13.8 Limits (`#/limits`) — limitations and roadmap
Three limitation cards (non-linearity, multicollinearity, data quality/representativeness; slide 8) each paired with a **real number from this dataset** (e.g. residual pattern, max VIF, % missing). Then the 3-stage roadmap (Polynomial → Regularisation → Real-time integration). Add: "Daily station averages hide local hotspots", "Weather alone cannot explain emission events such as festival fireworks or crop/waste burning".

---

## 14. Worked-example test (slide 6) — `tests/test_ols_sample.py`

Input `X=[10,20,30,40,50]`, `Y=[20,30,40,50,60]`. Assert:
- `X̄=30`, `Ȳ=40`, `Σ(X−X̄)(Y−Ȳ)=1000`, `Σ(X−X̄)²=1000`, `b=1`, `a=10`.
- `Ŷ = 10 + X`; residuals all `0` (within 1e-12); MAE = MSE = RMSE = 0; R² = 1.
- Manual matrix OLS and statsmodels agree.
- `learn_example.json` stores all of the above.

Guard against division by zero when SST = 0 (return R² = NaN with a note).

---

## 15. Quality bar, testing, and acceptance criteria

### 15.1 Automated tests (`make test` must pass)
- AQI conversion (Section 7), slide-6 example (Section 14), split integrity (Section 8), metrics vs scikit-learn reference values, JSON schema validation, prediction calculator parity (Section 13.6).
- Frontend: component smoke tests (Vitest + React Testing Library) for `AQIBadge`, `Gauge`, `CalendarHeatmap` rendering with fixture data; `aqi.ts` parity with Python on 20 fixed values.

### 15.2 Acceptance criteria (Phase 1 is "done" when all are true)
1. `make pipeline` regenerates every JSON file from `data/raw/` with no manual steps, in < 5 minutes.
2. Real Kolkata data only (or documented fallback), ≥ 730 clean days, `is_synthetic=false`.
3. Both split protocols reported; chronological test is the headline; baselines shown.
4. All metrics in 10.1, all tests in 10.2–10.4 present in JSON and visible in UI.
5. The calendar heatmap, seasonal comparison, correlation heatmap, coefficient plot, actual-vs-predicted, and confusion matrix all render correctly in light and dark mode.
6. Predict page matches Python output; extrapolation warning works.
7. Learn page reproduces slide-6 numbers exactly.
8. Lighthouse (mobile): Performance ≥ 85, Accessibility ≥ 95; **no horizontal scroll at 320 px**; keyboard-navigable; colour contrast AA.
9. No console errors; no unused/dead JSON fields; README explains setup, data sources, how to refresh data, and limitations.
10. `docs/DECISIONS.md` lists every assumption and deviation (data source chosen, column mappings, headline-model rule, station mode).

---

## 16. Milestones and checklist (execute in this order)

- [ ] **M1 — Scaffold:** repo tree, `Makefile`, `requirements.txt`, `config.py`, `docs/`, Vite app with tokens from `design.md`, theme toggle, empty routes.
- [ ] **M2 — Data:** `01_acquire.py` (inspect + weather download), data dictionary, `02_clean.py` + cleaning report. *Stop and report if data unavailable (Section 4.5).*
- [ ] **M3 — Features + AQI:** `03_features.py`, `04_aqi.py`, `test_aqi.py`.
- [ ] **M4 — Split + models:** `05_split.py`, models M0–M3 (+M4/M5), manual-vs-statsmodels check, `test_split.py`, `test_ols_sample.py`.
- [ ] **M5 — Evaluation:** all metrics, inference, diagnostics, intervals, bootstrap, confusion matrix.
- [ ] **M6 — Insights + export:** `08_insights.py`, `09_export_json.py`, schemas + `test_export_schema.py`.
- [ ] **M7 — UI core:** components (Card, StatCard, InsightCard, AQIBadge, Gauge, Tabs, SegmentedControl, DataTable disclosure), Home page.
- [ ] **M8 — Explore + Model + Accuracy pages** with all charts.
- [ ] **M9 — Predict + Learn + Limits pages.**
- [ ] **M10 — Polish:** responsive audit (320/375/768/1024/1440), dark mode audit, accessibility, performance, README, final acceptance run.

After each milestone: run tests, commit with a message like `feat(M4): OLS models and split`, and update the checklist.

---

## 17. Required honesty and limitation statements (use these or equivalent in the UI)

- "AQI here is computed from **PM₂.₅ only** using the Indian CPCB scale; the official AQI also uses other pollutants."
- "Predictions are **statistical estimates from historical weather**, not real-time forecasts."
- "Linear models can miss non-linear effects and sudden emission events (e.g. festival fireworks, waste or crop burning)."
- "Station readings are point measurements and may not represent every neighbourhood."
- "Weather variables are associated with PM₂.₅; this model does **not** prove causation."
- "The random split overstates accuracy for time-ordered data; the time-based split is more realistic."

---

## 18. Notes on tone and UX copy

Plain, calm, non-alarmist. Prefer "Poor air quality days" over "dangerous". Use short sentences. Avoid jargon on Home/Explore; put jargon (VIF, Durbin–Watson, Breusch–Pagan) on Model/Accuracy pages with a one-line "what this means" tooltip each. Units always shown (µg/m³). Dates in the format `12 Mar 2023`. Indian numbering is not needed for the values shown, but use `en-IN` locale for date formatting.
