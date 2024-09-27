import { ChainProviderError } from '../../error';
import { ChainBlock, ChainLog, ChainTransaction, IChainProvider } from '../../interface';

/**
 * Chain provider mock whose methods are not expected to ever be called
 *
 * @category Chain Provider Impl
 */
export class NeverChainProvider implements IChainProvider {
  public getBlock(): Promise<ChainBlock> {
    throw new ChainProviderError('NeverChainProvider.getBlock called');
  }

  public getTransaction(): Promise<ChainTransaction> {
    throw new ChainProviderError('NeverChainProvider.getTransaction called');
  }

  public getLogs(): Promise<ChainLog[]> {
    throw new ChainProviderError('NeverChainProvider.getLogs called');
  }

  public call(): Promise<string> {
    throw new ChainProviderError('NeverChainProvider.call called');
  }
}
