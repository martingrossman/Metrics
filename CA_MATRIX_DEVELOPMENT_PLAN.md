# CA Matrix Web — Development Readiness Plan
**Version:** 0.1 · 2026-10-25  
**Status:** Planning only; no repository changes authorized or executed.

## Goal
Preserve the currently working application, enable reliable remote development, organize the existing work, document a reproducible setup, and only then resume feature development.

## Current known context and assumptions
- Candidate GitHub repository: `martingrossman/Metrics` (verify this is the CA Matrix Web project before changes).
- GitHub repository default branch is currently `master`, **not `main`**. Do not rename or modify it without explicit decision.
- Previously mentioned working branch: `Branch_1e973a51`; it was not found in the remote branch search. It may exist only locally or under another name.
- Node HTTP server, static pages and ngrok were previously used. Verify actual source tree, commands, ports, OS, and tooling before documenting exact setup.
- Proposed target branch: `pre-dev-refactor`, created from the verified current working commit, never from an assumed remote ref.

## Phase 1 — Remote development (first major step)
### 1.1 Inventory and safety
- Identify exact local repository, working tree, branch, commit SHA, remotes, and uncommitted/untracked changes.
- Back up or commit work before branch operations; never force-push or delete history without explicit review.
- Confirm whether remote means GitHub/Codex cloud environment, remote access to the running app, or both. Plan for both, but configure only selected options.
### 1.2 GitHub + remote coding
- Verify GitHub origin, authentication, repository permissions, and branch visibility.
- Choose remote coding workflow: Codex cloud environment or GitHub Codespaces (or SSH to own computer if required).
- Define Node runtime version, install command, start/test commands, environment variables, and required services.
- Add a reproducible dev environment (e.g., `.devcontainer/` if Codespaces is chosen), with secrets managed outside Git.
- Verify remote checkout → install → start → edit → test → commit → push → pull request.
### 1.3 Application access
- Distinguish remote coding from publishing the running web app.
- Document local URL, listening interface, port, and port forwarding.
- For ngrok, document install, account authentication (never token value), current supported CLI syntax, tunnel start, traffic inspector, and access restrictions.
- Avoid public unauthenticated access to sensitive development endpoints; use access controls.
**Exit criteria:** Remote environment starts the app from a clean checkout and allows a verified code change and test.

## Phase 2 — Repository cleanup and reproducible documentation (second major step)
### 2.1 Branch structure
- Keep the currently stable default branch untouched.
- Preserve the original working branch/commit.
- Create `pre-dev-refactor` from the *verified* working commit after checking for uncommitted changes.
- Later introduce `dev` for routine development; use `feature/<topic>` branches for scoped work.
### 2.2 Technical audit
- Inventory folders, dependencies, entry points, API endpoints, data storage, configuration, deployment, and external integrations.
- Identify dead code, duplication, oversized files, unclear ownership, unsafe defaults, and missing tests.
- Rank improvements by risk, impact, and effort. Avoid rewriting working code without measurable benefit.
### 2.3 Engineering baseline
- Standardize formatting, linting, dependency lockfile, `.gitignore`, and `.env.example` without secrets.
- Add smoke tests and regression tests before structural refactoring.
- Add GitHub Actions for install, lint, test, and build (if applicable).
- Add error handling, logging, security checks, and branch/PR review conventions.
### 2.4 Documentation deliverables
- `README.md`: purpose, quick start, prerequisites, main commands.
- `docs/SETUP_LOCAL.md`: from zero to running locally.
- `docs/SETUP_REMOTE.md`: remote coding environment and troubleshooting.
- `docs/NGROK.md`: tunnel setup, security, inspector, shutdown.
- `docs/ARCHITECTURE.md`: components, data flow, entry points.
- `docs/DEVELOPMENT.md`: branching, testing, CI, release process.
- `docs/TROUBLESHOOTING.md`: common errors and recovery.
- `docs/DECISIONS.md`: decisions and rationale.
- `docs/SECURITY.md`: secrets, exposure, access and incident basics.
Each setup guide must be verified on a clean environment; commands must reflect actual repository and versions.
**Exit criteria:** Another developer can reproduce the environment using docs alone; baseline tests pass and changes are reviewable.

## Phase 3 — Feature development (third major step)
- Agree on product priorities, backlog and acceptance criteria.
- Create `dev` from the approved, tested refactoring baseline.
- Implement one feature or fix per branch and pull request.
- Require tests and documented behavior changes.
- Promote reviewed releases to the stable branch only when verified.
**Exit criteria:** New features are delivered with reproducible builds, tests, reviews and rollback guidance.

## Proposed execution checkpoints
1. Confirm repository identity and inspect local + remote branch/commit state.
2. Agree on remote coding provider and access/security model.
3. Demonstrate a clean remote setup.
4. Freeze current behavior with baseline tests.
5. Create `pre-dev-refactor` from verified commit.
6. Refactor in small PRs; complete all setup guides.
7. Review readiness checklist, then begin feature work.

## Do not do yet
- Do not rename `master` to `main` automatically.
- Do not create `pre-dev-refactor` from the wrong branch.
- Do not force-push, delete branches, expose tokens, or publish a dev server without safeguards.
- Do not claim setup documentation is tested until a clean-start verification succeeds.

## First unresolved questions
1. Is `martingrossman/Metrics` definitely the CA Matrix Web repository?
2. Is `Branch_1e973a51` local-only, and are there uncommitted changes?
3. Does “remote” mean Codex cloud coding, browser-based Codespaces, app access via ngrok, or all three?
