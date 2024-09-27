/**
 * Data required for storing amount
 * @category Amount
 */
export interface AmountData {
  /**
   * Value part of the amount. Contains only numbers that can be divided into
   * before and after the decimal point by {@link AmountData.decimals | decimals} field
   */
  value: string;

  /**
   * Number of decimals the {@link AmountData.value | value} field has
   */
  decimals: number;
}
