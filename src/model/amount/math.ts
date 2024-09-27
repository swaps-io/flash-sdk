import { AmountData } from './data';

export const ZERO_AMOUNT: AmountData = { value: '0', decimals: 0 };

const MIN_DIVISION_DECIMALS = 18;

const tenInPower = (power: number): bigint => {
  return power > 0 ? 10n ** BigInt(power) : 1n;
};

export const toSameOrderInts = (
  left: AmountData,
  right: AmountData,
): [left: bigint, right: bigint, decimals: number] => {
  let leftInt = BigInt(left.value);
  let rightInt = BigInt(right.value);
  let decimals = left.decimals;
  if (left.decimals > right.decimals) {
    rightInt *= tenInPower(left.decimals - right.decimals);
  } else if (left.decimals < right.decimals) {
    leftInt *= tenInPower(right.decimals - left.decimals);
    decimals = right.decimals;
  }
  return [leftInt, rightInt, decimals];
};

export const multiplyAmount = (left: AmountData, right: AmountData): AmountData => {
  const value = (BigInt(left.value) * BigInt(right.value)).toString();
  const decimals = left.decimals + right.decimals;
  return { value, decimals };
};

export const divideAmount = (left: AmountData, right: AmountData): AmountData => {
  let decimals = Math.max(left.decimals, right.decimals, MIN_DIVISION_DECIMALS);
  const leftInt = BigInt(left.value) * tenInPower(right.decimals + decimals);
  const rightInt = BigInt(right.value) * tenInPower(left.decimals);
  if (rightInt === 0n) {
    return ZERO_AMOUNT;
  }

  let value = (leftInt / rightInt).toString();

  let cursor = value.length - 1;
  while (decimals > 0 && cursor > 0 && value[cursor] === '0') {
    cursor--;
    decimals--;
  }
  value = value.slice(0, cursor + 1);

  return { value, decimals };
};

export const addAmount = (left: AmountData, right: AmountData): AmountData => {
  const [leftInt, rightInt, decimals] = toSameOrderInts(left, right);
  const value = (leftInt + rightInt).toString();
  return { value, decimals };
};

/**
 * _Warning_: Make sure `left` >= `right` prior the call
 */
export const subAmount = (left: AmountData, right: AmountData): AmountData => {
  const [leftInt, rightInt, decimals] = toSameOrderInts(left, right);
  const value = (leftInt - rightInt).toString();
  return { value, decimals };
};

export const amountToOrder = (amount: AmountData, decimals: number): AmountData => {
  if (amount.decimals === decimals) {
    return amount;
  }

  let value: string;
  if (decimals > amount.decimals) {
    value = (BigInt(amount.value) * tenInPower(decimals - amount.decimals)).toString();
  } else {
    value = (BigInt(amount.value) / tenInPower(amount.decimals - decimals)).toString();
  }

  return { value, decimals };
};
