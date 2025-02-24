import type { Eip1193Provider, PredictedSafeProps } from '@safe-global/protocol-kit';
import type { ExactPartial, TransactionRequest } from 'viem';

import { IChainProvider } from '../../../chainProvider';
import { ZERO_ADDRESS } from '../../../helper/address';
import { isArray } from '../../../helper/array';
import { ExclusiveInit } from '../../../helper/exclusive';
import { isNotNull, isNull } from '../../../helper/null';
import { IWallet, SendTransactionParams, SignTypedDataParams } from '../../../wallet';
import { SmartWalletError } from '../../error';
import {
  GetSmartAddressParams,
  GetSmartIsDeployedParams,
  GetSmartOwnersParams,
  GetSmartPermitTransactionParams,
  GetSmartSendTransactionParams,
  GetSmartSignTransactionParams,
  GetSmartSignTypedDataParams,
  ISmartWallet,
  SmartBatchTransactionParams,
} from '../../interface';

import { getNonce } from './getNonce';
import { isDeployedSafe } from './isDeployedSafe';
import { GetGnosisSafeNonceParams, GnosisSafeWalletParams } from './param';
import {
  DEFAULT_SAFE_VERSION,
  KX_SAFE_WALLET_RECVSALT,
  SAFE_WALLET_DEFAULT_FALLBACK_HANDLER_ADDRESS,
  predictSafeAddress,
} from './predictSafeAddress';

export * from './param';

/**
 * Gnosis Safe smart wallet provider
 *
 * @category Smart Wallet Impl
 */
export class GnosisSafeWallet implements ISmartWallet {
  private readonly chainProvider: IChainProvider;
  private readonly ownerWallet: IWallet;
  private readonly perChainSafeInit: Map<string, ExclusiveInit<SafeBundle>>;
  private readonly perChainOwnersInit: Map<string, ExclusiveInit<ReadonlySet<string>>>;
  private readonly safeSdkIsInit: Map<string, boolean | undefined>;

  public constructor(params: GnosisSafeWalletParams) {
    this.chainProvider = params.chainProvider;
    this.ownerWallet = params.ownerWallet;

    this.perChainSafeInit = new Map();
    this.perChainOwnersInit = new Map();
    this.safeSdkIsInit = new Map();
  }

  public async isDeployed(params: GetSmartIsDeployedParams): Promise<boolean> {
    const address = await this.getAddress(params);
    return await isDeployedSafe(address, params.chainId, this.chainProvider);
  }

  public async getOwners(params: GetSmartOwnersParams): Promise<ReadonlySet<string>> {
    let ownersInit = this.perChainOwnersInit.get(params.chainId);
    if (isNull(ownersInit) || (params.force ?? false)) {
      ownersInit = new ExclusiveInit(() => this.initOwners(params.chainId));
      this.perChainOwnersInit.set(params.chainId, ownersInit);
    }

    const owners = ownersInit.get();
    return owners;
  }

  public getOwnerWallet(): Promise<IWallet> {
    return Promise.resolve(this.ownerWallet);
  }

  public async getAddress(params: GetSmartAddressParams): Promise<string> {
    const safeInit = this.safeSdkIsInit.get(params.chainId);
    if (isNull(safeInit)) {
      const address = await this.ownerWallet.getAddress();
      this.getSafe(params.chainId).catch(console.error);
      return await predictSafeAddress(address);
    }

    const safe = await this.getSafe(params.chainId);
    return await safe.instance.getAddress();
  }

  public async getSignTransactionParams(params: GetSmartSignTransactionParams): Promise<SignTypedDataParams> {
    const safe = await this.getSafe(params.chainId);
    const nonce = await this.getNonce(params);

    const toSafeTx = (txp: SmartBatchTransactionParams): SafeTransactionParams => {
      return {
        to: txp.to,
        data: txp.data ?? '0x',
        value: txp.value ?? '0',
      };
    };

    const transactions: SafeTransactionParams[] = [];

    const addTxs = (tx: SmartBatchTransactionParams | readonly SmartBatchTransactionParams[] | undefined): void => {
      if (isNotNull(tx)) {
        if (isArray(tx)) {
          transactions.push(...tx.map(toSafeTx));
        } else {
          transactions.push(toSafeTx(tx));
        }
      }
    };

    addTxs(params.pre);
    addTxs(params);
    addTxs(params.post);

    const safeTransaction = await safe.instance.createTransaction({ transactions, options: { nonce } });

    const signParams = await this.prepareSignParams(
      params.chainId,
      params.from,
      safeTransaction.data,
      params.tag,
      params.operation,
    );
    return signParams;
  }

