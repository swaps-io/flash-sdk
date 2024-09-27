import { Amount } from '../../amount';
import { Crypto } from '../../crypto';
import { Data, WithData } from '../../data';
import { CollateralEstimateData } from '../data';

/**
 * Crypto getter by specified crypto ID
 *
 * @category Resolver
 */
export type CollateralEstimateCryptoGetter = (cryptoId: string) => Crypto;

/**
 * Collateral estimate info
 *
 * @category Resolver
 */
export class CollateralEstimate
  implements Data<CollateralEstimateData>, WithData<CollateralEstimateData, CollateralEstimate>
{
  /**
   * Plain data of the collateral estimate info. Can be used for serialization
   */
  public readonly data: CollateralEstimateData;

  private readonly getCrypto: CollateralEstimateCryptoGetter;

  public constructor(data: CollateralEstimateData, getCrypto: CollateralEstimateCryptoGetter) {
    this.data = data;
    this.getCrypto = getCrypto;
  }

  public withData(data: CollateralEstimateData): CollateralEstimate {
    return new CollateralEstimate(data, this.getCrypto);
  }

  /**
   * The "from" crypto the collateral estimate is for
   */
  public get fromCrypto(): Crypto {
    return this.getCrypto(this.data.fromCryptoId);
  }

  /**
   * The price change percent of "from" crypto
   */
  public get fromPriceChange(): Amount {
    return new Amount(this.data.fromPriceChange);
  }

  /**
   * The "to" crypto the collateral estimate is for
   */
  public get toCrypto(): Crypto {
    return this.getCrypto(this.data.toCryptoId);
  }

  /**
   * The price change percent of "to" crypto
   */
  public get toPriceChange(): Amount {
    return new Amount(this.data.toPriceChange);
  }

  /**
   * Collateral increase coefficient
   */
  public get increaseCoefficient(): Amount {
    return new Amount(this.data.increaseCoefficient);
  }

  /**
   * The total collateral increase percent
   */
  public get totalIncrease(): Amount {
    return new Amount(this.data.totalIncrease);
  }

  /**
   * URL to crypto price change analytics dashboard
   */
  public get dashboardUrl(): string {
    return this.data.dashboardUrl;
  }
}
