import { setAxiosInstanceCollateralV0 } from '../api/client/axios/collateral-v0';
import { setRequestProjectId } from '../api/client/axios/core/id';
import { setAxiosInstanceMainV0 } from '../api/client/axios/main-v0';
import { CryptoAggregator } from '../cryptoAggregator';
import { ApiCryptoApproveProvider, CryptoApprover, NoWalletCryptoApproveProvider } from '../cryptoApprove';
import { ApiCryptoDataSource } from '../cryptoDataSource';
import { isNotNull } from '../helper/null';
import { IWalletLike } from '../helper/wallet';
import {
  Amount,
  Chain,
  CollateralEstimate,
  Crypto,
  CryptoApprove,
  Duration,
  Quote,
  Resolver,
  ResolverBalance,
  ResolverCollateral,
  Swap,
  SwapApprove,
  SwapSubmit,
} from '../model';

import { FlashOptionalValue } from './optional';
import {
  AcceptAgreementParams,
  FlashClientParams,
  GetAgreementAcceptedParams,
  GetChainParams,
  GetChainsParams,
  GetCollateralEstimateParams,
  GetCryptoParams,
  GetCryptosParams,
  GetQuoteParams,
  GetResolverBalanceParams,
  GetResolverCollateralParams,
  GetResolverParams,
  GetResolversParams,
  GetSwapParams,
  SubmitSwapParams,
  UnwrapNativeParams,
  WrapNativeParams,
} from './param';
import { AgreementSubClient } from './sub/agreement';
import { NativeWrapSubClient } from './sub/nativeWrap';
import { QuoteSubClient } from './sub/quote';
import { ResolverSubClient } from './sub/resolver';
import { SwapSubClient } from './sub/swap';
import { SwapApproveSubClient } from './sub/swapApprove';
import { SwapCallSubClient } from './sub/swapCall';

export type * from './param';
export type * from './error';

/**
 * Client for interaction with Flash
 *
 * @category Client
 */
export class FlashClient {
  private readonly wallet: FlashOptionalValue<IWalletLike>;
  private readonly crypto: CryptoAggregator;
  private readonly cryptoApprover: CryptoApprover;
  private readonly quote: QuoteSubClient;
  private readonly swap: SwapSubClient;
  private readonly swapApprove: SwapApproveSubClient;
  private readonly swapCall: SwapCallSubClient;
  private readonly resolver: ResolverSubClient;
  private readonly nativeWrap: NativeWrapSubClient;
  private readonly agreement: AgreementSubClient;

  public constructor(params: FlashClientParams) {
    const {
      projectId,
      wallet,
      cryptoApprove = isNotNull(wallet)
        ? new ApiCryptoApproveProvider({ projectId, wallet })
        : new NoWalletCryptoApproveProvider(),
      swapToAmountTolerance = Amount.zero(),
      swapFromAmountTolerance = Amount.zero(),
      mainClient = 'https://api.prod.swaps.io',
      collateralClient = 'https://collateral.prod.swaps.io',
      cryptoCacheTtl = Duration.fromHours(1),
      cryptoDataSource = new ApiCryptoDataSource({ projectId }),
      resolverCacheTtl = Duration.fromHours(1),
      onInconsistencyError,
    } = params;

    setRequestProjectId(projectId);
    setAxiosInstanceMainV0(mainClient);
    setAxiosInstanceCollateralV0(collateralClient);

    this.wallet = new FlashOptionalValue(wallet);
    this.crypto = new CryptoAggregator(cryptoCacheTtl, cryptoDataSource);
    this.cryptoApprover = new CryptoApprover(cryptoApprove);
    this.quote = new QuoteSubClient(this.crypto, onInconsistencyError);
    this.swap = new SwapSubClient(
      this.crypto,
      this.cryptoApprover,
      this.wallet,
      swapToAmountTolerance,
      swapFromAmountTolerance,
      onInconsistencyError,
    );
    this.swapApprove = new SwapApproveSubClient(this.wallet);
    this.swapCall = new SwapCallSubClient(this.wallet);
    this.resolver = new ResolverSubClient(this.crypto, resolverCacheTtl);
    this.nativeWrap = new NativeWrapSubClient(this.wallet, this.crypto);
    this.agreement = new AgreementSubClient(this.wallet);
  }

