/**
 * State of swap
 *
 * @category Swap
 */
export enum SwapState {
  /**
   * Swap is created and signature submit is being awaited
   * from the "from" actor (user) in order to proceed
   *
   * From states: _none_ - initial swap state after creation
   */
  AwaitingSignature = 'awaiting-signature',

  /**
   * Swap in progress ("from" asset is Bitcoin) - collateral lock operation is being
   * awaited from the "to" actor (resolver) in order to proceed
   *
   * From states:
   * - {@link SwapState.AwaitingSignature} - when swap signature submitted by "from" actor
   */
  AwaitingBitcoinLock = 'awaiting-bitcoin-lock',

  /**
   * Swap in progress - "from" crypto receive operation is being
   * awaited from the "to" actor (resolver)
   * or from "from" actor (user) if the "from" asset is Bitcoin
   * in order to proceed
   *
   * From states:
   * - {@link SwapState.AwaitingSignature} - when swap signature submitted by "from" actor
   * - {@link SwapState.AwaitingBitcoinLock} - when "from" asset is Bitcoin and collateral was locked
   */
  AwaitingReceive = 'awaiting-receive',

  /**
   * Swap in progress - "to" crypto send operation is being
   * awaited from the "to" actor (resolver) in order to proceed
   *
   * From states:
   * - {@link SwapState.AwaitingReceive} - when "from" crypto received from "from" actor by "to" actor
   */
  AwaitingSend = 'awaiting-send',

  /**
   * Swap in progress - "to" crypto liquidation send operation is being
   * awaited from any actor (resolver or liquidator) in order to proceed
   *
   * From states:
   * - {@link SwapState.AwaitingSend} - when "to" crypto not sent to "from" actor
   *   by "to" actor within the send deadline
   */
  AwaitingLiqSend = 'awaiting-liq-send',

  /**
   * Swap cancelled with collateral slash required - awaiting slash procedure to be performed
   *
   * The slash procedure is required since "from" crypto has been taken from the "from" actor's account
   * and "to" crypto hasn't been sent to the actor. Here the "from" actor is compensated with "to" actor's
   * collateral crypto stored in the appropriate chain according to the order
   *
   * The slash procedure involves two calls:
   * - report "no-send" call - in the "to" chain
   * - slash collateral call - in the "collateral" chain (uses "no-send" proof)
   *
   * These calls can be performed by any actor (including "from" actor) with reward for doing so
   * as specified in the order. There can be multiple "report" calls but only one "slash" call.
   * The swap is considered to be in this state unless the final "slash" collateral call is performed
   *
   * From states:
   * - {@link SwapState.AwaitingLiqSend} - when "to" crypto is not sent to "from" actor
   *   by any actor within the liquidation send deadline
   */
  CancelledAwaitingSlash = 'cancelled-awaiting-slash',

  /**
   * Swap cancelled with no collateral slash required
   *
   * The slash is not required since "from" crypto is still in the "from" actor's account.
   * New swap that uses the "from" crypto can be created safely
   *
   * From states:
   * - {@link SwapState.AwaitingSignature} - when swap signature not submitted by "from" actor in reasonable time
   * - {@link SwapState.AwaitingReceive} - when "from" crypto not received from "from" actor
   * - {@link SwapState.AwaitingBitcoinLock} - when "to" actor not locked collateral for Bitcoin
   *   by "to" actor within the receive deadline
   */
  CancelledNoSlash = 'cancelled-no-slash',

  /**
   * Swap cancelled with collateral slash required - slash procedure is completed
   *
   * The slash procedure is completed as described in {@link SwapState.CancelledAwaitingSlash} state.
   * The "from" actor now has "to" actor's collateral crypto in the appropriate chain according to the order
   *
   * From states:
   * - {@link SwapState.CancelledAwaitingSlash} - when collateral slash procedure is completed by any actor
   */
  CancelledSlashed = 'cancelled-slashed',

  /**
   * Swap successfully completed
   *
   * The "to" actor now has "from" actor's "from" crypto, the "from" actor has "to" actor's "to" crypto
   *
   * From states:
   * - {@link SwapState.AwaitingSend} - when "to" crypto sent to "from" actor by "to" actor
   */
  CompletedSent = 'completed-sent',

  /**
   * Swap successfully completed with send performed during liquidation phase
   *
   * The "to" actor now has "from" actor's "from" crypto, the "from" actor has liquidator actor's "to" crypto.
   *
   * Liquidator compensates the "to" crypto they sent to "from" actor by slashing "to" actor's collateral.
   * This process is out of scope of this status and may occur later
   *
   * From states:
   * - {@link SwapState.AwaitingLiqSend} - when "to" crypto sent to "from" actor by liquidator actor
   */
  CompletedLiqSent = 'completed-liq-sent',
}

/**
 * Converts string value to {@link SwapState | swap state} entry
 *
 * @param value String value to convert swap state from.
 * Supported variants: `kebab-case`, `snake_case`
 *
 * @returns The {@link SwapState} entry if value is convertible, `undefined` otherwise
 *
 * @category Swap
 */
export const toSwapState = (value: string): SwapState | undefined => {
  return SWAP_STATE_MAP[value];
};

const SWAP_STATE_MAP: Record<string, SwapState> = {
  // Enum members
  [SwapState.AwaitingSignature]: SwapState.AwaitingSignature,
  [SwapState.AwaitingBitcoinLock]: SwapState.AwaitingBitcoinLock,
  [SwapState.AwaitingReceive]: SwapState.AwaitingReceive,
  [SwapState.AwaitingSend]: SwapState.AwaitingSend,
  [SwapState.AwaitingLiqSend]: SwapState.AwaitingLiqSend,
  [SwapState.CancelledAwaitingSlash]: SwapState.CancelledAwaitingSlash,
  [SwapState.CancelledNoSlash]: SwapState.CancelledNoSlash,
  [SwapState.CancelledSlashed]: SwapState.CancelledSlashed,
  [SwapState.CompletedSent]: SwapState.CompletedSent,
  [SwapState.CompletedLiqSent]: SwapState.CompletedLiqSent,

  // API representation
  awaiting_signature: SwapState.AwaitingSignature,
  awaiting_bitcoin_lock: SwapState.AwaitingBitcoinLock,
  awaiting_receive: SwapState.AwaitingReceive,
  awaiting_send: SwapState.AwaitingSend,
  awaiting_liq_send: SwapState.AwaitingLiqSend,
  cancelled_awaiting_slash: SwapState.CancelledAwaitingSlash,
  cancelled_no_slash: SwapState.CancelledNoSlash,
  cancelled_slashed: SwapState.CancelledSlashed,
  completed_sent: SwapState.CompletedSent,
  completed_liq_sent: SwapState.CompletedLiqSent,
};
