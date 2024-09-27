import { Amount } from '../src';

test('Creates amount from data', async () => {
  const amount = new Amount({ value: '1337', decimals: 3 });
  expect(amount.data.value).toBe('1337');
  expect(amount.data.decimals).toBe(3);
  expect(amount.toDecimalString()).toBe('1.337');
});

test('Creates amount from decimal string', async () => {
  const amount = Amount.fromDecimalString('12.34');
  expect(amount.data.value).toBe('1234');
  expect(amount.data.decimals).toBe(2);
  expect(amount.toDecimalString()).toBe('12.34');
});

test('Compares amount with other and zero', async () => {
  const amount = Amount.fromDecimalString('451');
  const smallerAmount = Amount.fromDecimalString('19.84');
  expect(amount.is('not-equal', smallerAmount)).toBe(true);
  expect(amount.is('greater', smallerAmount)).toBe(true);
  expect(amount.is('greater-or-equal', smallerAmount)).toBe(true);
  expect(amount.is('equal', Amount.zero())).toBe(false);
  expect(amount.is('less', Amount.zero())).toBe(false);
  expect(amount.is('less-or-equal', Amount.zero())).toBe(false);
  expect(amount.is('not-less', Amount.zero())).toBe(true);
});

test('Performs addition on two amounts', async () => {
  const leftAmount = Amount.fromDecimalString('3.01');
  const rightAmount = Amount.fromDecimalString('2.009');
  expect(leftAmount.add(rightAmount).is('equal', Amount.fromDecimalString('5.0109')));
});

test('Performs subtraction on two amounts', async () => {
  const leftAmount = Amount.fromDecimalString('3.01');
  const rightAmount = Amount.fromDecimalString('2.009');
  expect(leftAmount.sub(rightAmount).is('equal', Amount.fromDecimalString('1.001')));
});

test('Performs multiplication on two amounts', async () => {
  const leftAmount = Amount.fromDecimalString('3.01');
  const rightAmount = Amount.fromDecimalString('2.009');
  expect(leftAmount.mul(rightAmount).is('equal', Amount.fromDecimalString('6.04709')));
});

test('Performs division on two amounts', async () => {
  const leftAmount = Amount.fromDecimalString('3.01');
  const rightAmount = Amount.fromDecimalString('2.009');
  const result = leftAmount.div(rightAmount);
  expect(result.is('equal', Amount.fromDecimalString('1.4982578397212543')));
  expect(result.data.decimals === 18);
});

test('Performs amount value normalization', async () => {
  const amount = Amount.fromDecimalString('123.4567');
  expect(amount.data.decimals).toBe(4);
  expect(amount.normalizeValue(8)).toBe('12345670000');
  expect(amount.normalizeValue(2)).toBe('12345');
  expect(amount.normalizeValue(0)).toBe('123');
});

export default {};
