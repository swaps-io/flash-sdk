import type { AmountData } from './data';

/**
 * Money change (i.e. income/outcome) variant
 *
 * @category Amount
 */
export type MoneyChange = 'in' | 'out' | 'in-out';

/**
 * Money approximation display variant
 *
 * @category Amount
 */
export type MoneyApproximation = 'normal' | 'mini';

/**
 * Specific amount value format
 *
 * @category Amount
 */
export interface ValueFormat {
  /**
   * Number of decimals to divide value by before formatting
   *
   * @default 0
   */
  divDecimals?: number;

  /**
   * Maximum number of decimals formatted value can have
   */
  maxDecimals: number;

  /**
   * Suffix to add to the end of formatted value
   *
   * @default No suffix
   */
  suffix?: string;
}

/**
 * Specific amount format
 *
 * @category Amount
 */
export interface AmountFormat {
  /**
   * Value specification of amount format. Can be a `string` constant value to use
   * or an {@link ValueFormat | `object`} specifying value formatting to string
   */
  value: string | ValueFormat;
}

/**
 * Specific amount format that should be applied depending on threshold match
 *
 * @category Amount
 */
export interface AmountFormatThreshold extends AmountFormat {
  /**
   * Format amount threshold, i.e. maximum value that amount can be in order to be formatted with
   * format specified by the {@link AmountFormat.value | value} field. Whether the threshold value
   * is included or not depends on the {@link AmountFormatThreshold.inclusive | inclusive} field
   */
  threshold: AmountData;

  /**
   * Should the exact {@link AmountFormatThreshold.threshold | threshold} value be included or not
   *
   * @default false
   */
  inclusive?: boolean;
}

/**
 * Amount format specification
 *
 * @category Amount
 */
export interface AmountSpec {
  /**
   * List of formats specifying selection of the amount formatting by threshold.
   * The selection is done by going through the format list and stopping at one
   * that has matching {@link AmountFormatThreshold.threshold | threshold} value.
   * If no such format presented, {@link AmountSpec.overflowFormat | overflowFormat} is used
   */
  formats: AmountFormatThreshold[];

  /**
   * Format to apply to amount when it matches none of the {@link AmountSpec.formats | formats}
   */
  overflowFormat: AmountFormat;
}

interface CommonMoneyFormat {
  /**
   * Specification of how money amount should be formatted override
   *
   * @default Default spec of the money type is used
   */
  spec?: AmountSpec;

  /**
   * Display money amount as change (delta)
   *
   * @default No amount change displayed
   */
  change?: MoneyChange;

  /**
   * Display money amount as approximate
   *
   * @default No amount approximation displayed
   */
  approximation?: MoneyApproximation;
}

/**
 * Format to apply to crypto money string
 *
 * @category Amount
 */
export interface CryptoMoneyFormat extends CommonMoneyFormat {
  /**
   * Crypto money symbol to display
   *
   * @default No crypto money symbol displayed
   */
  symbol?: string;
}

/**
 * Fiat symbol display variant
 *
 * @category Amount
 */
export type FiatDisplay = 'sign' | 'symbol';

/**
 * Format to apply to fiat (USD) money string
 *
 * @category Amount
 */
export interface FiatMoneyFormat extends CommonMoneyFormat {
  /**
   * Display variant for fiat money symbol
   *
   * @default No fiat money symbol displayed
   */
  display?: FiatDisplay;
}
