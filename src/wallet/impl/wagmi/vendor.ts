import type { SendTransactionParameters, SignMessageParameters, SignTypedDataParameters } from '@wagmi/core';
import type { Address } from 'viem';
import type { Config } from 'wagmi';

import { Duration } from '../../..';
import { isNull } from '../../../helper/null';
import { WalletError } from '../../error';
import { SendTransactionParams, SignMessageParams, SignTypedDataParams } from '../../interface';
import {
  normalizeAddress,
  normalizeChainId,
  normalizeData,
  normalizeTypedData,
  normalizeValue,
} from '../viem/normalization';

export type WagmiSendTransactionParams = Pick<SendTransactionParams, 'chainId' | 'from' | 'to' | 'value' | 'data'>;
export type WagmiSignTypedDataParams = Pick<SignTypedDataParams, 'from' | 'data'>;
export type WagmiSignMessageParams = Pick<SignMessageParams, 'from' | 'message'>;

export class WagmiWalletVendor {
  private readonly config: Config;
  private readonly chainSwitchCheckPeriod: Duration;
  private readonly maxChainSwitchChecks: number;
  private readonly connectingCheckPeriod: Duration;
  private readonly maxConnectingChecks: number;
  private readonly onVendorError: ((error: unknown) => void) | undefined;

  public constructor(
    config: Config,
    chainSwitchCheckPeriod: Duration,
    maxChainSwitchChecks: number,
    connectingCheckPeriod: Duration,
    maxConnectingChecks: number,
    onVendorError: ((error: unknown) => void) | undefined,
  ) {
    this.config = config;
    this.chainSwitchCheckPeriod = chainSwitchCheckPeriod;
    this.maxChainSwitchChecks = maxChainSwitchChecks;
    this.connectingCheckPeriod = connectingCheckPeriod;
    this.maxConnectingChecks = maxConnectingChecks;
    this.onVendorError = onVendorError;
  }

  public async isConnected(): Promise<boolean> {
    await this.waitConnectingComplete();

    const wagmiCore = await import('@wagmi/core');

    const account = wagmiCore.getAccount(this.config);
    return account.isConnected;
  }

  public async getActiveAccountAddress(): Promise<string> {
    const wagmiCore = await import('@wagmi/core');

    const account = wagmiCore.getAccount(this.config);
    const address = account.address;
    if (isNull(address)) {
      throw new WalletError('Wallet provider has no account address available');
    }

    return address;
  }

  public async getActiveChainId(): Promise<string> {
    const wagmiCore = await import('@wagmi/core');

    const account = wagmiCore.getAccount(this.config);
    const chainId = account.chainId;
    if (isNull(chainId)) {
      throw new WalletError('Wallet provider has no active network chain available');
    }

    return chainId.toString();
  }

  public async switchChain(chainId: string): Promise<void> {
    const wagmiCore = await import('@wagmi/core');

    try {
      await wagmiCore.switchChain(this.config, { chainId: Number(chainId) });
    } catch (e) {
      this.onVendorError?.(e);
      const activeChainId = await this.getActiveChainId();
      throw new WalletError(
        `Chain switch from ${activeChainId} to ${chainId} failed. Try again or switch manually in the wallet`,
      );
    }

    await this.waitChainSwitch(chainId);
  }

  public async signTypedData(params: WagmiSignTypedDataParams): Promise<string> {
    const wagmiCore = await import('@wagmi/core');

    const args = await this.signTypedDataParamsToArgs(params);
    try {
      const signature = await wagmiCore.signTypedData(this.config, args);
      return signature;
    } catch (e) {
      this.onVendorError?.(e);
      throw new WalletError('Sign typed data operation was rejected in the wallet or failed');
    }
  }

  public async sendTransaction(params: WagmiSendTransactionParams): Promise<string> {
    const wagmiCore = await import('@wagmi/core');

    const args = await this.sendTransactionParamsToArgs(params);
    try {
      const txid = await wagmiCore.sendTransaction(this.config, args);
      return txid;
    } catch (e) {
      this.onVendorError?.(e);
      throw new WalletError('Send transaction operation was rejected in the wallet or failed');
    }
  }

  public async signMessage(params: WagmiSignMessageParams): Promise<string> {
    const wagmiCore = await import('@wagmi/core');

    const args = await this.signMessageParamsToArgs(params);
    try {
      const signature = await wagmiCore.signMessage(this.config, args);
      return signature;
    } catch (e) {
      this.onVendorError?.(e);
      throw new WalletError('Sign message operation was rejected in the wallet or failed');
    }
  }

  private async signTypedDataParamsToArgs(params: WagmiSignTypedDataParams): Promise<SignTypedDataParameters> {
    const data = normalizeTypedData(params.data);
    const args: SignTypedDataParameters = {
      account: await this.normalizeAccountAddress(params.from),
      domain: data.domain,
      message: data.message,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      types: data.types as any,
      primaryType: data.primaryType,
    };
    return args;
  }

  private async sendTransactionParamsToArgs(params: WagmiSendTransactionParams): Promise<SendTransactionParameters> {
    const args: SendTransactionParameters = {
      chainId: normalizeChainId(params.chainId),
      account: await this.normalizeAccountAddress(params.from),
      to: normalizeAddress(params.to),
      value: normalizeValue(params.value),
      data: normalizeData(params.data),
    };
    return args;
  }

  private async signMessageParamsToArgs(params: WagmiSignMessageParams): Promise<SignMessageParameters> {
    const args: SignMessageParameters = {
      account: await this.normalizeAccountAddress(params.from),
      message: params.message,
    };
    return args;
  }

  private async waitChainSwitch(chainId: string): Promise<void> {
    for (let i = 0; i < this.maxChainSwitchChecks; i++) {
      const activeChainId = await this.getActiveChainId();
      if (activeChainId === chainId) {
        return;
      }

      await this.chainSwitchCheckPeriod.sleep();
    }

    throw new WalletError('Wallet chain switch exceeded time limit');
  }

  private async waitConnectingComplete(): Promise<void> {
    for (let i = 0; i < this.maxConnectingChecks; i++) {
      const connecting = await this.isConnecting();
      if (!connecting) {
        return;
      }

      await this.connectingCheckPeriod.sleep();
    }

    throw new WalletError('Wallet connecting exceeded time limit');
  }

  private async isConnecting(): Promise<boolean> {
    const wagmiCore = await import('@wagmi/core');

    const account = wagmiCore.getAccount(this.config);
    return account.isConnecting;
  }

  private async normalizeAccountAddress(address: string): Promise<Address> {
    const viem = await import('viem');

    // Account addresses must be checksum variant due to the way Wagmi maps them for connectors
    const accountAddress = viem.getAddress(address);
    return accountAddress;
  }
}
