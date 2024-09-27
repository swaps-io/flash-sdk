import { generateRandomId } from '../../helper/random';
import { Data } from '../data';

import { ExplorerData } from './data';

export type { ExplorerData };

/**
 * Chain explorer - get link to EVM address / transaction
 *
 * @category Explorer
 */
export class Explorer implements Data<ExplorerData> {
  /**
   * Plain data of the explorer. Can be used for serialization
   */
  public readonly data: ExplorerData;

  public constructor(data: ExplorerData) {
    this.data = data;
  }

  /**
   * Constructs unknown {@link Explorer} mockup. This explorer returns empty links
   *
   * @param known Known properties the explorer is unknown for
   *
   * @returns Instance of {@link Explorer}
   */
  public static unknown(known: Partial<Pick<ExplorerData, 'id' | 'chainId'>> = {}): Explorer {
    const data: ExplorerData = {
      id: known.id ?? `unknown-explorer-${generateRandomId()}`,
      name: 'Unknown',
      domain: '',
      baseUrl: '',
      chainId: known.chainId ?? `unknown-chain-${generateRandomId()}`,
    };
    return new Explorer(data);
  }

  /**
   * Converts the essential explorer info to string
   *
   * @returns String representation of the explorer
   */
  public toString(): string {
    return `Explorer "${this.name}" (${this.domain})`;
  }

  /**
   * Unique ID of the explorer. Uses custom Flash format
   */
  public get id(): string {
    return this.data.id;
  }

  /**
   * Name of the explorer
   */
  public get name(): string {
    return this.data.name;
  }

  /**
   * Domain of the explorer
   */
  public get domain(): string {
    return this.data.domain;
  }

  /**
   * Base URL of the explorer
   */
  public get baseUrl(): string {
    return this.data.baseUrl;
  }

  /**
   * Get link to address in the explorer
   *
   * @param address EVM address to get link for
   *
   * @returns URL link to view the {@link address} in the explorer
   */
  public getAddressLink(address: string): string {
    return this.getLink(`/address/${address}`);
  }

  /**
   * Get link to transaction in the explorer
   *
   * @param txid EVM TXID of the transaction to get link for
   *
   * @returns URL link to view the {@link txid | transaction} in the explorer
   */
  public getTransactionLink(txid: string): string {
    return this.getLink(`/tx/${txid}`);
  }

  private getLink(path: string): string {
    if (!this.baseUrl) {
      return '';
    }

    const link = this.baseUrl + path;
    return link;
  }
}
