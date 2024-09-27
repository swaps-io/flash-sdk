import { Comparable, CompareOperation } from '../../helper/math/compare';
import { IAdd, IDiv, IMul, ISub } from '../../helper/math/operation';
import { Data } from '../data';

import { AmountComparator } from './compare';
import { amountToDecimal, decimalToAmount, isDecimalAmount } from './convert';
import { AmountData } from './data';
import { AmountOverflowError } from './error';
import { formatCryptoMoney, formatFiatMoney } from './format';
import { CryptoMoneyFormat, FiatMoneyFormat } from './formatTypes';
import { ZERO_AMOUNT, addAmount, amountToOrder, divideAmount, multiplyAmount, subAmount } from './math';

export type { AmountData };
export type * from './formatTypes';

/**
 * Floating point amount for storing precise values such as money
 *
 * @category Amount
 */
export class Amount
  implements Data<AmountData>, Comparable<Amount>, IAdd<Amount>, ISub<Amount>, IMul<Amount>, IDiv<Amount>
{
  /**
   * Plain data of the amount. Can be used for serialization
   */
  public readonly data: AmountData;

  private static readonly comparator = new AmountComparator();

  public constructor(data: AmountData) {
    this.data = data;
  }

  /**
   * Checks if value is a valid decimal string that can be used in {@link Amount.fromDecimalString}
   *
   * @param value String to check for decimal validity
   *
   * @returns `true` if the value is a valid decimal string, `false` otherwise
   */
  public static isDecimalString(value: string): boolean {
    return isDecimalAmount(value);
  }

  /**
   * Constructs {@link Amount} from decimal string value \
   * The value should be pre-checked with {@link Amount.isDecimalString} prior usage in this method
   *
   * @param value Pre-checked decimal string to construct amount from
   *
   * @returns Instance of {@link Amount} corresponding to the decimal string \
   * The returned amount will be zero if the passed value is not a valid decimal string
   */
  public static fromDecimalString(value: string): Amount {
    return new Amount(decimalToAmount(value));
  }

  /**
   * Constructs {@link Amount} that has value of zero
   *
   * @returns Instance of {@link Amount}
   */
  public static zero(): Amount {
    return new Amount(ZERO_AMOUNT);
  }

  /**
   * Converts the essential amount info to string
   *
   * @returns String representation of the amount
   */
  public toString(): string {
    return this.toDecimalString();
  }

  public add(other: Amount): Amount {
    return new Amount(addAmount(this.data, other.data));
  }

  public sub(other: Amount): Amount {
    if (this.is('less', other)) {
      throw new AmountOverflowError('Sub operation results in amount overflow below zero');
    }

    return new Amount(subAmount(this.data, other.data));
  }

  public mul(other: Amount): Amount {
    return new Amount(multiplyAmount(this.data, other.data));
  }

  public div(other: Amount): Amount {
    return new Amount(divideAmount(this.data, other.data));
  }

  public is(compare: CompareOperation, other: Amount): boolean {
    return Amount.comparator.is(this.data, compare, other.data);
  }

  public min(other: Amount): Amount {
    return new Amount(Amount.comparator.min(this.data, other.data));
  }

  public max(other: Amount): Amount {
    return new Amount(Amount.comparator.max(this.data, other.data));
  }

  /**
   * Returns amount normalized to have specified number of decimals
   *
   * @param decimals Number of decimals normalized amount should have
   *
   * @returns Normalized amount
   */
  public normalize(decimals: number): Amount {
    return new Amount(amountToOrder(this.data, decimals));
  }

  /**
   * Returns amount's value normalized to have specified number of decimals
   *
   * @param decimals Number of decimals normalized value should represent
   *
   * @returns Normalized amount value
   */
  public normalizeValue(decimals: number): string {
    return amountToOrder(this.data, decimals).value;
  }

  /**
   * Converts amount to decimal string
   *
   * @returns Decimal string representing amount
   */
  public toDecimalString(): string {
    return amountToDecimal(this.data);
  }

  /**
   * Converts amount to string representing crypto money
   *
   * @param format Crypto money string format to apply
   *
   * @returns Formatted crypto money amount string
   */
  public toCryptoMoneyString(format?: CryptoMoneyFormat): string {
    return formatCryptoMoney(this.data, Amount.comparator, format);
  }

  /**
   * Converts amount to string representing fiat money
   *
   * @param format Fiat money string format to apply
   *
   * @returns Formatted fiat money amount string
   */
  public toFiatMoneyString(format?: FiatMoneyFormat): string {
    return formatFiatMoney(this.data, Amount.comparator, format);
  }

  /**
   * Converts amount to number with possible precision loss
   *
   * @returns Number that represents amount
   */
  public toNumber(): number {
    return Number(this.toDecimalString());
  }
}
