import { AmountSource, Chain } from '..';
import { isNull } from '../../helper/null';
import { Amount } from '../amount';
import { Crypto } from '../crypto';
import { Data, WithData } from '../data';
import { Duration, Instant } from '../time';
import { LiqSendTransaction, ReportNoSendTransaction, SlashTransaction, Transaction } from '../transaction';

import { SwapData } from './data';
import { SwapState, toSwapState } from './state';

export type { SwapData };
export { SwapState, toSwapState };

/**
 * Crypto getter by specified crypto ID
 *
 * @category Swap
 */
export type SwapCryptoGetter = (cryptoId: string) => Crypto;

/**
 * Chain getter by specified chain ID
 *
 * @category Swap
 */
export type SwapChainGetter = (chainId: string) => Chain;

/**
 * Swap operation representation
 *
 * @category Swap
 */
export class Swap implements Data<SwapData>, WithData<SwapData, Swap> {
  /**
   * Plain data of the swap. Can be used for serialization
   */
  public readonly data: SwapData;

  private readonly getCrypto: SwapCryptoGetter;
  private readonly getChain: SwapChainGetter;

  public constructor(data: SwapData, getCrypto: SwapCryptoGetter, getChain: SwapChainGetter) {
    this.data = data;
    this.getCrypto = getCrypto;
    this.getChain = getChain;
  }

  public withData(data: SwapData): Swap {
    return new Swap(data, this.getCrypto, this.getChain);
  }

  /**
   * Converts the essential swap info to string
   *
   * @returns String representation of the swap
   */
  public toString(): string {
    return (
      `Swap ` +
      `from crypto "${this.fromCrypto.name}" (${this.fromCrypto.address}) ` +
      `on chain "${this.fromCrypto.chain.name}" (${this.fromCrypto.chain.id})` +
      `amount ${this.fromAmount.toString()}` +
      `owned by ${this.fromActor}` +
      `to crypto "${this.toCrypto.name}" (${this.toCrypto.address}) ` +
      `on chain "${this.toCrypto.chain.name}" (${this.toCrypto.chain.id})` +
      `amount ${this.toAmount.toString()}` +
      `owned by ${this.toActor}`
    );
  }

  /**
   * Hash of all the swap properties essential for the contract. Serves as swap ID
   */
  public get hash(): string {
    return this.data.hash;
  }

  /**
   * Time the swap was created at
   */
  public get createdAt(): Instant {
    return new Instant(this.data.createdAt);
  }

  /**
   * Address of account that owns "from" crypto (i.e. user)
   */
  public get fromActor(): string {
    return this.data.fromActor;
  }

  /**
   * Address of the Bitcoin account that owns "from" crypto (i.e. user) when Bitcoin is "from" asset
   */
  public get fromActorBitcoin(): string | undefined {
    return this.data.fromActorBitcoin;
  }

  /**
   * Address of account that will receive "to" crypto (i.e. user)
   */
  public get fromActorReceiver(): string {
    return this.data.fromActorReceiver;
  }

  /**
   * The "from" ("sell" from user perspective) crypto of the swap
   */
  public get fromCrypto(): Crypto {
    return this.getCrypto(this.data.fromCryptoId);
  }

  /**
   * The "from" ("sell" from user perspective) amount of the swap
   */
  public get fromAmount(): Amount {
    return new Amount(this.data.fromAmount);
  }

  /**
   * Address of account that owns "to" crypto (i.e. resolver)
   */
  public get toActor(): string {
    return this.data.toActor;
  }

  /**
   * Address of account that will send Bitcoin (i.e. resolver)
   */
  public get toActorBitcoin(): string | undefined {
    return this.data.toActorBitcoin;
  }

  /**
   * The "to" ("buy" from user perspective) crypto of the swap
   */
  public get toCrypto(): Crypto {
    return this.getCrypto(this.data.toCryptoId);
  }

  /**
   * The "to" ("buy" from user perspective) amount of the swap
   */
  public get toAmount(): Amount {
    return new Amount(this.data.toAmount);
  }

  /**
   * The collateral chain of the swap
   */
  public get collateralChain(): Chain {
    return this.getChain(this.data.collateralChainId);
  }

  /**
   * The collateral crypto amount of the swap owned by "to" actor (resolver)
   */
  public get collateralAmount(): Amount {
    return new Amount(this.data.collateralAmount);
  }

  /**
   * Time estimate the swap will be finished within from start.
   * This time is assumption made by resolver and not guaranteed to be accurate
   */
  public get timeEstimate(): Duration {
    return new Duration(this.data.timeEstimate);
  }

  /**
   * Time for "to" actor (resolver) to lock collateral for Bitcoin in the collateral chain
   */
  public get timeToLockBitcoin(): Duration | undefined {
    if (isNull(this.data.timeToLockBitcoin)) {
      return undefined;
    }
    return new Duration(this.data.timeToLockBitcoin);
  }

  /**
   * Total time for "to" actor (resolver) to lock collateral for Bitcoin in the collateral chain
   */
  public get timeToLockBitcoinTotal(): Duration | undefined {
    return this.timeToLockBitcoin;
  }

  /**
   * Time of the receive phase of "from" crypto by "to" actor (resolver)
   *
   * This is time delta of specific phase. For total time since start see {@link Swap.timeToReceiveTotal}
   */
  public get timeToReceive(): Duration {
    return new Duration(this.data.timeToReceive);
  }

  /**
   * Total time the "to" actor (resolver) has to receive "from" crypto
   */
  public get timeToReceiveTotal(): Duration {
    return this.timeToReceive;
  }

