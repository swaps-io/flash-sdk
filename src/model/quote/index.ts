import { AmountSource } from '..';
import { isNull } from '../..';
import { Amount } from '../amount';
import { Chain } from '../chain';
import { Crypto } from '../crypto';
import { Data, WithData } from '../data';
import { Duration } from '../time';

import { QuoteData } from './data';

export type { QuoteData };

/**
 * Crypto getter by specified crypto ID
 *
 * @category Quote
 */
export type QuoteCryptoGetter = (cryptoId: string) => Crypto;

/**
 * Chain getter by specified chain ID
 *
 * @category Quote
 */
export type QuoteChainGetter = (chainId: string) => Chain;

/**
 * Quote representation
 *
 * @category Quote
 */
export class Quote implements Data<QuoteData>, WithData<QuoteData, Quote> {
  /**
   * Plain data of the quote. Can be used for serialization
   */
  public readonly data: QuoteData;

  private readonly getCrypto: QuoteCryptoGetter;
  private readonly getChain: QuoteChainGetter;

  public constructor(data: QuoteData, getCrypto: QuoteCryptoGetter, getChain: QuoteChainGetter) {
    this.data = data;
    this.getCrypto = getCrypto;
    this.getChain = getChain;
  }

  public withData(data: QuoteData): Quote {
    return new Quote(data, this.getCrypto, this.getChain);
  }

  /**
   * Converts the essential quote info to string
   *
   * @returns String representation of the quote
   */
  public toString(): string {
    return (
      `Quote ` +
      `from crypto "${this.fromCrypto.name}" (${this.fromCrypto.address}) ` +
      `on chain "${this.fromCrypto.chain.name}" (${this.fromCrypto.chain.id})` +
      `amount ${this.fromAmount.toString()}` +
      `to crypto "${this.toCrypto.name}" (${this.toCrypto.address}) ` +
      `on chain "${this.toCrypto.chain.name}" (${this.toCrypto.chain.id})` +
      `amount ${this.toAmount.toString()}`
    );
  }

  /**
   * The "from" ("sell" from user perspective) crypto of the quote
   */
  public get fromCrypto(): Crypto {
    return this.getCrypto(this.data.fromCryptoId);
  }

  /**
   * The "from" ("sell" from user perspective) amount of the quote
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
   * The "to" ("buy" from user perspective) crypto of the quote
   */
  public get toCrypto(): Crypto {
    return this.getCrypto(this.data.toCryptoId);
  }

  /**
   * The "to" ("buy" from user perspective) amount of the quote
   */
  public get toAmount(): Amount {
    return new Amount(this.data.toAmount);
  }

  /**
   * The collateral chain of the quote
   */
  public get collateralChain(): Chain {
    return this.getChain(this.data.collateralChainId);
  }

  /**
   * The collateral crypto amount of the quote owned by "to" actor (resolver)
   */
  public get collateralAmount(): Amount {
    return new Amount(this.data.collateralAmount);
  }

  /**
   * Time estimate the swap will be finished in for the quote.
   * This time is assumption made by resolver and not guaranteed to be accurate
   */
  public get timeEstimate(): Duration {
    return new Duration(this.data.timeEstimate);
  }

  /**
   * Time to lock collateral for Bitcoin swap by "to" actor (resolver)
   */
  public get timeToLockBitcoin(): Duration | undefined {
    if (isNull(this.data.timeToLockBitcoin)) {
      return undefined;
    }
    return new Duration(this.data.timeToLockBitcoin);
  }

  /**
   * Total ime to lock collateral for Bitcoin swap by "to" actor (resolver)
   */
  public get timeToLockBitcoinTotal(): Duration | undefined {
    return this.timeToLockBitcoin;
  }

  /**
   * Time of the receive phase of "from" crypto by "to" actor (resolver)
   *
   * This is time delta of specific phase. For total time since start see {@link Quote.timeToReceiveTotal}
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
   * This is time delta of specific phase. For total time since start see {@link Quote.timeToSendTotal}
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
   * This is time delta of specific phase. For total time since start see {@link Quote.timeToLiqSendTotal}
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
   * Source of the amount
   */
  public get amountSource(): AmountSource {
    return this.data.amountSource;
  }
}
