import { FlashClient, NeverWallet } from '../src';

import { toBooleanStrict } from './helper/boolean';

const SKIP_API_DEPS = toBooleanStrict(process.env.TEST_FLASH_SKIP_API_DEPS ?? 'false');
const LOG_API_RESULTS = toBooleanStrict(process.env.TEST_FLASH_LOG_API_RESULTS ?? 'false');

let flash: FlashClient;

beforeAll(async () => {
  const wallet = new NeverWallet();
  flash = new FlashClient({ wallet, projectId: 'sdk-test' });

  if (!SKIP_API_DEPS) {
    await flash.preload();
  }
});

test('FlashClient gets chains', async () => {
  if (SKIP_API_DEPS) {
    return;
  }

  const chains = await flash.getChains();
  expect(chains.length).toBeGreaterThan(0);

  if (LOG_API_RESULTS) {
    console.log(chains.map((c) => c.data));
  }
});

test('FlashClient gets cryptos', async () => {
  if (SKIP_API_DEPS) {
    return;
  }

  const cryptos = await flash.getCryptos();
  expect(cryptos.length).toBeGreaterThan(0);

  if (LOG_API_RESULTS) {
    console.log(cryptos.map((c) => c.data));
  }
});

test('FlashClient gets cryptos filtered by one chain', async () => {
  if (SKIP_API_DEPS) {
    return;
  }

  const chains = await flash.getChains();
  const [filterChain] = chains;
  const cryptos = await flash.getCryptos({ chain: filterChain });
  expect(cryptos.every((c) => c.chain.id === filterChain.id)).toBe(true);
});

test('FlashClient gets cryptos filtered by multiple chains', async () => {
  if (SKIP_API_DEPS) {
    return;
  }

  const chains = await flash.getChains();
  const [filterChain0, filterChain1] = chains;
  const cryptos = await flash.getCryptos({ chain: [filterChain0, filterChain1] });
  expect(cryptos.every((c) => c.chain.id === filterChain0.id || c.chain.id === filterChain1.id)).toBe(true);
});

export default {};
