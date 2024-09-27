/**
 * Represents an entity that can be added to other entity
 *
 * @category Math
 */
export interface IAdd<T, R = T> {
  /**
   * Performs addition operation on this & other entity
   *
   * @param other Entity to add to this entity
   *
   * @returns Addition result of this & other entity
   */
  add(other: T): R;
}

/**
 * Represents an entity that can be subtracted from other entity
 *
 * @category Math
 */
export interface ISub<T, R = T> {
  /**
   * Performs subtraction operation on this & other entity
   *
   * @param other Entity to subtract from this entity
   *
   * @returns Subtraction result of this & other entity
   */
  sub(other: T): R;
}

/**
 * Represents an entity that can be multiplied by other entity
 *
 * @category Math
 */
export interface IMul<T, R = T> {
  /**
   * Performs multiplication operation on this & other entity
   *
   * @param other Entity to multiply this entity by
   *
   * @returns Multiplication result of this & other entity
   */
  mul(other: T): R;
}

/**
 * Represents an entity that can be divided by other entity
 *
 * @category Math
 */
export interface IDiv<T, R = T> {
  /**
   * Performs division operation on this & other entity
   *
   * @param other Entity to divide this entity by
   *
   * @returns Division result of this & other entity
   */
  div(other: T): R;
}
