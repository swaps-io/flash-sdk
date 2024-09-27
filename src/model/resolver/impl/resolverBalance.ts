import { Amount } from '../../amount';
import { Crypto } from '../../crypto';
import { Data, WithData } from '../../data';
import { ResolverBalanceData } from '../data';

import { Resolver } from './resolver';

/**
 * Resolver getter by specified resolver address
 *
 * @category Resolver
 */
export type ResolverBalanceResolverGetter = (resolverAddress: string) => Resolver;

/**
 * Crypto getter by specified crypto ID
 *
 * @category Resolver
 */
export type ResolverBalanceCryptoGetter = (cryptoId: string) => Crypto;

/**
 * Resolver swap token balance info
 *
 * @category Resolver
 */
export class ResolverBalance implements Data<ResolverBalanceData>, WithData<ResolverBalanceData, ResolverBalance> {
  /**
   * Plain data of the resolver balance info. Can be used for serialization
   */
  public readonly data: ResolverBalanceData;

  private readonly getResolver: ResolverBalanceResolverGetter;
  private readonly getCrypto: ResolverBalanceCryptoGetter;

  public constructor(
    data: ResolverBalanceData,
    getResolver: ResolverBalanceResolverGetter,
    getCrypto: ResolverBalanceCryptoGetter,
  ) {
    this.data = data;
    this.getResolver = getResolver;
    this.getCrypto = getCrypto;
  }

  public withData(data: ResolverBalanceData): ResolverBalance {
    return new ResolverBalance(data, this.getResolver, this.getCrypto);
  }

  /**
   * Resolver the balance info is for
   */
  public get resolver(): Resolver {
    return this.getResolver(this.data.resolverAddress);
  }

  /**
   * Crypto the balance info is for
   */
  public get crypto(): Crypto {
    return this.getCrypto(this.data.cryptoId);
  }

  /**
   * Balance of the crypto on resolver's account
   */
  public get balance(): Amount {
    return new Amount(this.data.balance);
  }
}
