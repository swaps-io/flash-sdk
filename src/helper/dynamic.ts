/**
 * Function that provides dynamic value of an object
 *
 * @category Util
 */
export type DynamicProvider<T> = () => Promise<T> | T;

/**
 * Dynamic object. May be the value itself or {@link DynamicProvider | value provider}
 *
 * @category Util
 */
export type Dynamic<T> = T | DynamicProvider<T>;

/**
 * Resolved current value of a dynamic object
 *
 * @param dynamic Dynamic object to resolve
 *
 * @returns Resolved object value
 *
 * @category Util
 */
export const resolveDynamic = async <T>(dynamic: Dynamic<T>): Promise<T> => {
  if (dynamic instanceof Function) {
    dynamic = await dynamic();
  }
  return dynamic;
};
