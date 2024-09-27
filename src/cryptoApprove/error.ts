import { BaseError } from '../helper/error';

export class CryptoApproveError extends BaseError {
  public constructor(message: string) {
    super('CryptoApproveError', message);
  }
}
