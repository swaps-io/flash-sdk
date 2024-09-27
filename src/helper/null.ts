/**
 * Type representing null-like value
 *
 * @category Util
 */
export type NullLike = null | undefined | void;

/**
 * Type representing value that can be {@link NullLike}
 *
 * @category Util
 */
export type Nullish<T> = T | NullLike;

/**
 * Checks item to be {@link NullLike}
 *
 * @param item Item to check for {@link NullLike} match
 *
 * @returns `true` if item is {@link NullLike}, `false` otherwise
 *
 * @category Util
 */
export const isNull = <T>(item: Nullish<T>): item is NullLike => {
  return item == null;
};

/**
 * Checks item not to be {@link NullLike}
 *
 * @param item Item to check for {@link NullLike} mismatch
 *
 * @returns `true` if item is not {@link NullLike}, `false` otherwise
 *
 * @category Util
 */
export const isNotNull = <T>(item: Nullish<T>): item is T => {
  return item != null;
};

export const skipNulls = <T>(items: Nullish<T>[]): T[] => {
  return items.filter(isNotNull);
};
