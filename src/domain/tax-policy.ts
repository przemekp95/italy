import type { Money } from './money';

export type EmployeeRelief = {
  readonly kind: 'cash' | 'deduction' | 'none';
  readonly amount: Money;
};

export type SocialContributions = {
  readonly base: Money;
  readonly additional: Money;
  readonly total: Money;
  readonly massimaleWarning: boolean;
};

export interface TaxPolicy {
  readonly id: string;
  readonly taxYear: number;
  grossIrpef(taxableIncome: Money): Money;
  employmentDeduction(taxableIncome: Money): Money;
  employeeRelief(taxableIncome: Money): EmployeeRelief;
  treatmentIntegrativo(taxableIncome: Money): Money;
  regionalAdditional(taxableIncome: Money): Money;
  municipalAdditional(taxableIncome: Money): Money;
  socialContributions(annualGross: Money): SocialContributions;
}
