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

export const encodeMultiSend = async (multiSendCalls: string[]): Promise<string> => {
  const { concatHex } = await import('viem');
  const transactions = concatHex(multiSendCalls as Hex[]);
  const multiSendData = await evm.functionDataEncode(MULTI_SEND_ABI, 'multiSend', [transactions]);
  return multiSendData;
};

export const MULTI_SEND_CONTACT_ADDRESS = '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526';
