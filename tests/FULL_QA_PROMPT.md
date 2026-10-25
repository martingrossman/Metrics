# CMatrixLab — Comprehensive QA and Browser Testing

You are acting as a senior QA automation engineer, frontend engineer, and machine-learning evaluation expert.

Your mission is to **comprehensively test CMatrixLab using real browser interaction through Playwright MCP**, verify mathematical correctness and usability, identify defects, and produce a prioritized QA report.

**Do not modify application source code, fix bugs, commit changes, or push anything. This is a testing and investigation task only.** You may create isolated test scripts, screenshots, and QA reports under a dedicated test-results directory.

## 1. Repository and environment

Repository:
https://github.com/martingrossman/Metrics

Target branch:
`featursimple_bayes_story_overall_visual_GemFixes`

Before testing:

1. Check `git status`, `git branch --show-current`, and `git rev-parse HEAD`.
2. Verify that the active branch matches the target branch.
3. If the branch is different, do not overwrite, discard, or reset local changes. Explain the situation and use a safe isolated checkout/worktree when possible.
4. Read `AGENT.md`, `README.md`, `CMatrixLab_CODE_GUIDE.md`, `teaching_review.md`, and `package.json`.
5. Inspect the actual HTML/JavaScript/CSS implementation to discover all currently available features.
6. Treat the current source code as authoritative. Documentation may describe an earlier state. Report any discrepancies.
7. Record the exact commit SHA and browser versions.

Use the installed `playwright` MCP server for genuine browser interaction. Do not substitute static code inspection for browser tests.

Start the local server according to the repository instructions, normally `npm run serve`, and test at `http://localhost:8080`.

Run existing automated tests using `npm test`. Record results, but **do not stop if they pass**. Independent browser testing is mandatory.

## 2. Core functional testing

Exercise every currently implemented user-facing control and feature.

Specifically test:

- Scenario selector: Medical/Flu, Car Braking (AEB), Spam, Fraud, Generic ML, and any other available presets.
- Decision threshold / sensitivity controls.
- Positive-class prevalence controls.
- Model separation controls.
- Reset and default-state behavior.
- Custom scenario state after manual edits.
- Confusion matrix layouts, including Standard, Matches Graph, and scikit-learn, if present.
- All graph modes currently exposed, including Default, 4-Up, Gaussians, ROC, PR, and Bayes.
- Interactive metric and formula selection.
- Tooltips, hover highlights, tap-to-pin, focus, and Escape behavior.
- Navigation between simulator, reference, cheatsheet, and learning pages.
- Drag-and-resize behavior for dashboard panels if implemented.

For every applicable interaction, verify that all dependent numerical values, charts, labels, and highlights update correctly.

Do not assume a feature is present just because it is mentioned in documentation. Classify missing features separately from broken implemented features.

## 3. Mathematical and statistical correctness

Independently calculate the expected metrics from the underlying TP, FP, FN, and TN values.

Verify at least:

- Accuracy
- Balanced Accuracy
- Precision / PPV
- Recall / Sensitivity / TPR
- Specificity / TNR
- FPR
- FNR
- NPV
- F1-score
- MCC
- ROC-AUC
- PR-AUC, if implemented
- Other implemented classification metrics

Check formulas against an independent calculation, not merely against another function in the application.

Test the invariants documented in the code guide:

- The total weighted population remains 1,000.
- TP + FP + FN + TN equals the total population.
- Changing prevalence at fixed score distributions and threshold does not change defined TPR and FPR.
- Precision changes appropriately when prevalence changes.
- Raising a conventional positive-score threshold must not increase TPR or FPR.
- Extreme prevalence values of 0% and 100% are handled correctly.
- Zero denominators produce sensible undefined results, not NaN or Infinity.
- At perfect separation and the specified midpoint threshold, classification errors vanish where applicable.
- Rounded display counts do not corrupt internal calculations.
- Graph markers and matrix counts represent consistent weighted totals.
- ROC and PR operating points correspond to the same confusion matrix.
- Bayes precision calculations match the direct confusion-matrix results.

Use a suitable numerical tolerance for floating-point values. Do not misclassify legitimate display rounding as a defect.

Pay particular attention to **rare-event classification and the base-rate fallacy**, since these are central to the educational purpose.

## 4. Graphs and synchronized interactions

Use Playwright MCP to test actual graph interactions.

Test mouse dragging, pointer capture, boundary clamping, keyboard operation, and touch-equivalent interactions.

Verify:

- Dragging the threshold line updates its associated slider and metrics.
- Moving sliders updates the threshold line.
- The cutoff cannot move beyond its allowed range.
- All confusion matrix outcomes are synchronized with the score distribution.
- Numerator and denominator highlights reference the correct outcome regions.
- Hovering related data points highlights the corresponding elements.
- Switching graph views preserves the current model state.
- Switching matrix layouts changes presentation, not statistical values.
- Formula highlights remain correct after changing matrix layout.

Check whether chart axes, labels, scales, curves, points, and tooltips remain visually accurate at all supported viewport sizes.

## 5. Responsive visual testing

Test the following viewport sizes:

