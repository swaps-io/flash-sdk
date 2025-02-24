import { GnosisSafeWallet, ViemChainProvider, ViemWallet } from '../src';

const TIMEOUT = 60 * 60 * 1000; // 1h

test(
  'Should predict Gnosis Safe wallet address',
  async () => {
    const { gnosis, arbitrum } = await import('viem/chains');
    const chainProvider = new ViemChainProvider({ chains: [gnosis, arbitrum] });
    const privateKey = '0x1010101010101010101010101010101010101010101010101010101010101010';
    const ownerWallet = new ViemWallet({ privateKey });
    const safeWallet = new GnosisSafeWallet({ chainProvider, ownerWallet });

    {
      const ownerAddress = await ownerWallet.getAddress();
      expect(ownerAddress).toEqual('0xef045a554cbb0016275e90e3002f4d21c6f263e1');
    }

    {
      const safeAddress = await safeWallet.getAddress({ chainId: `${gnosis.id}` });
      expect(safeAddress).toEqual('0x123028aaD130EC7030957C0aD5E88977eBA778A2');
    }

    {
      const safeAddress = await safeWallet.getAddress({ chainId: `${arbitrum.id}` });
      expect(safeAddress).toEqual('0x123028aaD130EC7030957C0aD5E88977eBA778A2');
    }
  },
  TIMEOUT,
);

test(
  'Should form custom Safe permit transaction',
  async () => {
    const { gnosis } = await import('viem/chains');
    const chainProvider = new ViemChainProvider({ chains: [gnosis] });
    const privateKey = '0x1010101010101010101010101010101010101010101010101010101010101010';
    const ownerWallet = new ViemWallet({ privateKey });
    const safeWallet = new GnosisSafeWallet({ chainProvider, ownerWallet });

    const smartTransactionParams = await safeWallet.getSignTransactionParams({
      tag: 'test-tag',
      chainId: `${gnosis.id}`,
      from: await ownerWallet.getAddress(),
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      data: '0xaaaabbbb',
    });

    const smartTransactionSignature = await ownerWallet.signTypedData(smartTransactionParams);

    const permitTransaction = await safeWallet.getPermitTransaction({
      chainId: smartTransactionParams.chainId!,
      data: smartTransactionParams.data,
      signature: smartTransactionSignature,
    });

    expect(permitTransaction.length).toEqual(778);
    expect(permitTransaction.slice(0, 10)).toEqual('0x3d1f4ba5'); // 'permitSafeCustom(address,address,uint256,bytes,uint8,bytes)' signature
    expect(permitTransaction.slice(10, 74)).toEqual('000000000000000000000000123028aad130ec7030957c0ad5e88977eba778a2'); // smart wallet address
    expect(permitTransaction.slice(74, 138)).toEqual('000000000000000000000000abcdefabcdefabcdefabcdefabcdefabcdefabcd'); // "to" address
    expect(permitTransaction.slice(138, 202)).toEqual('0000000000000000000000000000000000000000000000000000000000000000'); // "value"
    expect(permitTransaction.slice(202, 266)).toEqual('00000000000000000000000000000000000000000000000000000000000000c0'); // "data" bytes offset
    expect(permitTransaction.slice(266, 330)).toEqual('0000000000000000000000000000000000000000000000000000000000000000'); // "operation"
    expect(permitTransaction.slice(330, 394)).toEqual('0000000000000000000000000000000000000000000000000000000000000100'); // "signatures" bytes offset
    expect(permitTransaction.slice(394, 458)).toEqual('0000000000000000000000000000000000000000000000000000000000000004'); // "data" bytes length (4)
    expect(permitTransaction.slice(458, 522)).toEqual('aaaabbbb00000000000000000000000000000000000000000000000000000000'); // "data" bytes (#0-#3)
    expect(permitTransaction.slice(522, 586)).toEqual('0000000000000000000000000000000000000000000000000000000000000041'); // "signatures" bytes length (65)
    expect(permitTransaction.slice(586, 650)).toEqual('6f8580dba590419a0852b3b5e510c404ec365d9919e22bea44af257dd1a0f1c2'); // "signatures" bytes (#0-#31)
    expect(permitTransaction.slice(650, 714)).toEqual('465dd7dbd886d36eecb7a057cbd43ef3a4f3d86944d3ee8be1a408894dd4e234'); // "signatures" bytes (#32-#63)
    expect(permitTransaction.slice(714, 778)).toEqual('1b00000000000000000000000000000000000000000000000000000000000000'); // "signatures" bytes (#64)
  },
  TIMEOUT,
);

