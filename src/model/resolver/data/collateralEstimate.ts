import { AmountData } from '../../amount';

/**
 * Data required for storing collateral estimate
 *
 * @category Resolver
 */
export interface CollateralEstimateData {
  /**
   * The "from" crypto ID the collateral estimate is for
   */
  fromCryptoId: string;

  /**
   * The data of "from" crypto price change percent {@link Amount}
   */
  fromPriceChange: AmountData;

  /**
   * The "to" crypto ID the collateral estimate is for
   */
  toCryptoId: string;

  /**
   * The data of "to" crypto price change percent {@link Amount}
   */
  toPriceChange: AmountData;

  /**
   * The data of collateral increase coefficient {@link Amount}
   */
  increaseCoefficient: AmountData;

  /**
   * The data of total collateral increase percent {@link Amount}
   */
  totalIncrease: AmountData;

  /**
   * URL to crypto price change analytics dashboard
   */
  dashboardUrl: string;
}
