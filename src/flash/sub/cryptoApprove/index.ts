import { CryptoApprover } from '../../../cryptoApprove';
import { IWalletLike, isSmartWallet } from '../../../helper/wallet';
import { Amount, Crypto, CryptoApprove } from '../../../model';
import { FlashOptionalValue } from '../../optional';

export class CryptoApproveSubClient {
  private readonly cryptoApprover: CryptoApprover;
  private readonly wallet: FlashOptionalValue<IWalletLike>;

  public constructor(cryptoApprover: CryptoApprover, wallet: FlashOptionalValue<IWalletLike>) {
    this.cryptoApprover = cryptoApprover;
    this.wallet = wallet;
  }

  public async approveCrypto(operation: string | undefined, crypto: Crypto, amount: Amount): Promise<CryptoApprove> {
    const spender = crypto.chain.contract.address;

    let nativeWrapCrypto: Crypto | undefined;
    const wallet = await this.wallet.getValue('Wallet must be configured for crypto approve');
    if (isSmartWallet(wallet)) {
      nativeWrapCrypto = crypto.chain.contract.nativeWrapCrypto;
    }

    const cryptoApprove = await this.cryptoApprover.approve({
      operation,
      crypto,
      amount,
      spender,
      nativeWrapCrypto,
    });
    return cryptoApprove;
  }
}
