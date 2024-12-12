import { AxiosInstanceSource } from '../api/client/axios/core/source';
import { ICryptoApproveProvider } from '../cryptoApprove';
import { ICryptoDataSource } from '../cryptoDataSource';
import { Dynamic } from '../helper/dynamic';
import { IWalletLike } from '../helper/wallet';
import { Amount, Chain, Crypto, Duration, Quote, Resolver, Swap } from '../model';
import { WithWalletOperation } from '../wallet';

/**
 * Callback for handling inconsistency errors that are passed as a parameter
 *
 * May return boolean indicating if inconsistency should be propagated as error.
 * Defaults to `true` when nothing is returned, i.e. throws inconsistency error
 *
 * @param errors Array of inconsistency-related error messages
 *
 * @returns Boolean indicating if inconsistency error should be thrown.
 * Defaults to `true` when nothing returned
 *
 * @category Client Params
 */
export type OnInconsistencyError = (errors: string[]) => void | boolean;

/**
 * Callback for handling created swap that is about to be signed
 *
 * @param swap Created swap instance
 *
 * @category Client Params
 */
export type OnSwapCreated = (swap: Swap) => void;

/**
 * Callback for handling manually called swap
 *
 * @param txid TXID of manual swap call transaction or empty string if no
 * manual call needed
 *
 * @category Client Params
 */
export type OnSwapCalled = (txid: string) => void;

/**
 * Function for checking order data
 *
 * Should throw an error if the data is invalid for any reason
 *
 * @param orderData Order data to check
 *
 * @category Client Params
 */
export type CheckOrderDataFunc = (orderData: string) => Promise<void>;

/**
 * Params for {@link FlashClient} constructor
 *
 * @category Client Params
 */
export interface FlashClientParams {
  /**
   * Wallet provider to use for signing quotes & sending transactions
   *
   * @default Swap functionality unavailable:
   * - Approve crypto for swap
   * - Create swap (including approve)
   * - Slash swap (including no-send report)
   * - Confirm swap
   */
  wallet?: Dynamic<IWalletLike>;

  /**
   * Allowance provider to use for checking allowance and making approves
   *
   * @default ApiCryptoApproveProvider({ wallet }) or NoWalletCryptoApproveProvider()
   */
  cryptoApprove?: ICryptoApproveProvider;

  /**
   * Tolerance in percent the created swap's "to" amount can be lower than was specified
   * in the corresponding quote when "from" amount was specified in quote params. Examples:
   * - quote "to" is `200`, swap "to" is `195`, tolerance is `5`: _swap approved_ (`2.5 <= 5`)
   * - quote "to" is `200`, swap "to" is `190`, tolerance is `5`: _swap approved_ (`5 <= 5`)
   * - quote "to" is `200`, swap "to" is `189`, tolerance is `5`: _swap rejected_ (`5.5 > 5`)
   *
   * @default Amount.zero() // Swap must have quote's "to" amount or be greater
   */
  swapToAmountTolerance?: Amount;

  /**
   * Tolerance in percent the created swap's "from" amount can be greater than was specified
   * in the corresponding quote when "to" amount was specified in quote params. Examples:
   * - quote "from" is `200`, swap "from" is `205`, tolerance is `5`: _swap approved_ (`2.5 <= 5`)
   * - quote "from" is `200`, swap "from" is `210`, tolerance is `5`: _swap approved_ (`5 <= 5`)
   * - quote "from" is `200`, swap "from" is `211`, tolerance is `5`: _swap rejected_ (`5.5 > 5`)
   *
   * @default Amount.zero() // Swap must have quote's "from" amount or be lower
   */
  swapFromAmountTolerance?: Amount;

  /**
   * Client for Flash Main API access
   *
   * See {@link AxiosInstanceSource} for supported options
   *
   * @default 'https://api.prod.swaps.io'
   */
  mainClient?: AxiosInstanceSource;

