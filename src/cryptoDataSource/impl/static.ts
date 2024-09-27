import { ChainData, ContractData, CryptoData, ExplorerData } from '../../model';
import { ICryptoDataSource } from '../interface';

/**
 * Static crypto data to use
 *
 * @category Crypto Source
 */
export interface StaticCryptoData {
  /**
   * Explorers data
   */
  explorers: ExplorerData[];

  /**
   * Contracts data
   */
  contracts: ContractData[];

  /**
   * Chains data
   */
  chains: ChainData[];

  /**
   * Cryptos data
   */
  cryptos: CryptoData[];
}

/**
 * Static crypto source that uses static crypto data
 *
 * @category Crypto Source
 */
export class StaticCryptoDataSource implements ICryptoDataSource {
  private staticCryptos: StaticCryptoData;

  public constructor(cryptos: StaticCryptoData) {
    this.staticCryptos = cryptos;
  }

  public getChains(): Promise<ChainData[]> {
    return Promise.resolve(this.staticCryptos.chains);
  }

  public getExplorers(): Promise<ExplorerData[]> {
    return Promise.resolve(this.staticCryptos.explorers);
  }

  public getContracts(): Promise<ContractData[]> {
    return Promise.resolve(this.staticCryptos.contracts);
  }

  public getCryptos(): Promise<CryptoData[]> {
    return Promise.resolve(this.staticCryptos.cryptos);
  }
}
