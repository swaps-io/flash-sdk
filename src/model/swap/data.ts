import { AmountSource } from '..';
import { AmountData } from '../amount';
import { DurationData, InstantData } from '../time';
import {
  LiqSendTransactionData,
  ReportNoSendTransactionData,
  SlashTransactionData,
  TransactionData,
} from '../transaction';

import { SwapState } from './state';

/**
 * Data required for storing swap
 *
 * @category Swap
 */
export interface SwapData {
  /**
   * Hash of all the swap properties essential for the contract. Serves as swap ID
   */
  hash: string;

  /**
   * Data of {@link Instant} the swap was created at
   */
  createdAt: InstantData;

  /**
   * Address of account that owns "from" crypto (i.e. user)
   */
  fromActor: string;

  /**
   * Address of account that will receive "to" crypto (i.e. user)
   */
  fromActorReceiver: string;

  /**
   * Address of account that will receive Bitcoin (i.e. user)
   */
  fromActorBitcoin: string | undefined;

  /**
   * ID of "from" {@link Crypto} of the swap
   */
  fromCryptoId: string;

  /**
   * Data of "from" {@link Amount} of the swap
   */
  fromAmount: AmountData;

  /**
   * Address of account that owns "to" crypto (i.e. resolver)
   */
  toActor: string;

  /**
   * Address of account that will send Bitcoin (i.e. resolver)
   */
  toActorBitcoin: string | undefined;

  /**
   * ID of "to" {@link Crypto} of the swap
   */
  toCryptoId: string;

  /**
   * Data of "to" {@link Amount} of the swap
   */
  toAmount: AmountData;

  /**
   * ID of resolver collateral {@link Chain | chain} of the swap
   */
  collateralChainId: string;

  /**
   * Data of resolver collateral {@link Amount} of the swap
   */
  collateralAmount: AmountData;

  /**
   * Data of time estimate {@link Duration} of the swap
   */
  timeEstimate: DurationData;

  /**
   * Data of {@link Duration} that is allocated for lock collateral for Bitcoin swap by "to" actor (resolver)
   */
  timeToLockBitcoin: DurationData | undefined;

  /**
   * Data of {@link Instant} that specifies deadline for the Bitcoin lock phase
   */
  deadlineLockBitcoin: InstantData | undefined;

  /**
   * Data of {@link Duration} that is allocated for crypto receive by "to" actor (resolver)
   */
  timeToReceive: DurationData;

  /**
   * Data of {@link Duration} that is allocated for crypto send by "to" actor (resolver)
   */
  timeToSend: DurationData;

  /**
   * Data of {@link Duration} that is allocated for crypto
   * liquidation send by any actor (resolver or liquidator)
   */
  timeToLiqSend: DurationData;

  /**
   * Data of {@link Instant} that specifies deadline for the total
   * receive phase time ("from" crypto by "to" actor)
   */
  deadlineReceive: InstantData;

  /**
   * Data of {@link Instant} that specifies deadline for the total
   * send phase time ("to" crypto by "to" actor)
   */
  deadlineSend: InstantData;

  /**
   * Data of {@link Instant} that specifies deadline for the total
   * liquidation send phase time ("to" crypto by any actor)
   */
  deadlineLiqSend: InstantData;

  /**
   * Estimated fee amount of the transaction in the "from" chain
   */
  fromFeeEstimate: AmountData;

  /**
   * Estimated fee amount of the transaction in the "to" chain
   */
  toFeeEstimate: AmountData;

  /**
   * Unique nonce of the swap
   */
  nonce: bigint;

  /**
   * Current state of the swap
   */
  state: SwapState;

  /**
   * Data of lock Bitcoin transaction (if occurred)
   */
  txLockBitcoin: TransactionData | undefined;

  /**
   * Data of receive transaction (if occurred)
   */
  txReceive: TransactionData | undefined;

  /**
   * Data of send transaction (if occurred)
   */
  txSend: TransactionData | undefined;

  /**
   * Data of liquidation send transaction (if occurred)
   */
  txLiqSend: LiqSendTransactionData | undefined;

  /**
   * Data of "no-send" report transactions
   */
  txReportNoSend: ReportNoSendTransactionData[];

  /**
   * Data of collateral slash transaction (if occurred)
   */
  txSlash: SlashTransactionData | undefined;

  /**
   * Source of the amount
   */
  amountSource: AmountSource;
}
