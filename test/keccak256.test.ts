import { evm } from '../src/lib/evm';

test('Calculates keccak256 hash for hex data', async () => {
  const hash = await evm.keccak256('0x1337abcdef1337');
  expect(hash).toBe('0x56cf69221e69556050cb05b4ac37ad2c22b9155b3454abb166fe75e2a454634e');
});

test('Calculates keccak256 hash for string', async () => {
  const hash = await evm.keccak256('Test 12345');
  expect(hash).toBe('0x4ff232f09cd96cd5613a828ca8f2b3d1c02924bc0c3392ce35dfddcd4de2bc71');
});

export default {};
