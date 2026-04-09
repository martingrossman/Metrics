const assert = require('node:assert/strict');

const MetricsCore = require('../metrics_core.js');

let failures = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error.stack || error);
  }
}

function approx(actual, expected, epsilon = 1e-3) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`
  );
}

function makeState(overrides = {}) {
  return {
    mu_neg: 0,
    std_neg: 1,
    mu_pos: 2,
    std_pos: 1,
    N: 1000,
    bal: 0.5,
    threshold: 1,
    manual_tpr: 0.85,
    manual_fpr: 0.2,
    linkedMode: false,
    customData: null,
    customCounts: null,
    ...overrides
  };
}

test('normal distribution helpers stay numerically consistent', function () {
  approx(MetricsCore.normPDF(0, 0, 1), 0.39894, 1e-4);
  approx(MetricsCore.normCDF(0, 0, 1), 0.5, 1e-6);
  approx(MetricsCore.normInvCDF(0.975, 0, 1), 1.96, 0.02);
  assert.ok(MetricsCore.normCDF(-1, 0, 1) < MetricsCore.normCDF(0, 0, 1));
  assert.ok(MetricsCore.normCDF(0, 0, 1) < MetricsCore.normCDF(1, 0, 1));
  assert.ok(MetricsCore.normInvCDF(0.1, 0, 1) < MetricsCore.normInvCDF(0.5, 0, 1));
  assert.ok(MetricsCore.normInvCDF(0.5, 0, 1) < MetricsCore.normInvCDF(0.9, 0, 1));
});

test('parseCSV handles headers, invalid rows, and score clamping', function () {
  const rows = MetricsCore.parseCSV([
    'label,score',
    '1,0.97',
    '0,1.5',
    '2,0.4',
    '0,-0.1'
  ].join('\n'));

  assert.deepEqual(rows, [
    { label: 1, score: 0.97 },
    { label: 0, score: 1 },
    { label: 0, score: 0 }
  ]);
});

test('parseJSON accepts alias fields used by the playground', function () {
  const rows = MetricsCore.parseJSON(JSON.stringify([
    { y_true: 1, prob: 0.8 },
    { target: 0, pred: 1.2 },
    { y: 4, p: 0.5 }
  ]));

  assert.deepEqual(rows, [
    { label: 1, score: 0.8 },
    { label: 0, score: 1 }
  ]);
});

test('threshold-to-rates for parametric mode matches the current Gaussian model', function () {
  const rates = MetricsCore.threshToRatesForState(makeState(), 1);
  assert.ok(rates.tpr > rates.fpr);
  approx(rates.tpr + rates.fpr, 1, 1e-9);
  assert.equal(rates.customCounts, null);
});

test('threshold-to-rates for empirical mode returns rates and counts', function () {
  const state = makeState({
    customData: [
      { label: 1, score: 0.9 },
      { label: 1, score: 0.6 },
      { label: 0, score: 0.8 },
      { label: 0, score: 0.4 }
    ]
  });

  const rates = MetricsCore.threshToRatesForState(state, 0.7);

  approx(rates.tpr, 0.5, 1e-9);
  approx(rates.fpr, 0.5, 1e-9);
  assert.deepEqual(rates.customCounts, {
    tp: 1,
    fp: 1,
    fn: 1,
    tn: 1,
    P: 2,
    N: 2
  });
});

test('dataset stats cover both synthetic and empirical modes', function () {
  assert.deepEqual(MetricsCore.getDatasetStats(makeState({ N: 101, bal: 0.25 })), {
    total: 101,
    P: 25,
    N: 76,
    bal: 0.25
  });

  assert.deepEqual(MetricsCore.getDatasetStats(makeState({
    customData: [
      { label: 1, score: 0.9 },
      { label: 0, score: 0.3 },
      { label: 1, score: 0.7 }
    ]
  })), {
    total: 3,
    P: 2,
    N: 1,
    bal: 2 / 3
  });
});

test('active rates follow direct vs linked vs custom-data behavior', function () {
  assert.deepEqual(
    MetricsCore.getActiveRatesForState(makeState({ manual_tpr: 0.7, manual_fpr: 0.1 })),
    { tpr: 0.7, fpr: 0.1 }
  );

  const linkedRates = MetricsCore.getActiveRatesForState(makeState({ linkedMode: true, threshold: 1 }));
  assert.ok(linkedRates.tpr > linkedRates.fpr);
  approx(linkedRates.tpr + linkedRates.fpr, 1, 1e-9);

  const customRates = MetricsCore.getActiveRatesForState(makeState({
    linkedMode: false,
    threshold: 0.75,
    customData: [
      { label: 1, score: 0.9 },
      { label: 1, score: 0.6 },
      { label: 0, score: 0.8 },
      { label: 0, score: 0.4 }
    ]
  }));
  assert.deepEqual(customRates, { tpr: 0.5, fpr: 0.5 });
});

test('ROC generation for empirical data sorts by false positive rate and includes endpoints', function () {
  const state = makeState({
    customData: [
      { label: 1, score: 0.9 },
      { label: 1, score: 0.6 },
      { label: 0, score: 0.8 },
      { label: 0, score: 0.4 }
    ]
  });

  const roc = MetricsCore.generateROCForState(state, 10);

  assert.ok(roc.length >= 4);
  assert.deepEqual(roc.map(function (pt) { return pt.fpr; }), [...roc.map(function (pt) { return pt.fpr; })].sort(function (a, b) {
    return a - b;
  }));
  assert.ok(roc.some(function (pt) { return pt.fpr === 0 && pt.tpr === 0; }));
  assert.ok(roc.some(function (pt) { return pt.fpr === 1 && pt.tpr === 1; }));
});

test('AUC uses trapezoidal integration', function () {
  const diagonal = [
    { fpr: 0, tpr: 0 },
    { fpr: 1, tpr: 1 }
  ];
  approx(MetricsCore.computeAUC(diagonal), 0.5, 1e-12);
});

test('metric computation matches confusion-matrix arithmetic', function () {
  const state = makeState({ N: 100, bal: 0.4 });
  const metrics = MetricsCore.computeMetricsForState(state, 0.75, 0.2, [
    { fpr: 0, tpr: 0 },
    { fpr: 1, tpr: 1 }
  ]);

  assert.equal(metrics.TP, 30);
  assert.equal(metrics.FN, 10);
  assert.equal(metrics.FP, 12);
  assert.equal(metrics.TN, 48);
  approx(metrics.rec, 0.75, 1e-12);
  approx(metrics.fpr, 0.2, 1e-12);
  approx(metrics.prec, 30 / 42, 1e-12);
  approx(metrics.acc, 0.78, 1e-12);
  approx(metrics.f1, 2 * (30 / 42) * 0.75 / ((30 / 42) + 0.75), 1e-12);
  approx(metrics.npv, 48 / 58, 1e-12);
  approx(metrics.auc, 0.5, 1e-12);
  approx(metrics.mcc, (30 * 48 - 12 * 10) / Math.sqrt(42 * 40 * 60 * 58), 1e-12);
});

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll computation tests passed.');
}
