import { getApiErrorDetail } from '../../../helper/api';
import { ExclusivePool } from '../../../helper/exclusive';
import { isNotNull, isNull } from '../../../helper/null';
import { generateRandomId } from '../../../helper/random';
import { Duration } from '../../../model';
import { WalletError } from '../../error';
import {
  IWallet,
  SendTransactionParams,
  SignMessageParams,
  SignTypedDataParams,
  WithWalletOperation,
} from '../../interface';

import { WagmiActionMeta, WagmiWalletAction } from './action';
import { WagmiActionQueue } from './actionQueue';
import { WagmiWalletExecutor } from './executor';
import { WagmiWalletExecuteParams, WagmiWalletParams } from './param';
import { WagmiWalletVendor } from './vendor';

export * from './action';
export * from './executor';
export * from './param';

type ActionExecutable = () => Promise<string>;
type ActionPlacement = 'first' | 'last';
type InactiveChainPolicy = 'plan-switch' | 'plan-switch-with-error-now';

type WithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
type WithOperation<T extends WithWalletOperation> = WithRequired<T, 'operation'>;
type SignTypedDataOperationParams = WithOperation<SignTypedDataParams>;
type SendTransactionOperationParams = WithOperation<SendTransactionParams>;
type SignMessageOperationParams = WithOperation<SignMessageParams>;

/**
 * Wagmi wallet provider
 *
 * Includes action queuing functionality for correct work in environments
 * where it's important to bind each wallet operation initiation to an
 * active user action (like button click). All the wallet interactions
 * are handled via {@link WagmiWallet.execute} method.
 *
 * @category Wallet Impl
 */
export class WagmiWallet implements IWallet {
  private readonly operationPool: ExclusivePool;
  private readonly executingOperations: Set<string>;
  private activeOperation: string | undefined;

  private readonly pendingActions: WagmiActionQueue;
  private readonly actionExecutables: Map<string, ActionExecutable>;
  private readonly actionResults: Map<string, string>;

  private readonly actionCheckPeriod: Duration;
  private readonly maxActionChecks: number;
  private readonly performActionCheckPeriod: Duration;
  private readonly enableAddressChecksum: boolean;

  private readonly wagmiVendor: WagmiWalletVendor;

  public constructor(params: WagmiWalletParams) {
    this.operationPool = new ExclusivePool();
    this.executingOperations = new Set();

    this.pendingActions = new WagmiActionQueue();
    this.actionExecutables = new Map();
    this.actionResults = new Map();

    this.actionCheckPeriod = params.actionCheckPeriod ?? Duration.fromMilliseconds(200);
    this.maxActionChecks = params.maxActionChecks ?? Infinity;
    this.performActionCheckPeriod = params.performActionCheckPeriod ?? Duration.fromMilliseconds(100);
    this.enableAddressChecksum = params.enableAddressChecksum ?? false;

    this.wagmiVendor = new WagmiWalletVendor(
      params.config,
      params.chainSwitchCheckPeriod ?? Duration.fromMilliseconds(100),
      params.maxChainSwitchChecks ?? Infinity,
      params.connectingCheckPeriod ?? Duration.fromMilliseconds(100),
      params.maxConnectingChecks ?? Infinity,
      params.onVendorError,
    );
  }

  /**
   * Returns ID of an active operation that awaits action processing by related
   * Wagmi wallet executor. Non-`undefined` value indicates there is one or
   * multiple wallet actions for the executor that are pending to be performed
   * right now.
   *
   * @returns ID of an active operation, or `undefined` if there is none
   */
  public getActiveOperation(): string | undefined {
    return this.activeOperation;
  }

  public getExecutingOperations(): Promise<ReadonlySet<string>> {
    return Promise.resolve(this.executingOperations);
  }

