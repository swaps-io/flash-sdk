/**
 * Checks if object is an array with specified item type
 *
 * @param items Object to check for being an array
 *
 * @returns `true` if object is an array, `false` otherwise
 *
 * @category Util
 */
export const isArray = <I, O>(items: readonly I[] | O): items is readonly I[] => {
  return Array.isArray(items);
};

interface NewArrayFunc {
  (length: number): undefined[];
  <I>(length: number, fill: I): I[];
}

/**
 * Creates new filled array with specified item type
 *
 * @param length Length of array to create
 * @param fill Element to fill array with
 *
 * @returns Array with specified length and fill
 *
 * @category Util
 */
export const newArray: NewArrayFunc = <I>(length: number, fill?: I): I[] => {
  return new Array(length).fill(fill) as I[];
};
