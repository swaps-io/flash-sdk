import type { Chain, PublicClient } from 'viem';

import { ExclusiveInit } from '../../../helper/exclusive';
import { isNotNull, isNull } from '../../../helper/null';
import { ChainProviderError } from '../../error';

import { ViemChainProviderParams } from './param';

type Client = PublicClient;
type ChainMap = Map<number, Chain>; // By chain ID
type ClientMap = Map<number, Client>; // By chain ID
type ClientFactory = (chain: Chain) => Client;

interface Data {
  chains: ChainMap;
  clients: ClientMap;
  clientFactory: ClientFactory;
}

export class ViemChainProviderVendor {
  private readonly data: ExclusiveInit<Data>;

  public constructor(params: ViemChainProviderParams) {
    this.data = new ExclusiveInit(() => this.initData(params));
  }

  public initialized(): boolean {
    return this.data.initialized();
  }

  public toViemChainId(chainId: string): number {
    return Number(chainId);
  }

  public async getCheckedChain(chainId: number): Promise<Chain> {
    const data = await this.data.get();
    const chain = data.chains.get(chainId);
    if (isNull(chain)) {
      throw new ChainProviderError('Invalid chain');
    }

    return chain;
  }

  public async getChainClient(chain: Chain): Promise<Client> {
    const data = await this.data.get();
    const client = data.clients.get(chain.id);
    if (isNotNull(client)) {
      return client;
    }

    const newClient = data.clientFactory(chain);
    data.clients.set(chain.id, newClient);
    return newClient;
  }

  private async initData(params: ViemChainProviderParams): Promise<Data> {
    let chains: ChainMap;
    if (isNotNull(params.chains)) {
      if (!params.chains.length) {
        throw new ChainProviderError('At least one chain must be specified');
      }

      chains = new Map(params.chains.map((c) => [c.id, c]));
      if (chains.size !== params.chains.length) {
        throw new ChainProviderError('Specified chain IDs are not unique');
      }
    } else {
      const viemChainModule = await import('viem/chains');
      const viemChains = Object.values(viemChainModule) as Chain[];
      chains = new Map(viemChains.map((c) => [c.id, c]));
    }

    const { createPublicClient, http } = await import('viem');

    const clientFactory: ClientFactory = (chain) => {
      const transport = http();
      const client = createPublicClient({
        batch: params.batch,
        chain,
        transport,
      });
      return client;
    };

    const data: Data = {
      chains,
      clientFactory,
      clients: new Map(),
    };
    return data;
  }
}
