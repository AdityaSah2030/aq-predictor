# KolkataAQ — Statistical Air Quality Estimation & Prediction Engine

A high-precision environmental analytics platform estimating ambient $\text{PM}_{2.5}$ particulate concentrations and official Indian Central Pollution Control Board (CPCB) Air Quality Index (AQI) values for Kolkata, West Bengal using closed-form Ordinary Least Squares (OLS) regression, observational meteorology, and real-time analytical prediction intervals.

## Live Demo

🚀 **Production Deployment**

**KolkataAQ Live Dashboard:**  
https://adityasah2030.github.io/aq-predictor/

---

## Overview

Urban air quality is heavily regulated by micro-meteorological variables, atmospheric stability, and seasonal weather patterns. In tropical and deltaic river basins like Kolkata, particulate matter concentrations swing drastically between summer monsoonal washout and severe winter stagnation.

KolkataAQ addresses this challenge by combining real-world atmospheric observation records (temperature, humidity, wind velocity, barometric pressure, precipitation, and Fourier cyclic seasonality) with rigorous mathematical estimation theory. 

Rather than relying on black-box heuristics or uninterpretable deep networks, KolkataAQ formulates ambient particulate prediction from first principles using closed-form matrix Ordinary Least Squares (OLS). The platform features an **instant interactive predictor** on the front page, **analytical 95% prediction intervals** computed directly in the browser via covariance leverage, **full-spectrum observational climatology**, and **exhaustive statistical diagnostics** (Gauss-Markov validation, VIF collinearity checks, and residual probability distributions).

---

## Key Features

### Real-Time Interactive Predictor (Landing View)
- **Dynamic Weather Controls**: Instant interactive sliders and numeric inputs for Temperature, Relative Humidity, Wind Speed, Barometric Pressure, Precipitation, and Calendar Month.
- **Continuous 180° CPCB AQI Gauge**: Live SVG semicircle gauge with an animated needle displaying the computed AQI sub-index and official color-coded health category.
- **Analytical 95% Prediction Intervals**: Real-time evaluation of forecast uncertainty intervals $[\hat{y} \pm t_{crit} \cdot \text{SE}_{pred}]$ using client-side leverage matrix multiplication:
  $$\text{SE}_{pred} = \sqrt{\hat{\sigma}^2 \left(1 + x^T (X^T X)^{-1} x\right)}$$
- **Quick Environmental Presets**: One-click configuration for historical atmospheric archetypes (*Winter Stagnation*, *Monsoon Washout*, *Pre-Monsoon Heat*).
- **Out-of-Distribution Warning**: Automated alerts when user inputs deviate beyond $3\sigma$ from historical training bounds.

### Observational Data & Climatological Intelligence
- **Comprehensive Daily Records**: 852 verified daily environmental readings for Kolkata ($22.5726^\circ\text{ N}, 88.3639^\circ\text{ E}$) spanning September 2022 to December 2024.
- **Annual Calendar Heatmap**: GitHub-style interactive calendar visualization displaying daily CPCB AQI classifications with date-level inspection tooltips.
- **Climatological Distributions**: Seasonal PM₂.₅ box and range distributions highlighting the $3.1\times$ pollution surge between Monsoon ($25.1\ \mu\text{g/m}^3$) and Winter ($78.4\ \mu\text{g/m}^3$).
- **Bivariate Scatter Explorer**: Regression scatter plots with Simple Linear Regression (SLR) best-fit lines, Pearson correlation coefficients ($r$), and coefficients of determination ($R^2$).
- **Correlation Heatmap**: Pairwise Pearson correlation matrix with diverging color scales revealing collinear weather dynamics.
- **Data Completeness Audit**: Automated verification adhering to official CPCB rules (minimum 16 of 24 hourly readings required for daily averages; zero target imputation).

### Mathematical Modeling & Statistical Rigor
- **Closed-Form Normal Equations**: Exact parameter estimation minimizing the Sum of Squared Residuals ($\text{SSE}$):
  $$\hat{\beta} = (X^T X)^{-1} X^T Y$$
- **Dual Matrix Verification**: Machine-precision numerical validation asserting that manual NumPy matrix algebra matches `statsmodels.OLS` ($< 10^{-10}$ max discrepancy).
- **KaTeX Typographic Typesetting**: Beautifully rendered multi-variable regression equation with clean mathematical notation.
- **Coefficient Forest Plot**: Visualized parameter estimates $\hat{\beta}_j$ with analytical 95% confidence intervals and p-values.
- **Multicollinearity Diagnostics**: Variance Inflation Factor (VIF) evaluation ensuring parameter stability ($\text{VIF} < 3.2$ across all predictors).
- **Architecture Benchmarking**: Multi-tier comparison evaluating baseline benchmarks (global mean, calendar month baseline) against SLR and MLR architectures.

