import {
  AbiSpec,
  AbiType,
  AbiValue,
  CompactSignature,
  TypedDataDomain,
  TypedDataFields,
  TypedDataValue,
} from './model';

/**
 * EVM functionality provider
 *
 * @category EVM Provider
 */
export interface IEvmProvider {
  /**
   * EVM provider name
   */
  name(): string;

  /**
   * Calculates Keccak (SHA-3) hash of given data with output size of 32 bytes
   *
   * @param data Hex data to calc hash of
   *
   * @returns Hex-encoded data hash
   */
  keccak256(data: string): Promise<string>;

  /**
   * Calculates SHA-256 hash of given data with output size of 32 bytes
   *
   * @param data Hex data to calc hash of
   *
   * @returns Hex-encoded data hash
   */
  sha256(data: string): Promise<string>;

  /**
   * Encodes ABI data of given values according to their types
   *
   * @param types List of ABI types
   * @param values List of values corresponding to ABI types
   *
   * @returns Hex-encoded ABI data
   */
  abiEncode(types: AbiType[], values: AbiValue[]): Promise<string>;

  /**
   * Encodes function call data
   *
   * @param abi ABI specification of a contract
   * @param name Function name presented in the ABI spec
   * @param args Function call arguments
   *
   * @returns Hex-encoded function call data
   */
  functionDataEncode(abi: AbiSpec, name: string, args?: unknown[]): Promise<string>;

  /**
   * Decodes function call result data
   *
   * @param abi ABI specification of a contract
   * @param name Function name presented in the ABI spec
   * @param data Function result data
   *
   * @returns Decoded function result data
   */
  functionResultDecode<T>(abi: AbiSpec, name: string, data: string): Promise<T>;

  /**
   * Calculates typed data hash according to EIP-712 standard
   *
   * @param domain Domain of the typed data
   * @param types Typed data specification
   * @param value Typed data value
   *
   * @returns Hex-encoded hash of typed data
   */
  hashTypedData(domain: TypedDataDomain, types: TypedDataFields, value: TypedDataValue): Promise<string>;

  /**
   * Converts a numeric value to hex-encoded big endian bytes of specified size
   *
   * @param value Value to base result bytes on
   * @param bytes Number of result bytes (i.e. size in bytes)
   *
   * @returns Hex-encoded bytes of the value
   */
  toHexBytes(value: bigint, bytes?: number): Promise<string>;

  /**
   * Converts full signature (65 bytes) to its compact form (64 bytes)
   *
   * @param signature Hex-encoded full signature to compact
   *
   * @returns Compact signature components
   */
  convertSignature(signature: string): Promise<CompactSignature>;
}
