import { isNativeCrypto } from '../helper/native';
import { CryptoApprove, IncompleteCryptoApprove } from '../model';

import { ICryptoApproveProvider, PrepareCryptoApproveParams } from './interface';

/**
 * Helper for conducting multi-step crypto approves
 *
 * @category Crypto Approve
 */
export class CryptoApprover {
  private readonly provider: ICryptoApproveProvider;

  public constructor(provider: ICryptoApproveProvider) {
    this.provider = provider;
  }

  /**
   * Conducts crypto approve actions until required crypto approve is completed
   *
   * @param params Approve prepare {@link PrepareCryptoApproveParams | params}
   *
   * @returns Complete crypto approve
   */
  public async approve(params: PrepareCryptoApproveParams): Promise<CryptoApprove> {
    if (isNativeCrypto(params.crypto)) {
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
