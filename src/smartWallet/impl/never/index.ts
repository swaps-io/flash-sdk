import { IWallet, SendTransactionParams, SignTypedDataParams } from '../../../wallet';
import { SmartWalletError } from '../../error';
import { ISmartWallet } from '../../interface';

/**
 * Smart wallet provider mock whose methods are not expected to ever be called
 *
 * @category Smart Wallet Impl
 */
export class NeverSmartWallet implements ISmartWallet {
  public isDeployed(): Promise<boolean> {
    throw new Error('NeverSmartWallet.isDeployed called.');
  }

  public getAddress(): Promise<string> {
    throw new SmartWalletError('NeverSmartWallet.getAddress called');
  }

  public getOwners(): Promise<ReadonlySet<string>> {
    throw new SmartWalletError('NeverSmartWallet.getOwners called');
  }

  public getOwnerWallet(): Promise<IWallet> {
    throw new SmartWalletError('NeverSmartWallet.getOwnerWallet called');
  }

  public getSignTransactionParams(): Promise<SignTypedDataParams> {
    throw new SmartWalletError('NeverSmartWallet.getSignTransactionParams called');
  }

  public getSendTransactionParams(): Promise<SendTransactionParams> {
    throw new SmartWalletError('NeverSmartWallet.getSendTransactionParams called');
  }

  public getSignTypedDataParams(): Promise<SignTypedDataParams> {
    throw new SmartWalletError('NeverSmartWallet.getSignTypedDataParams called');
  }

  public getNonce(): Promise<number> {
    throw new SmartWalletError('NeverSmartWallet.getNonce called');
  }
}
