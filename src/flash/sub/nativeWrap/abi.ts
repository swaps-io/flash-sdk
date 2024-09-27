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
