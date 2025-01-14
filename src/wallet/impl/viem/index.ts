import type { Chain, Hex, PrivateKeyAccount, WalletClient } from 'viem';

import { ExclusiveInit, ExclusivePool } from '../../../helper/exclusive';
import { isNotNull, isNull } from '../../../helper/null';
import { generateRandomId } from '../../../helper/random';
import { Duration } from '../../../model/time/duration';
import { WalletError } from '../../error';
import {
  IWallet,
  SendTransactionParams,
  SignMessageParams,
  SignTypedDataParams,
  WithWalletOperation,
} from '../../interface';

import {
  ANY_CHAIN,
  normalizeAddress,
  normalizeChainId,
  normalizeData,
  normalizeTypedData,
  normalizeValue,
} from './normalization';
import { ViemWalletParams } from './param';

export * from './param';

type ChainMap = Map<number, Chain>; // By chain ID
type ClientMap = Map<number, WalletClient>; // By chain ID

interface Data {
  account: PrivateKeyAccount;
  clients: ClientMap;
  chains: ChainMap;
}

/**
 * Viem wallet provider
 *
 * @category Wallet Impl
 */
export class ViemWallet implements IWallet {
  private readonly data: ExclusiveInit<Data>;
  private readonly gasLimitOverhead: bigint;
  private readonly waitTxTimeout: Duration;
  private readonly sendPool: ExclusivePool;
  private readonly enableAddressChecksum: boolean;
  private readonly executingOperations: Set<string>;

  public constructor(params: ViemWalletParams) {
    this.data = new ExclusiveInit(() => this.initData(params));
    const { gasLimitOverhead = 100_000n, waitTxTimeout = Duration.fromMinutes(3) } = params;
    this.gasLimitOverhead = gasLimitOverhead;
    this.waitTxTimeout = waitTxTimeout;
    this.sendPool = new ExclusivePool();
    this.enableAddressChecksum = params.enableAddressChecksum ?? false;
    this.executingOperations = new Set();
  }

  /**
   * Indicates if wallet initialization has been finished successfully.
   *
   * Initialization runs automatically. This method can be used to ensure no delay will be caused by awaiting
   * unfinished initialization process.
   *
   * @returns `true` if wallet is initialized, `false` if initialization is in progress or failed.
   */
  public initialized(): boolean {
    return this.data.initialized();
  }

  public async getAddress(): Promise<string> {
    const data = await this.data.get();

    let address: string = data.account.address;
    if (!this.enableAddressChecksum) {
      address = address.toLowerCase();
    }
    return Promise.resolve(address);
  }

  public async signTypedData(params: SignTypedDataParams): Promise<string> {
    return await this.withOperation(this.getOperation(params), async () => {
      const chainId = normalizeChainId(params.chainId);
      const from = normalizeAddress(params.from);
      const typedData = normalizeTypedData(params.data);

      await this.getCheckedChain(chainId); // Ensure chain was configured
      const account = await this.getCheckedAccount(from);

      const signature = await account.signTypedData(typedData);
      return signature;
    });
  }

  public async sendTransaction(params: SendTransactionParams): Promise<string> {
    return await this.withOperation(this.getOperation(params), async () => {
      const txid = await this.sendPool.execute(() => this.sendTransactionNoSync(params));
      return txid;
    });
  }

  public async signMessage(params: SignMessageParams): Promise<string> {
    return await this.withOperation(this.getOperation(params), async () => {
      const from = normalizeAddress(params.from);

      const account = await this.getCheckedAccount(from);

      const signature = await account.signMessage({ message: params.message });
      return signature;
    });
  }

  public async getExecutingOperations(): Promise<ReadonlySet<string>> {
    return Promise.resolve(this.executingOperations);
  }

