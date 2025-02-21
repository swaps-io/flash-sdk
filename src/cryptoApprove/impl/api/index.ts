import { setRequestProjectId } from '../../../api/client/axios/core/id';
import { setAxiosInstanceMainV0 } from '../../../api/client/axios/main-v0';
import {
  GetAllowanceMainV0Params,
  GetApproveMainV0Params,
  GetPermitDataMainV0Params,
  GetPermitTransactionMainV0Params,
  PermitDataMainV0,
  getAllowanceMainV0,
  getApproveMainV0,
  getPermitDataMainV0,
  getPermitTransactionMainV0,
} from '../../../api/gen/main-v0';
import { IChainProvider } from '../../../chainProvider';
import { Dynamic, resolveDynamic } from '../../../helper/dynamic';
import { isNotNull, isNull } from '../../../helper/null';
import { isNativeCrypto } from '../../../helper/public';
import { IWalletLike, isSmartWallet } from '../../../helper/wallet';
import {
  Amount,
  ApproveActionTarget,
  ApproveAmountPreference,
  ApproveProviderPreference,
  CryptoApprove,
  CryptoApproveAction,
  CryptoApproveRequest,
  CryptoData,
  Duration,
  FiniteApproveAmountPreference,
  IncompleteCryptoApprove,
  Instant,
  extractData,
  isFiniteApproveAmountPreference,
} from '../../../model';
import { SmartApproveData } from '../../../model/cryptoApprove/private';
import { SmartBatchTransactionParams } from '../../../smartWallet';
import { SendTransactionParams, SignTypedDataParams } from '../../../wallet';
import { CryptoApproveError } from '../../error';
import { ICryptoApproveProvider, PrepareCryptoApproveParams } from '../../interface';
import { PermitCache, PermitData } from '../../permit';
import { PERMIT2_ADDRESS } from '../../permit2';

import { decodeErc20Allowance, encodeErc20Allowance, encodeErc20Approve } from './erc20';
import { MULTI_SEND_CONTACT_ADDRESS, encodeMultiSend, encodeMultiSendTransaction } from './multiSend';
import {
  AllowanceSource,
  ApiCryptoApproveProviderParams,
  ApproveFinalizationMode,
  OnApproveTxidReceived,
} from './param';
import { encodeDeposit } from './wrap';

export type * from './param';

interface AllowanceInfo {
  allowance: Amount;
  allowanceP2?: Amount;
  allowanceUpdatable: boolean;
}

type ApproveVerdict =
  | 'no-action-needed'
  | 'should-approve-permit2'
  | 'should-provide-permit'
  | 'should-provide-permit2'
  | 'should-provide-smart-approve'
  | 'should-provide-smart-native-approve'
  | 'should-provide-approve';

const UNREACHABLE_TIME = Instant.fromEpochDuration(Duration.fromDays(10_000_000));

/**
 * Provider of crypto allowance using Flash Main API
 *
 * @category Crypto Approve Impl
 */
export class ApiCryptoApproveProvider implements ICryptoApproveProvider {
  private readonly wallet: Dynamic<IWalletLike>;
  private readonly providerPreference: Dynamic<ApproveProviderPreference>;
  private readonly amountPreference: Dynamic<ApproveAmountPreference>;
  private readonly allowanceSources: readonly AllowanceSource[];
  private readonly safePermitTtl: Duration;
  private readonly approveCheckPeriod: Duration;
  private readonly approveFinalizationMode: ApproveFinalizationMode;
  private readonly disableApproveFinalizationOperationCheck: boolean;
  private readonly onApproveTxidReceived: OnApproveTxidReceived | undefined;
  private readonly permitCache: PermitCache | undefined;
  private sendApprovePromise: Promise<void> | undefined;

