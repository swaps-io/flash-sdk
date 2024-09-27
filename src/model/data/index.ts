/**
 * Type aware of its data
 *
 * @category Data
 */
export interface Data<T> {
  /**
   * Field that contains data of the object
   */
  data: T;
}

/**
 * Type able to replace its data with a new one in a new instance
 *
 * @category Data
 */
export interface WithData<T, I extends Data<T>> {
  /**
   * Constructs a new instance of the type replacing its current data
   * with the specified one, preserving other fields of current instance
   *
   * @param data Data to update current instance's one with
   *
   * @returns Constructed instance with the new data
   */
  withData(data: T): I;
}

/**
 * Type aware of its data or data content itself
 *
 * @category Data
 */
export type DataLike<T> = Data<T> | T;

/**
 * Extracts data part from a {@link DataLike} object
 *
 * @param obj Object to extract data from
 *
 * @returns Data part of the object
 *
 * @category Data
 */
export const extractData = <T extends object>(obj: DataLike<T>): T => {
  return 'data' in obj ? obj.data : obj;
};
