import { CryptoApprover } from '../../../cryptoApprove';
import { Amount, Crypto, CryptoApprove } from '../../../model';

export class CryptoApproveSubClient {
  private readonly cryptoApprover: CryptoApprover;

  public constructor(cryptoApprover: CryptoApprover) {
    this.cryptoApprover = cryptoApprover;
  }

  public async approveCrypto(
    operation: string | undefined,
    crypto: Crypto,
    amount: Amount,
    preWrap: boolean,
  ): Promise<CryptoApprove> {
    const spender = crypto.chain.contract.address;
    const cryptoApprove = await this.cryptoApprover.approve({
      operation,
      crypto,
      amount,
      spender,
      preWrap,
    });
    return cryptoApprove;
  }
}
