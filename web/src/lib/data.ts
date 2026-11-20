/**
 * Data loader for the exported JSON artifacts in /data/*.
 */

export interface DatasetBundle {
  meta: any;
  daily: any[];
  monthly: any;
  seasonal: any;
  yearly: any[];
  correlations: any;
  models: any;
  metrics: any;
  predictions: any[];
  residuals: any;
  confusion: any;
  insights: any[];
  dataQuality: any;
  learnExample: any;
}

let cachedBundle: DatasetBundle | null = null;

export async function loadAllData(): Promise<DatasetBundle> {
  if (cachedBundle) return cachedBundle;

  const files = [
    { key: "meta", path: "meta.json" },
    { key: "daily", path: "daily.json" },
    { key: "monthly", path: "monthly.json" },
    { key: "seasonal", path: "seasonal.json" },
    { key: "yearly", path: "yearly.json" },
    { key: "correlations", path: "correlations.json" },
    { key: "models", path: "models.json" },
    { key: "metrics", path: "metrics.json" },
    { key: "predictions", path: "predictions.json" },
    { key: "residuals", path: "residuals.json" },
    { key: "confusion", path: "confusion.json" },
    { key: "insights", path: "insights.json" },
    { key: "dataQuality", path: "data_quality.json" },
    { key: "learnExample", path: "learn_example.json" }
  ];

  const results: any = {};
  const base = import.meta.env.BASE_URL || "./";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;

  await Promise.all(
    files.map(async ({ key, path }) => {
      const url = `${normalizedBase}data/${path}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load ${path} (status ${res.status})`);
      }
      results[key] = await res.json();
    })
  );

  cachedBundle = results as DatasetBundle;
  return cachedBundle;
}
