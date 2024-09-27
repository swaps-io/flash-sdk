import type { Hex, TypedDataDomain as ViemTypedDataDomain } from 'viem';

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
import { isArray, isNotNull } from '../util';

interface AbiParam {
  type: string;
  components?: AbiParam[];
}

/**
 * EVM functionality provider based on Viem library
 *
 * @category EVM Provider Impl
 */
export class ViemEvmProvider implements IEvmProvider {
  public name(): string {
    return 'Viem';
  }

  public async keccak256(data: string): Promise<string> {
    const viem = await import('viem');
    const hash = viem.keccak256(this.asHex(data));
    return hash;
  }

  public async sha256(data: string): Promise<string> {
    const viem = await import('viem');
    const hash = viem.sha256(this.asHex(data));
    return hash;
  }

  public async abiEncode(types: AbiType[], values: AbiValue[]): Promise<string> {
    const viem = await import('viem');
    const params = types.map((t) => this.toAbiParam(t));
    const data = viem.encodeAbiParameters(params, values);
    return data;
  }

  public async functionDataEncode(abi: AbiSpec, name: string, args?: unknown[]): Promise<string> {
    const viem = await import('viem');
    const data = viem.encodeFunctionData({ abi, functionName: name, args });
    return data;
  }

  public async functionResultDecode<T>(abi: AbiSpec, name: string, data: string): Promise<T> {
    const viem = await import('viem');
    const result = viem.decodeFunctionResult({ abi, functionName: name, data: this.asHex(data) });
    return result as T;
  }

  public async hashTypedData(domain: TypedDataDomain, types: TypedDataFields, value: TypedDataValue): Promise<string> {
    const viemDomain: ViemTypedDataDomain = {
      ...domain,
      chainId: isNotNull(domain.chainId) ? Number(domain.chainId) : undefined,
      verifyingContract: isNotNull(domain.verifyingContract) ? this.asHex(domain.verifyingContract) : undefined,
      salt: isNotNull(domain.salt) ? this.asHex(domain.salt) : undefined,
    };

    const typesInUse = new Set(
      Object.values(types)
        .flatMap((typeFields) => typeFields)
        .map((field) => field.type),
    );
    const primaryTypes = Object.keys(types).filter((type) => !typesInUse.has(type));
    if (primaryTypes.length !== 1) {
      throw new Error('Cannot deduce primary type for typed data hash');
    }

    const viem = await import('viem');
    const hash = viem.hashTypedData({
      domain: viemDomain,
      types,
      primaryType: primaryTypes[0],
      message: value,
    });
    return hash;
  }

  public async toHexBytes(value: bigint, bytes?: number): Promise<string> {
    const viem = await import('viem');
    const hex = viem.toHex(value, { size: bytes });
    return hex;
  }

  public async convertSignature(signature: string): Promise<CompactSignature> {
    const viem = await import('viem');
    const viemSignature = viem.hexToSignature(this.asHex(signature));
    const sig = viem.signatureToCompactSignature(viemSignature);
    const cs: CompactSignature = { r: sig.r, vs: sig.yParityAndS };
    return cs;
  }

  private asHex(value: string): Hex {
    return value as Hex;
  }

  private toAbiParam(abiType: AbiType): AbiParam {
    if (isArray(abiType)) {
      const param: AbiParam = {
        type: 'tuple',
        components: abiType.map((t) => this.toAbiParam(t)),
      };
      return param;
    }

    if (typeof abiType === 'object') {
      if (typeof abiType.array === 'string') {
        const param: AbiParam = {
          type: `${abiType.array}[]`,
        };
        return param;
      }

      const param: AbiParam = {
        type: 'tuple[]',
        components: abiType.array.map((t) => this.toAbiParam(t)),
      };
      return param;
    }

    const param: AbiParam = {
      type: abiType,
    };
    return param;
  }
}
