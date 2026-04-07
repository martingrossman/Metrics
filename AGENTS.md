# Agent Workflow

Use this workflow for consistent, high-quality implementation of the confusion matrix / ROC playground.

## Core Principles
- Keep code readable, modular, and easy to extend.
- Prefer simple solutions over clever ones.
- Preserve existing working behavior unless the task explicitly changes it.
- Do not introduce unnecessary abstractions or dependencies.
- Keep visual and interaction behavior consistent across the app.

## Roles
- `explorer`: Reads code, maps constraints, identifies affected components. No file edits.
- `worker`: Implements code changes only in assigned files and only within agreed scope.
- `reviewer`: Checks for regressions, edge cases, UI inconsistencies, and maintainability risks.
- `integrator` (main): Merges outcomes, runs final checks, and prepares the final result.

## Ownership Rules
- Each worker owns explicit files before editing starts.
- No agent edits files outside assigned ownership.
- If cross-file changes are needed, ownership is reassigned explicitly first.

## Required Handoff Format
Every agent handoff must include:
- Objective completed
- Files touched
- Behavior changed
- Risks introduced
- Verification run
- Open questions

## Code Quality Rules
- Prefer small, well-named functions over long blocks of inline logic.
- Reuse existing helpers and patterns before creating new ones.
- Avoid duplicated logic; extract shared behavior when it improves clarity.
- Use descriptive variable and function names.
- Add comments only where intent is non-obvious.
- Keep HTML structure clean and predictable.
- Keep CSS organized, grouped, and consistent with existing naming/style.
- Keep JavaScript side effects explicit and localized.

## UI / UX Rules
- Preserve responsive behavior on mobile and desktop.
- Do not break slider behavior, Plotly interactions, layout resizing, or scrolling.
- Prefer compact, visually clean layouts.
- Maintain consistency in spacing, typography, colors, and control sizing.
- New UI elements must feel native to the current design.
- Optimize for clarity first, then polish.

## Safety Rules
- Do not rewrite large sections unless necessary for the task.
- Do not change unrelated functionality while refactoring.
- If a refactor is needed, separate refactor from feature changes whenever possible.
- Flag fragile areas before modifying them.

## Verification Requirements
- Explorer gate: assumptions confirmed from source files.
- Worker gate: implementation runs and matches acceptance criteria.
- Reviewer gate: no critical regressions; major risks documented.
- Integrator gate: final checklist passes before completion.

## Minimum Final Checks
- No obvious syntax errors
- Existing interactions still work
- Layout still works on desktop and mobile
- No broken controls, labels, or event wiring
- No duplicate logic introduced without reason

## Stop Conditions
Stop and escalate when:
- Requirements conflict with existing behavior
- Hidden side effects appear in unrelated areas
- Verification cannot be completed locally
- The requested change would require broad refactoring beyond the agreed scope

## Project-Specific Priorities
- Favor clarity of metrics and interactions over architectural purity.
- Keep controls intuitive and compact.
- Preserve bidirectional linkage between UI controls and visualizations.
- Avoid changes that make the playground harder to understand or teach from.
## Refactor Rules
- Refactor for readability, structure, naming, and duplication reduction only.
- Do not change functionality, UI behavior, outputs, or public API.
- Do not change labels, defaults, event wiring, slider behavior, Plotly behavior, or layout behavior unless explicitly requested.
- Prefer small, local refactors over broad rewrites.
- Keep changes easy to review.

## Verification Rules
- Before changes, identify how the current behavior can be tested.
- After changes, run the same checks again and compare results.
- If no automated tests exist, create the smallest safe verification possible without changing behavior.
- Report exactly what was verified and any residual risk.
## Verification Constraints
- Do not use browser automation (e.g. headless Chrome, Playwright)
- Assume verification is performed manually by the user
- Provide clear manual verification steps instead of running tools
## Test Rule
- ALWAYS start responses with: CM_OK