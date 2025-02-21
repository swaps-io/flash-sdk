import type { Hex } from 'viem';

import { evm } from '../../../lib/evm';

const MULTI_SEND_ABI = [
  {
    name: 'multiSend',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'transactions', type: 'bytes' }],
    outputs: [],
  },
];

export const encodeMultiSend = async (multiSendTransactions: string[]): Promise<string> => {
  const { concatHex } = await import('viem');
  const transactions = concatHex(multiSendTransactions as Hex[]);
  const multiSendData = await evm.functionDataEncode(MULTI_SEND_ABI, 'multiSend', [transactions]);
  return multiSendData;
};

export const MULTI_SEND_CONTACT_ADDRESS = '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526';

export const encodeMultiSendTransaction = async (
  target: string,
  data: string,
  value = 0n,
  delegateCall = false,
): Promise<string> => {
  const { encodePacked, size } = await import('viem');
  const transaction = encodePacked(
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [delegateCall ? 1 : 0, target, value, BigInt(size(data as Hex)), data as Hex],
  );
  return transaction;
};
