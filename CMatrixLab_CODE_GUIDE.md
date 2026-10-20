# CMatrixLab Simple — code guide

Open `index.html` in a browser. This is the only HTML file; it contains the entire demo. No build step, server, or runtime libraries are required.

## Where to edit

- **Colors and layout:** the `<style>` block. Base styles come first, followed by tablet (1050px), phone (650px), compact portrait-phone, and reduced-motion rules. The score renderer also compresses vertical spacing in portrait-phone mode while preserving text and marker sizes.
- **Defaults:** HTML input values and the matching `CONFIG.default*` values. Keep these in sync.
- **Terminology:** The header button switches between flu and generic ML copy in `terminology`. Flu mode shows signal sensitivity: moving right lowers the effective cutoff. Generic ML shows the decision threshold: moving right raises it. Switching modes complements this slider value (`100 - value`) to preserve the cutoff, counts, metrics, and marker positions. Reset retains the selected terminology.
- **Population:** `CONFIG.totalExamples` is 1,000. `readSettings()` converts the positive-share percentage to a case count. Update the explanatory text if the population changes.
- **Score resolution:** `CONFIG.samplesPerClass` sets the fixed number of samples per class. Quantile sampling in `createClassExamples()` keeps scores deterministic.
- **Distributions:** `generateExamples()` sets class means, spread, and sample weights. Prevalence changes weights, not sample scores.
- **Classification:** `classifyExamples()` assigns TP, FP, FN, or TN using `score + 1e-9 >= threshold`; the tolerance handles numerical boundary noise.
- **Metrics:** `calculateMetrics()` uses weighted counts for precision and fixed class proportions for TPR/FPR. Undefined rates display `N/A`.
- **Matrix labels:** `renderPopulationGrid()` rounds the four visible counts to whole cases. Tooltips retain the expected counts; markers, metrics, and the precision calculation retain their original weights.
- **Markers:** `createCountGroups()` converts weighted outcomes to full markers of `CONFIG.caseUnit` (10) cases plus one partial marker per outcome when needed. Representative scores remain on the correct side of the threshold. Markers can be regrouped as outcomes change; underlying class samples stay fixed.
- **Charts:** `renderScorePlot()` and `renderPopulationGrid()` use the same marker groups and hover IDs. Fractional marker area is proportional to its case weight.
- **Summary:** `renderMetrics()` updates cards, outcome totals, and the precision bar.
- **Controls:** `update()` reads sliders and renders everything; `reset()` restores defaults.

## Invariants

1. The total weighted population is 1,000, including at prevalence 0% and 100%.
2. Every class sample has exactly one classification outcome.
3. Changing prevalence preserves class scores and conditional TPR/FPR wherever defined. Counts and precision can change.
4. Both charts represent the same weighted outcome totals. Display rounding never feeds back into calculations.
5. Full markers represent 10 cases; smaller markers represent the remainder. The number of visible markers can exceed 100.
6. At separation 100% and threshold 50%, FP and FN are zero for every prevalence.
7. A class with no population has an undefined conditional rate. No positive predictions means undefined precision.

## Verification

Run `npm test` after the setup in the [README](README.md). It checks model invariants and browser interactions at desktop, tablet, and phone widths, plus no-scroll portrait layouts at 402px wide and 714px, 754px, and 874px high.
For a manual check, use the defaults (50% positive share, 50% threshold, 60% separation), use the 10% and 50% buttons to compare positive shares, try both ends of each slider, hover a dot, and press Reset. The balance buttons preserve threshold and separation and highlight the selected share; Reset restores all defaults.

The HTML remains standalone. Styles and JavaScript can be moved into separate files later without changing the model.
