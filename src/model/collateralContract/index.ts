import { Crypto } from '../crypto';
import { Data } from '../data';

import { CollateralContractData } from './data';

export type { CollateralContractData } from './data';

/**
 * Crypto getter by specified crypto ID
 *
 * @category Collateral Contract
 */
export type CollateralContractCryptoGetter = (cryptoId: string) => Crypto;

/**
 * Collateral manager contract deployment info
 *
 * @category Collateral Contract
 */
export class CollateralContract implements Data<CollateralContractData> {
  /**
   * Plain data of the contract. Can be used for serialization
   */
  public readonly data: CollateralContractData;

  private readonly getCrypto: CollateralContractCryptoGetter;

  public constructor(data: CollateralContractData, getCrypto: CollateralContractCryptoGetter) {
    this.data = data;
    this.getCrypto = getCrypto;
  }

  /**
   * Chain ID of collateral manager contract
   */
  public get chainId(): string {
    return this.data.chainId;
  }

  /**
   * Address of collateral manager contract
   */
  public get address(): string {
    return this.data.address;
  }

  /**
   * Decimals collateral contract calculates balances & amounts in
   */
  public get decimals(): number {
    return this.data.decimals;
  }

  /**
   * Cryptos that can be used for providing collateral balance
   */
  public get balanceCryptos(): Crypto[] {
    return this.data.balanceCryptoIds.map(this.getCrypto);
  }
}
