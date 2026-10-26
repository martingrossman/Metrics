# CMatrixLab: teaching and decision-making strategy

**Date:** 25 October 2026  
**Status:** Design proposal, informed by the branch review and the user's audience clarification. This document is not an implementation, a release approval, or evidence that learning outcomes have been achieved.

## Product direction

Build CMatrixLab into an interactive school for making better decisions with predictions.

> Understand what an AI prediction means, what mistakes it makes, and when acting on it makes sense.

The first audience is **beginners, executives, and managers** who need sound understanding and judgment. Advanced users can go deeper, but the opening experience should not require familiarity with classifier terminology, formulas, or ROC curves.

**Selected first example:** automotive factory defect inspection, chosen by the user. A camera checks parts and flags suspected defects for manual re-inspection. The lesson connects quality, inspection capacity, unnecessary holds, and missed defects. Flagging a part does not automatically reject or scrap it.

The strongest existing asset is the connection between individual cases, confusion-matrix outcomes, and metric calculations. Make that connection the signature of the product. Build a guided learning experience around it, using short questions, controlled experiments, and feedback.

The important outcome is that someone can explain a better decision afterward. More charts, interactions, or time spent on the site are not sufficient evidence of learning.

## Evidence and concept previews

- [All-branch website review](../branch-review/CMATRIX_BRANCH_REVIEW.html): 23 branch names, 22 distinct versions, and 50 opened pages. This is the source for the reuse recommendations below.
- [Detailed QA report](../CMATRIX_QA_REPORT.md): mathematical, explanation, accessibility, and responsive findings for its recorded version. Its results should not be generalized to every branch.
- [Desktop concept sketch](sketch-desktop.png)
- [Mobile concept sketch](sketch-mobile.png)
- [Flagged-parts explanation](sketch-alerts.png)
- [Decision workshop](sketch-decision.png) · [Decision workshop on a phone](sketch-decision-mobile.png)
- [Population comparison](sketch-explore.png) · [Dark appearance](sketch-dark.png)

The sketch is a design illustration with predefined hypothetical policy examples. It is not the production simulator, a validated inspection model, or an assessment of real factory performance. Its purpose is to make the proposed learning flow concrete.

The clickable concept includes three policy options: Selective (6 defective parts caught, 14 good parts flagged), Balanced (8 caught, 32 good parts flagged), and Broad (9 caught, 99 good parts flagged), all out of 10 defective and 990 good parts. The population experiment explicitly uses the Broad camera policy's fixed 90% detection and 10% false-positive rates while changing the defect rate from 1% to 10%; it does not silently carry over a different policy.

## One product, three experiences

| Experience | What the visitor does | Intended outcome |
| --- | --- | --- |
| **Understand** | Works through short visual stories, predictions, and explanations | Understands accuracy, missed cases, false alarms, precision, recall, and base rates |
| **Decide** | Chooses a policy under stated costs, review capacity, and uncertainty | Can defend a decision and describe its trade-offs |
| **Explore** | Changes assumptions, compares states or models, and eventually imports labeled scores | Can investigate questions independently |

These experiences should use consistent calculations and vocabulary. A learner should be able to move from a story into exploration without losing the scenario or the meaning of its numbers.

Definitions, formulas, reference entries, and printable takeaways belong beside the relevant question. They should be easy to open when needed. The current README says the main page's Learn links were removed; reconnecting the educational material is an early priority.

## First complete lesson: should we use this factory inspection camera?

Use one coherent hypothetical story to connect statistical measures to a practical decision. Target roughly 10–15 minutes for the first prototype; validate the actual duration with users.

### 1. Evaluate a claim

Present: “A supplier offers a camera that detects defective automotive parts with 99% accuracy. Should your factory use it?”

Ask the learner to choose an initial response and explain what information they would request. Do not treat the headline accuracy alone as enough evidence to buy or reject the product.

Reveal a hypothetical shift with 1,000 automotive parts: 10 defective and 990 good. A camera that labels every part good catches no defects but reports 99% accuracy.

| Actual outcome | Flagged | Not flagged |
| --- | ---: | ---: |
| Defective part | 0 | 10 |
| Good part | 0 | 990 |

