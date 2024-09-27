import { Hex, verifyTypedData } from 'viem';

import { GnosisSafeWallet, ViemWallet } from '../src';
import { encodeErc20Approve } from '../src/cryptoApprove/impl/api/erc20';
import { normalizeTypedData } from '../src/wallet/impl/viem/normalization';

const TIMEOUT = 60 * 60 * 1000; // 1h

test(
  'Gets owners of Gnosis Safe wallet on Gnosis chain',
  async () => {
    const { gnosis } = await import('viem/chains');
    const gnosisChainId = gnosis.id.toString();
    const gnosisRpcUrl = gnosis.rpcUrls.default.http[0];

    const safe = new GnosisSafeWallet({
      chains: [
        {
          chainId: gnosisChainId,
          rpcUrl: gnosisRpcUrl,
          address: '0x9210B6A21d12F0578E974579c7E0ab6e0814aE2B',
        },
      ],
    });

    const owners = await safe.getOwners({ chainId: gnosisChainId });
    expect(owners.size).toBe(1);
    expect(owners.has('0x3ab09306654422b14cd5659086b1e5f1081bacb2'));
  },
  TIMEOUT,
);

test(
  'Creates sign token approve data for Gnosis Safe wallet',
  async () => {
    const { gnosis } = await import('viem/chains');
    const gnosisChainId = gnosis.id.toString();
    const gnosisRpcUrl = gnosis.rpcUrls.default.http[0];

    const safe = new GnosisSafeWallet({
      chains: [
        {
          chainId: gnosisChainId,
          rpcUrl: gnosisRpcUrl,
          address: '0x9210B6A21d12F0578E974579c7E0ab6e0814aE2B',
        },
      ],
    });

    const approveSignParams = await safe.getSignTransactionParams({
      chainId: gnosisChainId,
      to: '0x4567456745674567456745674567456745674567',
      data: await encodeErc20Approve('0x0123012301230123012301230123012301230123', '1234567890'),
      from: '0x0000000000000000000000000000000000000000', // Doesn't matter here
      tag: 'sign-smart-approve-tx-test',
    });

    const expectedApproveData = `
      {
        "types": {
          "EIP712Domain": [
            {
              "type": "uint256",
              "name": "chainId"
            },
            {
              "type": "address",
              "name": "verifyingContract"
            }
          ],
          "SafeTx": [
            {
              "type": "address",
              "name": "to"
            },
            {
              "type": "uint256",
              "name": "value"
            },
            {
              "type": "bytes",
              "name": "data"
            },
            {
              "type": "uint8",
              "name": "operation"
            },
            {
              "type": "uint256",
              "name": "safeTxGas"
            },
            {
              "type": "uint256",
              "name": "baseGas"
            },
            {
              "type": "uint256",
              "name": "gasPrice"
            },
            {
              "type": "address",
              "name": "gasToken"
            },
            {
              "type": "address",
              "name": "refundReceiver"
            },
            {
              "type": "uint256",
              "name": "nonce"
            }
          ]
        },
        "domain": {
          "verifyingContract": "0x9210b6a21d12f0578e974579c7e0ab6e0814ae2b",
          "chainId": "100"
        },
        "primaryType": "SafeTx",
        "message": {
          "to": "0x4567456745674567456745674567456745674567",
          "value": "0",
          "data": "0x095ea7b3000000000000000000000000012301230123012301230123012301230123012300000000000000000000000000000000000000000000000000000000499602d2",
          "operation": 0,
          "baseGas": "0",
          "gasPrice": "0",
          "gasToken": "0x0000000000000000000000000000000000000000",
          "refundReceiver": "0x0000000000000000000000000000000000000000",
          "nonce": 3,
          "safeTxGas": "0"
        }
      }
    `.replace(/\s/g, ''); // Remove whitespace chars
    expect(approveSignParams.data).toBe(expectedApproveData);
  },
  TIMEOUT,
);

