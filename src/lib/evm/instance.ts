import { DEFAULT_EVM } from './default';
import { IEvmProvider } from './interface';

export let evm: IEvmProvider;

export const setEvm = (provider?: IEvmProvider): void => {
  evm = provider ?? DEFAULT_EVM;
};

setEvm();
