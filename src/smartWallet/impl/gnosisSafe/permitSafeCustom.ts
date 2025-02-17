import { evm } from '../../../lib/evm';

const PERMIT_SAFE_CUSTOM = [
  {
    constant: false,
    inputs: [
      {
        name: 'safeWalletAddress',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
      {
        name: 'operation',
        type: 'uint8',
      },
      {
        name: 'signatures',
        type: 'bytes',
      },
    ],
    name: 'permitSafeCustom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export async function encodePermitSafeCustom(
  safeWalletAddress: string,
  to: string,
  value: string,
  data: string,
  delegateCall: boolean,
  signatures: string,
): Promise<string> {
  const permitSafeCustomData = await evm.functionDataEncode(PERMIT_SAFE_CUSTOM, 'permitSafeCustom', [
    safeWalletAddress,
    to,
    value,
    data,
    delegateCall ? 1 : 0,
    signatures,
  ]);
  return permitSafeCustomData;
}
