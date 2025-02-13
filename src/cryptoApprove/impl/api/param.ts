import { AxiosInstanceSource } from '../../../api/client/axios/core/source';
import { IChainProvider } from '../../../chainProvider';
import { CryptoAggregator } from '../../../cryptoAggregator';
import { Dynamic } from '../../../helper/dynamic';
import { IWalletLike } from '../../../helper/wallet';
import { ApproveAmountPreference, ApproveProviderPreference, Duration } from '../../../model';

/**
 * Mode to conduct approve finalization process in:
 * - `wait-after-wallet-tx` - send approve transaction in wallet, wait for wallet to
 *   return submitted approve TXID, then start checking for allowance to finalize
 * - `wait-parallel-with-wallet-tx` - send approve transaction in wallet, and
 *   immediately start checking for allowance to finalize
 *
 * @category Crypto Approve Impl
 *
 */
export type ApproveFinalizationMode = 'wait-after-wallet-tx' | 'wait-parallel-with-wallet-tx';

/**
 * Callback for handling approve transaction TXID when it's received from wallet
 *
 * @param txid TXID of the approve transaction
 *
 * @category Crypto Approve Impl
 */
export type OnApproveTxidReceived = (txid: string) => void;

/**
 * Params for {@link ApiCryptoApproveProvider} constructor
 *
 * @category Crypto Approve Impl
 */
export interface ApiCryptoApproveProviderParams {
  /**
   * Project identifier for Flash APIs
   *
   * Must consist of "a"-"z", "A"-"Z", "0"-"9", "-", and "_" (at least 1 character)
   */
  projectId: string;

  /**
   * Wallet provider to use for signing permits & sending approve transactions
   */
  wallet: Dynamic<IWalletLike>;

  /**
   *
   * */
  crypto: CryptoAggregator;

  /**
   * Client for Flash Main API access
   *
   * See {@link AxiosInstanceSource} for supported options
   *
   * @default 'https://api.prod.swaps.io'
   */
  mainClient?: AxiosInstanceSource;

  /**
   * {@link ApproveProviderPreference | Preference} of how crypto approve should be provided provider-wise
   *
   * @default 'permit-permit2-approve'
   */
  providerPreference?: Dynamic<ApproveProviderPreference>;

  /**
   * {@link ApproveAmountPreference | Preference} of how crypto approve should be provided amount-wise
   *
   * @default 'exact'
   */
  amountPreference?: Dynamic<ApproveAmountPreference>;

  /**
   * Allowance data sources. When multiple sources are specified, the first
   * non-failed source result is used, respecting the source list order.
   *
   * @default ['api']
   */
  allowanceSources?: readonly AllowanceSource[];

  /**
   * Time before deadline signed permit should be considered expired and re-created
   *
   * @default Duration.fromMinutes(10)
   */
  safePermitTtl?: Duration;

  /**
   * Time to wait between allowance checks while waiting for "from" crypto approve
   *
   * @default Duration.fromSeconds(5)
   */
  approveCheckPeriod?: Duration;

  /**
   * Should crypto permit cache be enabled/disabled. Enabling may reduce number of approve actions
   * in some cases. Example of such a scenario is permit signed for "from" crypto and then "to"
   * crypto changes for some reason. Here the signed permit can still be used with the new quote
   *
   * @default false
   */
  disablePermitCache?: boolean;

  /**
   * Mode to use for approve transaction finalization process
   *
   * @default 'wait-after-wallet-tx'
   */
  approveFinalizationMode?: ApproveFinalizationMode;

  /**
   * Should wallet operation execution status check be disabled or not during approve finalization.
   *
   * @default false
   */
  disableApproveFinalizationOperationCheck?: boolean;

  /**
   * Callback for handling approve transaction TXID when it's received from wallet
   *
   * @default No additional approve TXID handling
   */
  onApproveTxidReceived?: OnApproveTxidReceived;
}

/**
 * Allowance data source
 *
 * @category Crypto Approve Impl
 */
export type AllowanceSource =
  | 'api'
  | {
      /**
       * Chain provider to use as allowance data source (RPC)
       */
      chainProvider: IChainProvider;
    };
