# CMatrixLab competitive review

Research date: 26 October 2026.

## Assessment

CMatrixLab has a credible path to becoming a leading interactive explanation of binary classification. This review does not establish that it is already the best. Its strongest feature is the visible connection between scored cases, their matrix cells, and the denominator used by a metric. The prevalence experiment gives that connection a useful purpose.

The recommended promise is: **Understand why a classifier can look excellent and still make mostly false alarms.** Expand from that insight into thresholds, recall, ROC, PR, and decision costs.

The strongest competitors already combine several of these features. A threshold slider, ROC curve, or long metric list alone will not distinguish CMatrixLab. The opportunity is to make the causal explanation easier to understand and remember.

## Scope and evidence

This is a broad web survey, not a claim to have found every interactive matrix on the internet. It covers 24 products, projects, or educational resources. Multiple related modules from one provider count as one competitor. Search coverage included calculators, threshold simulators, diagnostic-test tools, teaching articles, and research visualizations.

Evidence levels used below:

- **Tested:** changed inputs or a preset in the browser and inspected the resulting output.
- **Inspected:** opened the live interface but did not validate its calculations through a controlled experiment.
- **Source reviewed:** reviewed the provider's page, documentation, or indexed page text. Features are provider descriptions, not verified behavior.
- **Limited access:** a fetch failed, the calculator was gated, or only indexed text was available. This is a limitation of this review, not evidence that the site is broken for users.

No quantitative ranking or user study was performed. Statements about relative teaching quality and priorities are my assessment.

## Closest competitors

