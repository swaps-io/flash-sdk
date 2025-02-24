import { IChainProvider } from '../../../chainProvider';
import { IWallet } from '../../../wallet';

/**
 * Params for {@link GnosisSafeWallet} constructor
 *
 * @category Smart Wallet Impl
 */
export interface GnosisSafeWalletParams {
  /**
   * Chain provider to use for smart wallet functionality
   */
  chainProvider: IChainProvider;

  /**
   * Owner wallet that is allowed to act on behalf of the smart wallet
   *
   * Note that the wallet account is expected to be in the smart wallet owners
   * and be able to single-handedly approve any transaction (i.e. threshold
   * of 1 is mandatory, however there can be multiple owners)
   */
  ownerWallet: IWallet;
}

/**
 * Get Gnosis Safe contract nonce parameters of {@link GnosisSafeWallet.getNonce}
 *
 * @category Smart Wallet Impl
 */
export interface GetGnosisSafeNonceParams {
  /**
   * Chain ID to get smart wallet nonce on
   */
  chainId: string;
}
