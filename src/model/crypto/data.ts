/**
 * Data required for storing crypto
 *
 * @category Crypto
 */
export interface CryptoData {
  /**
   * Unique ID of the crypto. Uses custom Flash format
   */
  id: string;

  /**
   * Name of the crypto
   */
  name: string;

  /**
   * Ticker symbol of the crypto
   */
  symbol: string;

  /**
   * Contract address of the crypto (ERC-20 compatible)
   */
  address: string;

  /**
   * Icon URL of the crypto
   */
  icon: string;

  /**
   * Number of decimals the crypto uses
   */
  decimals: number;

  /**
   * Whether ERC-2612 permit signatures supported by the crypto or not
   */
  permit: boolean;

  /**
   * {@link Crypto.id | Crypto ID} that should be used for price getting for the crypto
   */
  priceId: string;

  /**
   * Whether the crypto can be minted for free as test token or not
   */
  mintable: boolean;

  /**
   * Whether the forbid crypto as a "from" asset
   */
  forbidFrom: boolean;

  /**
   * Whether the forbid crypto as a "to" asset
   */
  forbidTo: boolean;

  /**
   * ID of {@link Chain} the crypto corresponds to
   */
  chainId: string;

  /**
   * Whether the crypto is a native wrap
   */
  isNativeWrap: boolean;
}
