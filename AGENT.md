# AGENT.md — Project Guidelines for cmatrixlab.com

## 1. Project Overview & Vision
**cmatrixlab.com** is an interactive educational web application designed to explain Machine Learning evaluation metrics (specifically Confusion Matrices, Precision, Recall, F1, Specificity, ROC-AUC, PR-AUC, and MCC).
- **Target Audience:** Dual-persona focus. It must be intuitive enough for **Executives** (business impact, cost of false positives/negatives, high-level tradeoffs) while remaining mathematically rigorous and interactive enough for **ML Engineers** (formulas, threshold tuning, class imbalance effects).
- **Vibe / Aesthetic:** Information-dense, crisp, functional dashboard. Think "scientific instrument meets executive control panel"—clean, immediate, and zero fluff.

---

## 2. Core UI/UX & Layout Rules (STRICT)

### A. Zero-Scroll "Single-Viewport" Architecture
- **No Vertical or Horizontal Scrolling:** All primary interactive components, matrices, sliders, and resulting metrics MUST fit within a single viewport (`100dvh` height, `100vw` width).
- **No Marketing Fluff:** Do NOT generate hero sections, large introductory paragraphs, footers, or decorative banners. Launch the user directly into the interactive workspace.
- **Viewport Management:** Use `h-dvh w-screen overflow-hidden flex flex-col` on the main application wrapper across all devices. If secondary explanations are needed, use compact tabs, inline inspector panels, or tooltips rather than extending page height.

### B. High Information Density (No Unnecessary Space)
- **Compact Spacing:** Minimize whitespace, margins, and padding. Every pixel must serve a functional or readability purpose.
- **Grid & Gap Limits:** 
  - Maximum outer container padding: `8px` to `12px` (`p-2` or `p-3`).
  - Maximum grid gaps between cards/panels: `6px` to `10px` (`gap-1.5` or `gap-2.5`).
  - Card internal padding: `8px` to `12px` (`p-2` or `p-3`).
- Avoid large empty cards. Group related metrics (e.g., Precision, Recall, F1, Specificity) into tight, unified stat strips or compact grids.

### C. Cross-Device Compatibility & Mobile Split-Screen Strategy
- **Desktop (`>=768px`):** Multi-column dashboard layout filling `100dvh` (e.g., Left column: Interactive Confusion Matrix & Sliders; Center/Right columns: Derived Metrics Grid, Visual Curves, & Executive/Formula Inspector).
- **Mobile — iPhone & Android (`<768px`):** 
  - Strictly enforce `100dvh` (dynamic viewport height) to account for mobile browser address/navigation bars without scrolling.
  - **Pinned Split-Screen Layout:**
    - **Top 55% of Viewport:** Pinned Interactive Confusion Matrix + Decision Threshold & Class Balance Sliders (always visible so the user can manipulate data at any time).
    - **Bottom 45% of Viewport:** A compact, tabbed or swipeable container switching cleanly between `[Metrics]`, `[Executive Impact]`, and `[Formulas & Curves]`.
  - **Touch Targets & Ergonomics:** All sliders and interactive cells must support smooth touch/drag events with a minimum hit area of `44x44px` (using invisible hit-padding if needed so visual spacing stays tight).
  - Prevent iOS Safari auto-zoom on focus by ensuring any `<input>` or `<select>` elements use at least `16px` font size on mobile, or prefer custom touch sliders/buttons over native text inputs.

### D. Strict Typography (2-Font Maximum)
- **Maximum of TWO font families across the entire application:**
  1. **UI & Explanations (`--font-sans`):** `Inter` or `system-ui` — Used for all labels, executive summaries, buttons, and navigation.
  2. **Math, Metrics & Matrices (`--font-mono`):** `JetBrains Mono` or `Fira Code` — Used for all numbers, percentages, formulas, confusion matrix cell counts, and threshold values.
- **Tabular Numerals:** Always apply `font-variant-numeric: tabular-nums` (`tabular-nums` in Tailwind) to all dynamic numbers, percentages, and matrix cells so the layout NEVER jitters or shifts when sliders are dragged in real time.
- **Strict Type Scale (4 Levels Only):**
  - Section Headers: `0.75rem`–`0.875rem` (12px–14px), uppercase, tracked out (`tracking-wider`), bold.
  - Body / Labels: `0.875rem` (14px), regular/medium, tight line-height (`leading-snug`).
  - Primary Metric Values: `1.25rem`–`1.5rem` (20px–24px), bold, monospace (`tabular-nums`).
  - Micro-labels / Formulas: `0.75rem` (12px), muted color.