  public constructor(params: ApiCryptoApproveProviderParams) {
    const {
      projectId,
      wallet,
      mainClient = 'https://api.prod.swaps.io',
      providerPreference = 'permit-permit2-approve',
      amountPreference = 'exact',
      allowanceSources = ['api'],
      safePermitTtl = Duration.fromMinutes(10),
      approveCheckPeriod = Duration.fromSeconds(5),
      disablePermitCache = false,
      approveFinalizationMode = 'wait-after-wallet-tx',
      disableApproveFinalizationOperationCheck = false,
      onApproveTxidReceived,
    } = params;

    setRequestProjectId(projectId);
    setAxiosInstanceMainV0(mainClient);

    this.wallet = wallet;
    this.providerPreference = providerPreference;
    this.amountPreference = amountPreference;
    this.allowanceSources = allowanceSources;
    this.safePermitTtl = safePermitTtl;
    this.approveCheckPeriod = approveCheckPeriod;
    this.approveFinalizationMode = approveFinalizationMode;
    this.disableApproveFinalizationOperationCheck = disableApproveFinalizationOperationCheck;
    this.onApproveTxidReceived = onApproveTxidReceived;
    if (!disablePermitCache) {
      this.permitCache = new PermitCache();
    }
  }

  public async prepareCryptoApprove(params: PrepareCryptoApproveParams): Promise<CryptoApproveRequest> {
    if (params.amount.is('less-or-equal', Amount.zero())) {
      const cryptoApproveRequest = new CryptoApproveRequest([]);
      return cryptoApproveRequest;
    }

    const cryptoData = extractData(params.crypto);
    const wallet = await resolveDynamic(this.wallet);

    let owner: string;
    if (isSmartWallet(wallet)) {
      owner = await wallet.getAddress({ chainId: cryptoData.chainId });
    } else {
      owner = await wallet.getAddress();
    }

    const shouldWrapNativeCrypto = isNativeCrypto(cryptoData) && isNotNull(params.nativeWrapTarget);

    const allowanceInfo = await this.getAllowance(cryptoData, owner, params.spender);
    const approveVerdict = await this.checkAllowance(cryptoData, params.amount, allowanceInfo, shouldWrapNativeCrypto);
    const canReusePermit = await this.checkCanReusePermit(cryptoData, params.amount, owner, approveVerdict);
    const revokeAllowance = this.checkShouldRevokeAllowance(allowanceInfo);

    let actions: CryptoApproveAction[] = [];
    if (!canReusePermit) {
      actions = await this.collectApproveActions(
        params.operation,
        cryptoData,
        params.amount,
        owner,
        params.spender,
        approveVerdict,
        revokeAllowance,
        allowanceInfo,
      );
    }

    const cryptoApproveRequest = new CryptoApproveRequest(actions);
    return cryptoApproveRequest;
  }

  public consumePermit(): void {
    this.permitCache?.invalidatePermit();
  }

  public async approveCrypto(
    cryptoApproveRequest: CryptoApproveRequest,
    incompleteCryptoApprove: IncompleteCryptoApprove | undefined,
  ): Promise<IncompleteCryptoApprove | CryptoApprove> {
    const actionIndex = incompleteCryptoApprove?.completedActions ?? 0;
    if (actionIndex >= cryptoApproveRequest.actions.length) {
      const cryptoApprove = new CryptoApprove(undefined);
      return cryptoApprove;
    }

    const action = cryptoApproveRequest.actions[actionIndex];
    const permitTransaction = await this.performApproveAction(action);

    const completedActions = actionIndex + 1;
    const approveIncomplete = completedActions < cryptoApproveRequest.actions.length;
    if (approveIncomplete) {
      const incompleteCryptoApprove = new IncompleteCryptoApprove(completedActions);
      return incompleteCryptoApprove;
    }

    const cryptoApprove = new CryptoApprove(permitTransaction);
    return cryptoApprove;
  }

  private async shouldWrapNativeCrypto(crypto: CryptoData, nativeWrapTarget: CryptoData | undefined): Promise<boolean> {
    const wallet = await resolveDynamic(this.wallet);
    const shouldWrap = isSmartWallet(wallet) && isNativeCrypto(crypto) && isNotNull(nativeWrapTarget);
    return shouldWrap;
  }