The question becomes: “How many of the defective parts did it catch?” Introduce *recall* alongside that meaning. A missed defect passes this camera screening step; the example does not assume that it necessarily reaches a customer.

### 2. Inspect another camera policy

Use an exact integer example:

| Actual outcome | Flagged | Not flagged |
| --- | ---: | ---: |
| Defective part | 9 true positives | 1 false negative |
| Good part | 99 false positives | 891 true negatives |

- Recall: 9 / 10 = **90%**.
- False-positive rate: 99 / 990 = **10%**.
- Parts flagged for manual re-inspection: 9 + 99 = **108**.
- Precision: 9 / 108 = **8.3%**, rounded.
- Accuracy: (9 + 891) / 1,000 = **90%**.

This second camera policy catches defective parts despite having lower accuracy than the always-negative baseline. The example establishes why the decision needs more than one number; it does not establish that this system is suitable for production.

Use a consistent vocabulary:

| Statistical term | Factory meaning |
| --- | --- |
| True positive | A defective part flagged for re-inspection |
| False positive | A good part unnecessarily flagged for re-inspection |
| False negative | A defective part missed by the camera |
| True negative | A good part correctly passed by the camera |
| Precision | The share of flagged parts that are actually defective |
| Recall | The share of defective parts that the camera flags |

Treat each part as one observation with a binary reference label. The teaching example assumes those reference labels are known; a real evaluation also needs a trustworthy method of establishing whether each part is defective.

### 3. Select the denominator

Ask: “Of all the parts the camera flagged, how many are actually defective?”

Let learners identify the flagged parts before showing the calculation. Highlight all 108 flagged parts as the denominator, then the 9 defective parts as the numerator. Introduce *precision* beside the plain-language question.

Use the same cases to ask the recall question. The change in denominator should be visually obvious.

### 4. Predict a population change

Ask which numbers change if defects become more common while the camera policy's true-positive and false-positive rates remain fixed.

Pin the original 1% defect rate and compare it with a second batch at up to 10% defects. At 10%, the Broad policy flags 90 defective and 90 good parts, giving 180 flags and 50% precision. Label the fixed assumptions explicitly. This is a controlled teaching experiment: detection rates need not remain unchanged with a different production line, part type, lighting condition, or defect mix.

### 5. Make an operational decision

Present: “Your team can manually re-inspect at most 40 flagged parts per shift. Choose a camera policy and explain the consequences.”

Show defective parts caught, defective parts missed, good parts unnecessarily flagged, and total manual inspection workload. Flagged parts enter a re-inspection queue; the camera does not automatically reject or scrap them.

| Illustrative policy | Defective parts caught | Good parts flagged | Defective parts missed | Good parts passed | Manual re-inspections |
| --- | ---: | ---: | ---: | ---: | ---: |
| Selective | 6 | 14 | 4 | 976 | 20 |
| Balanced | 8 | 32 | 2 | 958 | 40 |
| Broad | 9 | 99 | 1 | 891 | 108 |

If estimated costs are included, expose the assumptions: re-inspection cost, delay from unnecessary holds, and consequences of missed defects. Avoid double-counting inspection and false-alarm costs. Defect severity can matter more than a simple count.

All candidate policies must be generated consistently from one scored dataset or clearly labeled as separate hypothetical examples. Arbitrary matrix counts should not be presented as points on a fabricated ROC curve.

Provide feedback about capacity and consequences. A policy that fits the 40-part limit is not automatically safe or acceptable. If its missed defects are unacceptable, the decision may require additional inspection, more capacity, or a better model. Several choices may be defensible under different assumptions. Changing costs or capacity should sometimes change the preferred policy.

### 6. Transfer the idea

Give a new spam-filter or fraud-screening problem with different numbers. Ask the learner to identify the relevant denominator, evaluate a claim, or defend a threshold choice without the original factory hints.

Finish with a compact takeaway: what the learner chose, its consequences, the assumptions it depended on, and what evidence they would request before using a real system.

## Five interactions to make exceptional

