import { Dynamic, resolveDynamic } from './dynamic';
import { BaseError } from './error';
import { Nullish, isNull } from './null';

export class OptionalValueError extends BaseError {
  public constructor(message: string) {
    super('OptionalValueError', message);
  }
}

export type OptionalValueOnMissing = () => never;

const defaultOnMissing: OptionalValueOnMissing = () => {
  throw new OptionalValueError('Optional value is missing');
};

export interface GetOptionalValueParams {
  onMissing?: OptionalValueOnMissing;
}

export class OptionalValue<T> {
  private readonly value: Nullish<Dynamic<Nullish<T>>>;

  public constructor(value: Nullish<Dynamic<Nullish<T>>>) {
    this.value = value;
  }

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
