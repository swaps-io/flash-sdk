/**
 * Predicate function that returns wether item satisfies filter or not
 *
 * @category Util
 */
export type FilterPredicate<T> = (item: T) => boolean;

/**
 * Filter that can be applied to list of items for constructing a new list
 * that contains items that satisfy specified filter predicate
 *
 * @category Util
 */
export class Filter<T> {
  private readonly predicate: FilterPredicate<T>;

  public constructor(predicate: FilterPredicate<T>) {
    this.predicate = predicate;
  }

  /**
   * Applies filter to list of items constructing a new one with items
   * that satisfy filter predicate
   *
   * @param items Items to apply filter to
   *
   * @returns New items that satisfy filter predicate
   */
  public apply(items: readonly T[]): T[] {
    return items.filter(this.predicate);
  }
}

export class AllowFilter<T> extends Filter<T> {
  public constructor() {
    super(() => true);
  }
}

export class DenyFilter<T> extends Filter<T> {
  public constructor() {
    super(() => false);
  }
}
