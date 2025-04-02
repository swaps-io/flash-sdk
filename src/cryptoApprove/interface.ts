import { WithWalletOperation } from '..';
import { Amount, CryptoApprove, CryptoApproveRequest, CryptoData, DataLike, IncompleteCryptoApprove } from '../model';

/**
 * Params for {@link ICryptoApproveProvider.prepareCryptoApprove}
 *
 * @category Crypto Approve
 */
export interface PrepareCryptoApproveParams extends WithWalletOperation {
  /**
   * Crypto to approve
   *
   * Note:
   * - only ERC-20 tokens can be approved
   * - passing a native crypto will result in noop approve
   * - native cryptos can be {@link preWrap | pre-wrapped}
   */
  crypto: DataLike<CryptoData>;

  /**
   * Should native wrap be performed first to get the {@link crypto} to approve
   *
   * Note:
   * - this flag is only used when {@link crypto} is native wrap
   * - flag is passes as-is into the underlying approve provider
   * - smart wallet capabilities may be required for pre-wrap operation
   *
   * @default false
   */
  preWrap?: boolean;

  /**
   * Amount of crypto to approve
   */
  amount: Amount;

  /**
   * Address to approve as a spender
   */
  spender: string;
}

/**
 * Provider of crypto allowance
 *
 * @category Crypto Approve
 */
export interface ICryptoApproveProvider {
  /**
   * Prepares crypto approve request
   *
   * @param params Approve prepare {@link PrepareCryptoApproveParams | params}
   *
   * @returns Crypto approve request
   */
  prepareCryptoApprove(params: PrepareCryptoApproveParams): Promise<CryptoApproveRequest>;

  /**
   * Executes current step of the crypto approve request
   *
   * @param cryptoApproveRequest approve request {@link CryptoApproveRequest | params} from {@link prepareCryptoApprove method}
   * @param incompleteCryptoApprove crypto approve operations {@link IncompleteCryptoApprove | params}
   *
   * @returns Complete or incomplete crypto approve
   */
  approveCrypto(
    cryptoApproveRequest: CryptoApproveRequest,
    incompleteCryptoApprove: IncompleteCryptoApprove | undefined,
  ): Promise<IncompleteCryptoApprove | CryptoApprove>;

  /**
   * Marks permit cache as used
   */
  consumePermit(): void;
}
