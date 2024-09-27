export type CompareResult = 'less' | 'equal' | 'greater';

/**
 * Comparison operation for entities that have a quantitative representation
 *
 * @category Math
 */
export type CompareOperation =
  | 'less'
  | 'equal'
  | 'greater'
  | 'not-less'
  | 'not-equal'
  | 'not-greater'
  | 'less-or-equal'
  | 'greater-or-equal';

export type ComparatorConverter<T, N> = (left: T, right: T) => [leftNum: N, leftNum: N];

/**
 * Represents an entity that can be compared with other entity
 *
 * @category Math
 */
export interface Comparable<T> {
  /**
   * Compare entity value with other one
   *
   * @param compare Compare operation to perform
   * @param other Other entity (right side) to compare this one with (left side)
   *
   * @returns `true` if the compare result satisfies the requested operation, `false` otherwise
   */
  is(compare: CompareOperation, other: T): boolean;

  /**
   * Compare entity value with other one and return minimum of them
   *
   * @param other Other entity to choose min from it & this one
   *
   * @returns Entity that has minimum value between this & other
   */
  min(other: T): T;

  /**
   * Compare entity value with other one and return maximum of them
   *
   * @param other Other entity to choose max from it & this one
   *
   * @returns Entity that has maximum value between this & other
   */
  max(other: T): T;
}

export class Comparator<T, N extends number | bigint> {
  private readonly convert: ComparatorConverter<T, N>;

  public constructor(convert: ComparatorConverter<T, N>) {
    this.convert = convert;
  }

  public compare(left: T, right: T): CompareResult {
    const [leftNum, rightNum] = this.convert(left, right);
    const result = this.compareNums(leftNum, rightNum);
    return result;
  }

  public is(left: T, compare: CompareOperation, right: T): boolean {
    const result = this.compare(left, right);
    const satisfies = this.checkSatisfies(result, compare);
    return satisfies;
  }

  public max(left: T, right: T): T {
    return this.is(left, 'greater', right) ? left : right;
  }

  public min(left: T, right: T): T {
    return this.is(left, 'less', right) ? left : right;
  }

  private compareNums(leftNum: N, rightNum: N): CompareResult {
    return leftNum < rightNum ? 'less' : leftNum > rightNum ? 'greater' : 'equal';
  }

  private checkSatisfies(result: CompareResult, compare: CompareOperation): boolean {
    switch (compare) {
      case 'less':
        return result === 'less';
      case 'greater':
        return result === 'greater';
      case 'equal':
        return result === 'equal';
      case 'not-less':
      case 'greater-or-equal':
        return result !== 'less';
      case 'not-greater':
      case 'less-or-equal':
        return result !== 'greater';
      case 'not-equal':
        return result !== 'equal';
    }
  }
}
