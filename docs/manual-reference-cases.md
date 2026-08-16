# Independently calculated reference cases

These checkpoints were derived directly from the legal formulas before implementation. They are intentionally expressed at policy-function level so RAL, contribution and taxable-income thresholds are not confused. Monetary results are rounded half-up to cents at the named component boundary.

## National income of €18,000.00

- Gross IRPEF: `18,000 × 23% = 4,140.00`.
- Employment deduction: `1,910 + 1,190 × (28,000 − 18,000) / 13,000 = 2,825.384615… → 2,825.38`.
- Ordinary national IRPEF: `4,140.00 − 2,825.38 = 1,314.62`.
- Structural tax-free employee sum: `18,000 × 4.8% = 864.00`.
- Trattamento integrativo: `0.00` in the frozen scenario.

## National income of €30,000.00

- Gross IRPEF: `28,000 × 23% + 2,000 × 33% = 7,100.00`.
- Employment deduction: `1,910 × (50,000 − 30,000) / 22,000 + 65 = 1,801.363636… → 1,801.36`.
- Further employee deduction: `1,000.00`.
- National IRPEF: `7,100.00 − 1,801.36 − 1,000.00 = 4,298.64`.

## Milano exemption boundary

| Taxable income | Lombardia | Milano | Total local |
| ---: | ---: | ---: | ---: |
| €22,999.99 | €310.90 | €0.00 | €310.90 |
| €23,000.00 | €310.90 | €0.00 | €310.90 |
| €23,000.01 | €310.90 | €184.00 | €494.90 |

With the simplified 9.19% contribution rounded before taxable income, these taxable values correspond to approximately RAL €25,327.60 / €25,327.61 / €25,327.62. This is a documented legal discontinuity, not a monotonicity defect.

## INPS boundaries

- RAL €56,224.00: base `€56,224 × 9.19% = €5,166.99`; extra 1% `€0.00`.
- RAL €60,000.00: base `€5,514.00`; extra `1% × (€60,000 − €56,224) = €37.76`; total `€5,551.76`.
- At €122,295.00 the formula gives base `€11,238.91` plus extra `€660.71`, total `€11,899.62`; the UI warns because the statutory cap cannot be selected correctly without pension-history facts.
