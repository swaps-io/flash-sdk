/**
 * ABI type definition:
 * - `string`: a primitive type (`uint256`, `bytes32`, etc)
 * - `Array`: tuple of specified types (`tuple(...)`)
 * - `Object` with `array` property: array of specified types (`...[]`):
 *   - `string`: a primitive type (`uint256`, `bytes32`, etc)
 *   - `Array`: tuple of specified types (`tuple(...)`)
 *
 * @category EVM Provider
 */
export type AbiType =
  | string
  | AbiType[]
  | {
      /**
       * Designates array of specified types
       */
      array: string | AbiType[];
    };

/**
 * ABI value:
 * - `string`, `bigint` - primitive value
 * - `Array` - nested tuple or array of primitive values
 *
 * @category EVM Provider
 */
export type AbiValue = string | bigint | AbiValue[];

/**
 * Fragment of ABI specification, i.e. single function, event, etc.
 *
 * @category EVM Provider
 */
export interface AbiFragment {
  /**
   * Name of the ABI fragment
   */
  name: string;
}

/**
 * ABI specification of a contract
 *
 * @category EVM Provider
 */
export type AbiSpec = AbiFragment[];

/**
 * Typed data domain according to EIP-712 standard
 *
 * @category EVM Provider
 */
export interface TypedDataDomain {
  /**
   * Typed data domain name (optional)
   */
  name?: string;

  /**
   * Typed data domain version (optional)
   */
  version?: string;

  /**
   * Chain ID where signature is applicable only (optional)
   */
  chainId?: bigint;

  /**
   * Contract address where signature is applicable only (optional)
   */
  verifyingContract?: string;

  /**
   * Custom salt value as part of typed domain (optional)
   */
  salt?: string;
}

/**
 * Typed data field descriptor
 *
 * @category EVM Provider
 */
export interface TypedDataField {
  /**
   * Field name
   */
  name: string;

  /**
   * Field ABI type spec
   */
  type: string;
}

/**
 * Typed data fields descriptor
 *
 * Type name serves as a key, array of corresponding type fields as a value
 *
 * @category EVM Provider
 */
export type TypedDataFields = Record<string, TypedDataField[]>;

/**
 * Typed data value
 *
 * @category EVM Provider
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedDataValue = Record<string, any>;

/**
 * Compact signature components
 *
 * @category EVM Provider
 */
export interface CompactSignature {
  /**
   * R component of compact signature
   */
  r: string;

  /**
   * VS component of compact signature
   */
  vs: string;
}
