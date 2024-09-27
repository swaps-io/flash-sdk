import { evm } from '../../../lib/evm';

const ERC20_INFINITE_AMOUNT = (2n ** 256n - 1n).toString();

const ERC20_APPROVE_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

export const encodeErc20Approve = async (spender: string, amount: string | undefined): Promise<string> => {
  const approveAmount = amount ?? ERC20_INFINITE_AMOUNT;
  const approveData = await evm.functionDataEncode(ERC20_APPROVE_ABI, 'approve', [spender, approveAmount]);
  return approveData;
};

export const encodeErc20Allowance = async (owner: string, spender: string): Promise<string> => {
  const allowanceData = await evm.functionDataEncode(ERC20_APPROVE_ABI, 'allowance', [owner, spender]);
  return allowanceData;
};

export const decodeErc20Allowance = async (data: string): Promise<string> => {
  const allowance: bigint = await evm.functionResultDecode(ERC20_APPROVE_ABI, 'allowance', data);
  return allowance.toString();
};
