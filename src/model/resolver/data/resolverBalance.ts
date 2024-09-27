import { AmountData } from '../../amount';

/**
 * Data required for storing resolver balance info
 *
 * @category Resolver
 */
export interface ResolverBalanceData {
  /**
   * Address of the resolver the balance info is for
   */
  resolverAddress: string;

  /**
   * ID of the crypto the balance info is for
   */
  cryptoId: string;

  /**
   * Data of balance {@link Amount}
   */
  balance: AmountData;
}
