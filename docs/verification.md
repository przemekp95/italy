# Verification evidence

This file separates evidence layers that must not be conflated.

## Local source and tests

- Branch: `feat/milan-net-salary-2026` from `origin/main` `da7b710034e9849b18520b982a046b6690e34834`.
- Domain TDD: RED `e949b13`, GREEN `342e995`.
- UI TDD: RED `0180008`; localized input and combobox regressions also reproduced RED before fixes.
- Fresh local checks before delivery:
  - format, lint and typecheck;
  - 62 unit/component tests;
  - production Vite build;
  - 2 Playwright tests against `dist`, including 320 px keyboard flow and Axe WCAG 2 A/AA + 2.1 AA.

## CI

To be filled with the final GitHub Actions run URL and `head_sha` after push/PR/merge. A green PR-head run does not prove the final `main` SHA.

## Artifact

To be filled with the Pages artifact and workflow-run identity. The workflow uploads the already-tested `dist`; deployment does not rebuild it.

## Deployment

To be filled with the GitHub Pages deployment/environment URL and deployed SHA after merge.

## Public runtime

To be filled after an unauthenticated desktop and 320 px smoke against `https://przemekp95.github.io/italy/`, including the visible build marker.

## Human acceptance

Automated checks do not prove recruiter/user acceptance. The 10–15 minute walkthrough is prepared, but human acceptance remains a separate external decision.
