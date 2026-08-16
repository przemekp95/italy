const CENTS_PER_EURO = 100n;

const roundDivide = (numerator: bigint, denominator: bigint): bigint => {
  if (denominator <= 0n) {
    throw new RangeError('The denominator must be positive.');
  }

  const sign = numerator < 0n ? -1n : 1n;
  const magnitude = numerator < 0n ? -numerator : numerator;
  const quotient = magnitude / denominator;
  const remainder = magnitude % denominator;
  const rounded = remainder * 2n >= denominator ? quotient + 1n : quotient;

  return rounded * sign;
};

/** Immutable euro value object using integer cents and half-up rounding. */
export class Money {
  static readonly zero = new Money(0n);

  private constructor(readonly minorUnits: bigint) {}

  static fromMinorUnits(minorUnits: bigint): Money {
    return new Money(minorUnits);
  }

  static fromEuros(value: string | number): Money {
    const normalized = String(value).trim().replace(',', '.');
    const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(normalized);

    if (!match) {
      throw new TypeError(`Invalid euro amount: ${String(value)}`);
    }

    const signToken = match[1] ?? '';
    const wholeToken = match[2] ?? '0';
    const fractionToken = match[3] ?? '';
    const paddedFraction = `${fractionToken}000`;
    let magnitude =
      BigInt(wholeToken) * CENTS_PER_EURO + BigInt(paddedFraction.slice(0, 2));

    if (Number(paddedFraction[2] ?? '0') >= 5) {
      magnitude += 1n;
    }

    return new Money(signToken === '-' ? -magnitude : magnitude);
  }

  add(other: Money): Money {
    return new Money(this.minorUnits + other.minorUnits);
  }

  subtract(other: Money): Money {
    return new Money(this.minorUnits - other.minorUnits);
  }

  multiply(multiplier: number | bigint): Money {
    const integer = BigInt(multiplier);
    return new Money(this.minorUnits * integer);
  }

  multiplyFraction(numerator: bigint, denominator: bigint): Money {
    return new Money(roundDivide(this.minorUnits * numerator, denominator));
  }

  percentageBasisPoints(basisPoints: number): Money {
    return this.multiplyFraction(BigInt(basisPoints), 10_000n);
  }

  divide(divisor: number | bigint): Money {
    return new Money(roundDivide(this.minorUnits, BigInt(divisor)));
  }

  minimum(other: Money): Money {
    return this.isLessThanOrEqual(other) ? this : other;
  }

  maximum(other: Money): Money {
    return this.isGreaterThanOrEqual(other) ? this : other;
  }

  absolute(): Money {
    return this.minorUnits < 0n ? new Money(-this.minorUnits) : this;
  }

  isZero(): boolean {
    return this.minorUnits === 0n;
  }

  isPositive(): boolean {
    return this.minorUnits > 0n;
  }

  isLessThan(other: Money): boolean {
    return this.minorUnits < other.minorUnits;
  }

  isLessThanOrEqual(other: Money): boolean {
    return this.minorUnits <= other.minorUnits;
  }

  isGreaterThan(other: Money): boolean {
    return this.minorUnits > other.minorUnits;
  }

  isGreaterThanOrEqual(other: Money): boolean {
    return this.minorUnits >= other.minorUnits;
  }

  toNumber(): number {
    return Number(this.minorUnits) / Number(CENTS_PER_EURO);
  }

  toFixed(): string {
    const sign = this.minorUnits < 0n ? '-' : '';
    const magnitude = this.minorUnits < 0n ? -this.minorUnits : this.minorUnits;
    const whole = magnitude / CENTS_PER_EURO;
    const fraction = String(magnitude % CENTS_PER_EURO).padStart(2, '0');
    return `${sign}${whole}.${fraction}`;
  }
}
