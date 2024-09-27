import { ViemEvmProvider } from './impl/viem';
import { IEvmProvider } from './interface';

export const DEFAULT_EVM: IEvmProvider = new ViemEvmProvider();
