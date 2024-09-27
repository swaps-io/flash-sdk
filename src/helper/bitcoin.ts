import { Amount, Crypto } from '../model';

import { makeNativeCryptoId } from './native';

/**
 * Chain ID of Bitcoin crypto
 *
 * @category Bitcoin
 */
export const BITCOIN_CHAIN_ID = '668467';

/**
 * Decimals of Bitcoin crypto
 *
 * @category Bitcoin
 */
export const BITCOIN_DECIMALS = 8;

/**
 * Crypto ID of Bitcoin
 *
 * @category Bitcoin
 */
export const BITCOIN_CRYPTO_ID = makeNativeCryptoId(BITCOIN_CHAIN_ID);

/**
 * Checks if the crypto is Bitcoin
 *
 * @param crypto Crypto to check to be Bitcoin
 *
 * @returns `true` if crypto is Bitcoin, `false` otherwise
 *
 * @category Bitcoin
 */
export const isBitcoinCrypto = (crypto: Crypto): boolean => {
  return crypto.id === BITCOIN_CRYPTO_ID;
};

/**
 * Makes Bitcoin {@link Amount} from decimal-unaware value part
 *
 * @param value Value part of Bitcoin amount
 *
 * @returns Bitcoin amount representing value
 *
 * @category Bitcoin
 */
export const makeBitcoinAmount = (value: string): Amount => {
  const bitcoinAmount = new Amount({ value, decimals: BITCOIN_DECIMALS });
  return bitcoinAmount;
};
