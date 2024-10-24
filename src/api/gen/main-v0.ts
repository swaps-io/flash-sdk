/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Flash API (v0)
 * Main API of Flash project (v0)
 * OpenAPI spec version: v0.1.0
 */
import { axiosClientMainV0 } from '../client/axios/main-v0';

export type GetCollateralMainV0Params = {
  collateral_chain_id: string;
  distribution_chain_id: string;
};

export type GetBalanceMainV0Params = {
  chain_id: string;
  token_address: string;
};

export type GetStatesMainV0Params = {
  hashes: string[];
};

export type ConfirmSwapMainV0Params = {
  from_proof: string;
  to_proof: string;
  address?: string | null;
};

export type LiqSlashMainV0Params = {
  from_proof: string;
  to_proof: string;
};

export type SlashMainV0Params = {
  reporter: string;
  from_proof: string;
  to_proof: string;
};

export type ReportNoSendMainV0Params = {
  reporter: string;
};

export type LiqSendMainV0Params = {
  liquidator: string;
  permit_transaction?: string | null;
};

export type GetQuoteMainV0Params = {
  deploy_smart_to_chains?: string[];
  from_chain_id: string;
  to_chain_id: string;
  from_token_address: string;
  to_token_address: string;
  from_amount?: string | null;
  to_amount?: string | null;
};

export type GetPermitTransactionMainV0Params = {
  chain_id: string;
  token_address: string;
  actor_address: string;
  mode?: PermitModeMainV0;
  amount?: string | null;
  contract_address?: string | null;
  deadline: number;
  permit_signature: string;
};

export type GetPermitDataMainV0Params = {
  chain_id: string;
  token_address: string;
  actor_address: string;
  mode?: PermitModeMainV0;
  amount?: string | null;
  contract_address?: string | null;
};

export type GetApproveMainV0Params = {
  chain_id: string;
  token_address: string;
  actor_address: string;
  amount?: string | null;
  p2_contract?: boolean;
  contract_address?: string | null;
};

export type GetAllowanceMainV0Params = {
  chain_id: string;
  token_address: string;
  actor_address: string;
  contract_address?: string | null;
};

export type ValidationErrorMainV0LocItem = string | number;

export interface ValidationErrorMainV0 {
  loc: ValidationErrorMainV0LocItem[];
  msg: string;
  type: string;
}

export type TransactionDataMainV0Value = string | null;

export interface TransactionDataMainV0 {
  chain_id: string;
  data: string;
  from_address: string;
  to_address: string;
  value: TransactionDataMainV0Value;
}

export interface TransactionMainV0 {
  chain_id: string;
  confirmed: boolean;
  created_at: number;
  txid: string;
}

export type SwapStatesMainV0States = { [key: string]: string };

export interface SwapStatesMainV0 {
  states: SwapStatesMainV0States;
}

export type SwapStateMainV0 = (typeof SwapStateMainV0)[keyof typeof SwapStateMainV0];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SwapStateMainV0 = {
  awaiting_signature: 'awaiting_signature',
  awaiting_bitcoin_lock: 'awaiting_bitcoin_lock',
  awaiting_receive: 'awaiting_receive',
  awaiting_send: 'awaiting_send',
  awaiting_liq_send: 'awaiting_liq_send',
  cancelled_no_slash: 'cancelled_no_slash',
  cancelled_awaiting_slash: 'cancelled_awaiting_slash',
  cancelled_slashed: 'cancelled_slashed',
  completed_sent: 'completed_sent',
  completed_liq_sent: 'completed_liq_sent',
} as const;

export interface SwapListMainV0 {
  swaps: SwapMainV0[];
}

export interface SwapDataMainV0 {
  data: string;
  hash: string;
}

export type SwapMainV0TxSlash = SlashTransactionMainV0 | null;

export type SwapMainV0TxSend = TransactionMainV0 | null;

export type SwapMainV0TxReceive = TransactionMainV0 | null;

export type SwapMainV0TxLockBitcoin = TransactionMainV0 | null;

export type SwapMainV0TxLiqSend = LiqSendTransactionMainV0 | null;

export type SwapMainV0ToActorBitcoin = string | null;

export type SwapMainV0TimeToLockBitcoin = number | null;

export type SwapMainV0FromActorBitcoin = string | null;