### Error Analysis & Gauss-Markov Diagnostics
- **Honest Chronological Splitting**: Chronological train/test split (earliest 80% train, latest 20% test) preventing temporal autocorrelation leakage.
- **Quantified Predictive Accuracy**: Test RMSE of $23.1\ \mu\text{g/m}^3$ and $R^2$ of $0.764$ on out-of-sample observations ($98.2\%$ empirical coverage within the analytical 95% prediction interval).
- **CPCB Category Confusion Matrix**: 6×6 classification matrix with row-normalized sensitivity and recall metrics.
- **Statistical Diagnostic Suite**:
  - *Durbin-Watson Test* for serial autocorrelation ($d = 1.34$).
  - *Breusch-Pagan Test* for heteroscedasticity.
  - *Q-Q Normal Probability Plot* and *Jarque-Bera Test* for residual normality.
  - *Cook's Distance* identification for influential leverage days.

### Limitations & Research Roadmap
- **Physical Boundary Evaluation**: Analysis of non-linear planetary boundary layer capping, atmospheric multicollinearity, and unmodelled episodic combustion shocks (e.g., festival fireworks).
- **3-Stage Mathematical Roadmap**: Detailed progression for Polynomial basis expansions, Ridge/Lasso regularization, and Real-Time dynamic ARIMAX / Kalman filtering.

---

## System Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │ Atmospheric & Satellite Observations                   │
       │ (Copernicus CAMS Reanalysis + Open-Meteo Archive)      │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │ Preprocessing & CPCB Data Completeness                 │
       │ (>=16/24h hourly completeness, physical sanity bounds) │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │ Feature Engineering                                    │
       │ (Seasonal Fourier cyclic terms: sin/cos(2πm/12), lags) │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │ Closed-Form Matrix OLS Engine                          │
       │ β̂ = (XᵀX)⁻¹ XᵀY  &  Cov(β̂) = σ² (XᵀX)⁻¹               │
       └───────────────────────────┬────────────────────────────┘
                                   │
            ┌──────────────────────┴──────────────────────┐
            │                                             │
            ▼                                             ▼
┌───────────────────────────────┐           ┌───────────────────────────┐
│ Statistical Diagnostics       │           │ Exported JSON Artifacts   │
│ (F-test, VIF, DW, BP, QQ, CM) │           │ (14 canonical datasets)   │
└───────────────┬───────────────┘           └─────────────┬─────────────┘
                │                                         │
                └───────────────────┬─────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │ Vite + React + TypeScript Dashboard                    │
       │ (Interactive Predictor, Heatmap, Math & Limitations)   │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │ Client-Side Prediction Engine                          │
       │ ŷ = xᵀβ̂  &  SE_pred = √(σ²(1 + xᵀ(XᵀX)⁻¹x))            │
       └────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Data Pipeline & Mathematics
- **Python 3.11+**
- **NumPy** & **SciPy** (Matrix algebra, normal equations solver, singular value decomposition)
- **Pandas** (Time series indexing and CPCB completeness aggregation)
- **Statsmodels** (Gauss-Markov diagnostics, Breusch-Pagan, Durbin-Watson, Jarque-Bera)
- **Scikit-learn** (TimeSeries cross-validation and evaluation metrics)
- **Requests** (Automated API data acquisition)
- **Pytest** (Automated test suite)

### Frontend & User Interface
- **Vite + React 19**
- **TypeScript** (Strict type definitions and numerical array typing)
- **Recharts** (High-performance SVG charts: heatmaps, forest plots, time series, confusion matrices)
- **KaTeX** (Fast mathematical LaTeX typesetting)
- **Lucide Icons**
- **Vanilla CSS Tokens** (Apple Sky Blue inspired modern design system with native light/dark theme support)

### Infrastructure & Deployment
- **GitHub Pages** (Production static site hosting)
- **GitHub Actions** (Automated build and zero-downtime deployment pipeline)

---

## Project Structure

