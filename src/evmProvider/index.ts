import { IEvmProvider, evm, setEvm } from '../lib/evm';

export * from '../lib/evm/interface';
export * from '../lib/evm/model';

export { ViemEvmProvider } from '../lib/evm/impl/viem';
export { EthersEvmProvider } from '../lib/evm/impl/ethers';

/**
 * Gets current (active) EVM provider
 *
 * @returns EVM provider instance in use
 *
 * @category EVM Provider Config
 */
export const getEvmProvider = (): IEvmProvider => {
  return evm;
};

/**
 * Sets current (active) EVM provider
 *
 * @param provider EVM provider instance to use or `undefined` for resetting to default
 *
 * @category EVM Provider Config
 */
export const setEvmProvider = (provider?: IEvmProvider): void => {
  setEvm(provider);
};