export type SwapMainV0DeadlineLockBitcoin = number | null;

export interface SubmitSwapMainV0 {
  raise_on_error?: boolean;
  signature: string;
}

export type SmartWalletStateMainV0 = (typeof SmartWalletStateMainV0)[keyof typeof SmartWalletStateMainV0];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SmartWalletStateMainV0 = {
  ready: 'ready',
  pending: 'pending',
} as const;

export interface SmartWalletPayCryptosMainV0 {
  crypto_ids: string[];
}

export type SmartChainMainV0SmartAddress = string | null;

export interface SmartChainMainV0 {
  chain_id: string;
  smart_address: SmartChainMainV0SmartAddress;
  state: SmartWalletStateMainV0;
}

export interface SmartWalletMainV0 {
  owner_address: string;
  smart_chains: SmartChainMainV0[];
}

export interface SlashTransactionMainV0 {
  chain_id: string;
  confirmed: boolean;
  created_at: number;
  report_no_send_index: number;
  txid: string;
}

export interface ResolverMainV0 {
  address: string;
  icon: string;
  name: string;
}

export interface ResolverListMainV0 {
  resolvers: ResolverMainV0[];
}

export interface ReportNoSendTransactionMainV0 {
  chain_id: string;
  confirmed: boolean;
  created_at: number;
  reporter: string;
  txid: string;
}

export type QuoteMainV0TimeToLockBitcoin = number | null;

export interface QuoteMainV0 {
  amount_source: AmountSourceMainV0;
  collateral_amount: string;
  collateral_chain_id: string;
  deploy_smart_to_chains?: string[];
  from_amount: string;
  from_chain_id: string;
  from_fee_estimate: string;
  from_token_address: string;
  time_estimate: number;
  time_to_liq_send: number;
  time_to_lock_bitcoin: QuoteMainV0TimeToLockBitcoin;
  time_to_receive: number;
  time_to_send: number;
  to_actor: string;
  to_amount: string;
  to_chain_id: string;
  to_fee_estimate: string;
  to_token_address: string;
}

export interface PermitTransactionMainV0 {
  transaction: string;
}

export type PermitModeMainV0 = (typeof PermitModeMainV0)[keyof typeof PermitModeMainV0];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PermitModeMainV0 = {
  permit: 'permit',
  permit2: 'permit2',
} as const;

export type PermitDataMainV0Amount = string | null;

export interface PermitDataMainV0 {
  actor_address: string;
  amount: PermitDataMainV0Amount;
  chain_id: string;
  contract_address: string;
  deadline: number;
  mode: PermitModeMainV0;
  permit_data: string;
  token_address: string;
}

export interface LiqSendTransactionMainV0 {
  chain_id: string;
  confirmed: boolean;
  created_at: number;
  liquidator: string;
  txid: string;
}

export interface HTTPValidationErrorMainV0 {
  detail?: ValidationErrorMainV0[];
}

export type CreateSwapMainV0ToAmount = string | null;

export type CreateSwapMainV0PermitTransaction = string | null;

export type CreateSwapMainV0FromAmount = string | null;

export type CreateSwapMainV0FromActorReceiver = string | null;

export type CreateSwapMainV0FromActorBitcoin = string | null;

export interface CreateSwapMainV0 {
  deploy_smart_to_chains?: string[];
  /** @pattern ^(0x)[a-fA-F0-9]{40}$ */
  from_actor: string;
  from_actor_bitcoin?: CreateSwapMainV0FromActorBitcoin;
  from_actor_receiver?: CreateSwapMainV0FromActorReceiver;
  from_amount?: CreateSwapMainV0FromAmount;
  from_chain_id: string;
  from_token_address: string;
  permit_transaction?: CreateSwapMainV0PermitTransaction;
  to_amount?: CreateSwapMainV0ToAmount;
  to_chain_id: string;
  to_token_address: string;
}

export interface CreateAgreementUserMainV0 {
  /** @pattern ^(0x)[a-fA-F0-9]{40}$ */
  address: string;
  signature: string;
}

export interface CollateralInfoMainV0 {
  actor_address: string;
  available_withdraw_amount: string;
  balance: string;
  collateral_chain_id: string;
  collateral_token_address: string;
  distribution_chain_id: string;
  locked_amount: string;
  unlocked_amount: string;
}

