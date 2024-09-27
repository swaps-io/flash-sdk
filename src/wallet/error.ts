import { BaseError } from '../helper/error';

export class WalletError extends BaseError {
  public constructor(message: string) {
    super('WalletError', message);
  }
}
