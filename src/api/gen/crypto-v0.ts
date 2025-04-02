/**
 * Generated by orval v7.7.0 🍺
 * Do not edit manually.
 * Crypto API (v0)
 * API for crypto, chain and explorer lists (v0)
 * OpenAPI spec version: v0.1.0
 */
import { axiosClientCryptoV0 } from '../client/axios/crypto-v0';

export type ChainCryptoV0L1 = string | null;

export interface ChainCryptoV0 {
  id: string;
  name: string;
  icon: string;
  color: string;
  l2: boolean;
  l1: ChainCryptoV0L1;
}

export interface ChainListCryptoV0 {
  chains: ChainCryptoV0[];
}

export type ContractInfoCryptoV0CollateralDecimals = number | null;

export type ContractInfoCryptoV0CollateralAddress = string | null;

export type ContractInfoCryptoV0CollateralBitcoinAddress = string | null;

export type ContractInfoCryptoV0CollateralBitcoinDecimals = number | null;

export interface ContractInfoCryptoV0 {
  chain_id: string;
  address: string;
  collateral_support: boolean;
  collateral_token_addresses: string[];
  collateral_bitcoin_token_addresses: string[];
  collateral_decimals: ContractInfoCryptoV0CollateralDecimals;
  collateral_address: ContractInfoCryptoV0CollateralAddress;
  collateral_bitcoin_address: ContractInfoCryptoV0CollateralBitcoinAddress;
  collateral_bitcoin_decimals: ContractInfoCryptoV0CollateralBitcoinDecimals;
  collateral_bitcoin_support: boolean;
  native_wrap_address: string;
}

export interface ContractListCryptoV0 {
  contracts: ContractInfoCryptoV0[];
}

export interface CryptoCryptoV0 {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chain_id: string;
  icon: string;
  decimals: number;
  permit: boolean;
  price_id: string;
  mintable: boolean;
  forbid_from: boolean;
  forbid_to: boolean;
  native_wrap: boolean;
}

export interface CryptoListCryptoV0 {
  cryptos: CryptoCryptoV0[];
}

export interface ExplorerCryptoV0 {
  id: string;
  chain_id: string;
  name: string;
  domain: string;
  base_url: string;
}

export interface ExplorerListCryptoV0 {
  explorers: ExplorerCryptoV0[];
}

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * Returns list of cryptos
 * @summary Get list of cryptos
 */
export const getCryptosCryptoV0 = (options?: SecondParameter<typeof axiosClientCryptoV0>) => {
  return axiosClientCryptoV0<CryptoListCryptoV0>({ url: `/api/v0/cryptos`, method: 'GET' }, options);
};

/**
 * Returns list of chains
 * @summary Get list of chains
 */
export const getChainsCryptoV0 = (options?: SecondParameter<typeof axiosClientCryptoV0>) => {
  return axiosClientCryptoV0<ChainListCryptoV0>({ url: `/api/v0/chains`, method: 'GET' }, options);
};

/**
 * Returns list of explorers
 * @summary Get list of explorers
 */
export const getExplorersCryptoV0 = (options?: SecondParameter<typeof axiosClientCryptoV0>) => {
  return axiosClientCryptoV0<ExplorerListCryptoV0>({ url: `/api/v0/explorers`, method: 'GET' }, options);
};

/**
 * Returns contracts info
 * @summary Get contracts
 */
export const getContractsCryptoV0 = (options?: SecondParameter<typeof axiosClientCryptoV0>) => {
  return axiosClientCryptoV0<ContractListCryptoV0>({ url: `/api/v0/contracts`, method: 'GET' }, options);
};

export type GetCryptosCryptoV0Result = NonNullable<Awaited<ReturnType<typeof getCryptosCryptoV0>>>;
export type GetChainsCryptoV0Result = NonNullable<Awaited<ReturnType<typeof getChainsCryptoV0>>>;
export type GetExplorersCryptoV0Result = NonNullable<Awaited<ReturnType<typeof getExplorersCryptoV0>>>;
export type GetContractsCryptoV0Result = NonNullable<Awaited<ReturnType<typeof getContractsCryptoV0>>>;
