/**
 * Data required for storing collateral manager contract
 *
 * @category Collateral Contract
 */
export interface CollateralContractData {
  /**
   * Chain ID of collateral manager contract
   */
  chainId: string;

  /**
   * Address of collateral manager contract
   */
  address: string;

  /**
   * Decimals collateral contract calculates balances & amounts in
   */
  decimals: number;

  /**
   * Crypto IDs that can be used for providing collateral balance
   */
  balanceCryptoIds: string[];
}
