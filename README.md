# Milan Net Salary 2026

**[Live demo](https://przemekp95.github.io/italy/)** · [Public repository](https://github.com/przemekp95/italy) · [Verified sources](docs/source-registry.md)

An explainable annual net-salary estimate for a standard private employee resident in Milan in tax year 2026. Enter RAL, choose 12, 13 or 14 pay periods and explicitly calculate. The result shows annual net, average net per pay period, every contribution and tax, applicable employee benefits, assumptions, sources and the complete calculation trail.

The interface is available in Italian and English. All calculations run locally in the browser; RAL is never transmitted.

> **Estimate, not a payslip.** The per-period figure is annual estimated net divided by the selected number of pay periods. It does not simulate payroll calendars, monthly rounding, advances, balances or year-end adjustments.

## Supported scenario

The policy is intentionally narrow and versioned as `it-milano-employee-2026-v1`:

- tax year 2026;
- private FPLD employee, permanent contract, employed for the full year;
- one employer and RAL as the only income;
- resident in Milan, Lombardy;
- no children, dependants, other income, bonuses, benefits, special personal deductions or impatriate regime;
- standard 9.19% employee INPS profile as an explicit simplification, plus the 2026 additional 1% where applicable;
- standard employment deduction, structural employee tax relief and trattamento integrativo when eligible;
- 13 pay periods by default, with 12 and 14 available.

Excluded: TFR, employer cost, INAIL, overtime, bonuses, extra CCNL contributions and exact monthly payroll adjustments. High RAL at or above the 2026 INPS massimale receives a prominent warning because cap eligibility cannot be inferred from RAL alone.

## What the result explains

- estimated annual net;
- average net per selected pay period;
- ordinary and additional employee INPS;
- gross and net national IRPEF;
- employment and structural employee deductions;
- trattamento integrativo and the non-taxable employee relief sum;
- Lombardy regional and Milan municipal surtaxes;
- total taxes, social contributions and deductions;
- the exact balance from RAL through taxable income to annual net.

## Calculation model

All money uses integer euro cents. Every named annual component is rounded half-up to cents; binary floating-point is not used for tax arithmetic.

1. **Employee contributions**
   - ordinary simplified INPS: `RAL × 9.19%`;
   - additional INPS: `max(0, RAL − €56,224) × 1%`;
   - the €122,295 massimale is a warning boundary, not a silent cap, because it depends on pension-history facts absent from this one-input product.
2. **Taxable employment income**
   - `taxable income = RAL − rounded employee INPS`.
3. **Gross IRPEF 2026**
   - 23% through €28,000;
   - 33% from €28,000 to €50,000;
   - 43% above €50,000.
4. **National deductions and benefits**
   - the standard full-year employment deduction under TUIR art. 13;
   - the additional €65 in the statutory €25,000–€35,000 band;
   - structural employee relief: non-taxable 7.1% / 5.3% / 4.8% sum through €20,000, then a €1,000/tapering tax deduction through €40,000;
   - trattamento integrativo only when its income and tax-capacity conditions are met.
5. **Local surtaxes**
   - Lombardy: progressive 1.23% / 1.58% / 1.72% / 1.73%;
   - Milan: zero through €23,000 taxable income, then 0.8% of the **entire** taxable income.
6. **Balance**
   - `annual net = RAL − social contributions − taxes + net employee benefits`;
   - the automated invariant verifies `annual net + total deductions − benefits = RAL` exactly.

The Milan rule creates a legal discontinuity immediately above €23,000 taxable income. The implementation deliberately does not assert global net monotonicity or `net ≤ gross`: low-income cash benefits can also make the second statement false.

See [independently calculated checkpoints](docs/manual-reference-cases.md) and the [complete source registry and decision log](docs/source-registry.md).

## Architecture

```text
src/domain/
  money.ts                         integer-cent Money value object
  tax-policy.ts                    TaxPolicy strategy contract
  policies/italy-2026.ts          versioned 2026 rules
  calculate-net-salary.ts          pure orchestration and balance
src/features/calculator/
  CalculatorApp.tsx                UI state and explicit submit
  PayPeriodSelect.tsx              accessible custom combobox
  ResultView.tsx                   explainable result ledger
  translations.ts                  complete Italian/English copy
e2e/calculator.spec.ts             browser, mobile, keyboard and Axe
```

This is a functional core with a React UI shell and light, purposeful OOP: `Money` is a value object and `TaxPolicy` is a replaceable strategy. It is not presented as full DDD, hexagonal architecture, CQRS or BDD. There is one small domain and no backend, command/query split or external adapters to justify those labels.

## Methodology and tests

The core and UI were built with recorded RED → GREEN → refactor loops:

- domain RED commit `e949b13`: policy and balance tests fail before `Money`, `TaxPolicy` and calculator exist;
- domain GREEN commit `342e995`: 56 focused tests pass after the minimum tax core;
- UI RED commit `0180008`: bilingual CTA, validation and keyboard tests fail before the React feature exists;
- localized-number and custom-combobox regressions were each reproduced by a failing focused test before their fixes.

Coverage includes:

- threshold and ±€0.01 checks for taxable-income boundaries €8,500, €15,000, €20,000, €23,000, €25,000, €28,000, €32,000, €35,000, €40,000 and €50,000;
- RAL-side checks at the €56,224 additional-INPS threshold and €122,295 massimale warning;
- exact component balance across representative RAL values;
- component behavior in Italian and English;
- keyboard focus management and localized number formats;
- a full production-build browser flow;
- 320 px keyboard operation and horizontal-overflow protection;
- Axe WCAG 2 A/AA and WCAG 2.1 AA checks.

Tests prove behavior and regression coverage. The commit sequence is the evidence for test-first development; the presence of tests alone would not prove TDD. There are no Gherkin scenarios or living behavior documents, so this is not claimed as BDD.

## Local development

Requirements: Node version from `.node-version` and npm.

```bash
npm ci
npx playwright install chromium
npm run dev
```

Verification:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm run test:e2e` serves the already-built `dist` with `vite preview`; run `npm run build` first after source changes.

## CI and GitHub Pages

The GitHub Actions workflow runs formatting, linting, type checking, unit/component tests, builds once, and executes Playwright/Axe against that exact `dist`. On a successful `main` push it uploads the same directory as the Pages artifact. The deployment job never rebuilds.

The workflow uses:

- minimal job permissions (`contents: read` for verification; `pages: write` and `id-token: write` only for deployment);
- immutable full-SHA action pins;
- cancellation for superseded branch/PR verification, but no cancellation of an in-progress Pages deploy;
- Vite base `/italy/`;
- a visible build SHA marker for public-runtime verification.

CI, artifact publication, Pages deployment and public-runtime smoke are reported as separate evidence in [verification.md](docs/verification.md).

## Security and integration boundaries

- **CSRF/browser-request protection:** not applicable; there is no session, backend or state-changing HTTP request.
- **HTTP/API transport:** the deployed app fetches only its same-origin static assets. Official-source links navigate only when the user chooses them. RAL stays in memory in the browser.
- **Messaging, queues, jobs and webhooks:** not present and not applicable.
- **CQRS / ports and adapters:** intentionally not introduced for a static, single-domain calculator. The `TaxPolicy` strategy is the only needed policy boundary.
- No analytics, accounts, database, AI, PDF generation or third-party runtime scripts.

## Updating for a later tax year

1. Research the new year from primary official sources.
2. Add a new immutable `TaxPolicy` implementation; do not mutate the 2026 policy in place.
3. Update the source registry with publication date, verification date and the rule each source confirms.
4. Independently calculate new reference cases.
5. Add failing threshold/golden tests, confirm RED, implement to GREEN, then refactor.
6. Update UI scope copy and expose the new policy only after the complete verification pipeline passes.

## Further documentation

- [Source registry and decision log](docs/source-registry.md)
- [Manual reference calculations](docs/manual-reference-cases.md)
- [10–15 minute walkthrough](docs/walkthrough.md)
- [Verification evidence](docs/verification.md)
- [Interface design brief](docs/design-brief.md)