  /**
   * Preloads relatively static data to cache. Calling this method prior other methods has warm-up effect,
   * i.e. may result in much faster calls for some methods depending on use of the cached values
   */
  public async preload(): Promise<void> {
    await Promise.all([this.crypto.getCryptoData(true), this.resolver.getResolverData(true)]);
  }

  /**
   * Gets list of supported chains
   *
   * @param params The operation {@link GetChainsParams | params}
   *
   * @returns Array of supported {@link Chain}s
   */
  public async getChains(params: GetChainsParams = {}): Promise<readonly Chain[]> {
    const { chains } = await this.crypto.getCryptoData(params.force ?? false);
    return chains;
  }

  /**
   * Gets supported chain
   *
   * @param params The operation {@link GetChainParams | params}
   *
   * @returns Instance of supported {@link Chain}
   */
  public async getChain(params: GetChainParams): Promise<Chain> {
    await this.crypto.getCryptoData(params.force ?? false);
    const chain = this.crypto.getChainById(params.id, !params.unknown);
    return chain;
  }

  /**
   * Gets list of supported cryptos
   *
   * @param params The operation {@link GetCryptosParams | params}
   *
   * @returns Array of supported {@link Crypto}s
   */
  public async getCryptos(params: GetCryptosParams = {}): Promise<readonly Crypto[]> {
    let { cryptos } = await this.crypto.getCryptoData(params.force ?? false);
    const cryptoFilter = this.crypto.makeCryptoFilter(params.chain);
    cryptos = cryptoFilter.apply(cryptos);
    return cryptos;
  }

  /**
   * Gets supported crypto
   *
   * @param params The operation {@link GetCryptoParams | params}
   *
   * @returns Instance of supported {@link Crypto}
   */
  public async getCrypto(params: GetCryptoParams): Promise<Crypto> {
    await this.crypto.getCryptoData(params.force ?? false);
    const crypto = this.crypto.getCryptoById(params.id, !params.unknown);
    return crypto;
  }

  /**
   * Gets quote for specified params. Quote represents crypto exchange rates user will get.
   * Getting quote does not oblige the user to complete it. In order to proceed to swap, call
   * {@link FlashClient.submitSwap} (or analogous set of the manual flow calls)
   * passing the satisfying quote
   *
   * @param params The operation {@link GetQuoteParams | params}
   *
   * @returns Quote for the params
   */
  public async getQuote(params: GetQuoteParams): Promise<Quote> {
    await this.crypto.getCryptoData(false);
    const quote = await this.quote.getQuote(
      params.fromCrypto,
      params.toCrypto,
      params.fromAmount,
      params.toAmount,
      params.fromActor,
      params.fromActorReceiver,
      params.fromActorWalletOwner,
      params.fromActorReceiverWalletOwner,
    );
    return quote;
  }

  /**
   * Accepts agreement to Flash terms of use
   *
   * Agreement is an in-wallet signature of the terms text.
   * The signature is submitted to the Flash service.
   * Note that without submitted signature the service may
   * not provide some functionality
   *
   * This operation is needed once per "account + terms version"
   * (i.e. if terms update, a new signature is requested)
   *
   * @param params The operation {@link AcceptAgreementParams | params}
   *
   * @returns Agreement signature
   */
  public async acceptAgreement(params: AcceptAgreementParams = {}): Promise<string> {
    return await this.agreement.acceptAgreement(params);
  }

  /**
   * Get agreement status, i.e. if address has accepted current terms of use agreement of not
   *
   * If no address to check specified with params, current wallet account address is used
   *
   * @param params The operation {@link GetAgreementAcceptedParams | params}
   *
   * @returns Agreement state: `true` if accepted, `false` otherwise
   */
  public async getAgreementAccepted(params: GetAgreementAcceptedParams = {}): Promise<boolean> {
    return await this.agreement.getAgreementAccepted(params.address);
  }

  /**
   * Get active agreement message
   *
   * @returns Agreement message string
   */
  public async getAgreementMessage(): Promise<string> {
    return await this.agreement.getAgreementMessage();
  }

