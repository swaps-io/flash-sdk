import { BaseError } from '../helper/error';

export class ChainProviderError extends BaseError {
  public constructor(message: string) {
    super('ChainProviderError', message);
  }
}
