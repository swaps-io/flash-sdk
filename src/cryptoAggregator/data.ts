import { Chain, Contract, Crypto, Explorer } from '../model';

/**
 * Crypto aggregator-stored data
 *
 * @category Crypto Aggregator
 */
export interface CryptoAggregatorData {
  /**
   * List of aggregated explorers
   */
  explorers: Explorer[];

  /**
   * Aggregated explorers by chain ID
   */
  explorerByChainId: Map<string, Explorer>;

  /**
   * List of aggregated contracts
   */
  contracts: Contract[];

  /**
   * Aggregated contracts by chain ID
   */
  contractByChainId: Map<string, Contract>;

  /**
   * List of aggregated chains
   */
  chains: Chain[];

  /**
   * Aggregated chains by their ID
   */
  chainById: Map<string, Chain>;

  /**
   * List of aggregated cryptos
   */
  cryptos: Crypto[];

  /**
   * Aggregated cryptos by their ID
   */
  cryptoById: Map<string, Crypto>;
}
