/**
 * Formats decimal value according to it's decimals & desired max decimals.
 * Unnecessary chars (trailing 0s, dots, etc) are trimmed automatically.
 * The rounding (if needed to achieve desired format) is always down.
 *
 * @param value Decimal value string. Expected to match `^(0|([1-9][0-9]*))$` regex
 * @param valueDecimals Number of decimals in the value string. Expected to be `>= 0`
 * @param maxDecimals Maximum desired number of decimals in the output string. Expected to be `>= 0`
 *
 * @returns Formatted decimal string
 */
export const formatDecimal = (value: string, valueDecimals: number, maxDecimals: number): string => {
  const dotBefore = value.length - valueDecimals;
  if (dotBefore <= 0) {
    value = '0.' + '0'.repeat(-dotBefore) + value;
  } else if (dotBefore < value.length) {
    value = value.slice(0, dotBefore) + '.' + value.slice(dotBefore, value.length);
  }

  let endCharsToTrim = 0;
  const dotAt = value.indexOf('.');
  if (dotAt >= 0) {
    const lastCursor = value.length - 1;
    let cursor = Math.min(dotAt + maxDecimals, lastCursor);
    endCharsToTrim = lastCursor - cursor;
    while (value[cursor] === '0') {
      cursor--;
      endCharsToTrim++;
    }
    if (value[cursor] === '.') {
      endCharsToTrim++;
    }
  }
  if (endCharsToTrim > 0) {
    value = value.slice(0, value.length - endCharsToTrim);
  }

  return value;
};