```text
air-quality-predictor/
│
├── .github/
│   └── workflows/
│       └── deploy.yml           # Automated GitHub Pages CI/CD workflow
│
├── data/
│   ├── raw/                     # Untouched atmospheric API JSON payloads
│   ├── interim/                 # Aggregated clean daily observations CSV
│   └── processed/               # Engineered features & train/test split indices
│
├── docs/
│   ├── DECISIONS.md             # Methodological & architectural decisions
│   └── DATA_DICTIONARY.md       # Variable schemas, units, and definitions
│
├── pipeline/
│   ├── config.py                # Coordinates, CPCB breakpoints & standards
│   ├── aqi.py                   # CPCB PM2.5 AQI sub-index piecewise calculation
│   ├── 01_acquire.py            # Automated atmospheric data acquisition
│   ├── 02_clean.py              # CPCB aggregation & outlier auditing
│   ├── 03_features.py           # Feature derivation & Fourier seasonality
│   ├── 05_split.py              # Chronological and random split generation
│   ├── 06_models.py             # Fitting M0–M5 regression models
│   ├── 07_evaluate.py           # Evaluation, bootstrap CIs & diagnostics
│   ├── 08_insights.py           # Plain-language statistical insights engine
│   ├── 09_export_json.py        # Exporting 14 canonical JSON artifacts
│   └── models/
│       ├── base.py              # Abstract regression model interface
│       ├── baseline.py          # Benchmark baselines (M0, M0b)
│       ├── slr.py               # Simple Linear Regression from first principles
│       └── mlr.py               # Closed-form matrix OLS with dual verification
│
├── tests/
│   ├── test_aqi.py              # AQI breakpoint & monotonicity unit tests
│   ├── test_ols_sample.py       # Slide 6 sample dataset verification test
│   ├── test_split.py            # Train/test split integrity tests
│   └── test_metrics.py          # Evaluation metric formula assertions
│
├── web/
│   ├── public/data/*.json       # 14 exported model & climatology JSON artifacts
│   ├── src/
│   │   ├── styles/              # tokens.css & global.css design tokens
│   │   ├── lib/                 # predict.ts, aqi.ts, format.ts, data.ts
│   │   ├── components/          # Navbar, Footer, Gauge, StatCard, Card, LatexEquation
│   │   ├── charts/              # CalendarHeatmap, ForestPlot, ConfusionMatrix, etc.
│   │   ├── pages/
│   │   │   ├── Predict.tsx      # Flagship interactive real-time calculator (Home)
│   │   │   ├── DataView.tsx     # Historical observations, heatmap & correlations
│   │   │   ├── MathModel.tsx    # OLS derivation, equation, benchmarks & diagnostics
│   │   │   └── LimitationsView.tsx # Scope, boundaries & 3-stage roadmap
│   │   ├── App.tsx              # Root application & routing
│   │   └── main.tsx             # Entry point
│   ├── index.html               # HTML5 shell
│   ├── package.json             # Frontend dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.ts           # Vite build configuration with relative base
│
├── run_pipeline.py              # End-to-end Python pipeline orchestrator
├── Makefile                     # Build targets (pipeline, test, web, build)
├── requirements.txt             # Pinned Python dependencies
└── README.md                    # Project documentation
```

---

## Mathematical Formulations

### 1. Closed-Form Normal Equations
Given $m$ daily observations and $p$ meteorological features, design matrix $X \in \mathbb{R}^{m \times (p+1)}$ (with leading column of ones) and target vector $Y \in \mathbb{R}^m$:
$$\text{SSE}(\beta) = \sum_{i=1}^m (Y_i - X_i \beta)^2 = (Y - X\beta)^T (Y - X\beta)$$

Differentiating with respect to $\beta$ and setting the gradient to zero:
$$\nabla_\beta \text{SSE} = -2X^T Y + 2X^T X \beta = 0 \implies X^T X \beta = X^T Y$$
$$\hat{\beta} = (X^T X)^{-1} X^T Y$$

### 2. Analytical Online Prediction Intervals
For an arbitrary new environmental observation vector $x = [1, x_1, x_2, \dots, x_p]^T$:
$$\hat{y} = x^T \hat{\beta}$$
$$\text{SE}_{pred}(x) = \sqrt{\hat{\sigma}^2 \left(1 + x^T (X^T X)^{-1} x\right)}$$
$$\text{PI}_{95\%} = \left[\hat{y} - t_{0.025, m-p-1} \cdot \text{SE}_{pred}(x), \;\; \hat{y} + t_{0.025, m-p-1} \cdot \text{SE}_{pred}(x)\right]$$
where $\hat{\sigma}^2 = \frac{\text{SSE}}{m - p - 1}$.