  /**
   * Client for Flash Collateral API access
   *
   * See {@link AxiosInstanceSource} for supported options
   *
   * @default 'https://collateral.prod.swaps.io'
   */
  collateralClient?: AxiosInstanceSource;

  /**
   * Time duration crypto cache is considered relevant after fetch
   *
   * @default Duration.fromHours(1)
   */
  cryptoCacheTtl?: Duration;

  /**
   * Data source for cryptos
   *
   * @default ApiCryptoDataSource
   */
  cryptoDataSource?: ICryptoDataSource;

  /**
   * Time duration resolver cache is considered relevant after fetch
   *
   * @default Duration.fromHours(1)
   */
  resolverCacheTtl?: Duration;

  /**
   * {@link OnInconsistencyError | Callback} for handling inconsistency errors
   *
   * @default No additional handling, default error is thrown
   */
  onInconsistencyError?: OnInconsistencyError;
}

/**
 * Params for {@link FlashClient.getChains} method
 *
 * @category Client Params
 */
export interface GetChainsParams {
  /**
   * Should chain data load be forced or allow usage of cached values
   *
   * @default false
   */
  force?: boolean;
}

/**
 * Params for {@link FlashClient.getChain} method
 *
 * @category Client Params
 */
export interface GetChainParams {
  /**
   * EVM ID of the chain
   */
  id: string;

  /**
   * Should chain data load be forced or allow usage of cached values
   *
   * @default false
   */
  force?: boolean;

  /**
   * Should {@link Crypto.unknown} instance be returned if chain is not found.
   * When `false`, will throw error instead
   *
   * @default false
   */
  unknown?: boolean;
}

/**
 * Params for {@link FlashClient.getCryptos} method
 *
 * @category Client Params
 */
export interface GetCryptosParams {
  /**
   * Chain filter. Only cryptos that belong to provided chain (-s) are returned.
   * Empty list is equivalent to no filter constraints thus will return all cryptos.
   * Chain can be passed as instance or EVM ID
   *
   * @default []
   */
  chain?: Chain | string | readonly (Chain | string)[];

  /**
   * Should crypto data load be forced or allow usage of cached values
   *
   * @default false
   */
  force?: boolean;
}

/**
 * Params for {@link FlashClient.getCrypto} method
 *
 * @category Client Params
 */
export interface GetCryptoParams {
  /**
   * ID of the crypto. See {@link Crypto.makeId} for obtaining one
   */
  id: string;

  /**
   * Should crypto data load be forced or allow usage of cached values
   *
   * @default false
   */
  force?: boolean;

  /**
   * Should {@link Crypto.unknown} instance be returned if crypto is not found.
   * When `false`, will throw error instead
   *
   * @default false
   */
  unknown?: boolean;
}

/**
 * Params for {@link FlashClient.getQuote} method
 *
 * @category Client Params
 */
export interface GetQuoteParams {
  /**
   * The "from" ("sell" from user perspective) crypto
   */
  fromCrypto: Crypto;

  /**
   * The "from" ("sell" from user perspective) amount
   */
  fromAmount?: Amount;

  /**
   * The "to" ("buy" from user perspective) crypto
   */
  toCrypto: Crypto;

  /**
   * The "to" ("buy" from user perspective) amount
   */
  toAmount?: Amount;
}

/**
 * Params for {@link FlashClient.acceptAgreement} method
 *
 * @category Client Params
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AcceptAgreementParams extends WithWalletOperation {}

/**
 * Params for {@link FlashClient.getAgreementAccepted} method
 *
 * @category Client Params
 */
export interface GetAgreementAcceptedParams {
  /**
   * Address to check if agreement accepted for
   *
   * @default Current wallet address
   */
  address?: string;
}

/**
 * Params for {@link FlashClient.submitSwap} method
 *
 * @category Client Params
 */
export interface SubmitSwapParams extends WithWalletOperation {
  /**
   * Quote to automatically create and submit swap for
   */
  quote: Quote;

  /**
   * Address override where "from" actor will receive asset on "to" chain
   *
   * @default Same as for "from" actor address is used
   */
  fromActorReceiver?: string;

