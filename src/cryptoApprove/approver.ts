import { FlashOptionalValue } from '../flash/optional';
import { isNativeCrypto } from '../helper/native';
import { IWalletLike, isSmartWallet } from '../helper/wallet';
import { CryptoApprove, IncompleteCryptoApprove } from '../model';

import { ICryptoApproveProvider, PrepareCryptoApproveParams } from './interface';

/**
 * Helper for conducting multi-step crypto approves
 *
 * @category Crypto Approve
 */
export class CryptoApprover {
  private readonly provider: ICryptoApproveProvider;
  private readonly wallet: FlashOptionalValue<IWalletLike>;

  public constructor(provider: ICryptoApproveProvider, wallet: FlashOptionalValue<IWalletLike>) {
    this.provider = provider;
    this.wallet = wallet;
  }

  /**
   * Conducts crypto approve actions until required crypto approve is completed
   *
   * @param params Approve prepare {@link PrepareCryptoApproveParams | params}
   *
   * @returns Complete crypto approve
   */
  public async approve(params: PrepareCryptoApproveParams): Promise<CryptoApprove> {
    const wallet = await this.wallet.getValue('Wallet must be configured for swap creation');
    if (isNativeCrypto(params.crypto) && !isSmartWallet(wallet)) {
      const cryptoApprove = new CryptoApprove(undefined);
      return cryptoApprove;
    }

    const cryptoApproveRequest = await this.provider.prepareCryptoApprove(params);

    let cryptoApprove = await this.provider.approveCrypto(cryptoApproveRequest, undefined);
    while (cryptoApprove instanceof IncompleteCryptoApprove) {
      cryptoApprove = await this.provider.approveCrypto(cryptoApproveRequest, cryptoApprove);
    }

    return cryptoApprove;
  }

  /**
   * Marks permit cache as used in the underlying provider
   */
  public consumePermit(): void {
    this.provider.consumePermit();
  }
}
