import { IWallet } from '../../../wallet';

/**
 * Gnosis Safe configuration on specific chain
 *
 * @category Smart Wallet Impl
 */
export interface GnosisSafeChainConfig {
  /**
   * Chain ID this configuration is for
   *
   * Note that it must be unique in the configuration array
   */
  chainId: string;

  /**
   * RPC URL for the chain transport
   */
  rpcUrl: string;

  /**
   * Gnosis Safe wallet contract address on the chain
   *
   * Overrides default `address` configured on higher level.
   * Must be specified if no default value configured
   *
   * @default No address override
   */
  address?: string;
}

/**
 * Params for {@link GnosisSafeWallet} constructor
 *
 * @category Smart Wallet Impl
 */
export interface GnosisSafeWalletParams {
  /**
   * Owner wallet that is allowed to act on behalf of the smart wallet
   *
   * Note that the wallet account is expected to be in the smart wallet owners
   * and be able to single-handedly approve any transaction (i.e. threshold
   * of 1 is mandatory, however there can be multiple owners)
   */
  ownerWallet?: IWallet;

  /**
   * Gnosis Safe wallet contract address
   *
   * This value is default that can be overwritten by
   * {@link GnosisSafeWalletParams.chains | chains}.
   * At least one of the values must be specified
   *
   * @default No default address
   */
  address?: string;

  /**
   * List of per-chain Gnosis Safe configurations.
   * Values from the list override values provided on current level
   *
   * @default No per-chain config overrides
   */
  chains?: readonly GnosisSafeChainConfig[];
}
