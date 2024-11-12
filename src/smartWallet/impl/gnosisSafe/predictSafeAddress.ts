import type { Hex } from 'viem';

import { ZERO_ADDRESS } from '../../../helper/address';
import { evm } from '../../../lib/evm';

export const DEFAULT_SAFE_VERSION = '1.4.1';
export const KX_SAFE_WALLET_RECVSALT = '0x73776170732d696F000000000000000000000000'; // 0x{swaps-io}
// https://github.com/safe-global/safe-deployments/blob/main/src/assets/v1.4.1/compatibility_fallback_handler.json
export const SAFE_WALLET_DEFAULT_FALLBACK_HANDLER_ADDRESS = '0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99';
// Obtained from contract at `SAFE_WALLET_PROXY_FACTORY_ADDRESS` call `proxyCreationCode()`
const SAFE_WALLET_PROXY_CREATION_CODE =
  '0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806101c46022913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060ab806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea264697066735822122003d1488ee65e08fa41e58e888a9865554c535f2c77126a82cb4c0f917f31441364736f6c63430007060033496e76616c69642073696e676c65746f6e20616464726573732070726f7669646564';
// https://github.com/safe-global/safe-deployments/blob/main/src/assets/v1.4.1/safe.json
const SAFE_WALLET_MASTER_COPY_ADDRESS = '0x41675C099F32341bf84BFc5382aF534df5C7461a';
// https://github.com/safe-global/safe-deployments/blob/main/src/assets/v1.4.1/safe_proxy_factory.json
const SAFE_WALLET_PROXY_FACTORY_ADDRESS = '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67';

const addressCache = new Map<string, string>();

export async function predictSafeAddress(eoaAddress: string, saltNonce = 0): Promise<string> {
  if (addressCache.has(eoaAddress)) {
    return addressCache.get(eoaAddress)!;
  }
  const { concat, encodeAbiParameters, getContractAddress, isHex, keccak256, parseAbiParameters } = await import(
    'viem'
  );
  const asHex = (hex?: string): Hex => {
    return isHex(hex) ? hex : `0x${hex}`;
  };
  const encodeParameters = (types: string, values: unknown[]): string => {
    return encodeAbiParameters(parseAbiParameters(types), values);
  };
  const initializer = await encodeInitializer(eoaAddress);
  const initializerHash = keccak256(initializer as Hex);
  const encodedNonce = asHex(encodeParameters('uint256', [saltNonce]));
  const salt = keccak256(concat([initializerHash, encodedNonce]));
  const input = encodeParameters('address', [SAFE_WALLET_MASTER_COPY_ADDRESS]);
  const from = SAFE_WALLET_PROXY_FACTORY_ADDRESS;
  const initCode = concat([SAFE_WALLET_PROXY_CREATION_CODE, asHex(input)]);
  const address = getContractAddress({
    from,
    bytecode: initCode,
    opcode: 'CREATE2',
    salt,
  });
  addressCache.set(eoaAddress, address);
  return address;
}

async function encodeInitializer(userAddress: string): Promise<string> {
  const abi = await import('./abi');
  return await evm.functionDataEncode(abi.SAFE_ABI, 'setup', makeParams(userAddress));
}

export function makeParams(userAddress: string): unknown[] {
  return [
    /* _owners */ [userAddress],
    /* _threshold */ 1,
    /* to */ ZERO_ADDRESS,
    /* data */ '0x',
    /* fallbackHandler */ SAFE_WALLET_DEFAULT_FALLBACK_HANDLER_ADDRESS,
    /* paymentToken */ ZERO_ADDRESS,
    /* payment */ 0,
    /* paymentReceiver */ KX_SAFE_WALLET_RECVSALT,
  ];
}
