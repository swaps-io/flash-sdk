import { evm } from '../../../lib/evm';

export const NATIVE_WRAP_ABI = [
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    payable: true,
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'wad',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    payable: false,
    type: 'function',
  },
];

export const encodeDeposit = async (): Promise<string> => {
  const depositData = await evm.functionDataEncode(NATIVE_WRAP_ABI, 'deposit', []);
  return depositData;
};