  /**
   * Performs swap submit for quote
   *
   * Combines the following actions:
   * - accept agreement (optional, once per "account + terms version")
   * - approve/permit crypto for the swap (on the 'from' chain, optional)
   * - create swap with the service
   * - approve swap via signing the order typed data (chain-agnostic)
   * - submit swap to the service
   * - call swap transaction (optional, from native only)
   *
   * @param params The operation {@link SubmitSwapParams | params}
   *
   * @returns Submitted swap
   */
  public async submitSwap(params: SubmitSwapParams): Promise<Swap> {
    await this.acceptAgreement(params);
    const cryptoApprove = await this.submitSwapManualApproveCrypto(params);
    const swap = await this.submitSwapManualCreateSwap(params, cryptoApprove);
    const swapApprove = await this.submitSwapManualApproveSwap(params, swap);
    const swapSubmit = await this.submitSwapManualSubmitSwap(swap, swapApprove);
    await this.submitSwapManualCallSwap(params, swapSubmit);
    return swap;
  }

  /**
   * Performs manual approve/permit crypto for the swap (on the 'from' chain, optional)
   *
   * _Note_: this is a part of _manual_ flow. Automated {@link FlashClient.submitSwap}
   * method (that includes call of this manual method) should be preferred
   *
   * @param params The operation {@link SubmitSwapParams | params}
   *
   * @returns Crypto approve
   */
  public async submitSwapManualApproveCrypto(params: SubmitSwapParams): Promise<CryptoApprove> {
    const cryptoSpender = params.quote.fromCrypto.chain.contract.address;
    const cryptoApprove = await this.cryptoApprover.approve({
      crypto: params.quote.fromCrypto,
      amount: params.quote.fromAmount,
      spender: cryptoSpender,
      operation: params.operation,
      nativeWrapTarget: params.nativeWrapTarget,
    });
    return cryptoApprove;
  }

  /**
   * Performs manual creation of the swap with the service
   *
   * _Note_: this is a part of _manual_ flow. Automated {@link FlashClient.submitSwap}
   * method (that includes call of this manual method) should be preferred
   *
   * @param params The operation {@link SubmitSwapParams | params}
   * @param cryptoApprove Crypto approve (obtained from {@link FlashClient.submitSwapManualApproveCrypto})
   *
   * @returns Created swap
   */
  public async submitSwapManualCreateSwap(params: SubmitSwapParams, cryptoApprove: CryptoApprove): Promise<Swap> {
    const swap = await this.swap.createSwap(
      params.quote,
      cryptoApprove,
      params.fromActorBitcoin,
      params.fromActorReceiver,
      params.fromActorWalletOwner,
      params.fromActorReceiverWalletOwner,
    );
    params.onSwapCreated?.(swap);
    return swap;
  }

  /**
   * Performs manual swap swap approve via signing the order typed data (chain-agnostic)
   *
   * _Note_: this is a part of _manual_ flow. Automated {@link FlashClient.submitSwap}
   * method (that includes call of this manual method) should be preferred
   *
   * @param params The operation {@link SubmitSwapParams | params}
   * @param swap Created swap (obtained from {@link FlashClient.submitSwapManualCreateSwap})
   *
   * @returns Swap approve
   */
  public async submitSwapManualApproveSwap(params: SubmitSwapParams, swap: Swap): Promise<SwapApprove> {
    const swapApproveRequest = await this.swapApprove.prepareSwapApprove(
      params.operation,
      swap,
      params.checkOrderData,
      params.domainChainId,
    );
    const swapApprove = await this.swapApprove.approveSwap(swapApproveRequest);
    return swapApprove;
  }

  /**
   * Performs manual swap submit to the service
   *
   * _Note_: this is a part of _manual_ flow. Automated {@link FlashClient.submitSwap}
   * method (that includes call of this manual method) should be preferred
   *
   * This is the final step in manual swap submit flow
   *
   * @param swap Created swap (obtained from {@link FlashClient.submitSwapManualCreateSwap})
   * @param swapApprove Swap approve (obtained from {@link FlashClient.submitSwapManualApproveSwap})
   *
   * @returns Swap submit
   */
  public async submitSwapManualSubmitSwap(swap: Swap, swapApprove: SwapApprove): Promise<SwapSubmit> {
    const swapSubmit = await this.swap.submitSwap(swap, swapApprove);
    return swapSubmit;
  }

