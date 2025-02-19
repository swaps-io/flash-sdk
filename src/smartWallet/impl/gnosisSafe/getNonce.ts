import { IChainProvider } from '../../../chainProvider';
import { evm } from '../../../lib/evm';

export async function getNonce(address: string, chainId: string, provider: IChainProvider): Promise<number> {
  const abi = await import('./abi');
  try {
    const nonce = await provider.call({
      chainId,
      to: address,
      data: await evm.functionDataEncode(abi.SAFE_IMPL_ABI, 'nonce'),
    });
    return Number(nonce);
  } catch {
    return 0;
  }
}
