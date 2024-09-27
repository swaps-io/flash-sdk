import { isNull } from '../../helper/null';
import { generateRandomId } from '../../helper/random';
import { Contract } from '../contract';
import { Data, WithData } from '../data';
import { Explorer } from '../explorer';

import { ChainData } from './data';

export type { ChainData };

/**
 * Explorer getter by specified chain ID
 *
 * @category Chain
 */
export type ChainExplorerGetter = (chainId: string) => Explorer;

const getUnknownExplorer: ChainExplorerGetter = (chainId) => {
  return Explorer.unknown({ chainId });
};

/**
 * Chain getter by specified chain ID
 *
 * @category Chain
 */
export type ChainChainGetter = (chainId: string) => Chain;

const getUnknownChain: ChainChainGetter = (id): Chain => {
  return Chain.unknown({ id });
};

/**
 * Contract getter by specified chain ID
 *
 * @category Chain
 */
export type ChainContractGetter = (chainId: string) => Contract;

const getUnknownContract: ChainContractGetter = (chainId): Contract => {
  return Contract.unknown({ chainId });
};

/**
 * Chain - i.e. blockchain representation
 *
 * @category Chain
 */
export class Chain implements Data<ChainData>, WithData<ChainData, Chain> {
  /**
   * Plain data of the chain. Can be used for serialization
   */
  public readonly data: ChainData;

  private readonly getExplorer: ChainExplorerGetter;
  private readonly getContract: ChainContractGetter;
  private readonly getChain: ChainChainGetter;

  public constructor(
    data: ChainData,
    getExplorer: ChainExplorerGetter,
    getContract: ChainContractGetter,
    getChain: ChainChainGetter,
  ) {
    this.data = data;
    this.getExplorer = getExplorer;
    this.getContract = getContract;
    this.getChain = getChain;
  }

  /**
   * Constructs unknown {@link Chain} mockup. Uses unknown explorer
   *
   * @param known Known properties the chain is unknown for
   * @param getExplorer Getter of {@link Explorer} entity by chain ID
   * @param getContract Getter of {@link Contract} entity by chain ID
   *
   * @returns Instance of {@link Explorer}
   */
  public static unknown(
    known: Partial<Pick<ChainData, 'id'>> = {},
    getExplorer?: ChainExplorerGetter,
    getContract?: ChainContractGetter,
    getChain?: ChainChainGetter,
  ): Chain {
    const data: ChainData = {
      id: known.id ?? `unknown-chain-${generateRandomId()}`,
      name: 'Unknown',
      icon: '',
      color: '',
      layer1Parent: undefined,
    };
    return new Chain(
      data,
      getExplorer ?? getUnknownExplorer,
      getContract ?? getUnknownContract,
      getChain ?? getUnknownChain,
    );
  }

  public withData(data: ChainData): Chain {
    return new Chain(data, this.getExplorer, this.getContract, this.getChain);
  }

  /**
   * Converts the essential chain info to string
   *
   * @returns String representation of the chain
   */
  public toString(): string {
    return `Chain "${this.name}" (${this.id})`;
  }

  /**
   * Unique ID of the chain. Corresponds to {@link https://chainlist.org | EVM chain ID}
   */
  public get id(): string {
    return this.data.id;
  }

  /**
   * Name of the chain
   */
  public get name(): string {
    return this.data.name;
  }

  /**
   * Icon URL of the chain
   */
  public get icon(): string {
    return this.data.icon;
  }

  /**
   * Primary color of the chain {@link Chain.icon | icon}
   */
  public get color(): string {
    return this.data.color;
  }

  /**
   * Explorer that corresponds to the chain
   */
  public get explorer(): Explorer {
    return this.getExplorer(this.id);
  }

  /**
   * Contract that corresponds to the chain
   */
  public get contract(): Contract {
    return this.getContract(this.id);
  }

  /**
   *  Related "layer-1" chain if current chain is "layer-2"
   */
  public get layer1Parent(): Chain | undefined {
    if (isNull(this.data.layer1Parent)) {
      return undefined;
    }
    if (this.data.layer1Parent === this.data.id) {
      return undefined;
    }
    return this.getChain(this.data.layer1Parent);
  }
}
