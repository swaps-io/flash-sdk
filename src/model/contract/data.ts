import { CollateralContractData } from '../collateralContract';

/**
 * Data required for storing contract
 *
 * @category Contract
 */
export interface ContractData {
  /**
   * Chain ID of main Flash contract
   */
  chainId: string;

  /**
   * Address of main Flash contract
   */
  address: string;

  /**
   * Collateral manager contract main Flash was configured to use
   *
   * Collateral manager may be not supported on a particular chain,
   * which is indicated by this value being `undefined`
   */
  collateral: CollateralContractData | undefined;

  /**
   * Collateral manager contract for serving Bitcoin orders
   * main Flash was configured to use
   *
   * Bitcoin collateral manager may be not supported on a particular chain,
   * which is indicated by this value being `undefined`
   */
  collateralBitcoin: CollateralContractData | undefined;

  /**
   * Id of the native wrap crypto
   */
  nativeWrapCryptoId: string;
}
