import {
  CollateralEstimateCollateralV0,
  EstimateCollateralCollateralV0Params,
  estimateCollateralCollateralV0,
} from '../../api/gen/collateral-v0';
import {
  BalanceInfoMainV0,
  CollateralInfoMainV0,
  GetBalanceMainV0Params,
  GetCollateralMainV0Params,
  ResolverMainV0,
  getBalanceMainV0,
  getCollateralMainV0,
  getResolverListMainV0,
} from '../../api/gen/main-v0';
import { CryptoAggregator } from '../../cryptoAggregator';
import { Cache } from '../../helper/cache';
import { isNotNull } from '../../helper/null';
import {
  Amount,
  Chain,
  CollateralEstimate,
  CollateralEstimateData,
  Crypto,
  Duration,
  Resolver,
  ResolverBalance,
  ResolverBalanceData,
  ResolverCollateral,
  ResolverCollateralData,
  ResolverData,
} from '../../model';
import { FlashError } from '../error';

export interface ResolverStorage {
  resolvers: Resolver[];
  resolverByAddress: Map<string, Resolver>;
}

export class ResolverSubClient {
  private readonly cryptoAggregator: CryptoAggregator;
  private readonly resolverStorage: Cache<ResolverStorage>;

  public constructor(cryptoAggregator: CryptoAggregator, cacheTtl: Duration) {
    this.cryptoAggregator = cryptoAggregator;
    this.resolverStorage = new Cache(cacheTtl, (...args) => this.loadResolverStorage(...args));
  }

  public async getResolverData(force: boolean): Promise<ResolverStorage> {
    return await this.resolverStorage.get(force);
  }

  public getResolverByAddress(address: string, required = false): Resolver {
    const resolver = this.resolverStorage.getCurrent()?.resolverByAddress?.get(address);
    if (isNotNull(resolver)) {
      return resolver;
    }

    if (required) {
      throw new FlashError(`Resolver with address ${address} does not exist`);
    }

    const unknownResolver = Resolver.unknown({ address });
    return unknownResolver;
  }

  public async getResolverBalance(
    resolverRef: Resolver | string,
    cryptoRef: Crypto | string,
  ): Promise<ResolverBalance> {
    const [resolver, crypto] = await Promise.all([
      this.resolveResolverRef(resolverRef),
      this.resolveCryptoRef(cryptoRef),
    ]);

    const balanceParams: GetBalanceMainV0Params = {
      chain_id: crypto.chain.id,
      token_address: crypto.address,
    };
    const { data: balanceResponse } = await getBalanceMainV0(resolver.address, balanceParams);
    if (
      balanceResponse.actor_address !== resolver.address ||
      balanceResponse.chain_id !== crypto.chain.id ||
      balanceResponse.token_address !== crypto.address
    ) {
      throw new FlashError('Inconsistent Flash API resolver balance response');
    }

    const resolverBalance = this.mapResolverBalance(balanceResponse, crypto);
    return resolverBalance;
  }

  public async getResolverCollateral(
    resolverRef: Resolver | string,
    collateralChainRef: Chain | string,
    distributionChainRef: Chain | string,
  ): Promise<ResolverCollateral> {
    const [resolver, collateralChain, distributionChain] = await Promise.all([
      this.resolveResolverRef(resolverRef),
      this.resolveChainRef(collateralChainRef),
      this.resolveChainRef(distributionChainRef),
    ]);

    const collateralParams: GetCollateralMainV0Params = {
      collateral_chain_id: collateralChain.id,
      distribution_chain_id: distributionChain.id,
    };
    const { data: collateralResponse } = await getCollateralMainV0(resolver.address, collateralParams);
    if (
      collateralResponse.actor_address !== resolver.address ||
      collateralResponse.collateral_chain_id !== collateralChain.id ||
      collateralResponse.distribution_chain_id !== distributionChain.id
    ) {
      throw new FlashError('Inconsistent Flash API resolver balance response');
    }

    const collateralCryptoId = Crypto.makeId(collateralChain.id, collateralResponse.collateral_token_address);
    const collateralCrypto = await this.resolveCryptoRef(collateralCryptoId);

    const resolverCollateral = this.mapResolverCollateral(collateralResponse, collateralCrypto, distributionChain);
    return resolverCollateral;
  }

  public async getCollateralEstimate(
    fromCryptoRef: Crypto | string,
    toCryptoRef: Crypto | string,
  ): Promise<CollateralEstimate> {
    const [fromCrypto, toCrypto] = await Promise.all([
      this.resolveCryptoRef(fromCryptoRef),
      this.resolveCryptoRef(toCryptoRef),
    ]);

    const estimateParams: EstimateCollateralCollateralV0Params = {
      from_chain_id: fromCrypto.chain.id,
      from_token_address: fromCrypto.address,
      to_chain_id: toCrypto.chain.id,
      to_token_address: toCrypto.address,
    };
    const { data: estimateData } = await estimateCollateralCollateralV0(estimateParams);

    const estimate = this.mapCollateralEstimate(estimateData, fromCrypto, toCrypto);
    return estimate;
  }