test(
  'Produces signable approve sign params for Gnosis Safe wallet',
  async () => {
    const { gnosis } = await import('viem/chains');
    const gnosisChainId = gnosis.id.toString();
    const gnosisRpcUrl = gnosis.rpcUrls.default.http[0];

    const safe = new GnosisSafeWallet({
      chains: [
        {
          chainId: gnosisChainId,
          rpcUrl: gnosisRpcUrl,
          address: '0x9210B6A21d12F0578E974579c7E0ab6e0814aE2B',
        },
      ],
    });

    const signerWallet = new ViemWallet({
      privateKey: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    });
    const signerAddress = await signerWallet.getAddress();
    expect(signerAddress).toBe('0xfcad0b19bb29d4674531d6f115237e16afce377c');

    const approveSignParams = await safe.getSignTransactionParams({
      chainId: gnosisChainId,
      to: '0x4567456745674567456745674567456745674567',
      data: await encodeErc20Approve('0x0123012301230123012301230123012301230123', '1234567890'),
      from: signerAddress,
      tag: 'sign-smart-approve-tx-test',
    });

    const signature = await signerWallet.signTypedData(approveSignParams);

    const expectedSignature =
      '0x4176124da1d15a8d0eac659042d86b39755247b297712171a4976ba4f62a6fba3195476f9b3c604f722e86eb391174c7ed11262d0348b6b627af3d068ee417ed1c';
    expect(signature).toBe(expectedSignature);

    const valid = await verifyTypedData({
      ...normalizeTypedData(approveSignParams.data),
      signature: signature as Hex,
      address: signerAddress as Hex,
    });
    expect(valid).toBe(true);
  },
  TIMEOUT,
);

test(
  'Produces approve send transaction params for Gnosis Safe wallet',
  async () => {
    const { gnosis } = await import('viem/chains');
    const gnosisChainId = gnosis.id.toString();
    const gnosisRpcUrl = gnosis.rpcUrls.default.http[0];

    const safe = new GnosisSafeWallet({
      chains: [
        {
          chainId: gnosisChainId,
          rpcUrl: gnosisRpcUrl,
          address: '0x9210B6A21d12F0578E974579c7E0ab6e0814aE2B',
        },
      ],
    });

    const ownerWallet = new ViemWallet({
      privateKey: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    });
    const ownerAddress = await ownerWallet.getAddress();

    const approveSignParams = await safe.getSignTransactionParams({
      chainId: gnosisChainId,
      to: '0x4567456745674567456745674567456745674567',
      data: await encodeErc20Approve('0x0123012301230123012301230123012301230123', '1234567890'),
      from: ownerAddress, // Note: here `from` is who signs, i.e. owner
      tag: 'smart-approve-tx-test',
    });

    const ownerSignature = await ownerWallet.signTypedData(approveSignParams);

    const approveSendParams = await safe.getSendTransactionParams({
      ...approveSignParams,
      ownerSignature,
      from: '0xeeee0000eeee0000eeee0000eeee0000eeee0000', // Note: here `from` is who executes transaction. Can be anyone, not only owner
    });

    const expectedData =
      '0x6a76120200000000000000000000000045674567456745674567456745674567456745670000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000012301230123012301230123012301230123012300000000000000000000000000000000000000000000000000000000499602d20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000414176124da1d15a8d0eac659042d86b39755247b297712171a4976ba4f62a6fba3195476f9b3c604f722e86eb391174c7ed11262d0348b6b627af3d068ee417ed1c00000000000000000000000000000000000000000000000000000000000000';
    expect(expectedData.includes(ownerSignature.slice(2))).toBe(true);

    expect(approveSendParams.tag).toBe('smart-approve-tx-test');
    expect(approveSendParams.chainId).toBe(gnosisChainId);
    expect(approveSendParams.from).toBe('0xeeee0000eeee0000eeee0000eeee0000eeee0000');
    expect(approveSendParams.data).toBe(expectedData);
    expect(approveSendParams.to).toBe('0x9210b6a21d12f0578e974579c7e0ab6e0814ae2b');
  },
  TIMEOUT,
);