---

## 3. Core Functional Components & Interactive Mechanics

### A. Layout Components (All Visible Within Viewport)
1. **Ultra-Thin Header Bar (`h-9` or `h-10`):**
   - Brand title (`cmatrixlab.com`).
   - **Scenario Preset Selector:** Instant data presets (*Fraud Detection [High Imbalance]*, *Medical Screening [High Recall]*, *Spam Filter [High Precision]*, *Balanced Baseline*).
   - **Persona Mode / Cost Toggle:** Quick toggle or inline display bridging Executive ($$ cost per FP/FN) and Engineer (statistical formulas) perspectives.
2. **Interactive Confusion Matrix (2x2 Grid):**
   - Displays **TP, FP, FN, TN** with both raw counts and percentages of total population.
   - Users can either drag sliders (Decision Threshold $\tau$, Class Imbalance ratio, Model Separation $d'$) OR directly increment/drag individual cell counts.
3. **Derived Metrics Grid:**
   - Real-time calculation of: **Accuracy, Precision (PPV), Recall (Sensitivity/TPR), Specificity (TNR), F1-Score, FPR, FNR, and MCC (Matthews Correlation Coefficient)**.
   - Each metric card shows a compact progress bar/sparkline, exact value (`tabular-nums`), and mini formula.
4. **Live Inspector Bar / Panel (Executive + Engineer Bridge):**
   - Displays the selected metric's **Mathematical Formula** with live plugged-in numbers alongside a plain-English **Executive Translation** (e.g., *"At threshold 0.65: Out of 100 flagged alerts, 84 are real threats (Precision), while 12% of actual threats slip through undetected (FNR)."*).

### B. Visual Cross-Highlighting (The "Aha!" Mechanic)
- **Metric-to-Matrix Linking:** Hovering (desktop) or tapping (mobile) any metric card MUST visually highlight the exact Confusion Matrix cells involved in its formula and dim the irrelevant cells (`opacity-30`):
  - *Precision selected* $\rightarrow$ Highlight **TP** (numerator, bright border) and **FP** (denominator component); dim **FN** and **TN**.
  - *Recall selected* $\rightarrow$ Highlight **TP** and **FN**; dim **FP** and **TN**.
  - *Specificity selected* $\rightarrow$ Highlight **TN** and **FP**; dim **TP** and **FN**.
  - *F1 / Accuracy / MCC selected* $\rightarrow$ Highlight all participating cells with role badges (Numerator vs. Denominator).
- **Matrix-to-Metric Linking:** Hovering/tapping a cell in the Confusion Matrix (e.g., **FP**) subtly highlights all metrics that are sensitive to changes in that cell.

---

## 4. Tech Stack & Implementation Standards
- **Framework & Styling:** React (Vite) + TypeScript + Tailwind CSS (or clean Vanilla TS + Tailwind if single-file requested). Do NOT install heavy component libraries (no Material UI, Bootstrap, or Ant Design) that inject bloated default padding.
- **Icons & Graphics:** Use `lucide-react` (compact `14px`–`16px` stroke icons) and lightweight custom inline `<svg>` for ROC/PR curves and matrix visual connectors. Do NOT pull in heavy charting libraries (like Chart.js or Highcharts) when a fast, crisp 100-line SVG component gives tighter layout control.
- **Zero-Latency Reactivity:** All sliders and matrix adjustments must compute synchronously in client state (60fps reactivity, no API calls, no debouncing on local math). Handle division-by-zero edge cases gracefully (display `N/A` or `0.0%` cleanly).
- **Color Semantics (High Contrast, Colorblind-Aware):**
  - **True Positives (TP) & True Negatives (TN):** Emerald / Teal tones (Correct classifications).
  - **False Positives (FP — Type I Error / False Alarm):** Amber / Orange tones.
  - **False Negatives (FN — Type II Error / Missed Detection):** Rose / Crimson tones.
- **Pre-Flight Viewport Check:** Before finalizing any UI code, verify that the total height of header + main grid + padding does not exceed `100dvh` on a `1366x768` laptop screen or a `390x844` iPhone viewport. Use `flex-1 min-h-0` on flex children to prevent flex overflow bugs.