  /**
   * Non-synchronized version of {@link sendTransaction} method
   *
   * It's highly recommended to use the synchronized version instead this one
   * to avoid nonce usage conflicts, unless code on the user side implements
   * its own synchronization mechanism for transaction sends
   *
   * @param params Send transaction {@link SendTransactionParams | params}
   *
   * @returns TXID of sent transaction
   */
  public async sendTransactionNoSync(params: SendTransactionParams): Promise<string> {
    return await this.withOperation(this.getOperation(params, '-no-sync'), async () => {
      const chainId = normalizeChainId(params.chainId);
      const from = normalizeAddress(params.from);
      const to = normalizeAddress(params.to);
      const value = normalizeValue(params.value);
      const data = normalizeData(params.data);

      const chain = await this.getCheckedChain(chainId);
      const account = await this.getCheckedAccount(from);

      const client = await this.getCheckedClient(chainId);

      const { waitForTransactionReceipt, estimateGas } = await import('viem/actions');

      const estimatedGas = await estimateGas(client, { account, to, value, data });
      const gas = estimatedGas + this.gasLimitOverhead;
      const txid = await client.sendTransaction({
        account,
        chain,
        to,
        value,
        data,
        gas,
      });

      const errors: unknown[] = [];

      const timeout = async (): Promise<void> => {
        await this.waitTxTimeout.sleep();
        const errorMessage = this.combineErrorMessage(errors);
        throw new WalletError(errorMessage);
      };

      const wait = async (): Promise<void> => {
        for (;;) {
          try {
            await waitForTransactionReceipt(client, { hash: txid });
            return;
          } catch (e) {
            errors.push(e);
          }
        }
      };
      await Promise.race([timeout(), wait()]);

      return txid;
    });
  }

  private getOperation(wo: WithWalletOperation, suffix = ''): string {
    return (wo.operation ?? generateRandomId()) + suffix;
  }

  private async withOperation<T>(operation: string, call: () => Promise<T>): Promise<T> {
    this.executingOperations.add(operation);
    try {
      return await call();
    } finally {
      this.executingOperations.delete(operation);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return `${error as string}`;
  }

  private combineErrorMessage(errors: unknown[]): string {
    const errorCounts = new Map<string, number>();
    let totalErrors = 0;
    for (const error of errors) {
      const errorMessage = this.getErrorMessage(error);
      const errorCount = errorCounts.get(errorMessage) ?? 0;
      errorCounts.set(errorMessage, errorCount + 1);
      totalErrors++;
    }

    let errorMessage = 'Wallet transaction wait exceeded timeout';
    let firstError = true;
    for (const [error, count] of errorCounts.entries()) {
      if (firstError) {
        errorMessage += `. Retry errors (${totalErrors}):`;
        firstError = false;
      } else {
        errorMessage += ',';
      }
      errorMessage += ` "${error}"`;
      if (count > 1) {
        errorMessage += ` (x${count})`;
      }
    }
    return errorMessage;
  }

  private async initData(params: ViemWalletParams): Promise<Data> {
    let chains: ChainMap;
    if (isNotNull(params.chains)) {
      if (!params.chains.length) {
        throw new WalletError('At least one chain must be specified');
      }

      chains = new Map(params.chains.map((c) => [c.id, c]));
      if (chains.size !== params.chains.length) {
        throw new WalletError('Specified chain IDs are not unique');
      }
    } else {
      const viemChainModule = await import('viem/chains');
      const viemChains = Object.values(viemChainModule) as Chain[];
      chains = new Map(viemChains.map((c) => [c.id, c]));
    }

    const { privateKeyToAccount } = await import('viem/accounts');
    const { createWalletClient, http } = await import('viem');

    const account = privateKeyToAccount(params.privateKey as Hex);
    const clients = new Map(
      Array.from(chains).map(([chainId, chain]) => [
        chainId,
        createWalletClient({ transport: http(chain.rpcUrls.default.http[0]) }),
      ]),
    );

    const data: Data = {
      account,
      clients,
      chains,
    };
    return data;
  }

  private async getCheckedChain(chainId: number): Promise<Chain | undefined> {
    if (chainId == ANY_CHAIN) {
      return undefined;
    }

    const data = await this.data.get();
    const chain = data.chains.get(chainId);
    if (isNull(chain)) {
      throw new WalletError('Invalid chain');
    }

    return chain;
  }

  private async getCheckedClient(chainId: number): Promise<WalletClient> {
    const data = await this.data.get();
    const client = data.clients.get(chainId);
    if (isNull(client)) {
      throw new WalletError('Invalid chain');
    }

    return client;
  }

  private async getCheckedAccount(from: string): Promise<PrivateKeyAccount> {
    const data = await this.data.get();
    if (data.account.address.toLowerCase() !== from.toLowerCase()) {
      throw new WalletError('Invalid account');
    }

    return data.account;
  }
}
