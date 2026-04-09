# Visual Test Checklist

Use this checklist before commits that affect layout, controls, rendering, or interaction flow.

## How To Run

1. Open [index.html](/c:/Users/martin/Documents/GitHub/Metrics/index.html) in a browser.
2. Test once in a desktop-sized window.
3. Test once in a narrow/mobile viewport using browser responsive mode.
4. If you changed logic as well, run:

```powershell
npm.cmd test
```

## Desktop Checks

- Page loads without obvious console or rendering failures.
- Header, theme toggle, controls, charts, confusion matrix, and mosaic all appear.
- Nothing overlaps, clips, or leaves large unintended empty gaps.
- Plot areas render at expected size and do not collapse.
- Scrolling works normally.

## Controls

- Preset buttons switch the scenario cleanly.
- TPR, FPR, prevalence, threshold, and model sliders move smoothly.
- Percent inputs stay synchronized with their paired sliders.
- Switching between direct mode and linked mode updates the right controls.
- Threshold changes update linked-mode behavior correctly.
- Resetting custom data returns the app to simulator mode.

## Metrics And Views

- `Matrix` and `Mosaic` view toggle works.
- `Values`, `Bars`, `Equations`, and `Theory` metric tabs switch correctly.
- `Curves` and `Top View` distribution tabs switch correctly.
- Metric values update after changing sliders or presets.
- Hovering or tapping metric cards highlights the matching regions correctly.
- Opening an equation from a metric card jumps to the right formula.

## Charts

- Confusion matrix numbers and labels render correctly.
- Mosaic renders with correct proportions and updates after control changes.
- ROC chart updates when threshold, presets, or custom data change.
- Distribution/top-view chart updates when model parameters change.
- Plot resizing still works after changing tabs, viewport width, or orientation.

## Custom Data

- CSV upload works with [sample_data.csv](/c:/Users/martin/Documents/GitHub/Metrics/sample_data.csv).
- JSON upload works if you changed import/parsing behavior.
- After loading custom data, threshold movement walks through the empirical ROC behavior.
- Reset removes custom-data mode and restores built-in settings.
- Status text reflects load/reset state correctly.

## Mobile / Narrow Viewport

- Sticky/mobile controls remain reachable.
- No controls are hidden behind overlays or cut off by the viewport.
- Text remains readable and buttons remain tappable.
- Horizontal overflow does not appear unexpectedly.
- Charts, matrix, and mosaic remain usable without broken spacing.
- Metric-card tap behavior works on touch-sized layout.

## Theme / Styling

- Theme toggle still changes appearance correctly.
- Blur, borders, spacing, and typography still look intentional.
- No obvious broken colors, transparent artifacts, or unreadable contrast issues.

## Final Pre-Commit Pass

- Save all files.
- Run `npm.cmd test`.
- Recheck the main flow once with the final code.
- Review `git diff --stat` and `git status --short` before committing.
