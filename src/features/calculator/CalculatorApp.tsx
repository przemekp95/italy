import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  calculateNetSalary,
  type NetSalaryResult,
  type PayPeriods,
} from '../../domain/calculate-net-salary';
import { Money } from '../../domain/money';
import { ITALY_2026_POLICY } from '../../domain/policies/italy-2026';
import { ResultView } from './ResultView';
import { PayPeriodSelect } from './PayPeriodSelect';
import { translations, type Locale } from './translations';

const normalizeGrossInput = (raw: string, locale: Locale): string | null => {
  const compact = raw.trim().replace(/\s/g, '');
  if (!/^\d[\d.,]*$/.test(compact)) {
    return null;
  }

  const grouping = locale === 'it' ? '.' : ',';
  const decimal = locale === 'it' ? ',' : '.';
  const escapedGrouping = grouping === '.' ? '\\.' : grouping;
  const groupedInteger = new RegExp(`^\\d{1,3}(?:${escapedGrouping}\\d{3})+$`);

  if (!compact.includes(decimal) && groupedInteger.test(compact)) {
    return compact.replaceAll(grouping, '');
  }

  const parts = compact.split(decimal);
  if (parts.length > 2 || (parts[1]?.length ?? 0) > 2) {
    return null;
  }

  const integerPart = parts[0] ?? '';
  const validInteger = integerPart.includes(grouping)
    ? groupedInteger.test(integerPart)
    : /^\d+$/.test(integerPart);

  if (
    !validInteger ||
    (parts.length === 2 && !/^\d{1,2}$/.test(parts[1] ?? ''))
  ) {
    return null;
  }

  const normalizedInteger = integerPart.replaceAll(grouping, '');
  return parts.length === 2
    ? `${normalizedInteger}.${parts[1]}`
    : normalizedInteger;
};

const parseGross = (raw: string, locale: Locale): Money | null => {
  const normalized = normalizeGrossInput(raw, locale);
  if (!normalized) {
    return null;
  }

  try {
    const amount = Money.fromEuros(normalized);
    return amount.isPositive() ? amount : null;
  } catch {
    return null;
  }
};

export const CalculatorApp = () => {
  const [locale, setLocale] = useState<Locale>('it');
  const [grossInput, setGrossInput] = useState('');
  const [payPeriods, setPayPeriods] = useState<PayPeriods>(13);
  const [result, setResult] = useState<NetSalaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const t = translations[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      locale === 'it' ? 'Netto Milano 2026' : 'Milan Net Salary 2026';
  }, [locale]);

  useEffect(() => {
    resultRef.current?.focus();
  }, [result]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const annualGross = parseGross(grossInput, locale);

    if (!annualGross) {
      setError(t.error);
      setResult(null);
      return;
    }

    setError(null);
    setResult(
      calculateNetSalary({
        annualGross,
        payPeriods,
        policy: ITALY_2026_POLICY,
      }),
    );
  };

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setError(null);
  };

  return (
    <div className="app-shell">
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Netto Milano 2026">
          <span>NM</span>
          <strong>Netto Milano</strong>
        </a>
        <div className="language-switcher" aria-label={t.language} role="group">
          <button
            type="button"
            className={locale === 'it' ? 'is-active' : ''}
            aria-pressed={locale === 'it'}
            onClick={() => changeLocale('it')}
          >
            Italiano
          </button>
          <button
            type="button"
            className={locale === 'en' ? 'is-active' : ''}
            aria-pressed={locale === 'en'}
            onClick={() => changeLocale('en')}
          >
            English
          </button>
        </div>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 id="page-title">{t.title}</h1>
          <p>{t.intro}</p>
        </section>

        <section className="calculator" id="calculator" aria-label={t.title}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="gross-field">
              <label htmlFor="gross-salary">{t.grossLabel}</label>
              <div className="currency-input">
                <span aria-hidden="true">€</span>
                <input
                  id="gross-salary"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={grossInput}
                  placeholder={t.grossPlaceholder}
                  aria-describedby="gross-hint gross-error"
                  aria-invalid={Boolean(error)}
                  onChange={(event) => setGrossInput(event.target.value)}
                />
              </div>
              <small id="gross-hint">{t.grossHint}</small>
            </div>

            <PayPeriodSelect
              label={t.payPeriods}
              value={payPeriods}
              onChange={setPayPeriods}
            />

            <button className="calculate-button" type="submit">
              {t.calculate}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <div id="gross-error">
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </section>

        {result && (
          <ResultView
            result={result}
            locale={locale}
            payPeriods={payPeriods}
            ref={resultRef}
          />
        )}

        <section className="context-grid" aria-label={t.assumptionsTitle}>
          <div>
            <p className="section-number" aria-hidden="true">
              01
            </p>
            <h2>{t.assumptionsTitle}</h2>
            <p className="section-lead">{t.assumptionsLead}</p>
            <ul>
              {t.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </div>
          <div className="estimate-note">
            <p className="section-number" aria-hidden="true">
              02
            </p>
            <h2>{t.estimateTitle}</h2>
            <p>{t.estimateBody}</p>
          </div>
        </section>

        <section className="sources" aria-labelledby="sources-title">
          <p className="section-number" aria-hidden="true">
            03
          </p>
          <h2 id="sources-title">{t.sourcesTitle}</h2>
          <p>{t.sourcesLead}</p>
          <ul>
            <li>
              <a href="https://www.normattiva.it/eli/id/2025/12/30/25G00212/ORIGINAL">
                {t.sourceNational}
              </a>
            </li>
            <li>
              <a href="https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2026.01.circolare-numero-6-del-30-01-2026_15151.html">
                {t.sourceInps}
              </a>
            </li>
            <li>
              <a href="https://www.regione.lombardia.it/bollo-auto-e-tributi-regionali/red-addizionale-regionale-irpef">
                {t.sourceRegion}
              </a>
            </li>
            <li>
              <a href="https://www.comune.milano.it/documents/20118/5500233/00%2B-%2BDelibera%2BBilancio%2B2026-2028.pdf/5ed4f4dc-7c23-5a16-4b03-5536698fe3b3?download=true&t=1768816987921&version=1.0">
                {t.sourceMilan}
              </a>
            </li>
            <li>
              <a href="https://github.com/przemekp95/italy/blob/main/docs/source-registry.md">
                {t.sourceRegistry}
              </a>
            </li>
          </ul>
        </section>
      </main>

      <footer>
        <p>{t.footer}</p>
        <p className="build-marker">
          {t.build}: <code>{__BUILD_SHA__.slice(0, 12)}</code>
        </p>
      </footer>
    </div>
  );
};
