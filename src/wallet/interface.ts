import { Amount } from '../model';

/**
 * Operation identifier provider
 *
 * @category Wallet
 */
export interface WithWalletOperation {
  /**
   * Operation identifier marking specific SDK usage by user
   */
  operation?: string;
}

/**
 * Base parameters of a {@link IWallet} operation
 *
 * @category Wallet
 */
export interface WalletBaseParams extends WithWalletOperation {
  /**
   * Arbitrary tag marking specific wallet usage by SDK
   */
  tag: string;
}

/**
 * Sign typed data parameters of {@link IWallet.signTypedData}
 *
 * @category Wallet
 */
export interface SignTypedDataParams extends WalletBaseParams {
  /**
   * Chain ID on which typed data should be signed.
   * Some wallets verify active chain matches this param
   *
   * @default The signature is chain-agnostic
   */
  chainId?: string;

  /**
   * Address corresponding to private key the typed data should be signed by.
   * Some wallets verify active account matches this param
   */
  from: string;

  /**
   * JSON-serialized (MetaMask format) typed data to sign
   */
  data: string;
}

/**
 * Send transaction parameters of {@link IWallet.sendTransaction}
 *
 * @category Wallet
 */
export interface SendTransactionParams extends WalletBaseParams {
  /**
   * Chain ID on which the transaction should be sent.
   * Some wallets verify active chain matches this param
   */
  chainId: string;

  /**
   * Address from which the transaction should be sent.
   * Some wallets verify active account matches this param
   */
  from: string;

  /**
   * Address the transaction should be sent to
   */
  to: string;

  /**
   * Value of transaction, i.e. amount of chain's native token
   * that should be sent with this transaction
   *
   * @default No native token should be sent
   */
  value?: string;

  /**
   * Data of the transaction, i.e. contract method call data
   *
   * @default Native token transfer transaction
   */
  data?: string;

  /**
   * Gas limit multiplier
   * Applies only for native tokens swap
   */
  gasMultiplier?: Amount;
}

/**
 * Sign message parameters of {@link IWallet.signMessage}
 *
 * @category Wallet
 */
export interface SignMessageParams extends WalletBaseParams {
  /**
   * Address corresponding to private key the typed data should be signed by.
   * Some wallets verify active account matches this param
   */
  from: string;

  /**
   * String message to sign
   */
  message: string;
}

/**
 * Wallet functionality provider
 *
 * @category Wallet
 */
export interface IWallet {
  /**
   * Gets address of active (current) wallet account
   *
   * @returns Active wallet account address
   */
  getAddress(): Promise<string>;

  /**
   * Signs typed data with wallet account's private key
   *
   * @param params Sign typed data {@link SignTypedDataParams | params}
   *
   * @returns Valid signature of the typed data
   */
  signTypedData(params: SignTypedDataParams): Promise<string>;

  /**
   * Signs transaction with wallet account's private key and sends it
   *
   * @param params Send transaction {@link SendTransactionParams | params}
   *
   * @returns TXID of sent transaction
   */
  sendTransaction(params: SendTransactionParams): Promise<string>;

  /**
   * Signs message with wallet account's private key
   *
   * @param params Sign message {@link SignMessageParams | params}
   *
   * @returns Valid signature of the message
   */
  signMessage(params: SignMessageParams): Promise<string>;

  /**
   * Returns set of IDs of operations that are in active execution, i.e. there
   * is a wallet executor for each of these operations that neither finished
   * (successfully or with failure) nor terminated.
   *
   * @returns Readonly set of operation IDs in active execution
   */
  getExecutingOperations(): Promise<ReadonlySet<string>>;
}