  private async getAllowanceCrypto(crypto: CryptoData, nativeWrapTarget: CryptoData | undefined): Promise<CryptoData> {
    const shouldWrap = await this.shouldWrapNativeCrypto(crypto, nativeWrapTarget);
    return shouldWrap && isNotNull(nativeWrapTarget) ? nativeWrapTarget : crypto;
  }

  private async getAllowance(crypto: CryptoData, owner: string, spender: string): Promise<AllowanceInfo> {
    const obtainSourceAllowance = async (source: AllowanceSource): Promise<AllowanceInfo | undefined> => {
      try {
        switch (source) {
          case 'api':
            return await this.getAllowanceViaApi(crypto, owner, spender);
          default:
            return await this.getAllowanceViaRpc(crypto, owner, spender, source.chainProvider);
        }
      } catch {
        // Individual source errors are replaced with `undefined` as `no-data` result.
        // Common error is thrown below if none of the sources provided data
        return undefined;
      }
    };

    const allowanceInfos = await Promise.all(this.allowanceSources.map(obtainSourceAllowance));
    for (const allowanceInfo of allowanceInfos) {
      if (isNotNull(allowanceInfo)) {
        return allowanceInfo;
      }
    }
    throw new CryptoApproveError(`No allowance info provided by ${this.allowanceSources.length} data sources`);
  }

  private async getAllowanceViaApi(crypto: CryptoData, owner: string, spender: string): Promise<AllowanceInfo> {
    const getAllowanceParams: GetAllowanceMainV0Params = {
      chain_id: crypto.chainId,
      token_address: crypto.address,
      actor_address: owner,
      contract_address: spender,
    };
    const { data: allowanceInfo } = await getAllowanceMainV0(getAllowanceParams);

    const mapAmount = (allowance: string): Amount => {
      return new Amount({ value: allowance, decimals: crypto.decimals });
    };

    return {
      allowance: mapAmount(allowanceInfo.allowance),
      allowanceP2: allowanceInfo.allowance_p2 ? mapAmount(allowanceInfo.allowance_p2) : undefined,
      allowanceUpdatable: allowanceInfo.allowance_updatable ?? false,
    };
  }

  private async getAllowanceViaRpc(
    crypto: CryptoData,
    owner: string,
    spender: string,
    chainProvider: IChainProvider,
  ): Promise<AllowanceInfo> {
    const allowanceData = await encodeErc20Allowance(owner, spender);

    const callResultData = await chainProvider.call({
      chainId: crypto.chainId,
      to: crypto.address,
      data: allowanceData,
    });

    const mapAmount = (allowance: string): Amount => {
      return new Amount({ value: allowance, decimals: crypto.decimals });
    };

    const allowance = await decodeErc20Allowance(callResultData);
    return {
      allowance: mapAmount(allowance),
      allowanceP2: undefined,
      allowanceUpdatable: false, // Unknown, use safer option
    };
  }

  private async checkAllowance(
    crypto: CryptoData,
    amount: Amount,
    allowanceInfo: AllowanceInfo,
    shouldWrapNativeCrypto?: boolean,
  ): Promise<ApproveVerdict> {
    const wallet = await resolveDynamic(this.wallet);
    if (isSmartWallet(wallet) && shouldWrapNativeCrypto) {
      return 'should-provide-smart-native-approve';
    }

    const checkSufficient = (allowance: Amount): boolean => {
      const sufficient = allowance.is('greater-or-equal', amount);
      return sufficient;
    };

    const sufficientXSwap = checkSufficient(allowanceInfo.allowance);
    if (sufficientXSwap) {
      return 'no-action-needed';
    }

    if (isSmartWallet(wallet)) {
      return 'should-provide-smart-approve';
    }

    const providerPreference = await resolveDynamic(this.providerPreference);
    if (providerPreference === 'approve') {
      return 'should-provide-approve';
    }

    if (crypto.permit) {
      return 'should-provide-permit';
    }

    if (providerPreference === 'permit-approve') {
      return 'should-provide-approve';
    }

    // Check if chain doesn't support Permit2
    if (isNull(allowanceInfo.allowanceP2)) {
      return 'should-provide-approve';
    }

    const sufficientPermit2 = checkSufficient(allowanceInfo.allowanceP2);
    if (!sufficientPermit2) {
      return 'should-approve-permit2';
    }

    return 'should-provide-permit2';
  }

