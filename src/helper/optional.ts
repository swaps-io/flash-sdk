import { Dynamic, resolveDynamic } from './dynamic';
import { BaseError } from './error';
import { Nullish, isNull } from './null';

/**
 * Error occurred in {@link OptionalValue} helper
 *
 * @category Util
 */
export class OptionalValueError extends BaseError {
  public constructor(message: string) {
    super('OptionalValueError', message);
  }
}

/**
 * Callback that is called when value is demanded but currently nullish
 *
 * Expected to never return, i.e. to throw an exception
 *
 * @category Util
 */
export type OptionalValueOnMissing = () => never;

const defaultOnMissing: OptionalValueOnMissing = () => {
  throw new OptionalValueError('Optional value is missing');
};

/**
 * Params for {@link OptionalValue.getValue} method
 *
 * @category Util
 */
export interface GetOptionalValueParams {
  /**
   * Callback that's called when value is demanded but resolved to nullish
   *
   * Can be used to throw a custom exception instead of default one
   *
   * @default Throws OptionalValueError('Optional value is missing')
   */
  onMissing?: OptionalValueOnMissing;
}

/**
 * Optional dynamic value helper
 *
 * @category Util
 */
export class OptionalValue<T> {
  private readonly value: Nullish<Dynamic<Nullish<T>>>;

  public constructor(value: Nullish<Dynamic<Nullish<T>>>) {
    this.value = value;
  }

  /**
   * Gets some resolved dynamic value
   *
   * If value is missing, throws an exception (default one or via `params.onMissing`)
   *
   * @param params Get value params
   *
   * @returns Some resolved dynamic value
   */
  public async getValue({ onMissing = defaultOnMissing }: GetOptionalValueParams = {}): Promise<T> {
    if (isNull(this.value)) {
      return onMissing();
    }

    const value = await resolveDynamic(this.value);
    if (isNull(value)) {
      return onMissing();
    }

    return value;
  }
}