  public async getSendTransactionParams(params: GetSmartSendTransactionParams): Promise<SendTransactionParams> {
    const chainId = params.chainId;
    if (isNull(chainId)) {
      throw new SmartWalletError('No chain ID provided for Gnosis Safe wallet send transaction params');
    }

    const transactionData = this.parseTransactionData(params.data);

    const protocolKit = await this.importProtocolKit();

    const SafeEthTransaction = await this.importProtocolKitSafeEthTransaction();
    const safeTransaction = new SafeEthTransaction(transactionData);
    const safeSignature = new protocolKit.EthSafeSignature(params.from, params.ownerSignature);
    safeTransaction.addSignature(safeSignature);

    const safe = await this.getSafe(chainId);
    const executeTransactionData = await safe.instance.getEncodedTransaction(safeTransaction);
    const executeTransactionValue = transactionData.value;

    const sendParams: SendTransactionParams = {
      chainId,
      from: params.from,
      to: safe.address,
      data: executeTransactionData,
      value: executeTransactionValue,
      tag: params.tag,
      operation: params.operation,
    };
    return sendParams;
  }

  public async getSignTypedDataParams(params: GetSmartSignTypedDataParams): Promise<SignTypedDataParams> {
    const typedData = JSON.parse(params.data) as SafeData;

    const signParams = await this.prepareSignParams(
      params.chainId,
      params.from,
      typedData,
      params.tag,
      params.operation,
    );
    return signParams;
  }

  public async getPermitTransaction(params: GetSmartPermitTransactionParams): Promise<string> {
    const data = this.parseTransactionData(params.data);
    const address = await this.getAddress(params);
    const { encodePermitSafeCustom } = await import('./permitSafeCustom');
    const transaction = await encodePermitSafeCustom(
      address,
      data.to,
      data.value,
      data.data,
      data.operation,
      params.ownerSignature,
    );
    return transaction;
  }

  /**
   * Gets nonce of the smart wallet contract
   *
   * @param params Get nonce {@link GetGnosisSafeNonceParams | params}
   *
   * @returns Contract nonce of swart wallet
   */
  public async getNonce(params: GetGnosisSafeNonceParams): Promise<number> {
    const address = await this.getAddress(params);
    const nonce = await getNonce(address, params.chainId, this.chainProvider);
    return nonce;
  }

  private async getSafe(chainId: string): Promise<SafeBundle> {
    let safeInit = this.perChainSafeInit.get(chainId);
    if (isNull(safeInit)) {
      safeInit = new ExclusiveInit(() => this.initSafe(chainId));
      this.perChainSafeInit.set(chainId, safeInit);
    }

    const safe = await safeInit.get();
    return safe;
  }

  private async initSafe(chainId: string): Promise<SafeBundle> {
    const provider = this.getProvider(chainId);

    const ownerAddress = await this.ownerWallet.getAddress();

    const protocolKit = await this.importProtocolKit();
    const Safe = protocolKit.default;

    const predictedSafe: PredictedSafeProps = {
      safeAccountConfig: {
        owners: [ownerAddress],
        threshold: 1,
        to: ZERO_ADDRESS,
        data: '0x',
        fallbackHandler: SAFE_WALLET_DEFAULT_FALLBACK_HANDLER_ADDRESS,
        paymentToken: ZERO_ADDRESS,
        payment: 0,
        paymentReceiver: KX_SAFE_WALLET_RECVSALT,
      },
      safeDeploymentConfig: {
        saltNonce: '0',
        safeVersion: DEFAULT_SAFE_VERSION,
        deploymentType: 'canonical',
      },
    };

    const instance = await Safe.init({ provider, predictedSafe, isL1SafeSingleton: true });
    const safeAddress = await instance.getAddress();
    this.safeSdkIsInit.set(chainId, true);
    const safe: SafeBundle = {
      instance,
      chainId: BigInt(chainId),
      address: safeAddress,
      version: instance.getContractVersion(),
    };
    return safe;
  }