  private async checkCanReusePermit(
    crypto: CryptoData,
    amount: Amount,
    owner: string,
    approveVerdict: ApproveVerdict,
  ): Promise<boolean> {
    const permit = this.permitCache?.getPermit();
    if (isNull(permit)) {
      return false;
    }

    if (approveVerdict !== 'should-provide-permit' && approveVerdict !== 'should-provide-permit2') {
      return false;
    }

    const exceedsMaxAmount = (): boolean => {
      if (isNull(permit.maxAmount)) {
        return false;
      }

      const permitMaxAmount = new Amount({ value: permit.maxAmount, decimals: crypto.decimals });
      if (amount.is('less-or-equal', permitMaxAmount)) {
        return false;
      }

      return true;
    };

    const expired = (): boolean => {
      const now = Instant.now();
      const expiresAt = new Instant(permit.expiresAt);
      const safeExpiresAt = expiresAt.sub(this.safePermitTtl);
      return now.is('greater', safeExpiresAt);
    };

    const mismatchPreference = async (): Promise<boolean> => {
      const infinite = isNull(permit.maxAmount);
      const preference = await resolveDynamic(this.amountPreference);
      if (isFiniteApproveAmountPreference(preference)) {
        if (infinite) {
          return true;
        }

        const finiteValue = this.getFiniteApproveValue(crypto, amount, preference);
        return finiteValue !== permit.maxAmount;
      }

      switch (preference) {
        case 'exact':
          return infinite;
        case 'infinite':
          return !infinite;
      }
    };

    const canReuse =
      permit.actorAddress === owner &&
      permit.chainId === crypto.chainId &&
      permit.tokenAddress === crypto.address &&
      !exceedsMaxAmount() &&
      !expired() &&
      !(await mismatchPreference());
    return canReuse;
  }

  private checkShouldRevokeAllowance(allowanceInfo: AllowanceInfo): boolean {
    const hasAllowance = allowanceInfo.allowance.is('greater', Amount.zero());
    if (!hasAllowance) {
      return false;
    }

    const shouldRevoke = !allowanceInfo.allowanceUpdatable;
    return shouldRevoke;
  }

