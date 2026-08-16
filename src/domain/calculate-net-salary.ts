import { Money } from './money';
import type { TaxPolicy } from './tax-policy';

export type PayPeriods = 12 | 13 | 14;

export type NetSalaryInput = {
  readonly annualGross: Money;
  readonly payPeriods: PayPeriods;
  readonly policy: TaxPolicy;
};

export type NetSalaryResult = {
  readonly annualGross: Money;
  readonly annualNet: Money;
  readonly averageNetPerPayPeriod: Money;
  readonly taxableIncome: Money;
  readonly contributions: {
    readonly base: Money;
    readonly additional: Money;
    readonly total: Money;
  };
  readonly taxes: {
    readonly grossIrpef: Money;
    readonly employmentDeduction: Money;
    readonly employeeReliefDeduction: Money;
    readonly deductionsApplied: Money;
    readonly nationalIrpef: Money;
    readonly regionalAdditional: Money;
    readonly municipalAdditional: Money;
    readonly total: Money;
  };
  readonly benefits: {
    readonly employeeReliefCash: Money;
    readonly treatmentIntegrativo: Money;
    readonly total: Money;
  };
  readonly deductions: {
    readonly total: Money;
  };
  readonly warnings: ReadonlyArray<'massimale'>;
};

export const calculateNetSalary = ({
  annualGross,
  payPeriods,
  policy,
}: NetSalaryInput): NetSalaryResult => {
  if (!annualGross.isPositive()) {
    throw new RangeError('Annual gross salary must be greater than zero.');
  }

  if (![12, 13, 14].includes(payPeriods)) {
    throw new RangeError('Pay periods must be 12, 13 or 14.');
  }

  const social = policy.socialContributions(annualGross);
  const taxableIncome = annualGross.subtract(social.total).maximum(Money.zero);
  const grossIrpef = policy.grossIrpef(taxableIncome);
  const employmentDeduction = policy.employmentDeduction(taxableIncome);
  const employeeRelief = policy.employeeRelief(taxableIncome);
  const employeeReliefDeduction =
    employeeRelief.kind === 'deduction' ? employeeRelief.amount : Money.zero;
  const deductionsApplied = employmentDeduction
    .add(employeeReliefDeduction)
    .minimum(grossIrpef);
  const nationalIrpef = grossIrpef.subtract(deductionsApplied);

  const regionalAdditional = nationalIrpef.isPositive()
    ? policy.regionalAdditional(taxableIncome)
    : Money.zero;
  const municipalAdditional = nationalIrpef.isPositive()
    ? policy.municipalAdditional(taxableIncome)
    : Money.zero;
  const totalTaxes = nationalIrpef
    .add(regionalAdditional)
    .add(municipalAdditional);

  const employeeReliefCash =
    employeeRelief.kind === 'cash' ? employeeRelief.amount : Money.zero;
  const treatmentIntegrativo = policy.treatmentIntegrativo(taxableIncome);
  const totalBenefits = employeeReliefCash.add(treatmentIntegrativo);
  const totalDeductions = social.total.add(totalTaxes);
  const annualNet = annualGross.subtract(totalDeductions).add(totalBenefits);

  return {
    annualGross,
    annualNet,
    averageNetPerPayPeriod: annualNet.divide(payPeriods),
    taxableIncome,
    contributions: {
      base: social.base,
      additional: social.additional,
      total: social.total,
    },
    taxes: {
      grossIrpef,
      employmentDeduction,
      employeeReliefDeduction,
      deductionsApplied,
      nationalIrpef,
      regionalAdditional,
      municipalAdditional,
      total: totalTaxes,
    },
    benefits: {
      employeeReliefCash,
      treatmentIntegrativo,
      total: totalBenefits,
    },
    deductions: { total: totalDeductions },
    warnings: social.massimaleWarning ? ['massimale'] : [],
  };
};
