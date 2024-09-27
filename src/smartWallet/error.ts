import { BaseError } from '../helper/error';

export class SmartWalletError extends BaseError {
  public constructor(message: string) {
    super('SmartWalletError', message);
  }
}
