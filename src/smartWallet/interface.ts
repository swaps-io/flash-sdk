import { IWallet, SendTransactionParams, SignTypedDataParams } from '../wallet';

/**
 * Get smart wallet address parameters of {@link ISmartWallet.getAddress}
 *
 * @category Smart Wallet
 */
export interface GetSmartAddressParams {
  /**
   * Chain ID to get smart wallet address on
   */
  chainId: string;
}

/**
 * Get smart wallet nonce parameters of {@link ISmartWallet.getNonce}
 *
 * @category Smart Wallet
 */
export interface GetSmartNonceParams {
  /**
   * Chain ID to get smart wallet nonce on
   */
  chainId: string;
}

/**
 * Get smart wallet deployment status parameters of {@link ISmartWallet.isDeployed}
 *
 * @category Smart Wallet
 */
export interface GetSmartIsDeployedParams {
  /**
   * Chain ID to get smart wallet address on
   */
  chainId: string;
}

/**
 * Get smart wallet owners parameters of {@link ISmartWallet.getOwners}
 *
 * @category Smart Wallet
 */
export interface GetSmartOwnersParams {
  /**
   * Chain ID to get owners on
   */
  chainId: string;

  /**
   * Should owner list load be forced or not
   *
   * Owner list is not expected to change often, so caching may be applied
   * by a smart wallet
   *
   * When this options is set to `true`, it's ensured that the latest
   * owner data is returned
   *
   * @default false
   */
  force?: boolean;
}

/**
 * Parameters of a smart wallet transaction that's part of transaction batch
 *
 * @category Smart Wallet
 */
export type SmartBatchTransactionParams = Pick<SendTransactionParams, 'to' | 'value' | 'data'>;

/**
 * Get smart wallet sign transaction parameters of {@link ISmartWallet.getSignTransactionParams}
 *
 * @category Smart Wallet
 */
export interface GetSmartSignTransactionParams extends SendTransactionParams {
  /**
   * List or single item of "pre" batch transaction params to execute before the primary transaction
   *
   * @default []
   */
  pre?: SmartBatchTransactionParams | readonly SmartBatchTransactionParams[];

  /**
   * List or single item of "post" batch transaction params to execute after the primary transaction
   *
   * @default []
   */
  post?: SmartBatchTransactionParams | readonly SmartBatchTransactionParams[];
}

/**
 * Get smart wallet send transaction parameters of {@link ISmartWallet.getSendTransactionParams}
 *
 * Consumes sign typed data returned by {@link ISmartWallet.getSignTransactionParams}
 * with its signature by owner wallet
 *
 * @category Smart Wallet
 */
export interface GetSmartSendTransactionParams extends SignTypedDataParams {
  /**
   * Smart wallet transaction signature obtained from signing
   * {@link ISmartWallet.getSignTransactionParams | data} by owner wallet address
   */
  ownerSignature: string;
}

/**
 * Get smart wallet sign typed data parameters of {@link ISmartWallet.getSignTypedDataParams}
 *
 * @category Smart Wallet
 */
export type GetSmartSignTypedDataParams = Omit<SignTypedDataParams, 'chainId'> &
  Required<Pick<SignTypedDataParams, 'chainId'>>;

/**
 * Smart Wallet functionality provider
 *
 * @category Smart Wallet
 */
export interface ISmartWallet {
  /**
   * Gets address of the swart wallet contract
   *
   * @param params Get address {@link GetSmartAddressParams | params}
   *
   * @returns Contract address of swart wallet
   */
  getAddress(params: GetSmartAddressParams): Promise<string>;

  /**
   * Gets current list of the smart wallet owner addresses
   *
   * @param params Get owners {@link GetSmartOwnersParams | params}
   *
   * @returns Addresses of swart wallet owners
   */
  getOwners(params: GetSmartOwnersParams): Promise<ReadonlySet<string>>;

  /**
   * Gets deployed smart wallet status
   *
   * @param params Get owners {@link GetSmartIsDeployedParams | params}
   *
   * @returns boolean deployed smart wallet status
   */
  isDeployed(params: GetSmartIsDeployedParams): Promise<boolean>;

  /**
   * Gets wallet of the owner the smart wallet is managed on behalf of
   *
   * @returns Owner wallet instance
   */
  getOwnerWallet(): Promise<IWallet>;

  /**
   * Prepares sign transaction params for signing via regular
   * {@link IWallet | wallet} of a smart wallet owner
   *
   * @param params Get sign transaction {@link GetSmartSignTransactionParams | params}
   *
   * @returns Sign transaction typed data params usable in regular {@link IWallet | wallet}
   */
  getSignTransactionParams(params: GetSmartSignTransactionParams): Promise<SignTypedDataParams>;

  /**
   * Prepares send transaction params for sending via regular
   * {@link IWallet | wallet} of a smart wallet owner
   *
   * @param params Get send transaction {@link GetSmartSendTransactionParams | params}
   *
   * @returns Send transaction params usable in regular {@link IWallet | wallet}
   */
  getSendTransactionParams(params: GetSmartSendTransactionParams): Promise<SendTransactionParams>;

  /**
   * Prepares sign typed data params for signing via regular
   * {@link IWallet | wallet} of a smart wallet owner
   *
   * @param params Get sign typed data {@link GetSmartSignTypedDataParams | params}
   *
   * @returns Sign typed data params usable in regular {@link IWallet | wallet}
   */
  getSignTypedDataParams(params: GetSmartSignTypedDataParams): Promise<SignTypedDataParams>;

  /**
   * Gets nonce of the smart wallet contract
   *
   * @param params Get nonce {@link GetNonceParams | params}
   *
   * @returns Contract nonce of swart wallet
   */
  getNonce(params: GetSmartNonceParams): Promise<number>;
}
