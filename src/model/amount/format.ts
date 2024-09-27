import { AmountComparator } from './compare';
import { AmountData } from './data';
import { formatDecimal } from './formatDecimal';
import { formatApproximation, formatMoneyChange, formatSign, formatSymbol } from './formatDecorators';
import { AmountFormat, AmountSpec, CryptoMoneyFormat, FiatMoneyFormat } from './formatTypes';
import { ZERO_AMOUNT } from './math';

const DEFAULT_CRYPTO_AMOUNT_SPEC: AmountSpec = {
  formats: [
    { threshold: ZERO_AMOUNT, inclusive: true, value: '0' },
    { threshold: { value: '1', decimals: 6 }, value: '<0.000001' },
    { threshold: { value: '1', decimals: -2 }, value: { maxDecimals: 6 } },
    { threshold: { value: '1', decimals: -5 }, value: { maxDecimals: 3 } },
    { threshold: { value: '1', decimals: -8 }, value: { divDecimals: 3, maxDecimals: 3, suffix: 'k' } }, // Thousand
    { threshold: { value: '1', decimals: -11 }, value: { divDecimals: 6, maxDecimals: 3, suffix: 'M' } }, // Million
    { threshold: { value: '1', decimals: -14 }, value: { divDecimals: 9, maxDecimals: 3, suffix: 'B' } }, // Billion
    { threshold: { value: '1', decimals: -17 }, value: { divDecimals: 12, maxDecimals: 3, suffix: 'T' } }, // Trillion
    { threshold: { value: '1', decimals: -20 }, value: { divDecimals: 15, maxDecimals: 3, suffix: 'Qd' } }, // Quadrillion
    { threshold: { value: '1', decimals: -23 }, value: { divDecimals: 18, maxDecimals: 3, suffix: 'Qn' } }, // Quintillion
    { threshold: { value: '1', decimals: -26 }, value: { divDecimals: 21, maxDecimals: 3, suffix: 'Sx' } }, // Sextillion
    { threshold: { value: '1', decimals: -29 }, value: { divDecimals: 24, maxDecimals: 3, suffix: 'Sp' } }, // Septillion
    { threshold: { value: '1', decimals: -32 }, value: { divDecimals: 27, maxDecimals: 3, suffix: 'Oc' } }, // Octillion
    { threshold: { value: '1', decimals: -35 }, value: { divDecimals: 30, maxDecimals: 3, suffix: 'No' } }, // Nonillion
  ],
  overflowFormat: { value: '∞' },
};

const DEFAULT_FIAT_AMOUNT_SPEC: AmountSpec = {
  formats: [
    { threshold: ZERO_AMOUNT, inclusive: true, value: '0' },
    { threshold: { value: '1', decimals: 2 }, value: '<0.01' },
    { threshold: { value: '1', decimals: -5 }, value: { maxDecimals: 2 } },
    { threshold: { value: '1', decimals: -8 }, value: { divDecimals: 3, maxDecimals: 3, suffix: 'k' } }, // Thousand
    { threshold: { value: '1', decimals: -11 }, value: { divDecimals: 6, maxDecimals: 3, suffix: 'M' } }, // Million
    { threshold: { value: '1', decimals: -14 }, value: { divDecimals: 9, maxDecimals: 3, suffix: 'B' } }, // Billion
    { threshold: { value: '1', decimals: -17 }, value: { divDecimals: 12, maxDecimals: 3, suffix: 'T' } }, // Trillion
    { threshold: { value: '1', decimals: -20 }, value: { divDecimals: 15, maxDecimals: 3, suffix: 'Qd' } }, // Quadrillion
    { threshold: { value: '1', decimals: -23 }, value: { divDecimals: 18, maxDecimals: 3, suffix: 'Qn' } }, // Quintillion
    { threshold: { value: '1', decimals: -26 }, value: { divDecimals: 21, maxDecimals: 3, suffix: 'Sx' } }, // Sextillion
    { threshold: { value: '1', decimals: -29 }, value: { divDecimals: 24, maxDecimals: 3, suffix: 'Sp' } }, // Septillion
    { threshold: { value: '1', decimals: -32 }, value: { divDecimals: 27, maxDecimals: 3, suffix: 'Oc' } }, // Octillion
    { threshold: { value: '1', decimals: -35 }, value: { divDecimals: 30, maxDecimals: 3, suffix: 'No' } }, // Nonillion
  ],
  overflowFormat: { value: '∞' },
};

const formatAmountWith = (amount: AmountData, format: AmountFormat): string => {
  if (typeof format.value === 'string') {
    return format.value;
  }

  const valueDecimals = amount.decimals + (format.value.divDecimals ?? 0);
  const decimalString = formatDecimal(amount.value, valueDecimals, format.value.maxDecimals);
  return decimalString + (format.value.suffix ?? '');
};

const formatAmount = (amount: AmountData, comparator: AmountComparator, spec: AmountSpec): string => {
  for (const format of spec.formats) {
    const compareResult = comparator.compare(amount, format.threshold);
    if (compareResult === 'less' || (format.inclusive && compareResult === 'equal')) {
      return formatAmountWith(amount, format);
    }
  }
  return formatAmountWith(amount, spec.overflowFormat);
};

/**
 * Formats decimal amount as crypto money.
 * The result string will contain approximately a fixed amount of chars.
 * This is achieved by restricting the max number of decimals displayed
 * and special large amount suffixes (like 'k', 'M', 'B', etc).
 */
export const formatCryptoMoney = (
  amount: AmountData,
  comparator: AmountComparator,
  format?: CryptoMoneyFormat,
): string => {
  const f =
    formatMoneyChange(format?.change) +
    formatApproximation(format?.approximation) +
    formatAmount(amount, comparator, format?.spec ?? DEFAULT_CRYPTO_AMOUNT_SPEC) +
    formatSymbol(format?.symbol);
  return f;
};

const FIAT_SIGN = '$';
const FIAT_SYMBOL = 'USD';

/**
 * Formats decimal amount as fiat money.
 * The result string will contain approximately a fixed amount of chars.
 * This is achieved by restricting the max number of decimals displayed
 * and special large amount suffixes (like 'k', 'M', 'B', etc).
 */
export const formatFiatMoney = (amount: AmountData, comparator: AmountComparator, format?: FiatMoneyFormat): string => {
  const f =
    formatMoneyChange(format?.change) +
    formatApproximation(format?.approximation) +
    formatSign(format?.display === 'sign' ? FIAT_SIGN : undefined) +
    formatAmount(amount, comparator, format?.spec ?? DEFAULT_FIAT_AMOUNT_SPEC) +
    formatSymbol(format?.display === 'symbol' ? FIAT_SYMBOL : undefined);
  return f;
};