1. **Predict before changing something.** Ask what will happen before revealing an experiment. Explain the observed result afterward.
2. **Make the denominator visible.** Link plain-language questions to the relevant cases, then to the formula. Support recall and precision on the same cohort.
3. **Compare two states.** Pin a baseline, change one assumption, and label what stayed fixed. Make differences easy to inspect.
4. **Choose and justify a decision.** Assess consequences and assumptions. Distinguish questions with one numerical answer from decisions with multiple defensible answers.
5. **Check understanding in a different context.** Use unfamiliar scenarios and numbers to test transfer, rather than rewarding repetition of the lesson's wording.

The learning cycle is: **predict → experiment → explain → decide → transfer**. Use only the steps a particular lesson needs.

## Proposed curriculum

| Lesson question | Core idea | Practical decision |
| --- | --- | --- |
| Does 99% accuracy mean useful? | Imbalance and a meaningful baseline | What evidence should we request from a supplier? |
| If the camera flags a part, how often is it defective? | Precision, recall, and denominators | What does a flag mean for the inspection team? |
| Why does the same camera policy behave differently on another batch? | Base rates and controlled comparisons | Can results from one setting support use in another? |
| Which mistakes matter most? | False positives, false negatives, and threshold trade-offs | What consequences are acceptable for this use case? |
| Can our team handle the workload? | Capacity and operational constraints | What policy fits manual inspection capacity, and are its missed defects acceptable? |
| What evidence do we need before relying on the system? | Evaluation sample size, uncertainty, calibration, and performance across populations | Is the evidence sufficient for the proposed use? |

Build the first coherent story before expanding into all six lessons. Later material should include the distinction between a raw model score and a calibrated probability, the uncertainty of estimates from small samples, and differences hidden by aggregate performance. Each topic needs its own controlled examples and validation.

For advanced learners, add threshold sweeps, ROC and PR interpretation, empirical data, and detailed metric definitions through Explore. Avoid assuming that a large AUC or F1 alone determines the best operational policy.

## Reuse the existing work deliberately

| Existing source | Preserve or study | Place in the proposed product |
| --- | --- | --- |
| Current compact branch, `featursimple_bayes_story_overall_visual_GemFixes` | Linked cases, threshold interaction, confusion matrix, scenario language, prevalence comparison | Main visual engine |
| `feature_simple_bayes_story_overall_visual` | Natural-frequency explanation and controls next to the Bayes story | Guided probability lesson |
| `learn.html` | Basics, formulas, Bayes, and trade-off material | Short lessons rewritten around learner actions |
| `reference.html` and `cheatsheet.html` | Definitions, caveats, worked examples, printable lookup | Contextual reference and takeaways |
| `mobile_view_rework` | Selected-panel navigation and nearby useful controls | Phone experience |
| `master`, `custom_data_2000`, and the import branches | CSV/JSON labels and scores; empirical exploration | Later Explore experience |
| `refactor_big` | Separation of numerical functions from rendering | Architectural pattern, with fresh validation |
| `old_from_scratch` | Explicit distributions → threshold → population sequence | Advanced model-building lesson |
| `dev_2` / `archive/dev_2` | Simultaneous matrix, metrics, distributions, and ROC | Advanced comparison layout |
| `main`, `old_dev`, and `design_0` / `archive/design_0` | Panel reordering and saved widths | Optional instructor or expert workspace |

The additional archived websites contain useful interaction ideas. Their dense layouts need substantial simplification for the first audience. Reuse proven components and concepts deliberately; different branches contain different mathematical state models and should not be combined blindly.

## Presentation, mobile, and accessibility

- Give each lesson one clear question, one dominant visualization, a small number of controls, and an explanation of what changed.
- Use plain-language labels first: “Defects caught,” “Defects missed,” “Good parts flagged,” and “Parts to re-inspect.” Introduce formal terminology alongside the explanation.
- Keep case identities and semantic colors consistent as the same data moves between representations. Pair color with labels, shapes, or patterns.
- On desktop, place the explanation beside the visualization when space permits. On phones, use a readable sequence and keep the active control near its result.
- Permit normal vertical scrolling for lessons. Do not shrink text or hide necessary outcomes to force every lesson into one viewport.
- Use native keyboard-operable controls, visible focus, adequate touch targets, meaningful accessible names, and concise text summaries of visual results. Essential information must be available without hover.
- Support reduced motion. Animation should explain a change of representation or state, rather than decorate the page.
- Preserve reading position and lesson state sensibly; distinguish returning to a previous state from resetting the exercise.

