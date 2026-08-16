import { forwardRef } from 'react';
import type { NetSalaryResult } from '../../domain/calculate-net-salary';
import type { Money } from '../../domain/money';
import type { Locale } from './translations';
import { translations } from './translations';

type ResultViewProps = {
  result: NetSalaryResult;
  locale: Locale;
  payPeriods: 12 | 13 | 14;
};

const currency = (value: Money, locale: Locale): string =>
  new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value.toNumber());

type LedgerRowProps = {
  label: string;
  value: Money;
  locale: Locale;
  tone?: 'minus' | 'plus' | 'strong';
};

const LedgerRow = ({ label, value, locale, tone }: LedgerRowProps) => (
  <div className={`ledger-row ${tone ? `ledger-row--${tone}` : ''}`}>
    <dt>{label}</dt>
    <dd>{currency(value, locale)}</dd>
  </div>
);

export const ResultView = forwardRef<HTMLElement, ResultViewProps>(
  ({ result, locale, payPeriods }, ref) => {
    const t = translations[locale];
    const localTaxes = result.taxes.regionalAdditional.add(
      result.taxes.municipalAdditional,
    );

    return (
      <section
        className="results"
        aria-label={t.resultRegion}
        ref={ref}
        tabIndex={-1}
      >
        <p className="eyebrow">{t.resultKicker}</p>
        <div className="headline-result">
          <div>
            <p>{t.annualNet}</p>
            <strong data-testid="annual-net">
              {currency(result.annualNet, locale)}
            </strong>
          </div>
          <div className="pay-period-result">
            <p>{t.averageNet}</p>
            <strong>{currency(result.averageNetPerPayPeriod, locale)}</strong>
            <small>{t.averageNote(payPeriods)}</small>
          </div>
        </div>

        <dl className="totals-strip">
          <LedgerRow
            label={t.contributionsTotal}
            value={result.contributions.total}
            locale={locale}
            tone="minus"
          />
          <LedgerRow
            label={t.taxesTotal}
            value={result.taxes.total}
            locale={locale}
            tone="minus"
          />
          <LedgerRow
            label={t.deductionsTotal}
            value={result.deductions.total}
            locale={locale}
            tone="strong"
          />
          {!result.benefits.total.isZero() && (
            <LedgerRow
              label={t.benefitsTotal}
              value={result.benefits.total}
              locale={locale}
              tone="plus"
            />
          )}
        </dl>

        <div className="breakdown-grid">
          <div>
            <h2>{t.breakdown}</h2>
            <dl className="detail-ledger">
              <LedgerRow
                label={t.baseInps}
                value={result.contributions.base}
                locale={locale}
              />
              {!result.contributions.additional.isZero() && (
                <LedgerRow
                  label={t.extraInps}
                  value={result.contributions.additional}
                  locale={locale}
                />
              )}
              <LedgerRow
                label={t.nationalIrpef}
                value={result.taxes.nationalIrpef}
                locale={locale}
              />
              <LedgerRow
                label={t.regional}
                value={result.taxes.regionalAdditional}
                locale={locale}
              />
              <LedgerRow
                label={t.municipal}
                value={result.taxes.municipalAdditional}
                locale={locale}
              />
              {!result.benefits.employeeReliefCash.isZero() && (
                <LedgerRow
                  label={t.reliefCash}
                  value={result.benefits.employeeReliefCash}
                  locale={locale}
                  tone="plus"
                />
              )}
              {!result.benefits.treatmentIntegrativo.isZero() && (
                <LedgerRow
                  label={t.treatment}
                  value={result.benefits.treatmentIntegrativo}
                  locale={locale}
                  tone="plus"
                />
              )}
            </dl>
          </div>

          <details className="calculation-trail">
            <summary>{t.method}</summary>
            <dl>
              <LedgerRow
                label={t.stepGross}
                value={result.annualGross}
                locale={locale}
              />
              <LedgerRow
                label={t.stepContributions}
                value={result.contributions.total}
                locale={locale}
                tone="minus"
              />
              <LedgerRow
                label={t.stepTaxable}
                value={result.taxableIncome}
                locale={locale}
              />
              <LedgerRow
                label={t.stepGrossIrpef}
                value={result.taxes.grossIrpef}
                locale={locale}
              />
              <LedgerRow
                label={t.stepEmploymentDeduction}
                value={result.taxes.employmentDeduction}
                locale={locale}
                tone="plus"
              />
              {!result.taxes.employeeReliefDeduction.isZero() && (
                <LedgerRow
                  label={t.stepReliefDeduction}
                  value={result.taxes.employeeReliefDeduction}
                  locale={locale}
                  tone="plus"
                />
              )}
              <LedgerRow
                label={t.stepNational}
                value={result.taxes.nationalIrpef}
                locale={locale}
              />
              <LedgerRow
                label={t.stepLocal}
                value={localTaxes}
                locale={locale}
              />
              <LedgerRow
                label={t.stepBenefits}
                value={result.benefits.total}
                locale={locale}
                tone="plus"
              />
              <LedgerRow
                label={t.stepNet}
                value={result.annualNet}
                locale={locale}
                tone="strong"
              />
            </dl>
          </details>
        </div>

        {result.warnings.includes('massimale') && (
          <aside className="warning" aria-labelledby="massimale-warning-title">
            <h2 id="massimale-warning-title">{t.warningTitle}</h2>
            <p>{t.warningBody}</p>
          </aside>
        )}
      </section>
    );
  },
);

ResultView.displayName = 'ResultView';
