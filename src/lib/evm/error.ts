import { BaseError } from './util';

export class EvmProviderError extends BaseError {
  public constructor(message: string) {
    super('EvmProviderError', message);
  }
}
