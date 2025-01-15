import { ViemChainProvider } from './impl/viem';
import { IChainProvider } from './interface';

export * from './interface';
export * from './impl/never';
export * from './impl/viem';

export function buildChainProvider(): IChainProvider {
  const provider = new ViemChainProvider();
  provider.initialized();
  return provider;
}