  private getProvider(chainId: string): Eip1193Provider {
    type EthCallParams = ExactPartial<TransactionRequest>;

    const ethCall = async (params: EthCallParams): Promise<string> => {
      return await this.chainProvider.call({
        chainId,
        to: params.to!,
        data: params.data!,
        address: params.from,
        value: params.value,
      });
    };

    const ethGetCode = async (address: string): Promise<string> => {
      return await this.chainProvider.getByteCode({ chainId, address });
    };

    const provider: Eip1193Provider = {
      request: async (args) => {
        switch (args.method) {
          case 'eth_chainId':
            return `0x${Number(chainId).toString(16)}`;

          case 'eth_accounts':
            return [];

          case 'eth_call':
            if (!isArray(args.params)) {
              throw new SmartWalletError('Unexpected EIP-1193 provider "eth_call" params');
            }
            return await ethCall(args.params[0] as EthCallParams);

          case 'eth_getCode':
            if (!isArray(args.params)) {
              throw new SmartWalletError('Unexpected EIP-1193 provider "eth_getCode" params');
            }
            return await ethGetCode(args.params[0] as string);

          default:
            throw new SmartWalletError(`Unexpected EIP-1193 provider request of "${args.method}" method`);
        }
      },
    };
    return provider;
  }

  private parseTransactionData(data: string): SafeTransaction['data'] {
    const transactionData = (JSON.parse(data) as { message: SafeTransaction['data'] }).message;
    return transactionData;
  }

  private async initOwners(chainId: string): Promise<ReadonlySet<string>> {
    const safe = await this.getSafe(chainId);
    const safeOwners = await safe.instance.getOwners();
    const owners = new Set(safeOwners.map((o) => o.toLowerCase()));
    return owners;
  }

  private async importProtocolKit(): Promise<ProtocolKitLib> {
    const protocolKit = this.patchDefault(await import('@safe-global/protocol-kit'));
    return protocolKit;
  }

  private async importProtocolKitSafeEthTransaction(): Promise<SafeEthTransaction> {
    const protocolKitSafeTransaction = this.patchDefault(
      await import('@safe-global/protocol-kit/dist/src/utils/transactions/SafeTransaction'),
    );
    return protocolKitSafeTransaction.default;
  }

  private patchDefault<T extends { default: object }>(mod: T): T {
    // Patch the `default` mismatch in tests
    if ('default' in mod.default) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      mod = { ...mod.default, default: (mod.default as any).default } as unknown as T;
    }
    return mod;
  }

  private async prepareSignParams(
    chainId: string,
    from: string,
    data: SafeData,
    tag: string,
    operation: string | undefined,
  ): Promise<SignTypedDataParams> {
    const safe = await this.getSafe(chainId);
    const protocolKit = await this.importProtocolKit();

    const typedData = protocolKit.generateTypedData({
      safeAddress: safe.address,
      chainId: safe.chainId,
      safeVersion: safe.version,
      data,
    });

    const signParams: SignTypedDataParams = {
      chainId,
      from,
      data: JSON.stringify(typedData),
      tag,
      operation,
    };
    return signParams;
  }
}

type ProtocolKitLib = typeof import('@safe-global/protocol-kit');
type Safe = Awaited<ReturnType<ProtocolKitLib['default']['init']>>;
type SafeVersion = Awaited<ReturnType<Safe['getContractVersion']>>;
type SafeData = Parameters<ProtocolKitLib['generateTypedData']>[0]['data'];
type SafeTransaction = Awaited<ReturnType<Safe['createTransaction']>>;
type SafeTransactionParams = Parameters<Safe['createTransaction']>[0]['transactions'][0];
type SafeEthTransaction =
  (typeof import('@safe-global/protocol-kit/dist/src/utils/transactions/SafeTransaction'))['default'];

interface SafeBundle {
  instance: Safe;
  chainId: bigint;
  address: string;
  version: SafeVersion;
}
