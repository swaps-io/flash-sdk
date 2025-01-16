import { evm } from '../../../lib/evm';

const ERC20_INFINITE_AMOUNT = (2n ** 256n - 1n).toString();

const PERMIT_SAFE_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount_',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'signature_',
        type: 'bytes',
      },
    ],
    name: 'permitSafe',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const encodePermitSafe = async (
  from: string,
  token: string,
  amount: string | undefined,
  signature: string,
): Promise<string> => {
  const approveAmount = amount ?? ERC20_INFINITE_AMOUNT;
  const permitSafeData = await evm.functionDataEncode(PERMIT_SAFE_ABI, 'permitSafe', [
    from,
    token,
    approveAmount,
    signature,
  ]);
  return permitSafeData;
};
