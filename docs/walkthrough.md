# 10–15 minute product walkthrough

## 0:00–1:30 — Product and scope

- Open the [live demo](https://przemekp95.github.io/italy/).
- State the supported user: a standard full-year private FPLD employee resident in Milan in 2026.
- Show the one primary RAL input, 12/13/14 pay-period control and explicit Calculate action.
- Set the expectation: this is an explainable annual estimate, not a payslip simulator.

## 1:30–4:00 — Demo and explanation

- Enter `40.000`, keep 13 pay periods and calculate.
- Point out annual net and the average per pay period.
- Walk down social contributions, national IRPEF and both local surtaxes.
- Expand “Come abbiamo calcolato” and follow RAL → INPS → taxable income → gross IRPEF → deductions/benefits → addizionali → annual net.
- Switch to English and show that the result and assumptions remain intact.

## 4:00–6:30 — Policy decisions

- Explain the 2026 33% middle IRPEF rate and why a 2025 calculator would be wrong.
- Explain that statutory income thresholds apply after mandatory employee INPS, not directly to RAL.
- Demonstrate the Milan €23,000 taxable-income exemption boundary and its legal cliff.
- Enter a RAL at or above €122,295 and show why the app warns rather than silently selecting a non-universal INPS cap.
- Distinguish taxes, social contributions, non-taxable employee relief and a real payslip’s advance/balance timing.

## 6:30–8:30 — Architecture and arithmetic

- Show `Money`: integer cents, immutable operations and one half-up rounding policy.
- Show the `TaxPolicy` strategy and the versioned `Italy2026TaxPolicy`.
- Show `calculateNetSalary` as the pure functional core and React as a UI shell with no tax formulas.
- State the architecture boundary honestly: light value-object/strategy OOP, not full DDD, hexagonal architecture, CQRS or BDD.

## 8:30–10:30 — TDD and quality

- Show the domain RED commit `e949b13` and GREEN commit `342e995`.
- Show the UI RED commit `0180008` and the focused localized-input/custom-combobox regression loops.
- Run or show the 62 unit/component tests, including every requested threshold ±€0.01 and the exact balance invariant.
- Show Playwright’s full bilingual flow, 320 px keyboard test and Axe result.

## 10:30–12:30 — Delivery evidence

- Open the GitHub Actions run for the final `main` SHA.
- Show that formatting, lint, types, tests, build and E2E run in the same verify job.
- Show the Pages artifact uploaded only after those checks and deployed without rebuilding.
- Match the workflow `head_sha`, deployment SHA, public footer build marker and `origin/main` SHA.
- Run an unauthenticated desktop and 320 px public smoke.

## 12:30–15:00 — Trade-offs and production path

- Trade-off: one clear scenario gives a more defensible result than a misleading multi-contract payroll engine.
- Trade-off: annualized INPS/addizionali are explainable but do not reproduce individual monthly payslips.
- Trade-off: massimale applicability needs pension history, so warning is safer than hidden guessing.
- Production evolution: legal review/owner, broader CCNL and contribution profiles, payroll-calendar engine, monitoring and versioned multi-year policies—each behind new primary-source research and golden tests.
- Close with the source registry, explicit limitations and the distinction between automated evidence and human acceptance.