  private async collectApproveActions(
    operation: string | undefined,
    crypto: CryptoData,
    amount: Amount,
    owner: string,
    spender: string,
    approveVerdict: ApproveVerdict,
    revoke: boolean,
    allowanceInfo: AllowanceInfo,
  ): Promise<CryptoApproveAction[]> {
    switch (approveVerdict) {
      case 'no-action-needed':
        return [];

      case 'should-approve-permit2':
        // Infinite amount is provided for the Permit2 contract by-design (it has its own amount permit logic add-on)
        return [
          await this.prepareApproveAction(
            operation,
            'permit2',
            PERMIT2_ADDRESS,
            undefined, // Infinite amount for Permit2
            crypto,
            owner,
          ),
          this.prepareWaitAction(operation, 'permit2', crypto, amount, owner, PERMIT2_ADDRESS),
          await this.preparePermitAction(
            operation,
            'permit2',
            spender,
            await this.getApproveValue(crypto, amount),
            crypto,
            owner,
          ),
        ];

      case 'should-provide-permit':
        return [
          await this.preparePermitAction(
            operation,
            'main',
            spender,
            await this.getApproveValue(crypto, amount),
            crypto,
            owner,
          ),
        ];

      case 'should-provide-permit2':
        return [
          await this.preparePermitAction(
            operation,
            'permit2',
            spender,
            await this.getApproveValue(crypto, amount),
            crypto,
            owner,
          ),
        ];

      case 'should-provide-smart-approve':
        return [
          await this.prepareSmartApproveAction(
            operation,
            spender,
            await this.getApproveValue(crypto, amount),
            crypto,
            owner,
            revoke,
          ),
        ];

      case 'should-provide-smart-native-approve':
        return [
          await this.prepareSmartNativeApproveAction(operation, spender, amount, crypto, owner, revoke, allowanceInfo),
        ];

      case 'should-provide-approve':
        return [
          ...(revoke
            ? [
                await this.prepareApproveAction(
                  operation,
                  'main',
                  spender,
                  '0', // Revoke by approving 0 value
                  crypto,
                  owner,
                ),
              ]
            : []),
          await this.prepareApproveAction(
            operation,
            'main',
            spender,
            await this.getApproveValue(crypto, amount),
            crypto,
            owner,
          ),
          this.prepareWaitAction(operation, 'main', crypto, amount, owner, spender),
        ];

      default: // Ensure all approve verdict cases covered
        return approveVerdict satisfies never;
    }
  }

  private async getApproveValue(crypto: CryptoData, amount: Amount): Promise<string | undefined> {
    const preference = await resolveDynamic(this.amountPreference);
    if (isFiniteApproveAmountPreference(preference)) {
      return this.getFiniteApproveValue(crypto, amount, preference);
    }

    switch (preference) {
      case 'infinite':
        return undefined;
      case 'exact':
        return amount.normalizeValue(crypto.decimals);
    }
  }

  private getFiniteApproveValue(crypto: CryptoData, amount: Amount, preference: FiniteApproveAmountPreference): string {
    let finiteAmount = preference.finite;
    if (amount.is('greater', finiteAmount) && !preference.strict) {
      finiteAmount = amount;
    }

    if (finiteAmount.is('less', amount)) {
      throw new CryptoApproveError(
        `Strict finite approve amount preference insufficiency: ` +
          `${finiteAmount.normalizeValue(crypto.decimals)} provided, ` +
          `but at least ${amount.normalizeValue(crypto.decimals)} required`,
      );
    }

    return finiteAmount.normalizeValue(crypto.decimals);
  }

  private async prepareApproveAction(
    operation: string | undefined,
    actionTarget: ApproveActionTarget,
    spender: string,
    amount: string | undefined,
    crypto: CryptoData,
    owner: string,
  ): Promise<CryptoApproveAction> {
    const approveTxParams: GetApproveMainV0Params = {
      chain_id: crypto.chainId,
      token_address: crypto.address,
      actor_address: owner,
      p2_contract: actionTarget === 'permit2',
      amount: isNotNull(amount) ? amount : undefined,
      contract_address: spender,
    };

    const { data: approveTx } = await getApproveMainV0(approveTxParams);

    const approveParams: SendTransactionParams = {
      operation,
      tag: 'approve-crypto',
      chainId: approveTx.chain_id,
      from: approveTx.from_address,
      to: approveTx.to_address,
      data: approveTx.data,
      value: approveTx.value ?? undefined,
    };
    const approveAction: CryptoApproveAction = {
      type: 'send-approve-transaction',
      actionTarget,
      params: approveParams,
    };
    return approveAction;
  }

