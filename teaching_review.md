# CMatrixLab: Teaching Review

Reviewed: [index.html](file:///c:/Users/martin/Documents/GitHub/Metrics/index.html). I looked at the simple dashboard (desktop + phone) and all three **Learn more** tabs in both Flu and ML modes.

## What already works well
- **Two linked views.** The score plot and the matrix stay in sync, so you can see how a threshold produces the four cells.
- **The key message comes through.** TPR/FPR stay fixed while Precision moves with the portion slider. That is the hardest idea to teach, and the dashboard shows it.
- **Interactive formulas.** Tapping a term outlines its cells on the matrix and the plot.
- **Two audiences.** The Flu/ML toggle with matching terminology is a real strength.
- **Strong test coverage.** You can change things with confidence.

---

## P0: Fix first (they confuse learners or are wrong)

| # | Issue | Why it matters | Fix | Effort |
|---|---|---|---|---|
| 1 | **The slider is called "Sensitivity to the flu signal"** | In medicine, **Sensitivity = TPR**, and Learn more labels TPR "Sensitivity / Recall". A learner sets "Sensitivity" to 50% and then sees TPR = 96%. That's a direct contradiction. | Rename it to something like **"How easily the test says positive"** or **"Test cutoff"**. The ML label "Decision threshold" is already fine. | S |
| 2 | **Hardcoded numbers in Basics → "Why a rare disease creates mostly false alarms"** (10%, 900, 4%, 36, 96, 72.7%) | These are only correct at the default settings. Move the cutoff or separation slider and the text contradicts the matrix. | Generate the text from the live `comparisonFor(10)` values, the same way the comparison cards do. | S |
| 3 | **The matrix layout is uncommon and never explained** (FN top-left, TP top-right) | Learners will meet other layouts: scikit-learn uses `[[TN, FP], [FN, TP]]`, and many medical texts put TP top-left. If they memorize "TP = top-right", it won't transfer. | Keep your layout (it lines up with the plot: Test − left, Test + right). Add a short **"Other layouts you'll see"** box in Basics showing the sklearn and medical layouts, with cells color-mapped to yours. | S |
| 4 | **"Weighted cases… counts may be fractional"** | Confusing for laypeople, and the footnote is hidden on phones. | Replace with "Numbers are averages for 1,000 people" and move the technical detail into the existing `<details>`. | S |

---

## P1: Missing core concepts for a confusion-matrix course

| # | Add | Teaching value | Effort |
|---|---|---|---|
| 5 | **The other half of the matrix: Specificity (TNR), NPV, miss rate (FNR)** | Right now Test − results are never explained. NPV answers the natural question *"I tested negative; am I really healthy?"*. `metricGroups` already handles numerator/denominator highlighting, so extending it is cheap. | M |
| 6 | **Accuracy and the accuracy paradox** | This is the classic lesson: at 1% prevalence, a "test" that always says negative is **99% accurate** with **TPR = 0**. It shows why accuracy alone misleads. Add a one-click "Always say negative" demo. | S–M |
| 7 | **F1 score (ML mode)** | It's the standard ML summary metric. Show it as the harmonic mean of Precision and Recall, and point out that it ignores TN. | S |
| 8 | **ROC curve with a live operating point + AUC** | The threshold slider moves the dot along the curve, and separation reshapes the curve (AUC readout). The best part: **changing the portion leaves the ROC dot where it is.** That's visual proof of row normalization. | M |
| 9 | **Precision-vs-prevalence curve** (Bayes tab) | Replaces the two fixed 10%/50% cards with the whole curve plus a dot for the current p. The base-rate fallacy becomes visible across the full range. Optionally overlay a PR curve. | M |
| 10 | **Error costs: "Which mistake is worse?"** | Explains *why* you'd move the threshold. Flu: a missed case means spreading illness; a false alarm means unnecessary isolation. Spam: a lost real email vs. one more spam. You could add a cost ratio that marks the cost-optimal cutoff. | M |

---

## P2: Active learning (turns a demo into a lesson)

| # | Add | Effort |
|---|---|---|
| 11 | **Predict → Observe → Explain challenges.** Ask before revealing, e.g. *"If flu becomes rarer, will Precision go up or down?"* Then let the learner move the slider and explain the result. Suggested set of 5–6: get zero missed cases; get zero false alarms; find the portion where Precision drops below 50%; prove TPR doesn't change with the portion; beat 95% accuracy with a useless test. Show progress checkmarks. | M–L |
| 12 | **Real-world presets.** Flu: "Rapid flu test" (CDC reports roughly 50–70% sensitivity and high specificity; check the source before publishing exact numbers) and "Rare-disease screening". ML: spam filter, fraud detection (~0.1% positives), medical imaging. One click sets all three sliders. | S–M |
| 13 | **Synonyms glossary / hover tooltips.** Sensitivity = Recall = TPR = hit rate · Specificity = TNR = 1 − FPR · FPR = fall-out · Precision = PPV · Prevalence = base rate = prior. Learners get stuck on names more than on math. | S |
| 14 | **First-visit coach marks (3 steps).** "Each dot = 10 people" → "Drag the dashed line" → "Watch Precision". The 3-line intro is dense, especially on phones. | S–M |

---

## P3: Accessibility and polish

| # | Issue | Fix | Effort |
|---|---|---|---|
| 15 | **Green TP vs. red FP** are hard to tell apart with red-green color blindness (~8% of men). The grey TN count also has low contrast. | Add a second encoding: ✓/✗ glyphs or hatching on error cells/dots, or switch to a blue/orange palette. Check WCAG contrast for TN text. | S–M |
| 16 | **On phones, formula highlights fall off-screen.** "Outlined in the graphs above" is out of view while the learner reads the formula. | On narrow screens, add a small sticky mini-matrix above the formulas, or auto-scroll the matrix into view on tap. | M |
| 17 | **The Bayes tab is very long**, and the notation list repeats the Basics questions. | Fold the notation list and the derivation into `<details>`. Keep the funnel, sliders, and curve visible. | S |
| 18 | **The score axis (0–1) reads like a probability.** | Add a one-line note at the axis or in Basics: "Score is a ranking signal, not a probability." | S |
| 19 | **Teachers can't share a setup.** | Store state in the URL (`?p=10&t=50&s=60&mode=ml&tab=bayes`) so a link opens an exact scenario. | S |

---

## Suggested order
1. **Quick wins (≈1 session):** #1, #2, #3, #4, #13, #18, #19
2. **Core concepts:** #5, #6, #8, #9
3. **Pedagogy layer:** #11, #12, #10
4. **Polish:** #15, #16, #17, #14

> [!IMPORTANT]
> Put all new content in **Learn more** (or new tabs) so the simple single-screen dashboard and its no-scroll layout checks in `scripts/check.cjs` stay intact. The exception is #1, which is just a label change.
