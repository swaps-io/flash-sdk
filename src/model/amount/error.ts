import { BaseError } from '../../helper/error';

export abstract class AmountError extends BaseError {}

export class AmountOverflowError extends AmountError {
  public constructor(message: string) {
    super('AmountOverflowError', message);
  }
}