  /**
   * Runs wallet-dependent SDK function specified by {@link WagmiWalletExecuteParams | params}
   * gracefully handling all the wallet actions and reporting progress via the params callbacks.
   *
   * @returns Wagmi wallet executor instance
   */
  public execute<T>(params: WagmiWalletExecuteParams<T>): WagmiWalletExecutor {
    const operation = generateRandomId();

    let targetDone = false;
    let activeAction: (() => Promise<void>) | undefined;
    let executingActionId: string | undefined;
    let terminated = false;
    let terminatedReason: string | undefined;

    const next = (): void => {
      void activeAction?.();
    };

    const cancel = (): void => {
      executingActionId = undefined;
    };

    const terminate = (reason?: string): void => {
      cancel();
      terminated = true;
      terminatedReason = reason;
    };

    const tryTerminate = (): void => {
      if (terminated) {
        throw new WalletError(terminatedReason ?? 'Wallet execution has been terminated');
      }
    };

    const waitStep = async (): Promise<void> => {
      tryTerminate();
      await this.performActionCheckPeriod.sleep();
      tryTerminate();
    };

    const performAction = async (action: WagmiWalletAction): Promise<void> => {
      if (this.actionResults.has(action.id)) {
        throw new WalletError('Wallet action has already been executed successfully');
      }

      const executable = this.actionExecutables.get(action.id);
      if (isNull(executable)) {
        throw new WalletError('Wallet action does not have executable associated with it');
      }

      let activeActionDone = false;

      const canceller = async (): Promise<never> => {
        while (executingActionId === action.id) {
          await waitStep();
        }
        throw new WalletError('Wallet action has been cancelled');
      };

      const executeWithCancel = async (): Promise<string> => {
        const result = await Promise.race([executable(), canceller()]);
        return result;
      };

      activeAction = async (): Promise<void> => {
        if (isNotNull(executingActionId)) {
          throw new WalletError('Other wallet action is being executed');
        }

        executingActionId = action.id;
        params.onActionStart?.(action);

        let result: string | undefined;
        try {
          result = await executeWithCancel();
        } catch (e) {
          const reason = this.getErrorReason(e);
          params.onActionFail?.(action, reason);
        }

        if (isNotNull(result)) {
          this.actionResults.set(action.id, result);
          this.actionExecutables.delete(action.id);
          this.pendingActions.consume();

          params.onActionEnd?.(action, result);
        }

        activeAction = undefined;
        executingActionId = undefined;
        activeActionDone = true;
      };

      params.onNextAction?.(action);

      while (!activeActionDone) {
        await waitStep();
      }
    };

    const performActionsStep = async (): Promise<void> => {
      let shouldWait = true;

      const pendingAction = this.pendingActions.peek();
      if (isNotNull(pendingAction)) {
        if (pendingAction.operation === operation) {
          await performAction(pendingAction);
          shouldWait = false;
        }
      }

      if (shouldWait) {
        await waitStep();
      }
    };

    const performActions = async (): Promise<void> => {
      while (!targetDone) {
        await performActionsStep();
      }
    };

    const performTarget = async (): Promise<T> => {
      try {
        return await params.target(operation);
      } finally {
        targetDone = true;
      }
    };

    const executeTarget = async (): Promise<void> => {
      this.executingOperations.add(operation);
      params.onTargetStart?.(operation);
      try {
        const [, result] = await Promise.all([performActions(), performTarget()]);
        params.onTargetEnd?.(operation, result);
      } catch (e) {
        const reason = this.getErrorReason(e);
        params.onTargetFail?.(operation, reason);
      }
      this.pendingActions.consumeOperation(operation);
      this.executingOperations.delete(operation);
    };
    void executeTarget();

    const executor: WagmiWalletExecutor = {
      next,
      cancel,
      terminate,
    };
    return executor;
  }

  /**
   * Checks if wallet is connected
   *
   * @returns `true` if wallet is connected, `false` otherwise
   */
  public async isConnected(): Promise<boolean> {
    const connected = await this.wagmiVendor.isConnected();
    return connected;
  }

  /**
   * Returns active chain ID of wallet
   *
   * @returns Active chain ID
   */
  public async getChainId(): Promise<string> {
    const chainId = await this.wagmiVendor.getActiveChainId();
    return chainId;
  }

