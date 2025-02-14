/**
 * Get transaction parameters of {@link IChainProvider.getTransaction}
 *
 * @category Chain Provider
 */
export interface GetTransactionParams {
  /**
   * Chain ID to search for transaction specified by {@link GetTransactionParams.txid | TXID} on
   */
  chainId: string;

  /**
   * TXID of transaction
   */
  txid: string;
}

/**
 * Transaction on chain
 *
 * @category Chain Provider
 */
export interface ChainTransaction {
  /**
   * Chain ID of the transaction
   */
  chainId: string;

  /**
   * TXID of the transaction
   */
  txid: string;

  /**
   * Index of the transaction in block
   */
  index: number;

  /**
   * Hash of the block transaction included into
   */
  blockHash: string;

  /**
   * Number of the block transaction included into
   */
  blockNumber: number;
}

/**
 * Get block parameters of {@link IChainProvider.getBlock}
 *
 * @category Chain Provider
 */
export interface GetBlockParams {
  /**
   * Chain ID of the block
   */
  chainId: string;

  /**
   * Hash of the block
   */
  hash: string;
}

/**
 * Block on chain
 *
 * @category Chain Provider
 */
export interface ChainBlock {
  /**
   * Chain ID of the block
   */
  chainId: string;

  /**
   * Hash of the block
   */
  hash: string;

  /**
   * Timestamp of the block
   */
  timestamp: number;

  /**
   * List of TXIDs included into the block
   */
  txids: string[];
}

/**
 * Get transaction event logs parameters of {@link IChainProvider.getLogs}
 *
 * @category Chain Provider
 */
export interface GetLogsParams {
  /**
   * Chain ID of the event logs
   */
  chainId: string;

  /**
   * Hash of event logs block
   */
  blockHash: string;

  /**
   * TXID filter of the event logs
   *
   * Only events of the transaction specified by the TXID are included in result
   *
   * @default Any transaction
   */
  txid?: string;

  /**
   * Emitter filter of the event logs
   *
   * Only events by the specified emitter contract address are included in result
   *
   * @default Any emitter
   */
  emitter?: string;
}

/**
 * Event log on chain
 *
 * @category Chain Provider
 */
export interface ChainLog {
  /**
   * TXID of transaction where event occurred
   */
  txid: string;

  /**
   * Address of the contract that emitted event
   */
  emitter: string;

  /**
   * Event log index (in transaction)
   */
  index: number;

  /**
   * Event log topics (hex)
   */
  topics: string[];

  /**
   * Event log data (hex)
   */
  data: string;
}

/**
 * Call parameters of {@link IChainProvider.call}
 *
 * @category Chain Provider
 */
export interface CallParams {
  /**
   * Chain ID to perform call on
   */
  chainId: string;

  /**
   * Callee contract address
   */
  to: string;

  /**
   * Calldata to perform call
   */
  data: string;

  /**
   * Caller address
   */
  address?: string;

  /**
   * Value to send to contract
   */
  value?: bigint;
}

/**
 * Call parameters of {@link IChainProvider.getByteCode}
 *
 * @category Chain Provider
 */
export interface GetByteCodeParams {
  /**
   * Chain ID to get bytecode on
   */
  chainId: string;

  /**
   * Contract address to get bytecode of
   */
  address: string;
}

/**
 * Chain data provider
 *
 * @category Chain Provider
 */
export interface IChainProvider {
  /**
   * Get specified chain block
   *
   * @param params Get block {@link GetBlockParams | params}
   */
  getBlock(params: GetBlockParams): Promise<ChainBlock>;

  /**
   * Get specified chain transaction
   *
   * @param params Get transaction {@link GetTransactionParams | params}
   */
  getTransaction(params: GetTransactionParams): Promise<ChainTransaction>;

  /**
   * Get specified chain event logs
   *
   * @param params Get event logs {@link GetLogsParams | params}
   */
  getLogs(params: GetLogsParams): Promise<ChainLog[]>;

  /**
   * Perform contract call for specified chain
   *
   * @param params Call params {@link CallParams | params}
   */
  call(params: CallParams): Promise<string>;

  /**
   * Retrieve specified contract's deployed bytecode
   *
   * May return empty string if no bytecode is associated with the address
   *
   * @param params Get contract bytecode {@link GetByteCodeParams | params}
   */
  getByteCode(params: GetByteCodeParams): Promise<string>;
}
