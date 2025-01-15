import { IChainProvider } from '../../../chainProvider';
import { isNotNull } from '../../../helper/null';

export async function isDeployedSafe(address: string, chainId: string, provider: IChainProvider): Promise<boolean> {
  const code = await provider.getByteCode({ address, chainId });
  return isNotNull(code) && code.length > 2;
}
