import type { PredictedSafeProps } from '@safe-global/protocol-kit';

import { ZERO_ADDRESS } from '../../../helper/address';
import { ExclusiveInit } from '../../../helper/exclusive';
import { isNotNull, isNull } from '../../../helper/null';
import { IWallet, SendTransactionParams, SignTypedDataParams } from '../../../wallet';
import { SmartWalletError } from '../../error';
import {
  GetSmartAddressParams,
  GetSmartIsDeployedParams,
  GetSmartOwnersParams,
  GetSmartSendTransactionParams,
  GetSmartSignTransactionParams,
  GetSmartSignTypedDataParams,
  ISmartWallet,
} from '../../interface';

import { GnosisSafeWalletParams } from './param';
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
  private readonly ownerWallet: IWallet | undefined;
  private readonly perChainRpcUrls: Map<string, string>;
  private readonly perChainSafeInit: Map<string, ExclusiveInit<SafeBundle>>;
  private readonly perChainOwnersInit: Map<string, ExclusiveInit<ReadonlySet<string>>>;
  private readonly safeSDKIsInit: Map<string, boolean | undefined>;

  public constructor(params: GnosisSafeWalletParams = {}) {
    this.safeSDKIsInit = new Map();
    this.ownerWallet = params.ownerWallet;

    this.perChainRpcUrls = new Map();
    const chainConfigs = params.chains ?? [];
    for (const chainConfig of chainConfigs) {
      this.perChainRpcUrls.set(chainConfig.chainId, chainConfig.rpcUrl);
    }
    if (this.perChainRpcUrls.size < chainConfigs.length) {
      throw new SmartWalletError('Duplicate Gnosis Safe wallet chain config detected');
    }

    this.perChainSafeInit = new Map();
    this.perChainOwnersInit = new Map();
  }

  public async isDeployed(params: GetSmartIsDeployedParams): Promise<boolean> {
    const safe = await this.getSafe(params.chainId);
    return safe.instance.isSafeDeployed();
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
    if (isNull(this.ownerWallet)) {
      throw new SmartWalletError('No Gnosis Safe owner wallet configured');
    }

    return Promise.resolve(this.ownerWallet);
  }

  public async getAddress(params: GetSmartAddressParams): Promise<string> {
    const safeInit = this.safeSDKIsInit.get(params.chainId);
    if (isNull(safeInit) && isNotNull(this.ownerWallet)) {
      const address = await this.ownerWallet.getAddress();
      this.getSafe(params.chainId).catch(console.error);
      return predictSafeAddress(address);
    }
    const safe = await this.getSafe(params.chainId);
    return await safe.instance.getAddress();
  }

  public async getSignTransactionParams(params: GetSmartSignTransactionParams): Promise<SignTypedDataParams> {
    const safe = await this.getSafe(params.chainId);
    const safeTransaction = await safe.instance.createTransaction({
      transactions: [
        {
          to: params.to,
          data: params.data ?? '0x',
          value: params.value ?? '0',
        },
      ],
    });

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const signData = JSON.parse(params.data);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const transactionData = signData.message as SafeTransaction['data'];

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
    const provider = this.getRpcUrl(chainId);
    const ownerAddress = await this.ownerWallet?.getAddress();

    if (isNull(ownerAddress)) {
      throw new SmartWalletError('No Gnosis Safe owner wallet configured');
    }

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
    this.safeSDKIsInit.set(chainId, true);
    const safe: SafeBundle = {
      instance,
      chainId: BigInt(chainId),
      address: safeAddress,
      version: instance.getContractVersion(),
    };
    return safe;
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

  private getRpcUrl(chainId: string): string {
    const rpcUrl = this.perChainRpcUrls.get(chainId);
    if (isNull(rpcUrl)) {
      throw new SmartWalletError(`No Gnosis Safe wallet RPC URL configured for chain "${chainId}"`);
    }

    return rpcUrl;
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
type SafeEthTransaction =
  (typeof import('@safe-global/protocol-kit/dist/src/utils/transactions/SafeTransaction'))['default'];

interface SafeBundle {
  instance: Safe;
  chainId: bigint;
  address: string;
  version: SafeVersion;
}