  private async preparePermitAction(
    operation: string | undefined,
    actionTarget: ApproveActionTarget,
    spender: string,
    amount: string | undefined,
    crypto: CryptoData,
    owner: string,
  ): Promise<CryptoApproveAction> {
    const permitDataParams: GetPermitDataMainV0Params = {
      chain_id: crypto.chainId,
      token_address: crypto.address,
      actor_address: owner,
      mode: actionTarget === 'main' ? 'permit' : 'permit2',
      amount: isNotNull(amount) ? amount : undefined,
      contract_address: spender,
    };

    const { data: permitData } = await getPermitDataMainV0(permitDataParams);

    const signPermitParams: SignTypedDataParams = {
      operation,
      tag: 'approve-crypto',
      chainId: permitData.chain_id,
      from: permitData.actor_address,
      data: permitData.permit_data,
    };
    const permitAction: CryptoApproveAction = {
      type: 'sign-permit-typed-data',
      actionTarget,
      params: signPermitParams,
      permitData,
    };
    return permitAction;
  }

  private async prepareSmartApproveAction(
    operation: string | undefined,
    spender: string,
    amount: string | undefined,
    crypto: CryptoData,
    owner: string,
    revoke: boolean,
  ): Promise<CryptoApproveAction> {
    const wallet = await resolveDynamic(this.wallet);
    if (!isSmartWallet(wallet)) {
      throw new CryptoApproveError('Smart wallet must be configured for smart approve action');
    }

    const chainId = crypto.chainId;
    const actorAddress = owner;
    const tokenAddress = crypto.address;
    const smartWalletAddress = await wallet.getAddress({ chainId });

    const tokenApproveData = await encodeErc20Approve(spender, amount);

    let pre: SmartBatchTransactionParams | undefined;
    if (revoke) {
      const tokenRevokeData = await encodeErc20Approve(spender, '0'); // Revoke by approving 0 value
      pre = {
        to: tokenAddress,
        data: tokenRevokeData,
      };
    }

    const signSmartApproveParams = await wallet.getSignTransactionParams({
      operation,
      tag: 'approve-crypto',
      chainId,
      from: smartWalletAddress,
      to: tokenAddress,
      data: tokenApproveData,
      pre,
    });
    const smartApproveAction: CryptoApproveAction = {
      type: 'sign-smart-approve-typed-data',
      params: signSmartApproveParams,
      smartData: {
        actorAddress,
        tokenAddress,
        amount,
        native: false,
      },
    };
    return smartApproveAction;
  }

  private async prepareSmartNativeApproveAction(
    operation: string | undefined,
    spender: string,
    amount: Amount,
    crypto: CryptoData,
    owner: string,
    revoke: boolean,
    allowanceInfo: AllowanceInfo,
  ): Promise<CryptoApproveAction> {
    const wallet = await resolveDynamic(this.wallet);
    if (!isSmartWallet(wallet)) {
      throw new CryptoApproveError('Smart wallet must be configured for smart approve action');
    }

    if (!crypto.isNativeWrap) {
      throw new CryptoApproveError('Smart wallet approve action crypto is not native wrap');
    }

    const chainId = crypto.chainId;
    const actorAddress = owner;
    const tokenAddress = crypto.address;
    const smartWalletAddress = await wallet.getAddress({ chainId });

    const approveAmount = await this.getApproveValue(crypto, amount);
    const needApprove = allowanceInfo.allowance.is('less', amount);
    const amountStr = amount.normalizeValue(crypto.decimals);

    const wrapCalldata = await encodeDeposit();

    const multiSendCalls = [await encodeMultiSendTransaction(crypto.address, wrapCalldata, BigInt(amountStr))];

    if (needApprove && isNotNull(approveAmount)) {
      const approveCalldata = await encodeErc20Approve(spender, approveAmount);
      multiSendCalls.push(await encodeMultiSendTransaction(crypto.address, approveCalldata, 0n));
    }

    const multiSendCalldata = await encodeMultiSend(multiSendCalls);

    let pre: SmartBatchTransactionParams | undefined;
    if (revoke) {
      const tokenRevokeData = await encodeErc20Approve(spender, '0'); // Revoke by approving 0 value
      pre = {
        to: tokenAddress,
        data: tokenRevokeData,
      };
    }

    const signSmartApproveParams = await wallet.getSignTransactionParams({
      operation,
      pre,
      chainId,
      tag: 'approve-crypto',
      from: smartWalletAddress,
      to: MULTI_SEND_CONTACT_ADDRESS,
      data: multiSendCalldata,
      smartWalletDelegateCall: true,
    });
    const smartApproveAction: CryptoApproveAction = {
      type: 'sign-smart-approve-typed-data',
      params: signSmartApproveParams,
      smartData: {
        actorAddress,
        tokenAddress,
        amount: amountStr,
        native: true,
      },
    };
    return smartApproveAction;
  }

