/**
 * Returns random string that can serve as an ID
 *
 * The ID string consists of base-36 characters, i.e. `0`-`9` & `a`-`z`
 *
 * _Uses cryptographically insecure source of random_
 *
 * @param length Length of random string to generate.
 * Each character adds ~5.17 bits of entropy.
 * Defaults to 10 characters (i.e. ~51.7 bits)
 *
 * @returns Random base-36 string
 *
 * @category Util
 */
export const generateRandomId = (length = 10): string => {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length)
    .padStart(length, '0');
};