| Category | Width × Height |
|---|---|
| Small iPhone | 320 × 568 |
| iPhone SE | 375 × 667 |
| iPhone | 390 × 844 |
| iPhone | 402 × 874 |
| Large iPhone | 430 × 932 |
| Android phone | 360 × 800 |
| Android phone | 412 × 915 |
| Small tablet | 768 × 1024 |
| Tablet landscape | 1024 × 768 |
| Small laptop | 1366 × 768 |
| Laptop | 1440 × 900 |
| Full HD | 1920 × 1080 |
| Wide desktop | 2560 × 1440 |

Also test short-height windows and browser zoom at 125%, 150%, and 200%.

Where possible, use real Chromium and WebKit browser engines.

For each viewport:

1. Capture a screenshot.
2. Check horizontal overflow.
3. Check vertical overflow against the documented single-viewport design goal.
4. Verify that important controls are fully visible and accessible.
5. Check clipping, overlaps, text wrapping, and layout shifts.
6. Verify that buttons, dropdowns, graph controls, and sliders remain usable.
7. Check that graph labels and numbers are readable.
8. Check that dialogs and tooltips do not render outside the visible area.

Measure actual element bounding boxes, scroll dimensions, and computed styles. Do not rely only on screenshots.

Distinguish unintended overflow from intentional scrolling within secondary content.

## 6. Educational correctness and user experience

CMatrixLab is intended to teach classification metrics to both nontechnical users and ML engineers.

Test whether the explanations remain correct as the simulation changes.

Inspect every available educational section, particularly Basics, Formulas, Bayes, and Trade-offs in `learn.html`, if present.

Verify:

- Definitions accurately distinguish Precision from Recall.
- Sensitivity and specificity are described correctly.
- The meaning of FP and FN adapts appropriately to each domain.
- Changing prevalence demonstrates the base-rate fallacy correctly.
- Numerical examples match the current simulator state.
- Accuracy-paradox examples behave as described.
- F1 and MCC explanations match their formulas.
- Threshold/cost trade-offs make mathematical and domain sense.
- Every displayed equation agrees with the actual numbers.
- Undefined metrics are explained appropriately.

Try to find misleading explanations, inconsistent terminology, obsolete values, and descriptions that could cause a user to misunderstand classifier performance.

## 7. Robustness and accessibility

Perform negative and boundary testing:

- Rapidly move sliders back and forth.
- Switch presets repeatedly.
- Switch graph modes during interactions.
- Change matrix layout while a metric is highlighted.
- Resize the browser after changing model state.
- Refresh after complex interactions.
- Test repeated Reset operations.
- Test keyboard-only navigation.
- Test touch interactions where supported.
- Check for inaccessible or obscured controls.
- Verify focus indicators and accessible labels.
- Check for stale highlights or inconsistent UI states.

Monitor browser console errors, uncaught exceptions, failed requests, and unhandled promise rejections.

Check that no interaction creates NaN, Infinity, broken SVG coordinates, disappearing controls, or inconsistent model state.

## 8. Performance

Measure where practical:

- Initial page load
- Control-to-render latency
- Repeated slider-update responsiveness
- Layout stability
- Frame responsiveness during dragging
- Memory growth during repeated interactions
- Unnecessary rendering or layout recalculations

Use realistic sample sizes and explain measurement limitations.

Identify performance problems visible to users rather than optimizing speculative microseconds.

## 9. Test coverage and reproducibility

Create a test inventory based on actual discovered features.

For each feature, record:

- Tested behavior
- Expected result
- Actual result
- Pass / Fail / Blocked / Not implemented
- Browser and viewport
- Evidence

Run existing regression tests and additional independent browser scenarios.

For every discovered defect:

1. Reproduce it at least twice where feasible.
2. Minimize the steps needed to reproduce.
3. Capture a screenshot or other relevant evidence.
4. Identify the likely root cause.
5. Reference the relevant source file and line number when possible.
6. Explain user impact.
7. Suggest a fix, but do not implement it.

Do not claim tests passed unless they were actually executed.

## 10. Deliverables

Create a complete Markdown report:

`test-results/CMATRIX_QA_REPORT.md`

Structure:

### Executive summary
- Overall quality assessment
- Release readiness: READY / READY WITH ISSUES / NOT READY
- Tests passed, failed, blocked, and untested

### Critical findings
Prioritize defects:

- P0: Incorrect mathematical results or application-breaking bugs
- P1: Important functional or interaction failures
- P2: Visual, responsive, and usability problems
- P3: Minor polish and enhancements

### Functional test matrix
Detailed tested features and results.

### Mathematical validation
Independent expected values vs actual values.

### Responsive test matrix
Results for each viewport and browser.

### Educational review
Misleading, inconsistent, or mathematically incorrect explanations.

### Performance findings
Measurements and notable issues.

### Recommended fixes
Ranked by severity, user impact, and implementation effort.

### Evidence
Screenshots, reproduction steps, browser versions, tested commit SHA, and test logs.

### Coverage limitations
Clearly identify functionality or devices that could not be tested.

## 11. Execution rules

- Do not edit production application files.
- Do not commit, push, merge, reset, or delete branches.
- Use the actual target branch, never silently test `main`.
- Keep the existing Git working tree intact.
- Do not stop after smoke testing or after the existing test suite passes.
- Execute the full practical test campaign, prioritizing mathematical correctness, interactive behavior, and mobile usability.
- If a test is blocked, document the obstacle and continue with other tests.
- Do not invent results or claim complete coverage without evidence.

**Begin by inspecting the branch and enumerating the actual implemented features. Then execute the tests, collect evidence, and deliver the final report.**