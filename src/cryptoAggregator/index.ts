import { ICryptoDataSource } from '../cryptoDataSource';
import { isArray } from '../helper/array';
import { Cache } from '../helper/cache';
import { AllowFilter, Filter } from '../helper/filter';
import { isNotNull, isNull } from '../helper/null';
import { Chain, ChainData, Crypto, CryptoData, Duration, Explorer, ExplorerData } from '../model';
import { Contract, ContractData } from '../model';

import { CryptoAggregatorError } from './error';

type GetterBind<R> = (id: string, required?: boolean) => R;

interface CryptoStorage {
  explorers: Explorer[];
  explorerByChainId: Map<string, Explorer>;
  contracts: Contract[];
  contractByChainId: Map<string, Contract>;
  chains: Chain[];
  chainById: Map<string, Chain>;
  cryptos: Crypto[];
  cryptoById: Map<string, Crypto>;
}

export class CryptoAggregator {
  private readonly cryptoStorage: Cache<CryptoStorage>;
  private readonly getExplorerByChainIdBind: GetterBind<Explorer>;
  private readonly getContractByChainIdBind: GetterBind<Contract>;
  private readonly getChainByIdBind: GetterBind<Chain>;
  private readonly getCryptoByIdBind: GetterBind<Crypto>;
  private readonly cryptoDataSource: ICryptoDataSource;

  public constructor(cacheTtl: Duration, cryptoDataSource: ICryptoDataSource) {
    this.cryptoStorage = new Cache(cacheTtl, (...args) => this.loadCryptoStorage(...args));
    this.getExplorerByChainIdBind = (...args): Explorer => this.getExplorerByChainId(...args);
    this.getContractByChainIdBind = (...args): Contract => this.getContractByChainId(...args);
    this.getChainByIdBind = (...args): Chain => this.getChainById(...args);
    this.getCryptoByIdBind = (...args): Crypto => this.getCryptoById(...args);
    this.cryptoDataSource = cryptoDataSource;
  }

  public async getCryptoData(force: boolean): Promise<CryptoStorage> {
    return await this.cryptoStorage.get(force);
  }

  public getExplorerByChainId(chainId: string, required = false): Explorer {
    const explorer = this.cryptoStorage.getCurrent()?.explorerByChainId?.get(chainId);
    if (isNotNull(explorer)) {
      return explorer;
    }

    if (required) {
      throw new CryptoAggregatorError(`Explorer for chain with ID ${chainId} does not exist`);
    }

    const unknownExplorer = Explorer.unknown({ chainId });
    return unknownExplorer;
  }

  public getContractByChainId(chainId: string, required = false): Contract {
    const contract = this.cryptoStorage.getCurrent()?.contractByChainId?.get(chainId);
    if (isNotNull(contract)) {
      return contract;
    }

    if (required) {
      throw new CryptoAggregatorError(`Contract for chain with ID ${chainId} does not exist`);
    }

    const unknownContract = Contract.unknown({ chainId });
    return unknownContract;
  }

  public getChainById(chainId: string, required = false): Chain {
    const chain = this.cryptoStorage.getCurrent()?.chainById?.get(chainId);
    if (isNotNull(chain)) {
      return chain;
    }

    if (required) {
      throw new CryptoAggregatorError(`Chain with ID ${chainId} does not exist`);
    }

    const unknownChain = Chain.unknown({ id: chainId }, this.getExplorerByChainIdBind, this.getContractByChainIdBind);
    return unknownChain;
  }

  public getCryptoById(cryptoId: string, required = false): Crypto {
    const crypto = this.cryptoStorage.getCurrent()?.cryptoById?.get(cryptoId);
    if (isNotNull(crypto)) {
      return crypto;
    }

    if (required) {
      throw new CryptoAggregatorError(`Crypto with ID ${cryptoId} does not exist`);
    }

    const unknownCrypto = Crypto.unknown({ id: cryptoId }, this.getChainByIdBind);
    return unknownCrypto;
  }

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

  private async loadCryptoStorage(): Promise<CryptoStorage> {
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

    const data: CryptoStorage = {
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