  public async getAddress(): Promise<string> {
    let address = await this.wagmiVendor.getActiveAccountAddress();
    if (!this.enableAddressChecksum) {
      address = address.toLowerCase();
    }
    return address;
  }

  public async signTypedData(params: SignTypedDataParams): Promise<string> {
    this.assertOperation(params);
    const result = await this.performOperation(params, (...args) => this.signTypedDataCore(...args));
    return result;
  }

  public async sendTransaction(params: SendTransactionParams): Promise<string> {
    this.assertOperation(params);
    const result = await this.performOperation(params, (...args) => this.sendTransactionCore(...args));
    return result;
  }

  public async signMessage(params: SignMessageParams): Promise<string> {
    this.assertOperation(params);
    const result = await this.performOperation(params, (...args) => this.signMessageCore(...args));
    return result;
  }

  private assertOperation<T extends WithWalletOperation>(
    params: T | WithWalletOperation,
  ): asserts params is WithOperation<T> {
    if (isNull(params.operation)) {
      throw new WalletError(`Wallet requires 'operation' parameter to be passed to target call`);
    }
  }

  private async performOperation<T extends WithWalletOperation, P extends WithOperation<T>, R>(
    params: P,
    operationCore: (params: P) => Promise<R>,
  ): Promise<R> {
    const canceller = async (): Promise<never> => {
      while (this.executingOperations.has(params.operation ?? '')) {
        await this.performActionCheckPeriod.sleep();
      }
      throw new WalletError('Wallet operation has been cancelled');
    };

    const performWithCancel = async (): Promise<R> => {
      const result = await Promise.race([canceller(), operationCore(params)]);
      return result;
    };

    const result = await this.operationPool.execute(async () => {
      try {
        this.activeOperation = params.operation;
        return await performWithCancel();
      } finally {
        this.activeOperation = undefined;
      }
    });
    return result;
  }

  private async signTypedDataCore(params: SignTypedDataOperationParams): Promise<string> {
    if (isNotNull(params.chainId)) {
      await this.ensureChainActive(params.operation, params.tag, params.chainId, 'plan-switch');
    }

    const actionId = this.addSignTypedDataAction(params);

    const result = await this.waitActionCompletion(actionId);
    return result;
  }

  private async sendTransactionCore(params: SendTransactionOperationParams): Promise<string> {
    await this.ensureChainActive(params.operation, params.tag, params.chainId, 'plan-switch');

    const actionId = this.addSendTransactionAction(params);

    const result = await this.waitActionCompletion(actionId);
    return result;
  }

  private async signMessageCore(params: SignMessageOperationParams): Promise<string> {
    const actionId = this.addSignMessageAction(params);

    const result = await this.waitActionCompletion(actionId);
    return result;
  }

  private addAction(
    operation: string,
    executable: ActionExecutable,
    meta: WagmiActionMeta,
    placement: ActionPlacement,
  ): string {
    const id = generateRandomId();
    this.actionExecutables.set(id, executable);
    const action = new WagmiWalletAction(id, operation, meta);
    this.appendPendingAction(action, placement);
    return id;
  }

  private appendPendingAction(action: WagmiWalletAction, placement: ActionPlacement): void {
    switch (placement) {
      case 'first':
        this.pendingActions.addFirst(action);
        break;
      case 'last':
        this.pendingActions.addLast(action);
        break;
    }
  }

  private addSwitchChainAction(operation: string, tag: string, chainId: string, activeChainId: string): void {
    const executable: ActionExecutable = async () => {
      const [chainActive] = await this.checkChainActive(chainId);
      if (chainActive) {
        return '';
      }

      await this.wagmiVendor.switchChain(chainId);
      return '';
    };

    const meta: WagmiActionMeta = {
      type: 'switch-chain',
      params: [tag, chainId, activeChainId],
    };

    this.addAction(operation, executable, meta, 'first');
  }

