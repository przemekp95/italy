import { describe, expect, it } from 'vitest';
import { calculateNetSalary } from '../calculate-net-salary';
import { Money } from '../money';
import { ITALY_2026_POLICY } from '../policies/italy-2026';

const euros = (value: string | number) => Money.fromEuros(value);

describe('annual net salary calculation', () => {
  it.each([
    '8500',
    '15000',
    '20000',
    '23000',
    '25000',
    '28000',
    '32000',
    '35000',
    '40000',
    '50000',
    '56224',
    '122295',
  ])('balances every component exactly for RAL %s', (gross) => {
    const result = calculateNetSalary({
      annualGross: euros(gross),
      payPeriods: 13,
      policy: ITALY_2026_POLICY,
    });

    expect(
      result.annualNet
        .add(result.deductions.total)
        .subtract(result.benefits.total),
    ).toEqual(result.annualGross);
    expect(
      result.averageNetPerPayPeriod
        .multiply(13)
        .subtract(result.annualNet)
        .absolute()
        .isLessThanOrEqual(euros('0.06')),
    ).toBe(true);
  });

  it('transforms RAL into taxable income after rounded INPS', () => {
    const result = calculateNetSalary({
      annualGross: euros('60000'),
      payPeriods: 13,
      policy: ITALY_2026_POLICY,
    });

    expect(result.contributions.total).toEqual(euros('5551.76'));
    expect(result.taxableIncome).toEqual(euros('54448.24'));
  });
});
