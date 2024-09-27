import { ChainData, ContractData, CryptoData, ExplorerData } from '../model';

/**
 * Crypto data source interface
 *
 * @category Crypto Source
 */
export interface ICryptoDataSource {
  /**
   * Gets chains
   *
   * @returns ChainData[]
   */
  getChains(): Promise<ChainData[]>;

  /**
   * Gets explorers
   *
   * @returns ExplorerData[]
   */
  getExplorers(): Promise<ExplorerData[]>;

  /**
   * Gets contracts
   *
   * @returns ContractData[]
   */
  getContracts(): Promise<ContractData[]>;

  /**
   * Gets cryptos
   *
   * @returns CryptoData[]
   */
  getCryptos(): Promise<CryptoData[]>;
}