export interface BalanceInfoMainV0 {
  actor_address: string;
  balance: string;
  chain_id: string;
  token_address: string;
}

export type AmountSourceMainV0 = (typeof AmountSourceMainV0)[keyof typeof AmountSourceMainV0];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AmountSourceMainV0 = {
  from: 'from',
  to: 'to',
} as const;

export interface SwapMainV0 {
  amount_source: AmountSourceMainV0;
  collateral_amount: string;
  collateral_chain_id: string;
  collateral_rewardable: string;
  created_at: number;
  deadline_liq_send: number;
  deadline_lock_bitcoin: SwapMainV0DeadlineLockBitcoin;
  deadline_receive: number;
  deadline_send: number;
  deploy_smart_to_chains?: string[];
  from_actor: string;
  from_actor_bitcoin: SwapMainV0FromActorBitcoin;
  from_actor_receiver: string;
  from_amount: string;
  from_chain_id: string;
  from_fee_estimate: string;
  from_token_address: string;
  hash: string;
  nonce: number;
  state: SwapStateMainV0;
  time_estimate: number;
  time_to_liq_send: number;
  time_to_lock_bitcoin: SwapMainV0TimeToLockBitcoin;
  time_to_receive: number;
  time_to_send: number;
  to_actor: string;
  to_actor_bitcoin: SwapMainV0ToActorBitcoin;
  to_amount: string;
  to_chain_id: string;
  to_fee_estimate: string;
  to_token_address: string;
  tx_liq_send: SwapMainV0TxLiqSend;
  tx_lock_bitcoin: SwapMainV0TxLockBitcoin;
  tx_receive: SwapMainV0TxReceive;
  tx_report_no_send: ReportNoSendTransactionMainV0[];
  tx_send: SwapMainV0TxSend;
  tx_slash: SwapMainV0TxSlash;
}

export type AllowanceInfoMainV0ContractAddress = string | null;

export type AllowanceInfoMainV0AllowanceP2 = string | null;

export interface AllowanceInfoMainV0 {
  actor_address: string;
  allowance: string;
  allowance_p2: AllowanceInfoMainV0AllowanceP2;
  chain_id: string;
  contract_address: AllowanceInfoMainV0ContractAddress;
  token_address: string;
}

export type AgreementUserMainV0Signature = string | null;

export interface AgreementUserMainV0 {
  address: string;
  message: string;
  signature: AgreementUserMainV0Signature;
}

export interface AgreementMessageMainV0 {
  message: string;
}

type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];

/**
 * Returns token allowance
 * @summary Get allowance
 */
export const getAllowanceMainV0 = (
  params: GetAllowanceMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<AllowanceInfoMainV0>({ url: `/api/v0/allowance`, method: 'GET', params }, options);
};

/**
 * Returns call data to approve token
 * @summary Get approve
 */
export const getApproveMainV0 = (
  params: GetApproveMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<TransactionDataMainV0>({ url: `/api/v0/approve`, method: 'GET', params }, options);
};

/**
 * Returns token permit data to sign
 * @summary Get permit data
 */
export const getPermitDataMainV0 = (
  params: GetPermitDataMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<PermitDataMainV0>({ url: `/api/v0/permit/data`, method: 'GET', params }, options);
};

/**
 * Returns tokens permit signature
 * @summary Gets permit transaction
 */
export const getPermitTransactionMainV0 = (
  params: GetPermitTransactionMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<PermitTransactionMainV0>(
    { url: `/api/v0/permit/transaction`, method: 'GET', params },
    options,
  );
};

/**
 * Returns quote
 * @summary Get quote
 */
export const getQuoteMainV0 = (params: GetQuoteMainV0Params, options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<QuoteMainV0>({ url: `/api/v0/quote`, method: 'GET', params }, options);
};

/**
 * Creates swap
 * @summary Create swap
 */
export const createSwapMainV0 = (
  createSwapMainV0: CreateSwapMainV0,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<SwapMainV0>(
    { url: `/api/v0/swaps`, method: 'POST', headers: { 'Content-Type': 'application/json' }, data: createSwapMainV0 },
    options,
  );
};

/**
 * Returns swap
 * @summary Get swap
 */
export const getSwapMainV0 = (swapHash: string, options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<SwapMainV0>({ url: `/api/v0/swaps/${swapHash}`, method: 'GET' }, options);
};

