import type { Chain } from 'viem';

import { Duration } from '../../..';

/**
 * Params for {@link ViemWallet} constructor
 *
 * @category Wallet Impl
 */
export interface ViemWalletParams {
  /**
   * Private key (`0x`-prefixed hexadecimal) of the wallet account
   */
  privateKey: string;

  /**
   * Custom list of chain configurations to enable wallet operations on
   *
   * Defaults to chain configurations provided by the Viem library
   *
   * If provided:
   * - the list must include at least one element
   * - chain IDs must be unique across the list
   */
  chains?: readonly Chain[];

  /**
   * Custom gas limit overhead
   *
   * eth_estimateGas sometimes returns the amount that is too low
   * So better to add some overhead above estimation
   *
   * @default 100_000n
   */
  gasLimitOverhead?: bigint;

  /**
   * Time to wait for a transaction to appear in blockchain
   *
   * @default Duration.fromMinutes(3)
   */
  waitTxTimeout?: Duration;

  /**
   * Should checksum address format be used instead of default lowercase or not
   * for the {@link IWallet.getAddress} method result
   *
   * @default false
   */
  enableAddressChecksum?: boolean;
}
