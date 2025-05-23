import { PermitDataMainV0 } from '../../api/gen/main-v0';
import { SendTransactionParams, SignTypedDataParams } from '../../wallet';
import { Amount } from '../amount';
import { CryptoData } from '../crypto';

import { SmartApprovePermitData } from './private';

/**
 * Preference of how crypto allowance provider should be selected:
 * - `permit-permit2-approve`:
 *    - try ERC-2612 permit first
 *    - then Uniswap's Permit2
 *    - then fallback to default ERC-20 approve
 * - `permit-approve`:
 *    - try ERC-2612 permit first
 *    - then fallback to default ERC-20 approve
 * - `approve`:
 *    - use default ERC-20 approve regardless of permit availability
 *
 * @category Crypto Approve
 */
export type ApproveProviderPreference = 'permit-permit2-approve' | 'permit-approve' | 'approve';

/**
 * Finite crypto {@link ApproveAmountPreference | approve amount preference} descriptor
 *
 * @category Crypto Approve
 */
export interface FiniteApproveAmountPreference {
  /**
   * Finite amount to approve protocol with
   *
   * Can be overwritten by larger amount requirement of current swap, if not forbidden by {@link strict} param
   */
  finite: Amount;

  /**
   * Should {@link finite} amount be allowed to grow to match current swap amount or not
   *
   * When grow is not allowed, throws an insufficient finite approve amount error
   *
   * @default false
   */
  strict?: boolean;
}

/**
 * Preference of how crypto allowance amount should be selected:
 * - `exact` - provide exact amount allowance required for a single swap.
 *    Each approve/permit uses extra gas. This option is more secure, but less cheap
 * - `infinite` - provide infinite amount allowance for any number of swaps.
 *    No extra gas swapping approved "from" crypto next time. This option is
 *    more cheap, but potentially less secure
 * - `{ finite }` - provide a finite amount allowance that can be used for multiple swaps.
 *    This option is a customizable compromise between `exact` and `infinite`
 *
 * @category Crypto Approve
 */
export type ApproveAmountPreference = 'exact' | 'infinite' | FiniteApproveAmountPreference;

/**
 * Checks if passed {@link ApproveAmountPreference} is {@link FiniteApproveAmountPreference} case or not
 *
 * @param preference Preference to check for finite amount preference case
 *
 * @returns Type match: `true` if finite amount preference, `false` otherwise
 *
 * @category Crypto Approve
 */
export const isFiniteApproveAmountPreference = (
  preference: ApproveAmountPreference,
): preference is FiniteApproveAmountPreference => {
  return typeof preference === 'object' && 'finite' in preference;
};

/**
 * Which contract type the approve action targets:
 * - `main` - main contract of Flash
 * - `permit2` - Uniswap's Permit2 contract
 *
 * @category Crypto Approve
 */
export type ApproveActionTarget = 'main' | 'permit2';

/**
 * Send approve transaction type of crypto approve action
 *
 * @category Crypto Approve
 */
export interface SendApproveTransactionAction {
  /**
   * Type of the send approve transaction action
   */
  type: 'send-approve-transaction';

  /**
   * Target of the send approve transaction action
   */
  actionTarget: ApproveActionTarget;

  /**
   * @hidden
   */
  params: SendTransactionParams;
}

/**
 * Sign permit typed data type of crypto approve action
 *
 * @category Crypto Approve
 */
export interface SignPermitTypedDataAction {
  /**
   * Type of the sign permit typed data action
   */
  type: 'sign-permit-typed-data';

  /**
   * Target of the sign permit typed data action
   */
  actionTarget: ApproveActionTarget;

  /**
   * @hidden
   */
  params: SignTypedDataParams;

  /**
   * @hidden
   */
  permitData: PermitDataMainV0;
}

/**
 * Sign smart approve typed data type of crypto approve action
 *
 * @category Crypto Approve
 */
export interface SignSmartApproveTypedData {
  /**
   * Type of the sign smart approve typed data action
   */
  type: 'sign-smart-approve-typed-data';

  /**
   * @hidden
   */
  params: SignTypedDataParams;

  /**
   * @hidden
   */
  smartPermit: SmartApprovePermitData | undefined;
}

/**
 * Wait approve finalization type of crypto approve action
 *
 * @category Crypto Approve
 */
export interface WaitApproveFinalizationAction {
  /**
   * Type of the wait approve finalization action
   */
  type: 'wait-approve-finalization';

  /**
   * @hidden
   */
  operation: string | undefined;

  /**
   * Target of the wait approve finalization action
   */
  actionTarget: ApproveActionTarget;

  /**
   * @hidden
   */
  crypto: CryptoData;

  /**
   * @hidden
   */
  amount: Amount;

  /**
   * @hidden
   */
  owner: string;

  /**
   * @hidden
   */
  spender: string;
}

/**
 * Action to perform for progressing with crypto approve
 *
 * @category Crypto Approve
 */
export type CryptoApproveAction =
  | SendApproveTransactionAction
  | SignPermitTypedDataAction
  | SignSmartApproveTypedData
  | WaitApproveFinalizationAction;

/**
 * Crypto approve request. Contains actions that needs to be
 * performed in order to progress with approving crypto
 *
 * @category Crypto Approve
 */
export class CryptoApproveRequest {
  /**
   * Actions to perform in order to progress with crypto approve
   */
  public readonly actions: CryptoApproveAction[];

  public constructor(actions: CryptoApproveAction[]) {
    this.actions = actions;
  }
}

/**
 * Incomplete crypto approve result. Represents progress of incomplete multi-stage approve
 *
 * @category Crypto Approve
 */
export class IncompleteCryptoApprove {
  /**
   * @hidden
   */
  public readonly completedActions: number;

  public constructor(completedActions: number) {
    this.completedActions = completedActions;
  }
}

/**
 * Crypto approve result
 *
 * @category Crypto Approve
 */
export class CryptoApprove {
  /**
   * @hidden
   */
  public readonly permitTransaction: string | undefined;

  public constructor(permitTransaction: string | undefined) {
    this.permitTransaction = permitTransaction;
  }
}