The existing `AGENT.md` specifies a dense, single-viewport executive/engineer dashboard. The readable guided lesson approach above is an intentional **design recommendation** prompted by the user's clarified beginner/manager audience. This proposal does not edit those project guidelines or retrofit the application. A later implementation should make the adopted layout requirements explicit.

## Mathematical and architectural foundation

Use shared, independently tested calculations so the story, counts, matrix, metrics, captions, and accessible summaries agree. Keep calculations separate from presentation and lesson content. A framework change is not itself a learning improvement.

Distinguish these models clearly:

- **Weighted simulated cohorts:** counts can represent expected or weighted cases; explain fractional values when present.
- **Analytic score distributions:** curves and rates depend on stated distribution assumptions.
- **Manually entered rates or counts:** a single operating point does not determine a full score distribution or ROC curve.
- **Uploaded empirical data:** use the actual labels, scores, threshold convention, and documented treatment of ties and missing values.

Start beginner examples with exact, understandable counts. Derive curves and operating points from the same applicable model. Keep toy scenario assumptions visibly separate from claims about real deployment performance.

Before extending the curriculum, resolve the existing QA findings that undermine teaching trust: F1 zero semantics, inconsistent prevalence narratives, inverted cutoff wording, AP versus trapezoidal PR-AUC labeling, inaccessible controls, and responsive/touch issues. Validate the specific changed behaviors; the earlier report is not a guarantee for a future implementation.

## Build sequence and evidence of success

1. **Create one complete lesson prototype.** Include the supplier claim, exact cases, denominator task, operational choice, and unfamiliar follow-up problem.
2. **Establish a trustworthy shared core.** Correct relevant QA findings and test count totals, metric definitions, boundary cases, and synchronization across representations.
3. **Test with the intended audience.** Include beginners and managers. Observe where they misread labels, choose the wrong denominator, or cannot explain a trade-off.
4. **Revise the lesson before broadening the product.** Use those observations to improve pacing, language, controls, and feedback.
5. **Expand the curriculum and exploration tools.** Add further scenarios, comparison, and real-data import after the initial learning flow works.

Measure whether learners can independently:

- Explain why high accuracy can coexist with missing every rare event.
- Identify the denominator for recall and precision in an unfamiliar example.
- Describe how prevalence affects precision under fixed conditional detection rates.
- Choose a policy that respects a stated capacity constraint and explain its costs.
- State what additional evidence is needed before relying on a prediction system.

Use pre-lesson and unfamiliar post-lesson tasks; consider a later follow-up to assess retained understanding. Agree on success criteria before interpreting results. A small formative user test can reveal problems, but does not establish that the site is “world best” or prove broad educational effectiveness.

## External inspiration

These are design references, not claims that their approaches automatically produce the same learning outcomes here.

| Reference | Useful principle |
| --- | --- |
| [Seeing Theory: Bayesian inference](https://seeing-theory.brown.edu/bayesian-inference/index.html) | Concrete populations and interactive probability explanations |
| [Explained Visually: conditional probability](https://setosa.io/ev/conditional-probability/) | Changing perspective to make the denominator understandable |
| [Distill: How to Use t-SNE Effectively](https://distill.pub/2016/misread-tsne/) | Organizing experiments around specific misconceptions and counterexamples |
| [Google People + AI Guidebook: User Needs + Defining Success](https://pair.withgoogle.com/chapter/user-needs/) | Connecting false positives and false negatives to consequences for users |
| [TensorFlow Playground](https://playground.tensorflow.org/) | Immediate feedback and configurable exploration after a learner has a useful question |

The distinctive direction for CMatrixLab is to connect clear visual explanations with decisions that a manager actually needs to make—and then check whether the learner can transfer that understanding.
