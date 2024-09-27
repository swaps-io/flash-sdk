import { ISmartWallet } from '../smartWallet';
import { IWallet } from '../wallet';

/**
 * Type representing an instance of a wallet-like provider
 *
 * @category Wallet Util
 */
export type IWalletLike = IWallet | ISmartWallet;

/**
 * Get if provided wallet instance is smart wallet or not
 *
 * @param wallet Wallet instance to check for smartness
 *
 * @returns `true` if given wallet is smart, `false` otherwise
 *
 * @category Wallet Util
 */
export const isSmartWallet = (wallet: IWalletLike): wallet is ISmartWallet => {
  return 'getOwnerWallet' in wallet;
};
