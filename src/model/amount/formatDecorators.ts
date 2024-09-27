import { APPROXIMATE_MINI_SIGN, APPROXIMATE_SIGN, GLUE_SPACE } from './formatChars';
import { MoneyApproximation, MoneyChange } from './formatTypes';

export const formatMoneyChange = (change?: MoneyChange): string => {
  switch (change) {
    case 'in':
      return '+' + GLUE_SPACE;
    case 'out':
      return '-' + GLUE_SPACE;
    case 'in-out':
      return '±' + GLUE_SPACE;
    default:
      return '';
  }
};

export const formatApproximation = (approximation?: MoneyApproximation): string => {
  switch (approximation) {
    case 'normal':
      return APPROXIMATE_SIGN + GLUE_SPACE;
    case 'mini':
      return APPROXIMATE_MINI_SIGN;
    default:
      return '';
  }
};

export const formatSymbol = (symbol?: string): string => {
  return symbol ? GLUE_SPACE + symbol.toUpperCase() : '';
};

export const formatSign = (sign?: string): string => {
  return sign ?? '';
};
