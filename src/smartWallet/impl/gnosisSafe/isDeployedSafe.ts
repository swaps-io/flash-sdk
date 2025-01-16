import { IChainProvider } from '../../../chainProvider';

export async function isDeployedSafe(address: string, chainId: string, provider: IChainProvider): Promise<boolean> {
  const code = await provider.getByteCode({ address, chainId });
  const deployed = code.length > 2; // '0x'
  return deployed;
}