/**
 * Returns swap data
 * @summary Get swap data
 */
export const getSwapDataMainV0 = (swapHash: string, options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<SwapDataMainV0>({ url: `/api/v0/swaps/${swapHash}/data`, method: 'GET' }, options);
};

/**
 * Sends signed order to MM
 * @summary Confirm swap
 */
export const submitSwapMainV0 = (
  swapHash: string,
  submitSwapMainV0: SubmitSwapMainV0,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<SwapMainV0>(
    {
      url: `/api/v0/swaps/${swapHash}/submit`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: submitSwapMainV0,
    },
    options,
  );
};

/**
 * Returns call data to liquidate swap
 * @summary Liquidate swap
 */
export const liqSendMainV0 = (
  swapHash: string,
  params: LiqSendMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<TransactionDataMainV0>(
    { url: `/api/v0/swaps/${swapHash}/liq_send`, method: 'GET', params },
    options,
  );
};

/**
 * Returns call data to report no-send
 * @summary Prepare swap withdraw
 */
export const reportNoSendMainV0 = (
  swapHash: string,
  params: ReportNoSendMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<TransactionDataMainV0>(
    { url: `/api/v0/swaps/${swapHash}/report_no_send`, method: 'GET', params },
    options,
  );
};

/**
 * Returns call data to slash swap
 * @summary Slash swap
 */
export const slashMainV0 = (
  swapHash: string,
  params: SlashMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<TransactionDataMainV0>(
    { url: `/api/v0/swaps/${swapHash}/slash`, method: 'GET', params },
    options,
  );
};

/**
 * Returns call data to liq slash swap
 * @summary Liq slash swap
 */
export const liqSlashMainV0 = (
  swapHash: string,
  params: LiqSlashMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<TransactionDataMainV0>(
    { url: `/api/v0/swaps/${swapHash}/liq_slash`, method: 'GET', params },
    options,
  );
};

/**
 * Returns call data to confirm swap
 * @summary Confirm swap
 */
export const confirmSwapMainV0 = (
  swapHash: string,
  params: ConfirmSwapMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<TransactionDataMainV0>(
    { url: `/api/v0/swaps/${swapHash}/confirm`, method: 'GET', params },
    options,
  );
};

/**
 * Returns states for the requests swap hashes
 * @summary Get swap states
 */
export const getStatesMainV0 = (params: GetStatesMainV0Params, options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<SwapStatesMainV0>({ url: `/api/v0/states`, method: 'GET', params }, options);
};

/**
 * Returns user swaps
 * @summary Get user swaps
 */
export const getUserSwapsMainV0 = (address: string, options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<SwapListMainV0>({ url: `/api/v0/users/${address}/swaps`, method: 'GET' }, options);
};

/**
 * Returns resolver list
 * @summary Get resolvers
 */
export const getResolverListMainV0 = (options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<ResolverListMainV0>({ url: `/api/v0/resolvers`, method: 'GET' }, options);
};

/**
 * Returns resolver by address
 * @summary Get resolver
 */
export const getResolverMainV0 = (address: string, options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<ResolverMainV0>({ url: `/api/v0/resolvers/${address}`, method: 'GET' }, options);
};

/**
 * Returns resolver balance
 * @summary Get resolver balance
 */
export const getBalanceMainV0 = (
  address: string,
  params: GetBalanceMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<BalanceInfoMainV0>(
    { url: `/api/v0/resolvers/${address}/balance`, method: 'GET', params },
    options,
  );
};

/**
 * Returns resolver collateral info
 * @summary Get resolver collateral
 */
export const getCollateralMainV0 = (
  address: string,
  params: GetCollateralMainV0Params,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<CollateralInfoMainV0>(
    { url: `/api/v0/resolvers/${address}/collateral`, method: 'GET', params },
    options,
  );
};

/**
 * Returns agreement message
 * @summary Get agreement message
 */
export const getMessageMainV0 = (options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<AgreementMessageMainV0>({ url: `/api/v0/agreement/message`, method: 'GET' }, options);
};

/**
 * Creates agreement user
 * @summary Create user
 */