  private prepareWaitAction(
    operation: string | undefined,
    actionTarget: ApproveActionTarget,
    crypto: CryptoData,
    amount: Amount,
    owner: string,
    spender: string,
  ): CryptoApproveAction {
    const waitAction: CryptoApproveAction = {
      type: 'wait-approve-finalization',
      operation,
      actionTarget,
      crypto,
      amount,
      owner,
      spender,
    };
    return waitAction;
  }

  private async performApproveAction(action: CryptoApproveAction): Promise<string | undefined> {
    switch (action.type) {
      case 'sign-permit-typed-data':
        return await this.performSignPermitTypedData(action.params, action.permitData);
      case 'sign-smart-approve-typed-data':
        return await this.performSignSmartApproveTypedData(action.params, action.smartData);
      case 'send-approve-transaction':
        return await this.performSendApproveTransaction(action.params);
      case 'wait-approve-finalization':
        return await this.performWaitApproveFinalization(
          action.operation,
          action.crypto,
          action.amount,
          action.owner,
          action.spender,
        );
      default: // Ensure all action type cases covered
        return action satisfies never;
    }
  }

  private async performSignPermitTypedData(
    params: SignTypedDataParams,
    permitData: PermitDataMainV0,
  ): Promise<string | undefined> {
    const wallet = await resolveDynamic(this.wallet);
    if (isSmartWallet(wallet)) {
      throw new CryptoApproveError('Unexpected smart wallet for sign permit typed data');
    }

    const permitSignature = await wallet.signTypedData(params);

    const permitTransactionParams: GetPermitTransactionMainV0Params = {
      chain_id: permitData.chain_id,
      token_address: permitData.token_address,
      actor_address: permitData.actor_address,
      amount: isNotNull(permitData.amount) ? permitData.amount : undefined,
      deadline: permitData.deadline,
      mode: permitData.mode,
      permit_signature: permitSignature,
    };

    const { data: permitTx } = await getPermitTransactionMainV0(permitTransactionParams);

    const permit: PermitData = {
      type: 'default',
      transaction: permitTx.transaction,
      expiresAt: Instant.fromEpochDuration(Duration.fromSeconds(permitData.deadline)).data,
      chainId: permitData.chain_id,
      tokenAddress: permitData.token_address,
      actorAddress: permitData.actor_address,
      maxAmount: permitData.amount ?? undefined,
    };
    this.permitCache?.storePermit(permit);
    return permit.transaction;
  }

  private async performSignSmartApproveTypedData(
    params: SignTypedDataParams,
    smartData: SmartApproveData,
  ): Promise<string | undefined> {
    const chainId = params.chainId;
    if (isNull(chainId)) {
      throw new CryptoApproveError('Chain ID must be set for sign smart approve typed data');
    }

    const wallet = await resolveDynamic(this.wallet);
    if (!isSmartWallet(wallet)) {
      throw new CryptoApproveError('Smart wallet must be configured for sign smart approve typed data');
    }

    const ownerWallet = await wallet.getOwnerWallet();
    const ownerWalletAddress = await ownerWallet.getAddress();
    const smartApproveSignature = await ownerWallet.signTypedData({ ...params, from: ownerWalletAddress });

    let smartApproveTransaction: string;
    if (smartData.native) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const data = JSON.parse(params.data).message.data as string;

      smartApproveTransaction = await wallet.getCustomPermitTransaction({
        from: smartData.actorAddress,
        token: MULTI_SEND_CONTACT_ADDRESS,
        signature: smartApproveSignature,
        amount: '0',
        chainId,
        data,
        delegateCall: true,
      });
    } else {
      smartApproveTransaction = await wallet.getPermitTransaction({
        from: smartData.actorAddress,
        token: smartData.tokenAddress,
        amount: smartData.amount,
        signature: smartApproveSignature,
      });
    }

