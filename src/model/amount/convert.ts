import { isNull } from '../../helper/null';

import { AmountData } from './data';
import { formatDecimal } from './formatDecimal';
import { ZERO_AMOUNT } from './math';

const DECIMAL_PATTERN = /^([0-9]*)(\.([0-9]*))?$/;
const LEADING_ZEROS_PATTERN = /^(0+)(.+)$/;

export const isDecimalAmount = (decimal: string): boolean => {
  const decimalMatch = decimal.match(DECIMAL_PATTERN);
  return !isNull(decimalMatch);
};

export const decimalToAmount = (decimal: string): AmountData => {
  const decimalMatch = decimal.match(DECIMAL_PATTERN);
  if (isNull(decimalMatch)) {
    return ZERO_AMOUNT;
  }

  const int = decimalMatch[1] || '0';
  const dec = decimalMatch[3] || '';

  let value = int + dec;
  const leadingZerosMatch = value.match(LEADING_ZEROS_PATTERN);
  if (!isNull(leadingZerosMatch)) {
    value = leadingZerosMatch[2];
  }

  return { value, decimals: dec.length };
};

export const amountToDecimal = (amount: AmountData): string => {
  return formatDecimal(amount.value, amount.decimals, amount.decimals);
};
