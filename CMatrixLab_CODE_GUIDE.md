# CMatrixLab Simple — code guide

Open `cmatrixlab_minimal_readable.html` in a browser; no build step, server, or libraries are required.

## Where to edit things

- **Colors and layout:** the `<style>` block, especially the `:root` color variables and the `.views`, `.population`, and `.metrics` selectors.
- **Initial slider values:** the HTML inputs (`value="..."`) and matching `CONFIG.default*` entries in the `<script>` block. Keep these in sync.
- **Number of examples:** `CONFIG.totalExamples` (currently 100). The prevalence slider and labels deliberately assume percentages equal counts for 100 examples, so changing the total requires updating that mapping.
- **Class score distribution:** `generateExamples()` calculates positive/negative means and their common standard deviation. `createClassExamples()` generates deterministic representative scores.
- **Threshold rule:** `classifyExamples()` assigns each example to TP, FP, FN, or TN.
- **Metric formulas:** `calculateMetrics()` computes TPR = TP/(TP+FN), FPR = FP/(FP+TN), and Precision = TP/(TP+FP).
- **Left-hand 1D chart:** `renderScorePlot()`.
- **Right-hand population view:** `renderPopulationGrid()`.
- **Metric cards and green/red bar:** `renderMetrics()`.
- **Slider updates and reset:** `update()` and `reset()` at the bottom of the script.

## Design rules that keep results consistent

1. `generateExamples()` returns exactly **100 examples** by default.
2. `classifyExamples()` assigns exactly one classification outcome to each example.
3. Both charts use those **same examples**, and metric percentages come from the same integer counts.
4. A threshold predicts positive if `score >= threshold`.
5. At 100% separation with threshold 0.50, examples are fully separable (TPR 100%, FPR 0%).
6. Because the demo contains only 100 examples, TPR and FPR may change in discrete steps when you change prevalence; this is finite-sample rounding, not a claim that class prevalence changes population-conditional rates.

## Quick regression checks

- Default: 10 positives, 90 negatives, threshold 0.50, separation 60%.
- Prevalence 1%: one actual-positive example, 99 actual-negative examples.
- Separation 100%, threshold 0.50: FP = 0, FN = 0 for all allowed prevalences.
- Hover a dot: exactly the corresponding population square also highlights.
- Reset: returns to 10%, 0.50, 60%.

The HTML is intentionally standalone. To move it into a larger website later, the `<style>` section can become a CSS file and the `<script>` section a JavaScript module without changing the underlying logic.
