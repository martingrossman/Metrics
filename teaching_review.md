# CMatrixLab: Teaching Review & Current Implementation Status

Reviewed: [index.html](file:///c:/Users/martin/Documents/GitHub/Metrics/index.html). Evaluated across the simple dashboard (desktop + mobile phone) and all four **Learn more** tabs (**Basics**, **Formulas**, **Bayes**, and **Trade-offs**), in Flu, Car Braking (AEB), Spam Filter, Fraud Alert, and Generic ML modes.

---

## 1. What Works Exceptionally Well
- **Natural Left-to-Right `0.00 → 1.00` Coordinate System & Flexible Matrix Alignment.** The score axis and Gaussian distributions run intuitively from low scores (`0.00`) to high scores (`1.00`). Learners can keep the default standard Wikipedia matrix layout (`TP` top-left) or toggle the layout switcher to **"Matches graph"** so the matrix columns (`Test −` on left, `Test +` on right) geometrically match the Score Plot above 1:1, or to **"scikit-learn"** for Python ML compatibility.
- **Two Linked Core Views.** The 1D score distribution plot and the 2×2 confusion matrix stay strictly synchronized: moving the decision cutoff line dynamically redistributes cases across all 4 quadrants and formula cards in real time.
- **The Core Pedagogical Insight with Clear Metric Captions.** True Positive Rate (`TPR` / Sensitivity: "Tested + from sick") and False Positive Rate (`FPR` / Fall-out: "Tested + from healthy") remain fixed when changing class prevalence / sick portion, while `Precision` ("Truly sick among test +") moves dramatically. These clear definitions are visible on both desktop and mobile screens.
- **Rich Multi-Domain Real-World Presets.** Learners can instantly explore 5 domain scenarios:
  1. 🩺 **Flu Test** (Medical diagnosis, 50/50 baseline)
  2. 🚗 **Car Braking (AEB)** (Sensor-triggered emergency braking vs. phantom braking)
  3. 🔬 **Flu Screening** (Rare disease screening with 10% sick portion and high recall)
  4. 📧 **Spam Filter** (Email filtering prioritizing high precision to prevent loss of valid messages)
  5. 💳 **Fraud Alert** (Extreme class imbalance showcase of the base-rate fallacy)
  6. 🤖 **Generic ML** (Standard data science terminology)
- **Comprehensive Interactive Operating Curves.** Supports **ROC Curve with AUC readout**, **Precision–Recall (PR) Curve**, **Precision-vs-Prevalence Bayes Curve**, and **Prior-Weighted Gaussians**, available both in Learn Mode and directly on the dashboard switcher tabs (**Default**, **4-Up**, **Gaussians**, **ROC**, **PR**, **Bayes**) on both desktop and mobile (iPhone).
- **Interactive Bidirectional Formula Highlighting.** Hovering or tapping any formula term (`TPR`, `FPR`, `Precision`, `Specificity / TNR`, `NPV`, `Miss Rate / FNR`) outlines the exact corresponding cells in the Confusion Matrix and regions on the Score Plot.
- **Zero-Scroll Mobile & iPhone Optimization.** Maintains strict single-screen zero-scroll views on desktop and mobile viewports across 25 tested responsive widths (down to 320px). On modern iPhones (375px–430px), both the scenario preset selector (`#presetSelect`) and the 6-view graph toggle switcher are fully visible and interactive without vertical scroll overflow.

---

## 2. Implementation Status Summary

| Tier | Items | Completed | In Progress / Backlog | Completion Rate |
|---|---|---|---|---|
| **P0: Fix First (Pedagogical Errors / Confusion)** | #1, #2, #3, #4 | **4** | 0 | **100% Complete** ✅ |
| **P1: Missing Core Concepts** | #5, #6, #7, #8, #9, #10 | **6** | 0 | **100% Complete** ✅ (+ Enhanced) |
| **P2: Active Learning & Domain Examples** | #11, #12, #13, #14 | **2** (#12, #13) | 2 (#11, #14) | **50% Complete** (Presets & Reference ready) |
| **P3: Accessibility & Polish** | #15, #16, #17, #18, #19 | **1** (#18) | 4 (#15, #16, #17, #19) | **20% Complete** |

---

## 3. Detailed Review Breakdown

### P0: Pedagogical Corrections (All Complete)

| # | Item | Status | Implementation Details in Current Website |
|---|---|---|---|
| **1** | **Clarify Cutoff Label** | ✅ **Complete** | Renamed from "Sensitivity" to **"How easily the test says +"** (Flu) / **"Braking sensitivity"** (Car) / **"Filter aggressiveness"** (Spam) / **"Decision threshold"** (ML), eliminating contradictory "Sensitivity = 50% vs TPR = 96%". |
| **2** | **Dynamic Live Numbers in Rare-Disease Lesson** | ✅ **Complete** | In Learn Mode → Basics, the base-rate fallacy text is dynamically generated from live `comparisonFor(10)` values. Moving sliders recalculates the text in sync with the matrix. |
| **3** | **Dynamic Matrix Layout Switcher & Comparison Guide** | ✅ **Complete** | Added a clean toggle button (`#matrixLayoutBtn`) directly in the Confusion Matrix header cell. Each tap cycles seamlessly through the 3 layouts:<br/>1. **Standard (Default):** Wikipedia & medical standard (`[[TP, FN], [FP, TN]]` with `TP` top-left).<br/>2. **Matches graph:** Score-axis order (`[[FN, TP], [TN, FP]]`) where the left column is `Test −` and the right column is `Test +`, establishing a 1:1 geometric match with the Score Plot regions above.<br/>3. **scikit-learn:** Python/ML convention (`[[TN, FP], [FN, TP]]` with negative class 0 first in rows and columns).<br/>Also added clickable layout cards in Learn Mode (`#learn-basics`) and dynamic SVG/CSS formula outlines that adapt to each layout without breaking. |
| **4** | **Simplify Averages Footnote** | ✅ **Complete** | Replaced dense fractional weighting note with: *"Numbers are averages for a group of 1,000 people. Sick portion changes the counts and Precision; TPR and FPR stay fixed at the same test cutoff."* Detailed fractional weights are preserved in `<details>`. |

---

### P1: Core Confusion Matrix Curriculum (All Complete + Enhanced)

| # | Item | Status | Implementation Details in Current Website |
|---|---|---|---|
| **5** | **Specificity (TNR), NPV, Miss Rate (FNR)** | ✅ **Complete** | Full interactive formula cards added in Learn Mode → Formulas (`#tab-formulas`). Tapping numerator or denominator highlights exact cells on the matrix and regions on the Score Plot. |
| **6** | **Accuracy and Accuracy Paradox Demo** | ✅ **Complete** | Live accuracy metric card added in Basics. Includes one-click **"Demo: Always predict Negative"** (`#demoAlwaysNegative`) showing 90%+ accuracy with `TPR = 0%`, plus **"Reset cutoff"** button. |
| **7** | **F1 Score** | ✅ **Complete** | Dedicated F1 score card added in Formulas tab displaying harmonic mean $2 \cdot \frac{P \cdot R}{P + R}$, explaining why F1 focuses on positive detections and omits TN. |
| **8** | **ROC Curve + AUC Readout** | ✅ **Complete** | Live SVG ROC curve with current operating point dot `(FPR, TPR)` and AUC calculation. Visual proof that moving prevalence leaves the ROC operating point unchanged (row normalization). |
| **9** | **Precision-vs-Prevalence Bayes Curve & PR Curve** | ✅ **Complete** | Interactive curve in Bayes tab displaying Precision across all prevalences ($0 \to 100\%$) with current operating dot, plus Precision-Recall (PR) curve and Prior-Weighted Gaussians. |
| **10** | **Error Costs & Decision Trade-offs** | ✅ **Complete** | Interactive cost scenarios in Trade-offs tab (**🚨 Screening** with 80% sensitivity, **⚖️ Balanced** at 50%, **🛡️ Conservative** at 20%) demonstrating how real-world asymmetric error costs dictate threshold choice. |

---

### P2: Active Learning & Domain Examples

| # | Item | Status | Implementation Details in Current Website |
|---|---|---|---|
| **11** | **Predict → Observe → Explain Challenges** | ⏳ *Backlog* | Guided micro-challenges (e.g. "Find threshold with zero missed cases") with progress checkmarks. |
| **12** | **Real-World Domain Presets & Mobile Graph Switcher** | ✅ **Complete** | Expanded top bar scenario selector (`#presetSelect`) and responsive graph switcher on both desktop and mobile:<br/>• **🩺 Flu Test (50/50):** Baseline medical diagnostic (50% sick, 50% cutoff, 60% separation; 96% Precision).<br/>• **🚗 Car Braking (AEB Sensor):** Autonomous emergency braking (15% obstacle portion, 60% sensitivity, 70% clarity; 100% TPR, 12% FPR, 59.5% Precision; zero missed crashes).<br/>• **🔬 Flu Screening (10% Sick):** Rare-disease screening with high recall (10% sick, 80% sensitivity, 60% separation; 100% TPR, 11.2% Precision).<br/>• **📧 Spam Filter (Email):** High-precision filtering protecting valid emails (40% spam, 45% aggressiveness, 55% separation; 86% TPR, 2% FPR, 96.6% Precision; moving spam portion to 10% drops Precision to 82.7%).<br/>• **💳 Fraud Alert (1% Rare):** Extreme class imbalance showcasing the base-rate fallacy (1% fraud, 50% aggressiveness, 60% separation; 96% TPR, 4% FPR, 19.5% Precision; 80% of blocked charges are false alarms).<br/>• **🤖 Generic ML:** Standard data science formulation.<br/>• **Mobile tabs:** `[Default | 4-Up | Gauss | ROC | PR | Bayes]` fully interactive on iPhone portrait. |
| **13** | **Comprehensive 32-Metric Quick Reference & Checklist Page** | ✅ **Complete** | Added standalone reference page ([reference.html](file:///c:/Users/martin/Documents/GitHub/Metrics/reference.html)) with real-time search, category filters (Core, Imbalance-Aware, Negative & Errors, Ranking, Operational / Automotive), interactive 2×2 calculation playground, and domain decision guide. Linked from Learn Mode and the simulator footer. |
| **14** | **3-Step First-Visit Coach Marks** | ⏳ *Backlog* | Lightweight step-by-step onboarding walkthrough for first-time visitors. |

---

### P3: Accessibility & Polish

| # | Item | Status | Implementation Details in Current Website |
|---|---|---|---|
| **15** | **Color-Blind Secondary Encodings** | ⏳ *Backlog* | Secondary icons/symbols (✓ / ✗) or hatching on error cells for red-green color-blind users. |
| **16** | **Mobile Auto-Scroll on Formula Tap** | ⏳ *Backlog* | Smoothly auto-scroll highlighted matrix into view when tapping formula cards on compact viewports. |
| **17** | **Fold Long Bayes Derivations** | ⏳ *Backlog* | Collapse mathematical Bayes formula derivations inside `<details>` to keep curves immediately visible. |
| **18** | **Score Axis Ranking-Signal Note** | ✅ **Complete** | Clear disclaimer added explaining that raw scores represent relative ranking signals rather than calibrated posterior probabilities. |
| **19** | **URL State Query Parameters** | ⏳ *Backlog* | Deep-linkable state (`?p=10&t=50&s=60&domain=car`) for classroom and assignment sharing. |

---

## 4. Verification & Testing

Every change is verified against the complete automated test suite:
- **`scripts/check.cjs`**: 44,541 deterministic model states, drag hit-testing, and zero-scroll layout verification across 25 responsive widths.
- **`scripts/metrics.test.cjs`**: Numerator and denominator bounding box assertions across desktop, Android, and iPhone WebKit.
- **`scripts/drag.test.cjs`**: Touch and mouse threshold dragging, pointer capture, and boundary clamping.
- **`scripts/learning.test.cjs`**: Multi-tab Learn Mode navigation and layout.
- **`scripts/p1.test.cjs`**: End-to-end verification of Accuracy, Specificity, NPV, FNR, F1, ROC/AUC, Bayes curves, 4-Up view, and the Car Braking domain preset.