### 3. CPCB National Air Quality Index (AQI) Sub-Index
Piecewise linear interpolation mapping 24-hr $\text{PM}_{2.5}$ concentration $C$ ($\mu\text{g/m}^3$):
$$I = \frac{I_{hi} - I_{lo}}{BP_{hi} - BP_{lo}} (C - BP_{lo}) + I_{lo}$$

| Category | PM₂.₅ Breakpoint Range ($\mu\text{g/m}^3$) | AQI Sub-index Range | Color Token |
|---|---|---|---|
| **Good** | 0 – 30 | 0 – 50 | `--aqi-good` |
| **Satisfactory** | 31 – 60 | 51 – 100 | `--aqi-satisfactory` |
| **Moderately polluted** | 61 – 90 | 101 – 200 | `--aqi-moderate` |
| **Poor** | 91 – 120 | 201 – 300 | `--aqi-poor` |
| **Very poor** | 121 – 250 | 301 – 400 | `--aqi-verypoor` |
| **Severe** | 250+ | 401 – 500 | `--aqi-severe` |

---

## Installation & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/AdityaSah2030/aq-predictor.git
cd aq-predictor
```

### 2. Set Up Python Virtual Environment

#### Windows
```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

#### Linux / macOS
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Execute the Full Data & Modeling Pipeline
To acquire atmospheric observations, clean data under CPCB rules, fit all models, and export JSON artifacts:
```bash
python run_pipeline.py
# Or using make:
make pipeline
```

### 4. Run the Automated Test Suite
```bash
pytest tests/ -v
# Or using make:
make test
```
*Validates AQI piecewise calculations, split isolation, evaluation metrics, and first-principles OLS estimation.*

### 5. Launch the Frontend Application
```bash
cd web
npm install
npm run dev
# Or from root:
make web
```
Open your browser at:
```text
http://localhost:5173/
```

### 6. Production Static Build
```bash
cd web
npm run build
```
The compiled, optimized single-page application will be generated in `web/dist/`.

---

## Deployment on GitHub Pages

This repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys the dashboard automatically whenever code is pushed to `main` or `master`.

### One-Time Setup in GitHub:
1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of KolkataAQ platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Navigate to your repository on GitHub:
   - Go to **Settings** $\rightarrow$ **Pages** (under Code and automation).
   - Under **Build and deployment** $\rightarrow$ **Source**, select **GitHub Actions**.
3. That's it! GitHub Actions will trigger automatically, build the React bundle, and publish your site to:
   ```text
   https://<your-username>.github.io/<your-repo-name>/
   ```

---

## Roadmap

### Version 1.0 (Completed)
- [x] Atmospheric data ingestion (CAMS reanalysis + Open-Meteo)
- [x] Daily CPCB completeness aggregation ($\ge 16\text{h}/24\text{h}$)
- [x] Piecewise CPCB PM₂.₅ AQI calculation
- [x] Closed-form matrix OLS solver ($\hat{\beta} = (X^T X)^{-1} X^T Y$)
- [x] Automated unit test suite with 100% pass rate

### Version 2.0 (Current Release - v2.0.0)
- [x] **Interactive Real-Time Predictor**: Landing page calculator with live 180° CPCB AQI gauge
- [x] **Analytical 95% Prediction Intervals**: Client-side covariance leverage calculation
- [x] **Annual Calendar Heatmap**: Interactive daily CPCB category explorer across 852 days
- [x] **Comprehensive Statistical Diagnostics**: Breusch-Pagan, Durbin-Watson, Jarque-Bera, and VIF tables
- [x] **Modern Design System**: Apple Sky Blue theme with zero hardcoded colors and responsive tokens
- [x] **GitHub Actions CI/CD**: Automated deployment workflow for GitHub Pages

### Future Enhancements (Version 2.x & Beyond)
- [ ] **Polynomial Interaction Regressions**: Higher-degree non-linear terms ($X_i X_j$)
- [ ] **Regularization Suite**: Ridge ($L_2$) and Lasso ($L_1$) parameter shrinkage
- [ ] **Dynamic Time-Series Models**: ARIMAX and State-Space Kalman filters
- [ ] **Multi-Station Hotspot Modeling**: Ward-level spatial microclimate disaggregation
- [ ] **Direct IoT Hardware Integration**: Live streaming from low-cost optical particulate sensors

---

## License

This project is licensed under the MIT License.

---

## Current Release

```text
Version: v2.0.0
Status: Production Ready • GitHub Pages Enabled
Target Region: Kolkata, West Bengal (22.5726° N, 88.3639° E)
```

---

### ⭐ If you found this project useful, consider giving it a star on GitHub!
