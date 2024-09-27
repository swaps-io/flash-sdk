import { InstantData } from '../time';

/**
 * Data required for storing transaction
 *
 * @category Transaction
 */
export interface TransactionData {
  /**
   * TXID of the transaction
   */
  txid: string;

  /**
   * Data of {@link Instant} the transaction was created at
   */
  createdAt: InstantData;

  /**
   * Status indicating wether transaction is confirmed or not
   */
  confirmed: boolean;
}

/**
 * Data required for storing "report no-send" transaction
 *
 * @category Transaction
 */
export interface ReportNoSendTransactionData extends TransactionData {
  /**
   * The reporter address of the "no-send report" transaction
   */
  reporter: string;
}

/**
 * Data required for storing "slash" transaction
 *
 * @category Transaction
 */
export interface SlashTransactionData extends TransactionData {
  /**
   * Data of the "report no-send" transaction used for the slash transaction
   */
  txReportNoSend: ReportNoSendTransactionData;
}

/**
 * Data required for storing "liq-send" transaction
 *
 * @category Transaction
 */
export interface LiqSendTransactionData extends TransactionData {
  /**
   * The liquidator address of the "liq-send" transaction
   */
  liquidator: string;
}
