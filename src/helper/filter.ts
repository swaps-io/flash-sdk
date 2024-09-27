export type FilterPredicate<T> = (item: T) => boolean;

export class Filter<T> {
  private readonly predicate: FilterPredicate<T>;

  public constructor(predicate: FilterPredicate<T>) {
    this.predicate = predicate;
  }

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
