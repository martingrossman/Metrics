# CMatrixLab

An interactive explanation of how decision threshold, class separation, and
positive-class prevalence affect classifier metrics. Open `index.html` in a
browser; the demo has no build step or runtime dependencies.

The Simple view lives in `cmatrixlab_minimal_readable.html`, with its styles
and JavaScript together. `index.html` forwards to it. `CNAME` configures the
custom domain for GitHub Pages.

## Model

The demo represents 100 cases using two fixed distributions of 50 deterministic
score samples. Positive share changes their weights, preserving TPR and FPR
at a given threshold and separation. Precision changes with the weighted
balance of correct detections and false alarms. Counts can be fractional.

Each chart renders one marker per whole case plus a smaller marker for a
fractional remainder. Matching dots and squares highlight together on hover.
At 0% or 100% positive share, a rate with no actual cases is shown as `N/A`.
Precision is `N/A` when there are no positive predictions.

See [the code guide](CMatrixLab_CODE_GUIDE.md) for editing details.

## Checks

With Node.js and npm installed:

```sh
npm ci
npx playwright install chromium
npm test
```

Checks cover weighted counts, prevalence invariance, threshold extremes,
perfect separation, slider/reset behavior, linked hover, and responsive layout.
Development dependencies are only needed for these checks.
