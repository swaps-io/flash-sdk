import { WalletError } from '../../error';
import { IWallet } from '../../interface';

/**
 * Wallet provider mock whose methods are not expected to ever be called
 *
 * @category Wallet Impl
 */
export class NeverWallet implements IWallet {
  public getAddress(): Promise<string> {
    throw new WalletError('NeverWallet.getAddress called');
  }

  public signTypedData(): Promise<string> {
    throw new WalletError('NeverWallet.signTypedData called');
  }

  public sendTransaction(): Promise<string> {
    throw new WalletError('NeverWallet.sendTransaction called');
  }

  public signMessage(): Promise<string> {
    throw new WalletError('NeverWallet.signMessage called');
  }

  public getExecutingOperations(): Promise<ReadonlySet<string>> {
    throw new WalletError('NeverWallet.getExecutingOperations called');
  }
}
