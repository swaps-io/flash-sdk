import { Amount } from '../../amount';
import { Chain } from '../../chain';
import { Crypto } from '../../crypto';
import { ResolverCollateralData } from '../data';

import { Resolver } from './resolver';

/**
 * Resolver getter by specified resolver address
 *
 * @category Resolver
 */
export type ResolverCollateralResolverGetter = (resolverAddress: string) => Resolver;

/**
 * Crypto getter by specified crypto ID
 *
 * @category Resolver
 */
export type ResolverCollateralCryptoGetter = (cryptoId: string) => Crypto;

/**
 * Chain getter by specified chain ID
 *
 * @category Resolver
 */
export type ResolverCollateralChainGetter = (chainId: string) => Chain;

/**
 * Resolver collateral token info
 *
 * @category Resolver
 */
export class ResolverCollateral {
  /**
   * Plain data of the resolver collateral info. Can be used for serialization
   */
  public readonly data: ResolverCollateralData;

  private readonly getResolver: ResolverCollateralResolverGetter;
  private readonly getCrypto: ResolverCollateralCryptoGetter;
  private readonly getChain: ResolverCollateralChainGetter;

  public constructor(
    data: ResolverCollateralData,
    getResolver: ResolverCollateralResolverGetter,
    getCrypto: ResolverCollateralCryptoGetter,
    getChain: ResolverCollateralChainGetter,
  ) {
    this.data = data;
    this.getResolver = getResolver;
    this.getCrypto = getCrypto;
    this.getChain = getChain;
  }

  /**
   * Resolver the collateral info is for
   */
  public get resolver(): Resolver {
    return this.getResolver(this.data.resolverAddress);
  }

  /**
   * Collateral crypto this info refer to
   */
  public get collateralCrypto(): Crypto {
    return this.getCrypto(this.data.collateralCryptoId);
  }

  /**
   * Chain the collateral is distributed to
   */
  public get distributionChain(): Chain {
    return this.getChain(this.data.distributionChainId);
  }

  /**
   * Amount of collateral locked
   */
  public get lockedAmount(): Amount {
    return new Amount(this.data.lockedAmount);
  }

  /**
   * Amount of collateral unlocked
   */
  public get unlockedAmount(): Amount {
    return new Amount(this.data.unlockedAmount);
  }

  /**
   * Amount of collateral available for withdraw
   */
  public get availableWithdrawAmount(): Amount {
    return new Amount(this.data.availableWithdrawAmount);
  }

  /**
   * Amount of collateral balance
   */
  public get balance(): Amount {
    return new Amount(this.data.balance);
  }
}
