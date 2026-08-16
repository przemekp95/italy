import { describe, expect, it } from 'vitest';
import { Money } from '../money';
import { ITALY_2026_POLICY } from '../policies/italy-2026';

const euros = (value: string | number) => Money.fromEuros(value);

describe('Italy 2026 tax policy', () => {
  it.each([
    ['27999.99', '6440.00'],
    ['28000.00', '6440.00'],
    ['28000.01', '6440.00'],
    ['49999.99', '13700.00'],
    ['50000.00', '13700.00'],
    ['50000.01', '13700.00'],
  ])('calculates progressive gross IRPEF at %s', (income, expected) => {
    expect(ITALY_2026_POLICY.grossIrpef(euros(income))).toEqual(
      euros(expected),
    );
  });

  it.each([
    ['14999.99', '1955.00'],
    ['15000.00', '1955.00'],
    ['15000.01', '3099.9991'],
    ['24999.99', '2184.62'],
    ['25000.00', '2184.62'],
    ['25000.01', '2249.61'],
    ['34999.99', '1367.27'],
    ['35000.00', '1367.27'],
    ['35000.01', '1302.27'],
    ['49999.99', '0.00'],
    ['50000.00', '0.00'],
    ['50000.01', '0.00'],
  ])('calculates employment deduction at %s', (income, expected) => {
    expect(ITALY_2026_POLICY.employmentDeduction(euros(income))).toEqual(
      euros(expected),
    );
  });

  it.each([
    ['8499.99', 'cash', '603.50'],
    ['8500.00', 'cash', '603.50'],
    ['8500.01', 'cash', '450.50'],
    ['14999.99', 'cash', '795.00'],
    ['15000.00', 'cash', '795.00'],
    ['15000.01', 'cash', '720.00'],
    ['19999.99', 'cash', '960.00'],
    ['20000.00', 'cash', '960.00'],
    ['20000.01', 'deduction', '1000.00'],
    ['31999.99', 'deduction', '1000.00'],
    ['32000.00', 'deduction', '1000.00'],
    ['32000.01', 'deduction', '1000.00'],
    ['39999.99', 'deduction', '0.00'],
    ['40000.00', 'deduction', '0.00'],
    ['40000.01', 'none', '0.00'],
  ])('applies structural employee relief at %s', (income, kind, expected) => {
    const relief = ITALY_2026_POLICY.employeeRelief(euros(income));
    expect(relief.kind).toBe(kind);
    expect(relief.amount).toEqual(euros(expected));
  });

  it.each([
    ['22999.99', '0.00'],
    ['23000.00', '0.00'],
    ['23000.01', '184.00'],
  ])('preserves the legal Milano exemption cliff at %s', (income, expected) => {
    expect(ITALY_2026_POLICY.municipalAdditional(euros(income))).toEqual(
      euros(expected),
    );
  });

  it.each([
    ['56223.99', '5166.98', '0.00'],
    ['56224.00', '5166.99', '0.00'],
    ['56224.01', '5166.99', '0.00'],
    ['60000.00', '5514.00', '37.76'],
  ])(
    'calculates simplified employee INPS at RAL %s',
    (gross, base, additional) => {
      const result = ITALY_2026_POLICY.socialContributions(euros(gross));
      expect(result.base).toEqual(euros(base));
      expect(result.additional).toEqual(euros(additional));
    },
  );

  it.each([
    ['122294.99', false],
    ['122295.00', true],
    ['122295.01', true],
  ])('warns at the non-universal massimale boundary %s', (gross, warned) => {
    expect(
      ITALY_2026_POLICY.socialContributions(euros(gross)).massimaleWarning,
    ).toBe(warned);
  });
});
