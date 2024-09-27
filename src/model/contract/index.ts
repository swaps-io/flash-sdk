import { isNull } from '../../helper/null';
import { generateRandomId } from '../../helper/random';
import { CollateralContract } from '../collateralContract';
import { Crypto } from '../crypto';
import { Data } from '../data';

import { ContractData } from './data';

export type { ContractData };

/**
 * Crypto getter by specified crypto ID
 *
 * @category Contract
 */
export type ContractCryptoGetter = (cryptoId: string) => Crypto;

const getUnknownCrypto: ContractCryptoGetter = (cryptoId) => {
  return Crypto.unknown({ id: cryptoId });
};

/**
 * Flash contract deployment info
 *
 * @category Contract
 */
export class Contract implements Data<ContractData> {
  /**
   * Plain data of the contract. Can be used for serialization
   */
  public readonly data: ContractData;

  private readonly getCrypto: ContractCryptoGetter;

  public constructor(data: ContractData, getCrypto: ContractCryptoGetter) {
    this.data = data;
    this.getCrypto = getCrypto;
  }

  /**
   * Constructs unknown {@link Contract} mockup
   *
   * @param known Known properties the contract is unknown for
   *
   * @returns Instance of {@link Contract}
   */
  public static unknown(
    known: Partial<Pick<ContractData, 'chainId' | 'address'>> = {},
    getCrypto?: ContractCryptoGetter,
  ): Contract {
    const data: ContractData = {
      chainId: known.chainId ?? `unknown-chain-${generateRandomId()}`,
      address: known.address ?? '',
      collateral: undefined,
      collateralBitcoin: undefined,
      nativeWrapCryptoId: '',
    };
    return new Contract(data, getCrypto ?? getUnknownCrypto);
  }

  /**
   * Chain ID of main Flash contract
   */
  public get chainId(): string {
    return this.data.chainId;
  }

  /**
   * Address of main Flash contract on the chain
   */
  public get address(): string {
    return this.data.address;
  }

  /**
   * Native wrap crypto
   */
  public get nativeWrapCrypto(): Crypto {
    return this.getCrypto(this.data.nativeWrapCryptoId);
  }

  /**
   * Collateral manager main Flash was configured to use
   *
   * Collateral manager may be not supported on a chain,
   * which is indicated by this value being `undefined`
   */
  public get collateral(): CollateralContract | undefined {
    if (isNull(this.data.collateral)) {
      return undefined;
    }

    return new CollateralContract(this.data.collateral, this.getCrypto);
  }

  /**
   * Collateral manager contract for serving Bitcoin orders
   * main Flash was configured to use
   *
   * Bitcoin collateral manager may be not supported on a chain,
   * which is indicated by this value being `undefined`
   */
  public get collateralBitcoin(): CollateralContract | undefined {
    if (isNull(this.data.collateralBitcoin)) {
      return undefined;
    }

    return new CollateralContract(this.data.collateralBitcoin, this.getCrypto);
  }
}
