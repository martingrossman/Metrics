(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.MetricsCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function normPDF(x, mu, sigma) {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  }

  function stdNormCDF(z) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = z < 0 ? -1 : 1;
    const az = Math.abs(z);
    const t = 1 / (1 + p * az);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-az * az / 2);
    return 0.5 * (1 + sign * y);
  }

  function normCDF(x, mu, sigma) {
    const z = (x - mu) / sigma;
    return stdNormCDF(z);
  }

  function stdNormInvCDF(p) {
    if (p <= 0) return -8;
    if (p >= 1) return 8;
    if (p < 0.5) return -stdNormInvCDF(1 - p);
    const t = Math.sqrt(-2 * Math.log(1 - p));
    const c0 = 2.515517;
    const c1 = 0.802853;
    const c2 = 0.010328;
    const d1 = 1.432788;
    const d2 = 0.189269;
    const d3 = 0.001308;
    return t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
  }

  function normInvCDF(p, mu, sigma) {
    return mu + sigma * stdNormInvCDF(p);
  }

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function hasCustomDataset(state) {
    return !!(state.customData && state.customData.length);
  }

  function clampScore(score) {
    return Math.max(0, Math.min(1, score));
  }

  function parseCSV(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return [];
    const lines = trimmed.split(/\r?\n/);
    const first = lines[0].split(/,|\s+/);
    const hasHeader = isNaN(parseFloat(first[0])) || isNaN(parseFloat(first[1]));
    const rows = [];
    for (let i = hasHeader ? 1 : 0; i < lines.length && rows.length < 1000; i++) {
      const parts = lines[i].split(/,|\s+/).map(function (s) { return s.trim(); });
      if (parts.length < 2) continue;
      const label = parseInt(parts[0], 10);
      const score = parseFloat(parts[1]);
      if ((label === 0 || label === 1) && isFinite(score)) {
        rows.push({ label: label, score: clampScore(score) });
      }
    }
    return rows;
  }

  function parseJSON(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      return [];
    }
    if (!Array.isArray(data)) return [];
    const rows = [];
    for (let i = 0; i < data.length && rows.length < 1000; i++) {
      const row = data[i] || {};
      const label = parseInt(row.label ?? row.y_true ?? row.y ?? row.target, 10);
      const score = parseFloat(row.score ?? row.prob ?? row.p ?? row.pred);
      if ((label === 0 || label === 1) && isFinite(score)) {
        rows.push({ label: label, score: clampScore(score) });
      }
    }
    return rows;
  }

  function threshToRatesForState(state, threshold, storeCustomCounts) {
    if (storeCustomCounts === undefined) storeCustomCounts = true;
    if (!state.customData) {
      return {
        tpr: 1 - normCDF(threshold, state.mu_pos, state.std_pos),
        fpr: 1 - normCDF(threshold, state.mu_neg, state.std_neg),
        customCounts: null
      };
    }

    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;
    const data = state.customData;
    for (let i = 0; i < data.length; i++) {
      const predPos = data[i].score >= threshold;
      if (predPos && data[i].label === 1) tp++;
      else if (predPos && data[i].label === 0) fp++;
      else if (!predPos && data[i].label === 1) fn++;
      else tn++;
    }

    const P = tp + fn;
    const N = fp + tn;
    return {
      tpr: P > 0 ? tp / P : 0,
      fpr: N > 0 ? fp / N : 0,
      customCounts: storeCustomCounts ? { tp: tp, fp: fp, fn: fn, tn: tn, P: P, N: N } : null
    };
  }

  function tprToThreshold(state, tpr) {
    return normInvCDF(1 - tpr, state.mu_pos, state.std_pos);
  }

  function fprToThreshold(state, fpr) {
    return normInvCDF(1 - fpr, state.mu_neg, state.std_neg);
  }

  function getDatasetStats(state) {
    if (!hasCustomDataset(state)) {
      const P = Math.round(state.N * state.bal);
      return {
        total: state.N,
        P: P,
        N: state.N - P,
        bal: state.bal
      };
    }

    let P = 0;
    for (let i = 0; i < state.customData.length; i++) {
      if (state.customData[i].label === 1) P++;
    }
    const total = state.customData.length;
    return {
      total: total,
      P: P,
      N: total - P,
      bal: total > 0 ? P / total : 0
    };
  }

  function getActiveRatesForState(state) {
    if (state.customData || state.linkedMode) {
      const rates = threshToRatesForState(state, state.threshold, false);
      return { tpr: rates.tpr, fpr: rates.fpr };
    }
    return { tpr: state.manual_tpr, fpr: state.manual_fpr };
  }

  function generateROCForState(state, nPts) {
    if (state.customData) {
      const scores = Array.from(new Set(state.customData.map(function (d) { return d.score; }))).sort(function (a, b) {
        return b - a;
      });
      const pts = [];
      for (let i = 0; i < scores.length; i++) {
        const threshold = scores[i];
        const rates = threshToRatesForState(state, threshold, false);
        pts.push({ fpr: rates.fpr, tpr: rates.tpr, t: threshold });
      }
      if (scores.length < nPts) {
        pts.push(
          { fpr: 0, tpr: 0, t: 0 },
          { fpr: 1, tpr: 1, t: 1 }
        );
      }
      pts.sort(function (a, b) { return a.fpr - b.fpr; });
      return pts;
    }

    const pts = [];
    for (let i = 0; i <= nPts; i++) {
      const threshold =
        state.mu_neg - 4 * state.std_neg +
        (state.mu_pos + 4 * state.std_pos - state.mu_neg + 4 * state.std_neg) * i / nPts;
      const rates = threshToRatesForState(state, threshold, false);
      pts.push({ fpr: rates.fpr, tpr: rates.tpr, t: threshold });
    }
    pts.sort(function (a, b) { return a.fpr - b.fpr; });
    return pts;
  }

  function computeAUC(rocPts) {
    let auc = 0;
    for (let i = 1; i < rocPts.length; i++) {
      const dx = rocPts[i].fpr - rocPts[i - 1].fpr;
      const avgY = (rocPts[i].tpr + rocPts[i - 1].tpr) / 2;
      auc += dx * avgY;
    }
    return auc;
  }

  function resolveCountsForState(state, tpr, fpr) {
    if (state.customData && state.customCounts) {
      return {
        TP: state.customCounts.tp,
        FN: state.customCounts.fn,
        FP: state.customCounts.fp,
        TN: state.customCounts.tn,
        P: state.customCounts.P,
        N_neg: state.customCounts.N
      };
    }

    const P = Math.round(state.N * state.bal);
    const N_neg = state.N - P;
    const TP = Math.round(P * tpr);
    const FN = P - TP;
    const FP = Math.round(N_neg * fpr);
    const TN = N_neg - FP;
    return { TP: TP, FN: FN, FP: FP, TN: TN, P: P, N_neg: N_neg };
  }

  function computeMetricsForState(state, tpr, fpr, rocPts) {
    const counts = resolveCountsForState(state, tpr, fpr);
    const total = counts.TP + counts.TN + counts.FP + counts.FN;
    const acc = total > 0 ? (counts.TP + counts.TN) / total : 0;
    const prec = (counts.TP + counts.FP) > 0 ? counts.TP / (counts.TP + counts.FP) : 0;
    const rec = (counts.TP + counts.FN) > 0 ? counts.TP / (counts.TP + counts.FN) : 0;
    const fprMetric = (counts.FP + counts.TN) > 0 ? counts.FP / (counts.FP + counts.TN) : 0;
    const f1 = (prec + rec) > 0 ? 2 * prec * rec / (prec + rec) : 0;
    const npv = (counts.TN + counts.FN) > 0 ? counts.TN / (counts.TN + counts.FN) : 0;
    const denom = Math.sqrt(
      (counts.TP + counts.FP) *
      (counts.TP + counts.FN) *
      (counts.TN + counts.FP) *
      (counts.TN + counts.FN)
    );
    const mcc = denom > 0 ? (counts.TP * counts.TN - counts.FP * counts.FN) / denom : 0;
    const auc = Array.isArray(rocPts) ? computeAUC(rocPts) : 0;

    return {
      TP: counts.TP,
      FN: counts.FN,
      FP: counts.FP,
      TN: counts.TN,
      P: counts.P,
      N_neg: counts.N_neg,
      rec: rec,
      fpr: fprMetric,
      prec: prec,
      acc: acc,
      f1: f1,
      auc: auc,
      npv: npv,
      mcc: mcc
    };
  }

  return {
    normPDF: normPDF,
    stdNormCDF: stdNormCDF,
    normCDF: normCDF,
    stdNormInvCDF: stdNormInvCDF,
    normInvCDF: normInvCDF,
    clamp01: clamp01,
    hasCustomDataset: hasCustomDataset,
    parseCSV: parseCSV,
    parseJSON: parseJSON,
    threshToRatesForState: threshToRatesForState,
    tprToThreshold: tprToThreshold,
    fprToThreshold: fprToThreshold,
    getDatasetStats: getDatasetStats,
    getActiveRatesForState: getActiveRatesForState,
    generateROCForState: generateROCForState,
    computeAUC: computeAUC,
    computeMetricsForState: computeMetricsForState
  };
});
