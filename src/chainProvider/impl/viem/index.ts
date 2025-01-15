import type { Hex } from 'viem';

import { isNotNull, isNull } from '../../../helper/null';
import { ChainProviderError } from '../../error';
import {
  CallParams,
  ChainBlock,
  ChainLog,
  ChainTransaction,
  GetBlockParams, GetByteCodeParams,
  GetLogsParams,
  GetTransactionParams,
  IChainProvider,
} from '../../interface';

import { ViemChainProviderParams } from './param';
import { ViemChainProviderVendor } from './vendor';

export * from './param';

/**
 * Viem chain provider
 *
 * @category Chain Provider Impl
 */
export class ViemChainProvider implements IChainProvider {
  private readonly vendor: ViemChainProviderVendor;

  public constructor(params: ViemChainProviderParams = {}) {
    this.vendor = new ViemChainProviderVendor(params);
  }

  /**
   * Indicates if chain provider initialization has been finished successfully.
   *
   * Initialization runs automatically. This method can be used to ensure no delay will be caused by awaiting
   * unfinished initialization process.
   *
   * @returns `true` if chain provider is initialized, `false` if initialization is in progress or failed.
   */
  public initialized(): boolean {
    return this.vendor.initialized();
  }

  public async getBlock(params: GetBlockParams): Promise<ChainBlock> {
    const chainId = this.vendor.toViemChainId(params.chainId);
    const blockHash = params.hash.toLowerCase() as Hex;

    const chain = await this.vendor.getCheckedChain(chainId);
    const client = await this.vendor.getChainClient(chain);

    const block = await client.getBlock({ blockHash });
    const chainBlock: ChainBlock = {
      chainId: params.chainId,
      hash: params.hash,
      timestamp: Number(block.timestamp),
      txids: block.transactions,
    };
    return chainBlock;
  }

  public async getTransaction(params: GetTransactionParams): Promise<ChainTransaction> {
    const chainId = this.vendor.toViemChainId(params.chainId);
    const txid = params.txid.toLowerCase() as Hex;

    const chain = await this.vendor.getCheckedChain(chainId);
    const client = await this.vendor.getChainClient(chain);

    const transaction = await client.getTransaction({ hash: txid });
    const chainTransaction: ChainTransaction = {
      txid,
      chainId: params.chainId,
      index: transaction.transactionIndex,
      blockHash: transaction.blockHash,
      blockNumber: Number(transaction.blockNumber),
    };
    return chainTransaction;
  }

  public async getLogs(params: GetLogsParams): Promise<ChainLog[]> {
    const chainId = this.vendor.toViemChainId(params.chainId);
    const blockHash = params.blockHash.toLowerCase() as Hex;

    const chain = await this.vendor.getCheckedChain(chainId);
    const client = await this.vendor.getChainClient(chain);

    const logs = await client.getLogs({ blockHash });

    const txLogCounters = new Map<string, number>();
    let chainLogs = logs.map((log) => {
      const txid = log.transactionHash.toLowerCase();
      const index = txLogCounters.get(txid) ?? 0;
      txLogCounters.set(txid, index + 1);

      const chainLog: ChainLog = {
        txid,
        emitter: log.address.toLowerCase(),
        index,
        topics: log.topics,
        data: log.data,
      };
      return chainLog;
    });

    if (isNotNull(params.txid)) {
      const txid = params.txid.toLowerCase();
      chainLogs = chainLogs.filter((log) => log.txid === txid);
    }

    if (isNotNull(params.emitter)) {
      const emitter = params.emitter.toLowerCase();
      chainLogs = chainLogs.filter((log) => log.emitter === emitter);
    }

    return chainLogs;
  }

  public async call(params: CallParams): Promise<string> {
    const chainId = this.vendor.toViemChainId(params.chainId);
    const chain = await this.vendor.getCheckedChain(chainId);
    const client = await this.vendor.getChainClient(chain);

    let callResultData: string | undefined;
    let callError: string | undefined;
    try {
      const callResult = await client.call({
        to: params.to as Hex,
        data: params.data as Hex,
        account: params.address as Hex,
        value: params.value,
      });
      callResultData = callResult.data;
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      callError = `${err}`;
    }

    if (isNull(callResultData)) {
      throw new ChainProviderError(`Call failed - ${callError ?? 'result data is null'}`);
    }

    return callResultData;
  }

  public async getByteCode(params: GetByteCodeParams): Promise<string> {
    const chainId = this.vendor.toViemChainId(params.chainId);
    const chain = await this.vendor.getCheckedChain(chainId);
    const client = await this.vendor.getChainClient(chain);
    const code = await client.getCode({ address: params.address as Hex });
    return code ?? '';
  }


}
