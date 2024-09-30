import { ICryptoDataSource } from '../cryptoDataSource';
import { isArray } from '../helper/array';
import { Cache } from '../helper/cache';
import { AllowFilter, Filter } from '../helper/filter';
import { isNotNull, isNull } from '../helper/null';
import { Chain, ChainData, Crypto, CryptoData, Duration, Explorer, ExplorerData } from '../model';
import { Contract, ContractData } from '../model';

import { CryptoAggregatorData } from './data';
import { CryptoAggregatorError } from './error';

export { CryptoAggregatorError, CryptoAggregatorData };

type GetterBind<R> = (id: string, required?: boolean) => R;

/**
 * Crypto data access aggregator
 *
 * @category Crypto Aggregator
 */
export class CryptoAggregator {
  private readonly cryptoData: Cache<CryptoAggregatorData>;
  private readonly cryptoDataSource: ICryptoDataSource;
  private readonly getExplorerByChainIdBind: GetterBind<Explorer>;
  private readonly getContractByChainIdBind: GetterBind<Contract>;
  private readonly getChainByIdBind: GetterBind<Chain>;
  private readonly getCryptoByIdBind: GetterBind<Crypto>;

  public constructor(cacheTtl: Duration, cryptoDataSource: ICryptoDataSource) {
    this.cryptoData = new Cache(cacheTtl, (...args) => this.loadCryptoData(...args));
    this.cryptoDataSource = cryptoDataSource;
    this.getExplorerByChainIdBind = (...args): Explorer => this.getExplorerByChainId(...args);
    this.getContractByChainIdBind = (...args): Contract => this.getContractByChainId(...args);
    this.getChainByIdBind = (...args): Chain => this.getChainById(...args);
    this.getCryptoByIdBind = (...args): Crypto => this.getCryptoById(...args);
  }

  /**
   * Gets underlying aggregator-stored crypto data
   *
   * @param force Should data load be forced or allow cache use
   *
   * @returns Crypto storage data
   */
  public async getCryptoData(force: boolean): Promise<CryptoAggregatorData> {
    return await this.cryptoData.get(force);
  }

  /**
   * Gets explorer by chain ID it corresponds to
   *
   * @param chainId Chain ID of explorer
   * @param required How missing explorer should be handled:
   * - `false` - {@link Explorer.unknown | unknown} instance is returned (default)
   * - `true` - {@link CryptoAggregatorError | exception} is thrown
   *
   * @returns Explorer corresponding to chain ID
   */
  public getExplorerByChainId(chainId: string, required = false): Explorer {
    const explorer = this.cryptoData.getCurrent()?.explorerByChainId?.get(chainId);
    if (isNotNull(explorer)) {
      return explorer;
    }

    if (required) {
      throw new CryptoAggregatorError(`Explorer for chain with ID ${chainId} does not exist`);
    }

    const unknownExplorer = Explorer.unknown({ chainId });
    return unknownExplorer;
  }

  /**
   * Gets contract info by chain ID it corresponds to
   *
   * @param chainId Chain ID of contract
   * @param required How missing contract should be handled:
   * - `false` - {@link Contract.unknown | unknown} instance is returned (default)
   * - `true` - {@link CryptoAggregatorError | exception} is thrown
   *
   * @returns Contract info corresponding to chain ID
   */
  public getContractByChainId(chainId: string, required = false): Contract {
    const contract = this.cryptoData.getCurrent()?.contractByChainId?.get(chainId);
    if (isNotNull(contract)) {
      return contract;
    }

    if (required) {
      throw new CryptoAggregatorError(`Contract for chain with ID ${chainId} does not exist`);
    }

    const unknownContract = Contract.unknown({ chainId });
    return unknownContract;
  }