test(
  'Should form custom Safe permit transaction with multi send',
  async () => {
    const { gnosis } = await import('viem/chains');
    const chainProvider = new ViemChainProvider({ chains: [gnosis] });
    const privateKey = '0x1010101010101010101010101010101010101010101010101010101010101010';
    const ownerWallet = new ViemWallet({ privateKey });
    const safeWallet = new GnosisSafeWallet({ chainProvider, ownerWallet });

    const smartTransactionParams = await safeWallet.getSignTransactionParams({
      tag: 'test-tag',
      chainId: `${gnosis.id}`,
      from: await ownerWallet.getAddress(),
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      data: '0xaaaabbbb',
      pre: [
        {
          to: '0x1111222233334444555566667777888899990000',
          data: '0xdeadbeef',
          value: '13371337',
        },
      ],
    });

    const smartTransactionSignature = await ownerWallet.signTypedData(smartTransactionParams);

    const permitTransaction = await safeWallet.getPermitTransaction({
      chainId: smartTransactionParams.chainId!,
      data: smartTransactionParams.data,
      signature: smartTransactionSignature,
    });

    expect(permitTransaction.length).toEqual(1290);
    expect(permitTransaction.slice(0, 10)).toEqual('0x3d1f4ba5'); // 'permitSafeCustom(address,address,uint256,bytes,uint8,bytes)' signature
    expect(permitTransaction.slice(10, 74)).toEqual('000000000000000000000000123028aad130ec7030957c0ad5e88977eba778a2'); // smart wallet address
    expect(permitTransaction.slice(74, 138)).toEqual('00000000000000000000000038869bf66a61cf6bdb996a6ae40d5853fd43b526'); // "to" address (multi send)
    expect(permitTransaction.slice(138, 202)).toEqual('0000000000000000000000000000000000000000000000000000000000000000'); // "value"
    expect(permitTransaction.slice(202, 266)).toEqual('00000000000000000000000000000000000000000000000000000000000000c0'); // "data" bytes offset
    expect(permitTransaction.slice(266, 330)).toEqual('0000000000000000000000000000000000000000000000000000000000000001'); // "operation" (delegate call - multi send)
    expect(permitTransaction.slice(330, 394)).toEqual('0000000000000000000000000000000000000000000000000000000000000200'); // "signatures" bytes offset
    expect(permitTransaction.slice(394, 458)).toEqual('0000000000000000000000000000000000000000000000000000000000000104'); // "data" bytes length (260)
    expect(permitTransaction.slice(458, 522)).toEqual('8d80ff0a00000000000000000000000000000000000000000000000000000000'); // "data" bytes (#0-#31, 'multiSend(bytes)' signature)
    expect(permitTransaction.slice(522, 586)).toEqual('0000002000000000000000000000000000000000000000000000000000000000'); // "data" bytes (#32-#63)
    expect(permitTransaction.slice(586, 650)).toEqual('000000b200111122223333444455556666777788889999000000000000000000'); // "data" bytes (#64-#95)
    expect(permitTransaction.slice(650, 714)).toEqual('00000000000000000000000000000000000000000000cc07c900000000000000'); // "data" bytes (#96-#127)
    expect(permitTransaction.slice(714, 778)).toEqual('00000000000000000000000000000000000000000000000004deadbeef00abcd'); // "data" bytes (#128-#159)
    expect(permitTransaction.slice(778, 842)).toEqual('efabcdefabcdefabcdefabcdefabcdefabcd0000000000000000000000000000'); // "data" bytes (#160-#191)
    expect(permitTransaction.slice(842, 906)).toEqual('0000000000000000000000000000000000000000000000000000000000000000'); // "data" bytes (#192-#223)
    expect(permitTransaction.slice(906, 970)).toEqual('000000000000000000000000000000000004aaaabbbb00000000000000000000'); // "data" bytes (#224-#255)
    expect(permitTransaction.slice(970, 1034)).toEqual('0000000000000000000000000000000000000000000000000000000000000000'); // "data" bytes (#256-#259)
    expect(permitTransaction.slice(1034, 1098)).toEqual('0000000000000000000000000000000000000000000000000000000000000041'); // "signatures" bytes length (65)
    expect(permitTransaction.slice(1098, 1162)).toEqual('dc84764d2baa1915f1aabe41f72f23b7c90620adf2f7cefce68025be927871dd'); // "signatures" bytes (#0-#31)
    expect(permitTransaction.slice(1162, 1226)).toEqual('3f370df0540fbbf0ff781094ea1bc0da6dfc2ab7e8ecfafe3bcf979dc416bd3b'); // "signatures" bytes (#32-#63)
    expect(permitTransaction.slice(1226, 1290)).toEqual('1c00000000000000000000000000000000000000000000000000000000000000'); // "signatures" bytes (#64)
  },
  TIMEOUT,
);
