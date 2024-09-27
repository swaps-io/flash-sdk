import { Data } from '../data';
import { Instant } from '../time';

import { LiqSendTransactionData, ReportNoSendTransactionData, SlashTransactionData, TransactionData } from './data';

export type * from './data';

abstract class TransactionBase<D extends TransactionData> implements Data<D> {
  /**
   * Plain data of the transaction. Can be used for serialization
   */
  public readonly data: D;

  protected constructor(data: D) {
    this.data = data;
  }

  /**
   * TXID of the transaction
   */
  public get txid(): string {
    return this.data.txid;
  }

  /**
   * Time the transaction was created at
   */
  public get createdAt(): Instant {
    return new Instant(this.data.createdAt);
  }

  /**
   *  Status indicating wether transaction is confirmed or not
   */
  public get confirmed(): boolean {
    return this.data.confirmed;
  }
}

/**
 * Blockchain transaction representation
 *
 * @category Transaction
 */
export class Transaction extends TransactionBase<TransactionData> {
  public constructor(data: TransactionData) {
    super(data);
  }
}

/**
 * Blockchain "report no-send" transaction representation
 *
 * @category Transaction
 */
export class ReportNoSendTransaction extends TransactionBase<ReportNoSendTransactionData> {
  public constructor(data: ReportNoSendTransactionData) {
    super(data);
  }

  /**
   * The reporter address of the "no-send report" transaction
   */
  public get reporter(): string {
    return this.data.reporter;
  }
}

/**
 * Blockchain "slash" transaction representation
 *
 * @category Transaction
 */
export class SlashTransaction extends TransactionBase<SlashTransactionData> {
  public constructor(data: SlashTransactionData) {
    super(data);
  }

  /**
   * The "report no-send" transaction used for the slash transaction
   */
  public get txReportNoSend(): ReportNoSendTransaction {
    return new ReportNoSendTransaction(this.data.txReportNoSend);
  }
}

/**
 * Blockchain "liq-send" transaction representation
 *
 * @category Transaction
 */
export class LiqSendTransaction extends TransactionBase<LiqSendTransactionData> {
  public constructor(data: LiqSendTransactionData) {
    super(data);
  }

  /**
   * The liquidator address of the "liq-send" transaction
   */
  public get liquidator(): string {
    return this.data.liquidator;
  }
}
