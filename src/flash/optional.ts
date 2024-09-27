import { Dynamic } from '../helper/dynamic';
import { Nullish } from '../helper/null';
import { OptionalValue } from '../helper/optional';

import { FlashError } from './error';

export class FlashOptionalValue<T> {
  private readonly optional: OptionalValue<T>;

  public constructor(value: Nullish<Dynamic<Nullish<T>>>) {
    this.optional = new OptionalValue(value);
  }

  public async getValue(error: string): Promise<T> {
    const value = await this.optional.getValue({
      onMissing: () => {
        throw new FlashError(error);
      },
    });
    return value;
  }
}
