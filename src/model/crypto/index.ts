import { isNotNull, isNull } from '../../helper/null';
import { generateRandomId } from '../../helper/random';
import { Chain } from '../chain';
import { Data, WithData } from '../data';

import { CryptoData } from './data';

export type { CryptoData };

/**
 * Chain getter by specified chain ID
 *
 * @category Crypto
 */
export type CryptoChainGetter = (chainId: string) => Chain;

const getUnknownChain: CryptoChainGetter = (chainId) => {
  return Chain.unknown({ id: chainId });
};

/**
 * Crypto - i.e. cryptocurrency / ERC-20 token representation
 *
 * @category Crypto
 */
export class Crypto implements Data<CryptoData>, WithData<CryptoData, Crypto> {
  /**
   * Plain data of the crypto. Can be used for serialization
   */
  public readonly data: CryptoData;

  private readonly getChain: CryptoChainGetter;

  public constructor(data: CryptoData, getChain: CryptoChainGetter) {
    this.data = data;
    this.getChain = getChain;
  }

  /**
   * Constructs unknown {@link Chain} mockup. Uses unknown explorer
   *
   * @param known Known properties the chain is unknown for
   * @param getChain Getter of {@link Chain} entity by ID
   *
   * @returns Instance of {@link Explorer}
   */
  public static unknown(
    known: Partial<Pick<CryptoData, 'id' | 'chainId' | 'address' | 'decimals'>> = {},
    getChain?: CryptoChainGetter,
  ): Crypto {
    let id = known.id;
    if (isNull(id) && isNotNull(known.chainId) && isNotNull(known.address)) {
      id = Crypto.makeId(known.chainId, known.address);
    }
    if (isNull(id)) {
      id = `unknown-crypto-${generateRandomId()}`;
    }

    const data: CryptoData = {
      id,
      name: 'Unknown',
      symbol: '???',
      address: known.address ?? '',
      icon: '',
      decimals: known.decimals ?? 0,
      permit: false,
      priceId: id,
      mintable: false,
      forbidFrom: false,
      forbidTo: false,
      isNativeWrap: false,
      chainId: known.chainId ?? `unknown-chain-${generateRandomId()}`,
    };
    return new Crypto(data, getChain ?? getUnknownChain);
  }

  /**
   * Gets crypto ID from its components
   *
   * @param chainId Chain ID of the crypto
   * @param address Address of the crypto
   *
   * @returns Crypto ID
   */
  public static makeId(chainId: string, address: string): string {
    return `${chainId}/${address}`.toLowerCase();
  }

  public withData(data: CryptoData): Crypto {
    return new Crypto(data, this.getChain);
  }

  /**
   * Converts the essential crypto info to string
   *
   * @returns String representation of the crypto
   */
  public toString(): string {
    return `Crypto "${this.name}" (${this.address}) on chain "${this.chain.name}" (${this.chain.id})`;
  }

  /**
   * Unique ID of the crypto. Uses custom Flash format
   */
  public get id(): string {
    return this.data.id;
  }

  /**
   * Name of the crypto
   */
  public get name(): string {
    return this.data.name;
  }

  /**
   * Ticker symbol of the crypto
   */
  public get symbol(): string {
    return this.data.symbol;
  }

  /**
   * Contract address of the crypto (ERC-20 compatible)
   */
  public get address(): string {
    return this.data.address;
  }

  /**
   * Icon URL of the crypto
   */
  public get icon(): string {
    return this.data.icon;
  }

  /**
   * Number of decimals the crypto uses
   */
  public get decimals(): number {
    return this.data.decimals;
  }

  /**
   * Whether ERC-2612 permit signatures supported by the crypto or not
   */
  public get permit(): boolean {
    return this.data.permit;
  }

  /**
   * {@link Crypto.id | Crypto ID} that should be used for price getting for the crypto
   */
  public get priceId(): string {
    return this.data.priceId;
  }

  /**
   * Whether the crypto can be minted for free as test token or not
   */
  public get mintable(): boolean {
    return this.data.mintable;
  }

  /**
   * Whether to forbid crypto as "from" asset
   */
  public get forbidFrom(): boolean {
    return this.data.forbidFrom;
  }

  /**
   * Whether to forbid crypto as "to" asset
   */
  public get forbidTo(): boolean {
    return this.data.forbidTo;
  }

  /**
   * Whether the crypto is a native wrap
   */
  public get isNativeWrap(): boolean {
    return this.data.isNativeWrap;
  }

  /**
   * Chain the crypto corresponds to
   */
  public get chain(): Chain {
    return this.getChain(this.data.chainId);
  }
}
