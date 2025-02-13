import type { Hex } from 'viem';

import { evm } from '../../../lib/evm';

const MULTI_SEND = [
  {
    name: 'multiSend',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'transactions', type: 'bytes' }],
    outputs: [],
  },
];

export const encodeMultiSend = async (multiSendCalls: string[]): Promise<string> => {
  const { concatHex } = await import('viem');
  const transactions = concatHex(multiSendCalls as Hex[]);
  const multiSendCalldata = await evm.functionDataEncode(MULTI_SEND, 'multiSend', [transactions]);
  return multiSendCalldata;
};
