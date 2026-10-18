# CMatrixLab Simple — code guide

Open `index.html` or `cmatrixlab_minimal_readable.html` in a browser. No build step, server, or runtime libraries are required.

## Where to edit

- **Colors and layout:** the `<style>` block. Base styles come first, followed by tablet (1050px), phone (650px), and reduced-motion rules.
- **Defaults:** HTML input values and the matching `CONFIG.default*` values. Keep these in sync.
- **Population:** `CONFIG.totalExamples` is 100. The prevalence slider maps percentages directly to counts; changing the population requires updating that mapping and the UI labels.
- **Score resolution:** `CONFIG.samplesPerClass` sets the fixed number of samples per class. Quantile sampling in `createClassExamples()` keeps scores deterministic.
- **Distributions:** `generateExamples()` sets class means, spread, and sample weights. Prevalence changes weights, not sample scores.
- **Classification:** `classifyExamples()` assigns TP, FP, FN, or TN using `score + 1e-9 >= threshold`; the tolerance handles numerical boundary noise.
- **Metrics:** `calculateMetrics()` uses weighted counts for precision and fixed class proportions for TPR/FPR. Undefined rates display `N/A`.
- **Markers:** `createCountGroups()` converts weighted outcomes to full cases plus one fractional marker per outcome when needed. Representative scores remain on the correct side of the threshold.
- **Charts:** `renderScorePlot()` and `renderPopulationGrid()` use the same marker groups and hover IDs. Fractional marker area is proportional to its case weight.
- **Summary:** `renderMetrics()` updates cards, outcome totals, and the precision bar.
- **Controls:** `update()` reads sliders and renders everything; `reset()` restores defaults.

## Invariants

1. The total weighted population is 100, including at prevalence 0% and 100%.
2. Every class sample has exactly one classification outcome.
3. Changing prevalence preserves class scores and conditional TPR/FPR wherever defined. Counts and precision can change.
4. Both charts represent the same weighted outcome totals. Display rounding never feeds back into calculations.
5. Full markers represent one case; smaller markers represent fractional cases. The number of visible markers can exceed 100.
6. At separation 100% and threshold 50%, FP and FN are zero for every prevalence.
7. A class with no population has an undefined conditional rate. No positive predictions means undefined precision.

## Verification

Run `npm test` after the setup in the [README](README.md). It checks model invariants and browser interactions at desktop, tablet, and phone widths.
For a manual check, use the defaults (10% positive share, 50% threshold, 60% separation), try both ends of each slider, hover a dot, and press Reset.

The HTML remains standalone. Styles and JavaScript can be moved into separate files later without changing the model.
