import { CryptoApprove, CryptoApproveRequest, IncompleteCryptoApprove } from '../../..';
import { CryptoApproveError } from '../../error';
import { ICryptoApproveProvider } from '../../interface';

/**
 * Provider of crypto allowance mock when no wallet was configured
 *
 * @category Crypto Approve Impl
 */
export class NoWalletCryptoApproveProvider implements ICryptoApproveProvider {
  public prepareCryptoApprove(): Promise<CryptoApproveRequest> {
    this._throw();
  }

  public approveCrypto(): Promise<IncompleteCryptoApprove | CryptoApprove> {
    this._throw();
  }

  public consumePermit(): void {
    this._throw();
  }

  private _throw(): never {
    throw new CryptoApproveError('Wallet must be configured for crypto allowance providing');
  }
}
