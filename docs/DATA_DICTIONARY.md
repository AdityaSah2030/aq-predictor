# Data Dictionary — Kolkata Air Quality & Environmental Modeling

| Column | Type | Unit | Description | Canonical Field |
|---|---|---|---|---|
| `date` | Date (`YYYY-MM-DD`) | — | Observation date in Indian Standard Time (IST) | `date` |
| `station` | String | — | Monitoring station / region identifier (`Kolkata (Central)`) | `station` |
| `pm25` | Float | µg/m³ | Daily mean particulate matter $\le 2.5\ \mu\text{m}$ (Target variable $Y$) | `pm25` |
| `pm10` | Float | µg/m³ | Daily mean particulate matter $\le 10\ \mu\text{m}$ | `pm10` |
| `no2` | Float | µg/m³ | Nitrogen dioxide concentration | `no2` |
| `so2` | Float | µg/m³ | Sulphur dioxide concentration | `so2` |
| `co` | Float | mg/m³ | Carbon monoxide concentration | `co` |
| `o3` | Float | µg/m³ | Surface ozone concentration | `o3` |
| `temp_c` | Float | °C | 2m mean ambient air temperature | `temp_c` |
| `rh_pct` | Float | % | 2m mean relative humidity | `rh_pct` |
| `wind_kmh` | Float | km/h | 10m mean wind speed (converted from km/h or m/s) | `wind_kmh` |
| `rain_mm` | Float | mm | Daily accumulated precipitation | `rain_mm` |
| `pressure_hpa` | Float | hPa | Surface barometric atmospheric pressure | `pressure_hpa` |
| `n_obs` | Integer | — | Count of valid hourly observations for that day (min 16/24) | `n_obs` |
| `is_synthetic` | Boolean | — | Flag indicating whether data is simulated (`False` for real data) | `is_synthetic` |
