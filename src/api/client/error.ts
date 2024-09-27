import { BaseError } from '../../helper/error';

/**
 * API client configuration error
 *
 * @category API
 */
export class ClientConfigError extends BaseError {
  public constructor(message: string) {
    super('ClientConfigError', message);
  }
}
