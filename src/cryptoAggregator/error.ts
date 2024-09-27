import { BaseError } from '../helper/error';

/**
 * Error occurred in {@link CryptoAggregator}
 *
 * @category Crypto Aggregator
 */
export class CryptoAggregatorError extends BaseError {
  public constructor(message: string) {
    super('CryptoAggregatorError', message);
  }
}
