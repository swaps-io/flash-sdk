/**
 * Wagmi wallet action executor interface
 *
 * @category Wallet Impl
 */
export interface WagmiWalletExecutor {
  /**
   * Executes next pending wallet action
   */
  next: () => void;

  /**
   * Cancels pending wallet action execution
   */
  cancel: () => void;

  /**
   * Terminates executor, i.e. disposes it along with action cancellation
   */
  terminate: () => void;
}