export const createUserMainV0 = (
  createAgreementUserMainV0: CreateAgreementUserMainV0,
  options?: SecondParameter<typeof axiosClientMainV0>,
) => {
  return axiosClientMainV0<AgreementUserMainV0>(
    {
      url: `/api/v0/agreement/users`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: createAgreementUserMainV0,
    },
    options,
  );
};

/**
 * Returns agreement user
 * @summary Get user
 */
export const getUserMainV0 = (address: string, options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<AgreementUserMainV0>({ url: `/api/v0/agreement/users/${address}`, method: 'GET' }, options);
};

/**
 * Returns cryptos that can be used to pay for smart wallet deploy
 * @summary Get smart wallet pay-cryptos
 */
export const getSmartWalletPayCryptosMainV0 = (options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<SmartWalletPayCryptosMainV0>(
    { url: `/api/v0/smart/deploy/pay-cryptos`, method: 'GET' },
    options,
  );
};

/**
 * Returns smart wallet data of the owner
 * @summary Get smart wallet data
 */
export const getSmartWalletMainV0 = (ownerAddress: string, options?: SecondParameter<typeof axiosClientMainV0>) => {
  return axiosClientMainV0<SmartWalletMainV0>({ url: `/api/v0/smart/${ownerAddress}`, method: 'GET' }, options);
};

export type GetAllowanceMainV0Result = NonNullable<Awaited<ReturnType<typeof getAllowanceMainV0>>>;
export type GetApproveMainV0Result = NonNullable<Awaited<ReturnType<typeof getApproveMainV0>>>;
export type GetPermitDataMainV0Result = NonNullable<Awaited<ReturnType<typeof getPermitDataMainV0>>>;
export type GetPermitTransactionMainV0Result = NonNullable<Awaited<ReturnType<typeof getPermitTransactionMainV0>>>;
export type GetQuoteMainV0Result = NonNullable<Awaited<ReturnType<typeof getQuoteMainV0>>>;
export type CreateSwapMainV0Result = NonNullable<Awaited<ReturnType<typeof createSwapMainV0>>>;
export type GetSwapMainV0Result = NonNullable<Awaited<ReturnType<typeof getSwapMainV0>>>;
export type GetSwapDataMainV0Result = NonNullable<Awaited<ReturnType<typeof getSwapDataMainV0>>>;
export type SubmitSwapMainV0Result = NonNullable<Awaited<ReturnType<typeof submitSwapMainV0>>>;
export type LiqSendMainV0Result = NonNullable<Awaited<ReturnType<typeof liqSendMainV0>>>;
export type ReportNoSendMainV0Result = NonNullable<Awaited<ReturnType<typeof reportNoSendMainV0>>>;
export type SlashMainV0Result = NonNullable<Awaited<ReturnType<typeof slashMainV0>>>;
export type LiqSlashMainV0Result = NonNullable<Awaited<ReturnType<typeof liqSlashMainV0>>>;
export type ConfirmSwapMainV0Result = NonNullable<Awaited<ReturnType<typeof confirmSwapMainV0>>>;
export type GetStatesMainV0Result = NonNullable<Awaited<ReturnType<typeof getStatesMainV0>>>;
export type GetUserSwapsMainV0Result = NonNullable<Awaited<ReturnType<typeof getUserSwapsMainV0>>>;
export type GetResolverListMainV0Result = NonNullable<Awaited<ReturnType<typeof getResolverListMainV0>>>;
export type GetResolverMainV0Result = NonNullable<Awaited<ReturnType<typeof getResolverMainV0>>>;
export type GetBalanceMainV0Result = NonNullable<Awaited<ReturnType<typeof getBalanceMainV0>>>;
export type GetCollateralMainV0Result = NonNullable<Awaited<ReturnType<typeof getCollateralMainV0>>>;
export type GetMessageMainV0Result = NonNullable<Awaited<ReturnType<typeof getMessageMainV0>>>;
export type CreateUserMainV0Result = NonNullable<Awaited<ReturnType<typeof createUserMainV0>>>;
export type GetUserMainV0Result = NonNullable<Awaited<ReturnType<typeof getUserMainV0>>>;
export type GetSmartWalletPayCryptosMainV0Result = NonNullable<
  Awaited<ReturnType<typeof getSmartWalletPayCryptosMainV0>>
>;
export type GetSmartWalletMainV0Result = NonNullable<Awaited<ReturnType<typeof getSmartWalletMainV0>>>;
