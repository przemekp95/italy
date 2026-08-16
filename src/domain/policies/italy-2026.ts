import { Money } from '../money';
import type {
  EmployeeRelief,
  SocialContributions,
  TaxPolicy,
} from '../tax-policy';

const euros = (value: string | number): Money => Money.fromEuros(value);
const ZERO = Money.zero;

const progressiveTax = (
  income: Money,
  bands: ReadonlyArray<{ ceiling?: Money; basisPoints: number }>,
): Money => {
  let lower = ZERO;
  let total = ZERO;

  for (const band of bands) {
    const upper = band.ceiling ?? income;
    const taxableSlice = income.minimum(upper).subtract(lower).maximum(ZERO);
    total = total.add(taxableSlice.percentageBasisPoints(band.basisPoints));
    lower = upper;

    if (income.isLessThanOrEqual(upper)) {
      break;
    }
  }

  return total;
};

export class Italy2026TaxPolicy implements TaxPolicy {
  readonly id = 'it-milano-employee-2026-v1';
  readonly taxYear = 2026;

  grossIrpef(taxableIncome: Money): Money {
    return progressiveTax(taxableIncome.maximum(ZERO), [
      { ceiling: euros(28_000), basisPoints: 2_300 },
      { ceiling: euros(50_000), basisPoints: 3_300 },
      { basisPoints: 4_300 },
    ]);
  }

  employmentDeduction(taxableIncome: Money): Money {
    if (
      !taxableIncome.isPositive() ||
      taxableIncome.isGreaterThan(euros(50_000))
    ) {
      return ZERO;
    }

    if (taxableIncome.isLessThanOrEqual(euros(15_000))) {
      return euros(1_955);
    }

    let deduction: Money;
    if (taxableIncome.isLessThanOrEqual(euros(28_000))) {
      deduction = euros(1_910).add(
        euros(1_190).multiplyFraction(
          euros(28_000).subtract(taxableIncome).minorUnits,
          euros(13_000).minorUnits,
        ),
      );
    } else {
      deduction = euros(1_910).multiplyFraction(
        euros(50_000).subtract(taxableIncome).minorUnits,
        euros(22_000).minorUnits,
      );
    }

    if (
      taxableIncome.isGreaterThan(euros(25_000)) &&
      taxableIncome.isLessThanOrEqual(euros(35_000))
    ) {
      deduction = deduction.add(euros(65));
    }

    return deduction;
  }

  employeeRelief(taxableIncome: Money): EmployeeRelief {
    if (!taxableIncome.isPositive()) {
      return { kind: 'none', amount: ZERO };
    }

    if (taxableIncome.isLessThanOrEqual(euros(20_000))) {
      const basisPoints = taxableIncome.isLessThanOrEqual(euros(8_500))
        ? 710
        : taxableIncome.isLessThanOrEqual(euros(15_000))
          ? 530
          : 480;
      return {
        kind: 'cash',
        amount: taxableIncome.percentageBasisPoints(basisPoints),
      };
    }

    if (taxableIncome.isLessThanOrEqual(euros(32_000))) {
      return { kind: 'deduction', amount: euros(1_000) };
    }

    if (taxableIncome.isLessThanOrEqual(euros(40_000))) {
      return {
        kind: 'deduction',
        amount: euros(1_000).multiplyFraction(
          euros(40_000).subtract(taxableIncome).minorUnits,
          euros(8_000).minorUnits,
        ),
      };
    }

    return { kind: 'none', amount: ZERO };
  }

  treatmentIntegrativo(taxableIncome: Money): Money {
    if (
      taxableIncome.isPositive() &&
      taxableIncome.isLessThanOrEqual(euros(15_000)) &&
      this.grossIrpef(taxableIncome).isGreaterThan(
        this.employmentDeduction(taxableIncome).subtract(euros(75)),
      )
    ) {
      return euros(1_200);
    }

    return ZERO;
  }

  regionalAdditional(taxableIncome: Money): Money {
    return progressiveTax(taxableIncome.maximum(ZERO), [
      { ceiling: euros(15_000), basisPoints: 123 },
      { ceiling: euros(28_000), basisPoints: 158 },
      { ceiling: euros(50_000), basisPoints: 172 },
      { basisPoints: 173 },
    ]);
  }

  municipalAdditional(taxableIncome: Money): Money {
    return taxableIncome.isGreaterThan(euros(23_000))
      ? taxableIncome.percentageBasisPoints(80)
      : ZERO;
  }

  socialContributions(annualGross: Money): SocialContributions {
    const contributoryGross = annualGross.maximum(ZERO);
    const base = contributoryGross.percentageBasisPoints(919);
    const additional = contributoryGross
      .subtract(euros(56_224))
      .maximum(ZERO)
      .percentageBasisPoints(100);

    return {
      base,
      additional,
      total: base.add(additional),
      massimaleWarning: contributoryGross.isGreaterThanOrEqual(euros(122_295)),
    };
  }
}

export const ITALY_2026_POLICY: TaxPolicy = new Italy2026TaxPolicy();