| Competitor | Evidence | What it offers | Implication for CMatrixLab |
|---|---|---|---|
| [ML Visualization](https://www.mlvisualization.com/visualizations/confusion-matrix), including its [ROC](https://www.mlvisualization.com/visualizations/roc-auc) and [precision/recall](https://www.mlvisualization.com/visualizations/precision-recall) modules | Tested confusion-matrix example; reviewed other modules | Linked data and matrix, balance and separation controls, error costs, cost-optimal threshold, playback, failure examples, worked calculations | Closest teaching competitor. Match the clarity of its experiments and feedback while keeping your more compact workspace. |
| [Confusion Matrix Pro](https://confusionmatrixpro.com/) | Tested perfect-classifier preset; inspected interface | Editable binary matrix, prediction/CSV input, threshold mode, multiclass, formulas, intervals, many exports, sharing and embedding controls, color-blind mode | Strong practical calculator benchmark. Its broader workflow makes it difficult to win through feature count. Export controls were observed, not exhaustively tested. |
| [Kanaries](https://ml.kanaries.net/tools/confusion-matrix-calculator) | Tested four-input perfect classifier | Counts or paired labels, multiclass metrics, heatmap, per-class scores, CSV/PNG controls, code examples | Good benchmark for moving from calculation to reproducible work. Perfect inputs produced scores of 1 in the inspected results. |
| [Metrics Reloaded / DKFZ](https://metrics-reloaded.dkfz.de/metric-demo/confusion-matrix) | Inspected live interface | Class-count control, editable matrix, normalization, prevalence adjustment, F-score beta, expected-cost weights, links to a metric library | Strong reference and metric-selection benchmark. Its initial empty matrix displayed zero-valued metrics; CMatrixLab should explain its own undefined-value convention clearly. |
| [Meng-Chi Ed Chen: classification metrics](https://www.mit.edu/~edchen93/posts/precision-recall-f1-confusion-matrix-classification-metrics/) | Source reviewed | Calculator and 100-ball playground; learners drag cases between predicted classes, with extreme presets | Strong idea for teaching the four outcomes before introducing a score threshold. |
| [Ali Jabbary: classifier explorer](https://alijabbary.com/forge/classifier) | Source reviewed | Threshold, score presets, custom labels/scores, matrix, ROC/PR, six suggested experiments | Competes directly with the full explanation. Your guided path should keep instructions beside the relevant controls. |
| [Condados threshold lab](https://condados.ai/labs/confusion-matrix) | Source reviewed | Separate count-editing and threshold modes, metrics and ROC/PR, linked explanation | Useful precedent for separating arbitrary counts from an actual scored dataset. |
| [Cameron Summers](https://www.cameronsummers.com/precision_recall_visualization_tool) | Source reviewed | Classification-quality and threshold sliders, linked prediction outcomes and PR curve | Demonstrates the value of a small number of well-connected controls. |
| [Rogozhnikov / Alenkin ROC demo](https://arogozhnikov.github.io/2015/10/05/roc-curve.html) | Source reviewed, including linked source | Adjustable distribution means/variances and movable threshold connected to ROC | A focused conceptual benchmark. Your prevalence and matrix explanation extends beyond this particular lesson. |
| [Stupidpupil interactive matrix](https://stupidpupil.github.io/confusion_matrix/) | Source reviewed | Editable counts, scaled visualization, live formulas, complementary rates and summary measures | Formula inspection has established precedents. Your advantage should be tracing the same population through several views. |

## Broader survey

| Competitor | Evidence | Relevant feature or lesson |
|---|---|---|
| [MySimulator](https://www.mysimulator.uk/data-science/confusion-matrix-explorer/) and its [Threshold Lab](https://www.mysimulator.uk/machine-learning/model-evaluation-metrics/) | Limited access; indexed provider descriptions | Synthetic score distributions, threshold, matrix and curves; Threshold Lab also describes sample count, noise, class prior and best-F1 controls. These descriptions are not a performance validation. |
| [MLHIVE](https://www.mlhive.com/playground/machine-learning/confusion-matrix) | Limited access; indexed provider text | Presets, pasted scores, matrix, ROC/PR, formulas; explicitly distinguishes trapezoidal PR-AUC from other summaries. |
| [ReConcept Lab](https://reconceptlab.com/en/nodes/confusion-matrix/) | Limited access; indexed provider text | A deterministic 12-case trace, positive-class swap preview, ledger and exercises. Useful inspiration for teaching matrix construction. |
| [DIAGCALC](https://tiagojacinto.eu/projects/diagcalc/index.html) | Source reviewed | Diagnostic workflow from matrix to pre/post-test probability, likelihood ratios, Wilson intervals, Fagan nomogram, print output. Strong domain-specific explanation. |
| [Apple Neo](https://github.com/apple-aiml-research/ml-hierarchical-confusion-matrix) | Repository and research description reviewed | Hierarchical and multi-output matrices, normalization and shareable specifications. A different, more advanced analysis audience; not a sensible first feature target for CMatrixLab. |
| [Statistics Fundamentals](https://statisticsfundamentals.com/calculators/confusion-matrix-calculator/) | Source reviewed | Binary calculator, worked derivations, examples and undefined-value explanations. A reference-content benchmark. |
| [NR Tech Studio](https://nrtechstudio.com/tools/confusion-matrix-calculator/) | Limited access; indexed provider text | Binary and pasted multiclass matrices, heatmap, interpretations, explicit n/a convention. |
| [Tarcalc](https://tarcalc.com/) | Limited access; indexed provider text | Precision/recall point estimates, exact confidence intervals and an uncertainty plot. Distinct emphasis on sample-size uncertainty. |
| [Sesen AI](https://sesen.ai/classification-metrics-calculator) | Source reviewed; calculator gated by human verification | Counts/raw predictions, heatmap and metric comparison described. No interaction or correctness judgment made. |
| [StatGarden](https://www.statgarden.com/statistics/confusion-matrix.html) | Limited access; indexed provider text | Basic binary calculator and explanatory examples. |
| [TNAADO](https://tools.tnaado.ca/calculators/math/confusion-matrix-calculator/) | Limited access; indexed provider text | Broad binary metric list, formulas and undefined-value explanation. |
| [CS Fundamentals handbook](https://cs.velikhanov.com/) | Indexed provider text reviewed | Embedded count calculator and imbalance-trap preset within a larger handbook. |
| [ML Field Guide](https://eldorodo.github.io/data-to-decisions/labs/ch06_model_evaluation.html) | Indexed provider text reviewed | Scenario presets, threshold, ROC/PR and model-comparison controls alongside broader evaluation lessons. |
| [CMShiny](https://www.stats.bris.ac.uk/R/web/packages/CMShiny/refman/CMShiny.html) | Package documentation reviewed | Interactive confusion-matrix analysis and plot/data download; live hosted app not validated. |

## What I verified in CMatrixLab

### Public site versus local workspace

The current public interface at [cmatrixlab.com](https://cmatrixlab.com/) and the local workspace were materially different during this review.

The live page opened with 50% prevalence and offered a generic-ML terminology toggle. Its observed interface did not expose the local scenario selector, graph tabs, or cheatsheet navigation. A search result still described a much older, more extensive ROC playground. Search indexing therefore should not be treated as evidence of what visitors currently receive.

The local page opened with the medical scenario at 10% prevalence and exposed Medical test, Car braking, Spam filter, Fraud detection and Generic ML presets. It included Default, 4-Up, Gaussians, ROC, PR and Bayes views. I opened its ROC view and inspected the displayed operating point and AUC.

**First priority: choose the intended public version and make its useful features discoverable.** This is a release recommendation; no deployment was performed.

### The prevalence lesson works

On the live page, switching from 50% to 10% sick changed precision from 96% to 72.7%, while TPR remained 96% and FPR remained 4%. The displayed calculation became 96 / (96 + 36). This is a strong, concrete teaching interaction.

Keep the qualification visible: class-conditional scores, separation and threshold are being held fixed. In a real deployment, population changes can also accompany changes in those distributions.

### The visual relationship is strong

At 1440 × 900, the local score plot and matrix were visible together. The matrix's graph-matching arrangement put negative predictions on the left and positive predictions on the right, matching the score threshold. Outcome labels and population counts support the color encoding.

The metric inspector, common case identities and matching positions are worth developing. They support understanding the denominator rather than memorizing a ratio.

### Compact layout has an interaction cost

At 390 × 844, the local default view had no document overflow. However, graph-tab bounding boxes were only 16 px tall, and range-input boxes were 28 px tall. These measurements do not prove every effective touch area, but warrant checking the actual hit regions and missed taps on a phone. The project guidelines request 44 × 44 px touch targets.

At 1042 × 651, document height measured 1138 px. At 1440 × 900 it measured 900 px. The single-viewport goal therefore was not met at every sampled size. This was a small viewport sample, not a complete responsive audit.

### Learning content is difficult to discover

The local README explicitly says Learn entry points were removed, while learn.html remains available. The simulator visibly linked the cheatsheet. A reference link exists in the original footer markup, but the runtime footer replacement removed it from the inspected live DOM. Useful content should have a reachable, compact navigation path.

## Recommended work, in order

| Priority | Change | What successful behavior looks like |
|---|---|---|
| 1 | Resolve public/local version gap; restore learning navigation | A new visitor can reach the intended simulator, explanations and reference without knowing hidden URLs. |
| 2 | Add three short guided experiments | Learner predicts an outcome, changes one control, and gets an explanation using the current counts. |
| 3 | Save and compare two states | Pin a baseline; change prevalence or threshold; show differences in counts and metrics while making held-fixed variables explicit. |
| 4 | Add a share link that restores the full experiment | Scenario, prevalence, separation, threshold, view and selected metric survive opening the link on another device. |
| 5 | Improve mobile targets and short-window layout | Tabs and sliders are easy to acquire by touch; all essential feedback stays visible at supported viewport sizes. |
| 6 | Add explicit error-cost controls | FP cost and FN cost produce C = cFP × FP + cFN × FN; identify the lowest-cost available threshold for the current dataset/model. |
| 7 | Add counts and real-score input as separate modes | Counts support point metrics. Scores plus labels support threshold sweeps and ROC/PR. Never fabricate a full curve from four counts. |
| 8 | Add export and uncertainty where appropriate | Export state plus assumptions; intervals use actual sample counts and a named method, rather than treating weighted illustrative cases as independent observations. |

The first three lessons should be:

1. **Same test, different population.** Predict what happens to precision when positives fall from 50% to 10%; keep threshold and separation fixed. Explain the result with live TP and FP counts.
2. **High accuracy, no detections.** Predict negative for everyone in an imbalanced population. Ask what the impressive accuracy conceals.
3. **Same model, different decision.** Move the threshold, track cases into different cells and show why the ROC operating point moves while the underlying ROC curve remains fixed.

Use a compact lesson selector and inspector inside the existing workspace. A large introductory section or extra dashboard cards would compete with the interaction.

## Mathematical and editorial quality bar

- Distinguish the adjustable decision setting from measured sensitivity/recall. A slider percentage is not automatically TPR.
- Distinguish ranking scores from calibrated probabilities.
- Name the positive class and label both matrix axes in every layout.
- Show N/A with a short reason when a denominator is zero.
- Distinguish average precision from trapezoidal PR-AUC, and disclose the chosen computation.
- Keep operating-point metrics separate from summaries over thresholds.
- Present threshold optimization as conditional on the selected costs and data. Do not imply 0.5 or maximum F1 is universally optimal.
- Keep statements and examples synchronized with live values. During the ML Visualization experiment, a generic 99%-accuracy warning accompanied an actual 98%-accuracy rare-disease state. That small inconsistency illustrates an avoidable teaching problem.
- Define how weighted, fractional illustrative counts differ from an observed test set.

## How to support a claim of being the best

Run a small comparative usability study before making a broad superiority claim. Recruit beginners as well as people familiar with ML. Counterbalance the order in which participants use CMatrixLab and the strongest relevant competitor; use equivalent tasks so the second tool does not benefit unfairly from the first lesson.

Ask participants to identify FP/FN, explain precision versus recall, predict a prevalence change, explain a threshold change, and choose a decision under unequal error costs. Record correct answers, time, requests for help, and observed interaction problems. Test delayed recall with a new example if feasible.

Judge the teaching tool by what people can explain afterward. Judge a practical calculator separately by input convenience, correctness, exports and reproducibility. These are different goals, and CMatrixLab's clearest immediate opportunity is the former.

## Recommended direction

Preserve the compact, linked score-and-matrix workspace. Make it guide a learner through a small number of memorable experiments, with live explanations, pinned comparisons and links that teachers can share. That would give CMatrixLab a clearer reason to be chosen than a larger catalog of formulas.

This review added no application changes, published nothing, and did not run the application test suite. Browser checks were exploratory and are not a full correctness or accessibility audit.