  /**
   * Time of the send phase of "to" crypto by "to" actor (resolver)
   *
   * This is time delta of specific phase. For total time since start see {@link Swap.timeToSendTotal}
   */
  public get timeToSend(): Duration {
    return new Duration(this.data.timeToSend);
  }

  /**
   * Total time the "to" actor (resolver) has to send "to" crypto
   */
  public get timeToSendTotal(): Duration {
    return this.timeToReceive.add(this.timeToSend);
  }

  /**
   * Time of the liquidation send phase of "to" crypto by any actor (resolver or liquidator)
   *
   * This is time delta of specific phase. For total time since start see {@link Swap.timeToLiqSendTotal}
   */
  public get timeToLiqSend(): Duration {
    return new Duration(this.data.timeToLiqSend);
  }

  /**
   * Total time any actor (resolver or liquidator) has to send "to" crypto with liquidation
   */
  public get timeToLiqSendTotal(): Duration {
    return this.timeToReceive.add(this.timeToSend).add(this.timeToLiqSend);
  }

  /**
   * Deadline by which "to" actor (resolver) has to lock collateral for Bitcoin
   */
  public get deadlineLockBitcoin(): Instant | undefined {
    if (isNull(this.data.deadlineLockBitcoin)) {
      return undefined;
    }
    return new Instant(this.data.deadlineLockBitcoin);
  }

  /**
   * Time the total receive phase deadline occurs at ("from" crypto by "to" actor)
   */
  public get deadlineReceive(): Instant {
    return new Instant(this.data.deadlineReceive);
  }

  /**
   * Time the total send phase deadline occurs at ("to" crypto by "to" actor)
   */
  public get deadlineSend(): Instant {
    return new Instant(this.data.deadlineSend);
  }

  /**
   * Time the total liquidation send phase deadline occurs at ("to" crypto by any actor)
   */
  public get deadlineLiqSend(): Instant {
    return new Instant(this.data.deadlineLiqSend);
  }

  /**
   * Estimated fee amount of the transaction in the "from" chain
   */
  public get fromFeeEstimate(): Amount {
    return new Amount(this.data.fromFeeEstimate);
  }

  /**
   * Estimated fee amount of the transaction in the "to" chain
   */
  public get toFeeEstimate(): Amount {
    return new Amount(this.data.toFeeEstimate);
  }

  /**
   * Unique nonce of the swap
   */
  public get nonce(): bigint {
    return this.data.nonce;
  }

  /**
   * Current state of the swap
   */
  public get state(): SwapState {
    return this.data.state;
  }

  /**
   * Source of the amount
   */
  public get amountSource(): AmountSource {
    return this.data.amountSource;
  }

  /**
   * Lock collateral for Bitcoin transaction. May not occur yet
   */
  public get txLockBitcoin(): Transaction | undefined {
    if (isNull(this.data.txLockBitcoin)) {
      return undefined;
    }

    return new Transaction(this.data.txLockBitcoin);
  }

  /**
   * Swap's "from" crypto receive transaction. May not occur yet
   */
  public get txReceive(): Transaction | undefined {
    if (isNull(this.data.txReceive)) {
      return undefined;
    }

    return new Transaction(this.data.txReceive);
  }

  /**
   * Swap's "to" crypto send transaction. May not occur yet
   */
  public get txSend(): Transaction | undefined {
    if (isNull(this.data.txSend)) {
      return undefined;
    }

    return new Transaction(this.data.txSend);
  }

  /**
   * Swap's "to" crypto liquidation send transaction. May not occur yet
   */
  public get txLiqSend(): LiqSendTransaction | undefined {
    if (isNull(this.data.txLiqSend)) {
      return undefined;
    }

    return new LiqSendTransaction(this.data.txLiqSend);
  }

  /**
   * Swap's all "no-send" report transactions (part of slash process).
   * May contain any number of items
   */
  public get txReportNoSend(): ReportNoSendTransaction[] {
    return this.data.txReportNoSend.map((d) => new ReportNoSendTransaction(d));
  }

  /**
   * Swap's collateral slash transaction. May not occur yet
   */
  public get txSlash(): SlashTransaction | undefined {
    if (isNull(this.data.txSlash)) {
      return undefined;
    }

    return new SlashTransaction(this.data.txSlash);
  }

  /**
   * Indicates if swap is awaiting actions from "to" actor (resolver)
   *
   * When becomes `false`, either {@link Swap.completed} or {@link Swap.cancelled} is `true`
   */
  public get awaiting(): boolean {
    return !this.completed && !this.cancelled;
  }

  /**
   * Indicates if swap is in one of completed states
   *
   * When `true`, the "from" actor has successfully received the "to" crypto
   */
  public get completed(): boolean {
    return this.state === SwapState.CompletedSent || this.state === SwapState.CompletedLiqSent;
  }

  /**
   * Indicates if swap is in one of cancelled states
   *
   * When `true`, the "to" actor will not receive the "to" crypto.
   * The result of {@link Swap.slashable} should be checked to
   * determine whether the slash procedure is needed or not
   */
  public get cancelled(): boolean {
    return (
      this.state === SwapState.CancelledNoSlash ||
      this.state === SwapState.CancelledAwaitingSlash ||
      this.state === SwapState.CancelledSlashed
    );
  }

  /**
   * Indicates if swap in cancelled state that still require slash
   *
   * When `true`, the {@link SwapState.CancelledAwaitingSlash | two-stage} collateral slash operation
   * should be performed in order to compensate "from" crypto taken from "from" actor
   */
  public get slashable(): boolean {
    return this.state === SwapState.CancelledAwaitingSlash;
  }
}
