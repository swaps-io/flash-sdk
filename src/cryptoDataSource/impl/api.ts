import { setRequestProjectId } from '../../api/client/axios/core/id';
import { AxiosInstanceSource } from '../../api/client/axios/core/source';
import { setAxiosInstanceCryptoV0 } from '../../api/client/axios/crypto-v0';
import {
  ChainCryptoV0,
  ContractInfoCryptoV0,
  CryptoCryptoV0,
  ExplorerCryptoV0,
  getChainsCryptoV0,
  getContractsCryptoV0,
  getCryptosCryptoV0,
  getExplorersCryptoV0,
} from '../../api/gen/crypto-v0';
import { ZERO_ADDRESS } from '../../helper/address';
import { isNull } from '../../helper/null';
import { ChainData, CollateralContractData, ContractData, Crypto, CryptoData, ExplorerData } from '../../model';
import { ICryptoDataSource } from '../interface';

/**
 * Params for {@link ApiCryptoDataSource} constructor
 *
 * @category Crypto Source
 */
export interface ApiCryptoDataSourceParams {
  /**
   * Project identifier for Flash APIs
   *
   * Must consist of "a"-"z", "A"-"Z", "0"-"9", "-", and "_" (at least 1 character)
   */
  projectId: string;

  /**
   * Client for Flash Crypto API access
   *
   * See {@link AxiosInstanceSource} for supported options
   *
   * @default 'https://crypto.prod.swaps.io'
   */
  cryptoClient?: AxiosInstanceSource;
}

/**
 * Api crypto source that fetches crypto data from API
 *
 * @category Crypto Source
 */
export class ApiCryptoDataSource implements ICryptoDataSource {
  public constructor(params: ApiCryptoDataSourceParams) {
    const { projectId, cryptoClient = 'https://crypto.prod.swaps.io' } = params;

    setRequestProjectId(projectId);
    setAxiosInstanceCryptoV0(cryptoClient);
  }

  public async getChains(): Promise<ChainData[]> {
    const result = await getChainsCryptoV0();
    return result.data.chains.map((c) => this.mapChain(c));
  }

  public async getExplorers(): Promise<ExplorerData[]> {
    const result = await getExplorersCryptoV0();
    return result.data.explorers.map((e) => this.mapExplorer(e));
  }

  public async getContracts(): Promise<ContractData[]> {
    const result = await getContractsCryptoV0();
    return result.data.contracts.map((c) => this.mapContract(c));
  }

  public async getCryptos(): Promise<CryptoData[]> {
    const result = await getCryptosCryptoV0();
    return result.data.cryptos.map((c) => this.mapCrypto(c));
  }

  private mapChain(c: ChainCryptoV0): ChainData {
    const data: ChainData = {
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      layer1Parent: isNull(c.l1) ? undefined : c.l1,
    };
    return data;
  }

  private mapExplorer(e: ExplorerCryptoV0): ExplorerData {
    const data: ExplorerData = {
      id: e.id,
      name: e.name,
      domain: e.domain,
      baseUrl: e.base_url,
      chainId: e.chain_id,
    };
    return data;
  }

  private mapContract(c: ContractInfoCryptoV0): ContractData {
    let collateralData: CollateralContractData | undefined;
    if (c.collateral_support) {
      collateralData = {
        chainId: c.chain_id,
        address: c.collateral_address ?? ZERO_ADDRESS,
        decimals: c.collateral_decimals ?? 0,
        balanceCryptoIds: c.collateral_token_addresses.map((address) => Crypto.makeId(c.chain_id, address)),
      };
    }

    let collateralBitcoinData: CollateralContractData | undefined;
    if (c.collateral_bitcoin_support) {
      collateralBitcoinData = {
        chainId: c.chain_id,
        address: c.collateral_bitcoin_address ?? ZERO_ADDRESS,
        decimals: c.collateral_bitcoin_decimals ?? 0,
        balanceCryptoIds:
          c.collateral_bitcoin_token_addresses?.map((address) => Crypto.makeId(c.chain_id, address)) ?? [],
      };
    }

    const data: ContractData = {
      chainId: c.chain_id,
      address: c.address,
      collateral: collateralData,
      collateralBitcoin: collateralBitcoinData,
      nativeWrapCryptoId: Crypto.makeId(c.chain_id, c.native_wrap_address),
    };
    return data;
  }

  private mapCrypto(c: CryptoCryptoV0): CryptoData {
    const data: CryptoData = {
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      address: c.address,
      icon: c.icon,
      decimals: c.decimals,
      permit: c.permit,
      priceId: c.price_id,
      mintable: c.mintable,
      chainId: c.chain_id,
      forbidFrom: c.forbid_from,
      forbidTo: c.forbid_to,
      isNativeWrap: c.native_wrap,
    };
    return data;
  }
}
