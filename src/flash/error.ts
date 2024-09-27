import { BaseError } from '../helper/error';

/**
 * Error occurred in {@link FlashClient}
 *
 * @category Client
 */
export class FlashError extends BaseError {
  public constructor(message: string) {
    super('FlashError', message);
  }
}
