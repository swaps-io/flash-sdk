import type { ParamType } from 'ethers';

import { EvmProviderError } from '../error';
import { IEvmProvider } from '../interface';
import {
  AbiSpec,
  AbiType,
  AbiValue,
  CompactSignature,
  TypedDataDomain,
  TypedDataFields,
  TypedDataValue,
} from '../model';
import { isArray, isNull } from '../util';

/**
 * EVM functionality provider based on Ethers library
 *
 * @category EVM Provider Impl
 */
export class EthersEvmProvider implements IEvmProvider {
  public name(): string {
    return 'Ethers';
  }

  public async keccak256(data: string): Promise<string> {
    const ethers = await import('ethers');
    const hash = ethers.keccak256(data);
    return hash;
  }

  public async sha256(data: string): Promise<string> {
    const ethers = await import('ethers');
    const hash = ethers.sha256(data);
    return hash;
  }

  public async abiEncode(types: AbiType[], values: AbiValue[]): Promise<string> {
    const ethers = await import('ethers');
    const ethersTypes = types.map((t) => this.toEthersType(t));
    const data = ethers.AbiCoder.defaultAbiCoder().encode(ethersTypes, values);
    return data;
  }

  public async functionDataEncode(abi: AbiSpec, name: string, args?: unknown[]): Promise<string> {
    const ethers = await import('ethers');
    const paramType = await this.extractParamType(abi, name);
    const data = ethers.AbiCoder.defaultAbiCoder().encode([paramType], args ?? []);
    return data;
  }

  public async functionResultDecode<T>(abi: AbiSpec, name: string, data: string): Promise<T> {
    const ethers = await import('ethers');
    const paramType = await this.extractParamType(abi, name);
    const result = ethers.AbiCoder.defaultAbiCoder().decode([paramType], data);
    return result as T;
  }

  public async hashTypedData(domain: TypedDataDomain, types: TypedDataFields, value: TypedDataValue): Promise<string> {
    const ethers = await import('ethers');
    const hash = ethers.TypedDataEncoder.hash(domain, types, value);
    return hash;
  }

  public async toHexBytes(value: bigint, bytes?: number): Promise<string> {
    const ethers = await import('ethers');
    const hex = ethers.toBeHex(value, bytes);
    return hex;
  }

  public async convertSignature(signature: string): Promise<CompactSignature> {
    const ethers = await import('ethers');
    const sig = ethers.Signature.from(signature);
    const cs: CompactSignature = { r: sig.r, vs: sig.yParityAndS };
    return cs;
  }

  private toEthersType(abiType: AbiType): string {
    if (isArray(abiType)) {
      return this.toEthersTupleType(abiType);
    }

    if (typeof abiType === 'object') {
      return this.toEthersArrayType(abiType.array);
    }

    return abiType;
  }

  private toEthersTupleType(abiTypes: AbiType[]): string {
    let tupleType = 'tuple(';
    let prependComma = false;
    for (const abiType of abiTypes) {
      if (prependComma) {
        tupleType += ',';
      }
      tupleType += this.toEthersType(abiType);
      prependComma = true;
    }
    tupleType += ')';
    return tupleType;
  }

  private toEthersArrayType(abiTypes: string | AbiType[]): string {
    let arrayType = this.toEthersType(abiTypes);
    arrayType += '[]';
    return arrayType;
  }

  private async extractParamType(abi: AbiSpec, name: string): Promise<ParamType> {
    const fragment = abi.find((fragment) => fragment.name === name);
    if (isNull(fragment)) {
      throw new EvmProviderError(`Fragment '${name}' does not exist in ABI spec`);
    }

    const ethers = await import('ethers');
    const paramType = ethers.ParamType.from(fragment);
    return paramType;
  }
}