  /**
   * Bitcoin address "from" actor receives Bitcoin to
   *
   * Mandatory for Bitcoin orders, ignored for non-Bitcoin
   *
   * @default Can only be omitted for non-Bitcoin orders
   */
  fromActorBitcoin?: string;

  /**
   * {@link OnSwapCreated | Callback} for handling created swap
   * that is about to be passed to sign process
   *
   * @default No additional created swap handling
   */
  onSwapCreated?: OnSwapCreated;

  /**
   * {@link OnSwapCalled | Callback} for handling manual swap call
   *
   * @default No additional called swap handling
   */
  onSwapCalled?: OnSwapCalled;

  /**
   * {@link CheckOrderDataFunc | Callback} for checking order data
   * that is about to be passed to sign process
   *
   * @default No extra check performed for order data
   */
  checkOrderData?: CheckOrderDataFunc;
}

/**
 * Params for {@link FlashClient.getSwap} method
 *
 * @category Client Params
 */
export interface GetSwapParams {
  /**
   * Instance of existing swap or its {@link Swap.hash | hash} to get
   */
  swap: Swap | string;
}

/**
 * Params for {@link FlashClient.getResolvers} method
 *
 * @category Client Params
 */
export interface GetResolversParams {
  /**
   * Should resolver data load be forced or allow usage of cached values
   *
   * @default false
   */
  force?: boolean;
}

/**
 * Params for {@link FlashClient.getResolver} method
 *
 * @category Client Params
 */
export interface GetResolverParams {
  /**
   * Resolver address
   */
  address: string;

  /**
   * Should resolver data load be forced or allow usage of cached values
   *
   * @default false
   */
  force?: boolean;

  /**
   * Should {@link Resolver.unknown} instance be returned if resolver is not found.
   * When `false`, will throw error instead
   *
   * @default false
   */
  unknown?: boolean;
}

/**
 * Params for {@link FlashClient.getResolverBalance} method
 *
 * @category Client Params
 */
export interface GetResolverBalanceParams {
  /**
   * Resolver or its {@link Resolver.address | address} to get balance info for
   */
  resolver: Resolver | string;

  /**
   * Crypto or its {@link Crypto.id | id} to get balance on resolver's account for
   */
  crypto: Crypto | string;
}

/**
 * Params for {@link FlashClient.getResolverCollateral} method
 *
 * @category Client Params
 */
export interface GetResolverCollateralParams {
  /**
   * Resolver or its {@link Resolver.address | address} to get collateral info for
   */
  resolver: Resolver | string;

  /**
   * Chain or its {@link Chain.id | id} that has holds locked resolver collateral
   */
  collateralChain: Chain | string;

  /**
   * Chain its {@link Chain.id | id} where resolver collateral is distributed to (unlocked by)
   */
  distributionChain: Chain | string;
}

/**
 * Params for {@link FlashClient.getCollateralEstimate} method
 *
 * @category Client Params
 */
export interface GetCollateralEstimateParams {
  /**
   * The "from" crypto or its {@link Crypto.id | id} to get collateral estimate info for
   */
  fromCrypto: Crypto | string;

  /**
   * The "to" crypto or its {@link Crypto.id | id} to get collateral estimate info for
   */
  toCrypto: Crypto | string;
}

/**
 * Params for {@link FlashClient.wrapNative} method
 *
 * @category Client Params
 */
export interface WrapNativeParams extends WithWalletOperation {
  /**
   * Chain or its {@link Chain.id | id} where to wrap native
   */
  chain: Chain | string;

  /**
   * Amount of native to wrap
   */
  amount: Amount;
}

/**
 * Params for {@link FlashClient.unwrapNative} method
 *
 * @category Client Params
 */
export interface UnwrapNativeParams extends WithWalletOperation {
  /**
   * Chain or its {@link Chain.id | id} where to unwrap native
   */
  chain: Chain | string;

  /**
   * Amount of native to unwrap
   */
  amount: Amount;
}