  /**
   * Performs manual submitted swap call
   *
   * _Note_: this is a part of _manual_ flow. Automated {@link FlashClient.submitSwap}
   * method (that includes call of this manual method) should be preferred
   *
   * @param params The operation {@link SubmitSwapParams | params}
   * @param swapSubmit Swap submit (obtained from {@link FlashClient.submitSwapManualSubmitSwap})
   *
   * @returns Swap call TXID or empty string
   */
  public async submitSwapManualCallSwap(params: SubmitSwapParams, swapSubmit: SwapSubmit): Promise<string> {
    const callRequest = await this.swapCall.prepareSwapCall(params.operation, swapSubmit);
    const txid = await this.swapCall.callSwap(callRequest);
    params.onSwapCalled?.(txid);
    return txid;
  }

  /**
   * Gets created swap by its reference (instance or hash)
   *
   * @param params The operation {@link GetSwapParams | params}
   *
   * @returns Swap
   */
  public async getSwap(params: GetSwapParams): Promise<Swap> {
    await this.crypto.getCryptoData(false);
    const swap = await this.swap.getSwap(params.swap);
    return swap;
  }

  /**
   * Gets known resolvers (i.e. swap's "to" actors)
   *
   * @param params The operation {@link GetResolversParams | params}
   *
   * @returns Array of known {@link Resolver}s
   */
  public async getResolvers(params: GetResolversParams = {}): Promise<Resolver[]> {
    const { resolvers } = await this.resolver.getResolverData(params.force ?? false);
    return resolvers;
  }

  /**
   * Gets known resolver (i.e. swap's "to" actor)
   *
   * @param params The operation {@link GetResolverParams | params}
   *
   * @returns Instance of {@link Resolver}
   */
  public async getResolver(params: GetResolverParams): Promise<Resolver> {
    await this.resolver.getResolverData(params.force ?? false);
    const resolver = this.resolver.getResolverByAddress(params.address, !params.unknown);
    return resolver;
  }

  /**
   * Gets resolver ("to" actor) balance info for specified "to" token
   *
   * @param params The operation {@link GetResolverBalanceParams | params}
   *
   * @returns Resolver balance info
   */
  public async getResolverBalance(params: GetResolverBalanceParams): Promise<ResolverBalance> {
    const resolverBalance = await this.resolver.getResolverBalance(params.resolver, params.crypto);
    return resolverBalance;
  }

  /**
   * Gets resolver ("to" actor) collateral info for specified collateral & distribution chains
   *
   * @param params The operation {@link GetResolverCollateralParams | params}
   *
   * @returns Resolver collateral info
   */
  public async getResolverCollateral(params: GetResolverCollateralParams): Promise<ResolverCollateral> {
    const resolverCollateral = await this.resolver.getResolverCollateral(
      params.resolver,
      params.collateralChain,
      params.distributionChain,
    );
    return resolverCollateral;
  }

  /**
   * Gets collateral estimate info for specified "from" & "to" swap cryptos
   *
   * @param params The operation {@link GetCollateralEstimateParams | params}
   *
   * @returns Collateral estimate info
   */
  public async getCollateralEstimate(params: GetCollateralEstimateParams): Promise<CollateralEstimate> {
    const collateralEstimate = await this.resolver.getCollateralEstimate(params.fromCrypto, params.toCrypto);
    return collateralEstimate;
  }

  /**
   * Wraps native into a wrapped token
   *
   * @param params The operation {@link WrapNativeParams | params}
   *
   * @returns TXID of the native wrap
   */
  public async wrapNative(params: WrapNativeParams): Promise<string> {
    return await this.nativeWrap.wrap(params.chain, params.amount, params.operation);
  }

  /**
   * Unwraps native into a wrapped token
   *
   * @param params The operation {@link UnwrapNativeParams | params}
   *
   * @returns TXID of the native unwrap
   */
  public async unwrapNative(params: UnwrapNativeParams): Promise<string> {
    return await this.nativeWrap.unwrap(params.chain, params.amount, params.operation);
  }
}