  private addSignTypedDataAction(params: SignTypedDataOperationParams): string {
    const executable: ActionExecutable = async () => {
      await this.ensureReadyForOperation(params.operation, params.tag, params.chainId, params.from);

      const signature = await this.wagmiVendor.signTypedData(params);
      return signature;
    };

    const meta: WagmiActionMeta = {
      type: 'sign-typed-data',
      params: [params.tag, params.chainId ?? '', params.from, params.data],
    };

    return this.addAction(params.operation, executable, meta, 'last');
  }

  private addSendTransactionAction(params: SendTransactionOperationParams): string {
    const executable: ActionExecutable = async () => {
      await this.ensureReadyForOperation(params.operation, params.tag, params.chainId, params.from);

      const txid = await this.wagmiVendor.sendTransaction(params);
      return txid;
    };

    const meta: WagmiActionMeta = {
      type: 'send-transaction',
      params: [params.tag, params.chainId, params.from, params.to, params.value ?? '', params.data ?? ''],
    };

    return this.addAction(params.operation, executable, meta, 'last');
  }

  private addSignMessageAction(params: SignMessageOperationParams): string {
    const executable: ActionExecutable = async () => {
      await this.ensureReadyForOperation(params.operation, params.tag, undefined, params.from);

      const signature = await this.wagmiVendor.signMessage(params);
      return signature;
    };

    const meta: WagmiActionMeta = {
      type: 'sign-message',
      params: [params.tag, params.from, params.message],
    };

    return this.addAction(params.operation, executable, meta, 'last');
  }

  private async waitActionCompletion(actionId: string): Promise<string> {
    for (let i = 0; i < this.maxActionChecks; i++) {
      const result = this.actionResults.get(actionId);
      if (isNotNull(result)) {
        return result;
      }

      await this.actionCheckPeriod.sleep();
    }

    throw new WalletError('Wallet action exceeded time limit');
  }

  private async ensureReadyForOperation(
    operation: string,
    tag: string,
    chainId: string | undefined,
    fromAddress: string,
  ): Promise<void> {
    await this.ensureConnected();
    if (isNotNull(chainId)) {
      await this.ensureChainActive(operation, tag, chainId, 'plan-switch-with-error-now');
    }
    await this.ensureAccountActive(fromAddress);
  }

  private async ensureConnected(): Promise<void> {
    const connected = await this.wagmiVendor.isConnected();
    if (connected) {
      return;
    }

    throw new WalletError('Wallet should be connected');
  }

  private async ensureChainActive(
    operation: string,
    tag: string,
    chainId: string,
    inactivePolicy: InactiveChainPolicy,
  ): Promise<void> {
    const [chainActive, activeChainId] = await this.checkChainActive(chainId);
    if (chainActive) {
      return;
    }

    const planSwitch = (): void => {
      this.addSwitchChainAction(operation, tag, chainId, activeChainId);
    };

    switch (inactivePolicy) {
      case 'plan-switch':
        planSwitch();
        break;
      case 'plan-switch-with-error-now':
        planSwitch();
        throw new WalletError(`Wallet chain should be switched from ${activeChainId} to ${chainId}`);
    }
  }

  private async checkChainActive(chainId: string): Promise<[chainActive: boolean, activeChainId: string]> {
    const activeChainId = await this.wagmiVendor.getActiveChainId();
    const chainActive = activeChainId === chainId;
    return [chainActive, activeChainId];
  }

  private async ensureAccountActive(address: string): Promise<void> {
    const [accountActive, activeAddress] = await this.checkAccountActive(address);
    if (accountActive) {
      return;
    }

    throw new WalletError(`Wallet account should be switched from ${activeAddress} to ${address}`);
  }

  private async checkAccountActive(address: string): Promise<[accountActive: boolean, activeAddress: string]> {
    const activeAddress = await this.wagmiVendor.getActiveAccountAddress();
    const accountActive = activeAddress.toLowerCase() === address.toLowerCase();
    return [accountActive, activeAddress];
  }

  private getErrorReason(error: unknown): string {
    const detail = getApiErrorDetail(error);
    if (detail) {
      return detail;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return `${error as string}`;
  }
}