  /**
   * Gets chain by its ID
   *
   * @param chainId Chain ID
   * @param required How missing chain should be handled:
   * - `false` - {@link Chain.unknown | unknown} instance is returned (default)
   * - `true` - {@link CryptoAggregatorError | exception} is thrown
   *
   * @returns Chain corresponding to ID
   */
  public getChainById(chainId: string, required = false): Chain {
    const chain = this.cryptoData.getCurrent()?.chainById?.get(chainId);
    if (isNotNull(chain)) {
      return chain;
    }

    if (required) {
      throw new CryptoAggregatorError(`Chain with ID ${chainId} does not exist`);
    }

    const unknownChain = Chain.unknown({ id: chainId }, this.getExplorerByChainIdBind, this.getContractByChainIdBind);
    return unknownChain;
  }

  /**
   * Gets crypto by its ID
   *
   * @param cryptoId Crypto ID
   * @param required How missing crypto should be handled:
   * - `false` - {@link Crypto.unknown | unknown} instance is returned (default)
   * - `true` - {@link CryptoAggregatorError | exception} is thrown
   *
   * @returns Crypto corresponding to ID
   */
  public getCryptoById(cryptoId: string, required = false): Crypto {
    const crypto = this.cryptoData.getCurrent()?.cryptoById?.get(cryptoId);
    if (isNotNull(crypto)) {
      return crypto;
    }

    if (required) {
      throw new CryptoAggregatorError(`Crypto with ID ${cryptoId} does not exist`);
    }

    const unknownCrypto = Crypto.unknown({ id: cryptoId }, this.getChainByIdBind);
    return unknownCrypto;
  }

  /**
   * Creates specified filter that can be applied to crypto list
   *
   * @param chain Chain, its ID, or list of these values that crypto must be in
   *
   * @returns Crypto filter instance
   */
  public makeCryptoFilter(chain?: Chain | string | readonly (Chain | string)[]): Filter<Crypto> {
    if (isNull(chain)) {
      return new AllowFilter();
    }

    const extractChainId = (chain: Chain | string): string => {
      return typeof chain === 'string' ? chain : chain.id;
    };

    if (!isArray(chain)) {
      const allowedChainId = extractChainId(chain);
      return new Filter((c) => c.id === allowedChainId);
    }

    if (!chain.length) {
      return new AllowFilter();
    }

    const allowedChainIds = new Set(chain.map(extractChainId));
    return new Filter((c) => allowedChainIds.has(c.id));
  }

  private async loadCryptoData(): Promise<CryptoAggregatorData> {
    const [explorersResponse, contractsResponse, chainsResponse, cryptosResponse] = await Promise.all([
      this.cryptoDataSource.getExplorers(),
      this.cryptoDataSource.getContracts(),
      this.cryptoDataSource.getChains(),
      this.cryptoDataSource.getCryptos(),
    ]);

    const explorers = explorersResponse.map((d) => this.mapExplorer(d));
    const explorerByChainId = new Map(explorers.map((e) => [e.data.chainId, e]));

    const contracts = contractsResponse.map((d) => this.mapContract(d));
    const contractByChainId = new Map(contracts.map((c) => [c.data.chainId, c]));

    const chains = chainsResponse.map((d) => this.mapChain(d));
    const chainById = new Map(chains.map((c) => [c.data.id, c]));

    const cryptos = cryptosResponse.map((d) => this.mapCrypto(d));
    const cryptoById = new Map(cryptos.map((c) => [c.data.id, c]));

    const data: CryptoAggregatorData = {
      explorers,
      explorerByChainId,
      contracts,
      contractByChainId,
      chains,
      chainById,
      cryptos,
      cryptoById,
    };
    return data;
  }

  private mapExplorer(data: ExplorerData): Explorer {
    return new Explorer(data);
  }

  private mapContract(data: ContractData): Contract {
    return new Contract(data, this.getCryptoByIdBind);
  }

  private mapChain(data: ChainData): Chain {
    return new Chain(data, this.getExplorerByChainIdBind, this.getContractByChainIdBind, this.getChainByIdBind);
  }

  private mapCrypto(data: CryptoData): Crypto {
    return new Crypto(data, this.getChainByIdBind);
  }
}