  private async loadResolverStorage(): Promise<ResolverStorage> {
    const resolversResponse = await getResolverListMainV0();

    const resolvers = resolversResponse.data.resolvers.map((r) => this.mapResolver(r));
    const resolverByAddress = new Map(resolvers.map((r) => [r.address, r]));

    const data: ResolverStorage = {
      resolvers,
      resolverByAddress,
    };
    return data;
  }

  private async resolveResolverRef(resolverRef: Resolver | string): Promise<Resolver> {
    if (typeof resolverRef !== 'string') {
      const resolver: Resolver = resolverRef;
      return resolver;
    }

    const resolverAddress: string = resolverRef;
    await this.getResolverData(false);
    const resolver = this.getResolverByAddress(resolverAddress);
    return resolver;
  }

  private async resolveCryptoRef(cryptoRef: Crypto | string): Promise<Crypto> {
    if (typeof cryptoRef !== 'string') {
      const crypto: Crypto = cryptoRef;
      return crypto;
    }

    const cryptoId: string = cryptoRef;
    await this.cryptoAggregator.getCryptoData(false);
    const crypto = this.cryptoAggregator.getCryptoById(cryptoId);
    return crypto;
  }

  private async resolveChainRef(chainRef: Chain | string): Promise<Chain> {
    if (typeof chainRef !== 'string') {
      const chain: Chain = chainRef;
      return chain;
    }

    const chainId: string = chainRef;
    await this.cryptoAggregator.getCryptoData(false);
    const chain = this.cryptoAggregator.getChainById(chainId);
    return chain;
  }

  private mapResolver(r: ResolverMainV0): Resolver {
    const data: ResolverData = {
      address: r.address,
      name: r.name,
      icon: r.icon,
    };
    return new Resolver(data);
  }

  private mapResolverBalance(r: BalanceInfoMainV0, crypto: Crypto): ResolverBalance {
    const balance = new Amount({ value: r.balance, decimals: crypto.decimals });

    const data: ResolverBalanceData = {
      resolverAddress: r.actor_address,
      cryptoId: crypto.id,
      balance: balance.data,
    };
    return new ResolverBalance(
      data,
      (...args) => this.getResolverByAddress(...args),
      (...args) => this.cryptoAggregator.getCryptoById(...args),
    );
  }

  private mapResolverCollateral(
    r: CollateralInfoMainV0,
    collateralCrypto: Crypto,
    distributionChain: Chain,
  ): ResolverCollateral {
    const lockedAmount = new Amount({ value: r.locked_amount, decimals: collateralCrypto.decimals });
    const unlockedAmount = new Amount({ value: r.unlocked_amount, decimals: collateralCrypto.decimals });
    const balance = new Amount({ value: r.balance, decimals: collateralCrypto.decimals });

    const availableWithdrawAmount = new Amount({
      value: r.available_withdraw_amount,
      decimals: collateralCrypto.decimals,
    });

    const data: ResolverCollateralData = {
      resolverAddress: r.actor_address,
      collateralCryptoId: collateralCrypto.id,
      distributionChainId: distributionChain.id,
      lockedAmount: lockedAmount.data,
      unlockedAmount: unlockedAmount.data,
      availableWithdrawAmount: availableWithdrawAmount.data,
      balance: balance.data,
    };
    return new ResolverCollateral(
      data,
      (...args) => this.getResolverByAddress(...args),
      (...args) => this.cryptoAggregator.getCryptoById(...args),
      (...args) => this.cryptoAggregator.getChainById(...args),
    );
  }

  private mapCollateralEstimate(
    e: CollateralEstimateCollateralV0,
    fromCrypto: Crypto,
    toCrypto: Crypto,
  ): CollateralEstimate {
    const fromPriceChange = Amount.fromDecimalString(e.from_price_change);
    const toPriceChange = Amount.fromDecimalString(e.to_price_change);
    const increaseCoefficient = Amount.fromDecimalString(e.increase_coefficient);
    const totalIncrease = Amount.fromDecimalString(e.total_increase);

    const data: CollateralEstimateData = {
      fromCryptoId: fromCrypto.id,
      fromPriceChange: fromPriceChange.data,
      toCryptoId: toCrypto.id,
      toPriceChange: toPriceChange.data,
      increaseCoefficient: increaseCoefficient.data,
      totalIncrease: totalIncrease.data,
      dashboardUrl: e.dashboard_url,
    };
    return new CollateralEstimate(data, (...args) => this.cryptoAggregator.getCryptoById(...args));
  }
}
