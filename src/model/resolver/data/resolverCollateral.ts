import { AmountData } from '../../amount';

/**
 * Data required for storing resolver collateral info
 *
 * @category Resolver
 */
export interface ResolverCollateralData {
  /**
   * Address of the resolver the collateral info is for
   */
  resolverAddress: string;

  /**
   * ID of the collateral crypto
   */
  collateralCryptoId: string;

  /**
   * ID of the chain the collateral is distributed to
   */
  distributionChainId: string;

  /**
   * Data of locked collateral {@link Amount}
   */
  lockedAmount: AmountData;

  /**
   * Data of unlocked collateral {@link Amount}
   */
  unlockedAmount: AmountData;

  /**
   * Data of available to withdraw {@link Amount}
   */
  availableWithdrawAmount: AmountData;

  /**
   * Data of collateral balance {@link Amount}
   */
  balance: AmountData;
}
