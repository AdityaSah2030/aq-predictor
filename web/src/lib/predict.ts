/**
 * Client-side prediction and 95% Prediction Interval calculation.
 * Formula:
 * ŷ = xᵀβ̂
 * SE_pred = √(σ² · (1 + xᵀ (XᵀX)⁻¹ x))
 * PI = ŷ ± t_crit · SE_pred
 */

export interface CalculatorParams {
  feature_order: string[];
  coefficients: number[];    // [intercept, beta_1, ..., beta_p]
  xtx_inv: number[][];       // (p+1) x (p+1) matrix
  sigma2: number;
  df_resid: number;
  t_crit_95: number;
  feature_means: Record<string, number>;
  feature_stds: Record<string, number>;
}

export interface PredictionResult {
  pm25: number;
  pm25Lower: number;
  pm25Upper: number;
  sePred: number;
  isExtrapolated: boolean;
  extrapolatedFields: string[];
}

export function computePrediction(
  inputs: Record<string, number>,
  params: CalculatorParams
): PredictionResult {
  const { feature_order, coefficients, xtx_inv, sigma2, t_crit_95, feature_means, feature_stds } = params;

  // Build input vector with leading 1 for intercept
  const x = [1.0];
  const extrapolatedFields: string[] = [];

  for (const feat of feature_order) {
    const val = inputs[feat] !== undefined ? inputs[feat] : (feature_means[feat] || 0.0);
    x.push(val);

    // Check if beyond 3 standard deviations from mean
    const mean = feature_means[feat];
    const std = feature_stds[feat];
    if (mean !== undefined && std !== undefined && std > 0) {
      if (Math.abs(val - mean) > 3.0 * std) {
        extrapolatedFields.push(feat);
      }
    }
  }

  // 1. ŷ = xᵀβ̂
  let yHat = 0.0;
  for (let i = 0; i < x.length; i++) {
    yHat += x[i] * coefficients[i];
  }

  // 2. Leverage = xᵀ (XᵀX)⁻¹ x
  let leverage = 0.0;
  const n = x.length;
  for (let i = 0; i < n; i++) {
    let rowDot = 0.0;
    for (let j = 0; j < n; j++) {
      rowDot += xtx_inv[i][j] * x[j];
    }
    leverage += x[i] * rowDot;
  }

  // 3. SE_pred = √(σ² · (1 + leverage))
  const sePred = Math.sqrt(Math.max(0.0, sigma2 * (1.0 + leverage)));
  const margin = t_crit_95 * sePred;

  const pm25 = Math.max(0.0, yHat);
  const pm25Lower = Math.max(0.0, yHat - margin);
  const pm25Upper = Math.max(0.0, yHat + margin);

  return {
    pm25,
    pm25Lower,
    pm25Upper,
    sePred,
    isExtrapolated: extrapolatedFields.length > 0,
    extrapolatedFields
  };
}
