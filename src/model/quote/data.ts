import { AmountSource } from '..';
import { AmountData } from '../amount';
import { DurationData } from '../time';

/**
 * Data required for storing quote
 *
 * @category Quote
 */
export interface QuoteData {
  /**
   * ID of "from" {@link Crypto} of the quote
   */
  fromCryptoId: string;

  /**
   * Data of "from" {@link Amount} of the quote
   */
  fromAmount: AmountData;

  /**
   * Address of account that owns "to" crypto (i.e. resolver)
   */
  toActor: string;

  /**
   * ID of "to" {@link Crypto} of the quote
   */
  toCryptoId: string;

  /**
   * Data of "to" {@link Amount} of the quote
   */
  toAmount: AmountData;

  /**
   * ID of resolver collateral {@link Chain | chain} of the quote
   */
  collateralChainId: string;

  /**
   * Data of resolver collateral {@link Amount} of the quote
   */
  collateralAmount: AmountData;

  /**
   * Data of time estimate {@link Duration} of the quote
   */
  timeEstimate: DurationData;

  /**
   * Data of {@link Duration} that is allocated for lock collateral for Bitcoin swap by "to" actor (resolver)
   */
  timeToLockBitcoin: DurationData | undefined;

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
   * Estimated fee amount of the transaction in the "from" chain
   */
  fromFeeEstimate: AmountData;

  /**
   * Estimated fee amount of the transaction in the "to" chain
   */
  toFeeEstimate: AmountData;

  /**
   * Source of the amount
   */
  amountSource: AmountSource;

  /**
   * Chain ids where to deploy smart wallet
   */
  deploySmartToChains: string[];
}
