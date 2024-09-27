import type { Config } from 'wagmi';

import { Duration } from '../../../model';

import { WagmiWalletAction } from './action';

/**
 * Params for {@link WagmiWallet} creation
 *
 * @category Wallet Impl
 */
export interface WagmiWalletParams {
  /**
   * Wagmi config
   */
  config: Config;

  /**
   * Period to check wallet action completeness with
   *
   * Total time for action to complete is {@link actionCheckPeriod} multiplied by {@link maxActionChecks}.
   *
   * @default Duration.fromMilliseconds(200)
   */
  actionCheckPeriod?: Duration;

  /**
   * Maximum number of action checks to perform.
   * When run out of checks, the action is considered failed
   *
   * Total time for action to complete is {@link maxActionChecks} multiplied by {@link actionCheckPeriod}.
   *
   * @default Infinity
   */
  maxActionChecks?: number;

  /**
   * Period to check chain switch completeness with
   *
   * Total time for chain switch to complete is {@link chainSwitchCheckPeriod} multiplied by
   * {@link maxChainSwitchChecks}.
   *
   * @default Duration.fromMilliseconds(100)
   */
  chainSwitchCheckPeriod?: Duration;

  /**
   * Maximum number of chain switch checks to perform.
   * When run out of checks, the chain switch is considered failed
   *
   * Total time for chain switch to complete is {@link maxChainSwitchChecks} multiplied by
   * {@link chainSwitchCheckPeriod}.
   *
   * @default Infinity
   */
  maxChainSwitchChecks?: number;

  /**
   * Period to check wallet connecting completeness with
   *
   * Total time for wallet connecting process to complete is {@link connectingCheckPeriod} multiplied by
   * {@link maxConnectingChecks}.
   *
   * @default Duration.fromMilliseconds(100)
   */
  connectingCheckPeriod?: Duration;

  /**
   * Maximum number of wallet connecting checks to perform.
   * When run out of checks, the connecting is considered failed
   *
   * Total time for wallet connecting process to complete is {@link maxConnectingChecks} multiplied by
   * {@link connectingCheckPeriod}.
   *
   * @default Infinity
   */
  maxConnectingChecks?: number;

  /**
   * Period to check wallet action perform completeness with during execution
   *
   * @default Duration.fromMilliseconds(100)
   */
  performActionCheckPeriod?: Duration;

  /**
   * Callback for handling Wagmi wallet vendor runtime errors
   *
   * @param error Wagmi wallet vendor error
   */
  onVendorError?: (error: unknown) => void;

  /**
   * Should checksum address format be used instead of default lowercase or not
   * for the {@link IWallet.getAddress} method result
   *
   * @default false
   */
  enableAddressChecksum?: boolean;
}

/**
 * Params for {@link WagmiWallet.execute} method
 *
 * @category Wallet Impl
 */
export interface WagmiWalletExecuteParams<T> {
  /**
   * Target callback that should be handled by this wallet, i.e. SDK call.
   *
   * Must use passed `operation` param for the SDK call.
   *
   * Usage example:
   *
   * ```ts
   * const wallet = new WagmiWallet();
   * const flash = new FlashClient({ wallet });
   *
   * const quote = await flash.getQuote({ ... });
   *
   * const handleSubmitButtonClick = () => {
   *   const executor = wallet.execute({
   *     target: (operation) => flash.submitSwap({ operation, quote }),
   *     operation: 'submit-main-swap',
   *     ...
   *   });
   * };
   * ```
   *
   * @returns Result produced by the target callback
   */
  target: (operation: string) => Promise<T>;

  /**
   * Callback that's called before {@link WagmiWalletExecuteParams.target | target} execution
   *
   * @param operation Operation ID of the target
   */
  onTargetStart?: (operation: string) => void;

  /**
   * Callback that's called after successful {@link WagmiWalletExecuteParams.target | target} execution
   *
   * @param operation Operation ID of the target
   * @param result Result returned by executed target
   */
  onTargetEnd?: (operation: string, result: T) => void;

  /**
   * Callback that's called after failed {@link WagmiWalletExecuteParams.target | target} execution
   *
   * @param operation Operation ID of the target
   * @param reason Target execution failure reason
   */
  onTargetFail?: (operation: string, reason: string) => void;

  /**
   * Callback that's called when new wallet action is available for execution
   *
   * @param action Action that will be executed
   */
  onNextAction?: (action: WagmiWalletAction) => void;

  /**
   * Callback that's called before wallet action execution
   *
   * @param action Action that will be executed
   */
  onActionStart?: (action: WagmiWalletAction) => void;

  /**
   * Callback that's called after successful wallet action execution
   *
   * @param action Action has been executed
   * @param result Action execution result
   */
  onActionEnd?: (action: WagmiWalletAction, result: string) => void;

  /**
   * Callback that's called after failed wallet action execution
   *
   * @param action Action has been executed
   * @param reason Action execution failure reason
   */
  onActionFail?: (action: WagmiWalletAction, reason: string) => void;
}
