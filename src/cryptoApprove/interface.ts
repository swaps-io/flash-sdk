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
   */
  crypto: DataLike<CryptoData>;

  /**
   * Amount of crypto to approve
   */
  amount: Amount;

  /**
   * Address to approve as a spender
   */
  spender: string;

  /**
   * The parameter is needed to perform a swap of the network's native token with turnover in one transaction
   */
  smartWalletNativeSwap?: boolean;
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
