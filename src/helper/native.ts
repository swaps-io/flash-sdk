import { Amount, Crypto } from '../model';

/**
 * Address of native crypto
 *
 * @category Native
 */
export const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

/**
 * Decimals of native crypto
 *
 * @category Native
 */
export const NATIVE_DECIMALS = 18;

/**
 * Checks if given crypto is native or not
 *
 * @param crypto Crypto to check to be native
 *
 * @returns `true` if crypto is native, `false` otherwise
 *
 * @category Native
 */
export const isNativeCrypto = (crypto: Crypto): boolean => {
  return crypto.address === NATIVE_ADDRESS;
};

/**
 * Makes native crypto ID on specified chain ID
 *
 * @param chainId Chain ID the native crypto ID belongs to
 *
 * @returns Native crypto ID
 *
 * @category Native
 */
export const makeNativeCryptoId = (chainId: string): string => {
  const cryptoId = Crypto.makeId(chainId, NATIVE_ADDRESS);
  return cryptoId;
};

/**
 * Makes native {@link Amount} from decimal-unaware value part
 *
 * @param value Value part of native amount
 *
 * @returns Native amount representing value
 *
 * @category Native
 */
export const makeNativeAmount = (value: string): Amount => {
  const nativeAmount = new Amount({ value, decimals: NATIVE_DECIMALS });
  return nativeAmount;
};