    const permit: PermitData = {
      type: 'smart-approve',
      transaction: smartApproveTransaction,
      expiresAt: UNREACHABLE_TIME.data,
      chainId,
      actorAddress: smartData.actorAddress,
      tokenAddress: smartData.tokenAddress,
      maxAmount: smartData.amount,
    };
    this.permitCache?.storePermit(permit);
    return permit.transaction;
  }

  private async performSendApproveTransaction(params: SendTransactionParams): Promise<undefined> {
    const wallet = await resolveDynamic(this.wallet);
    if (isSmartWallet(wallet)) {
      throw new CryptoApproveError('Unexpected smart wallet for send approve transaction');
    }

    const sendApprove = async (): Promise<void> => {
      let txid: string;
      if (isSmartWallet(wallet)) {
        const ownerWallet = await wallet.getOwnerWallet();
        const from = await ownerWallet.getAddress();
        const signApproveParams = await wallet.getSignTransactionParams({ ...params, from });
        const ownerSignature = await ownerWallet.signTypedData(signApproveParams);
        const sendApproveParams = await wallet.getSendTransactionParams({ ...signApproveParams, ownerSignature });
        txid = await ownerWallet.sendTransaction(sendApproveParams);
      } else {
        txid = await wallet.sendTransaction(params);
      }
      this.onApproveTxidReceived?.(txid);
    };

    switch (this.approveFinalizationMode) {
      case 'wait-after-wallet-tx':
        await sendApprove();
        break;
      case 'wait-parallel-with-wallet-tx':
        this.sendApprovePromise = sendApprove();
        break;
      default: // Ensure all approve finalization modes covered
        this.approveFinalizationMode satisfies never;
    }
  }

  private async performWaitApproveFinalization(
    operation: string | undefined,
    crypto: CryptoData,
    amount: Amount,
    owner: string,
    spender: string,
  ): Promise<undefined> {
    let approveFinalized = false;

    let ensureOperationExecuting: (() => Promise<void>) | undefined;
    if (isNotNull(operation) && !this.disableApproveFinalizationOperationCheck) {
      const wallet = await resolveDynamic(this.wallet);
      if (isSmartWallet(wallet)) {
        throw new CryptoApproveError('Unexpected smart wallet to wait for approve finalization');
      }

      ensureOperationExecuting = async (): Promise<void> => {
        const operations = await wallet.getExecutingOperations();
        const executing = operations.has(operation);
        if (!executing) {
          throw new CryptoApproveError('Wallet operation related to approve wait is no longer executing');
        }
      };
    }

    const checkFinalized = async (): Promise<boolean> => {
      const info = await this.getAllowance(crypto, owner, spender);
      const verdict = await this.checkAllowance(crypto, amount, info);
      const finalized = verdict !== 'should-provide-approve' && verdict !== 'should-approve-permit2';
      return finalized;
    };

    const waitFinalization = async (): Promise<void> => {
      while (!approveFinalized) {
        await ensureOperationExecuting?.();
        approveFinalized = await checkFinalized();
        if (!approveFinalized) {
          await this.approveCheckPeriod.sleep();
        }
      }
    };

    const waitSend = async (): Promise<void> => {
      if (isNotNull(this.sendApprovePromise)) {
        await this.sendApprovePromise; // Can fail - abandon approve finalization then
      }

      while (!approveFinalized) {
        await this.approveCheckPeriod.sleep();
      }
    };

    try {
      await Promise.race([waitFinalization(), waitSend()]);
    } finally {
      this.sendApprovePromise = undefined;
    }
  }
}
