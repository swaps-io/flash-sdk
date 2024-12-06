import { isNull } from '../../../helper/null';

export async function getNonce(address: string, rpc: string | undefined): Promise<number> {
  if (isNull(rpc)) {
    throw new Error('getNonce error, rpc url not has');
  }
  const { createPublicClient, http, getAddress } = await import('viem');
  const abi = await import('./abi');
  const client = createPublicClient({
    transport: http(rpc),
  });
  try {
    const nonce = await client.readContract({
      abi: abi.SAFE_IMPL_ABI,
      functionName: 'nonce',
      address: getAddress(address),
    });
    return Number(nonce);
  } catch {
    return 0;
  }
}
