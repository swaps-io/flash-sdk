/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Hex, PrivateKeyAccount } from 'viem';

export const ANY_CHAIN = -1;

export const normalizeChainId = (chainId: string | undefined): number => {
  return chainId == null ? ANY_CHAIN : Number(chainId);
};

export const normalizeAddress = (address: string): Hex => {
  return address as Hex;
};

export const normalizeData = (data: string | undefined): Hex | undefined => {
  if (data == null) {
    return undefined;
  }

  return data as Hex;
};

export const normalizeValue = (value: string | undefined): bigint | undefined => {
  if (value == null) {
    return undefined;
  }

  return BigInt(value);
};

export type TypedDataComponents = Parameters<PrivateKeyAccount['signTypedData']>[0];

export const normalizeTypedData = (data: string): TypedDataComponents => {
  const signable = JSON.parse(data);
  const domain = signable.domain;
  const message = signable.message;
  const primaryType = signable.primaryType;
  const types = signable.types;
  delete types.EIP712Domain;
  return { domain, message, types, primaryType };
};
