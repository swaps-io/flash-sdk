import { getSwapDataMainV0 } from '../../../api/gen/main-v0';
import { isNotNull } from '../../../helper/null';
import { IWalletLike, isSmartWallet } from '../../../helper/wallet';
import { Swap, SwapApprove } from '../../../model';
import { IWallet, SignTypedDataParams } from '../../../wallet';
import { FlashOptionalValue } from '../../optional';
import { CheckOrderDataFunc } from '../../param';

import { SwapApproveRequest } from './model';

export class SwapApproveSubClient {
  private readonly wallet: FlashOptionalValue<IWalletLike>;

  public constructor(wallet: FlashOptionalValue<IWalletLike>) {
    this.wallet = wallet;
  }

  public async prepareSwapApprove(
    operation: string | undefined,
    swap: Swap,
    checkOrderData: CheckOrderDataFunc | undefined,
  ): Promise<SwapApproveRequest> {
    const response = await getSwapDataMainV0(swap.hash);
    const orderData = response.data.data;

    if (isNotNull(checkOrderData)) {
      await checkOrderData(orderData);
    }

    const swapApproveRequest = new SwapApproveRequest(operation, swap.fromActor, orderData, swap.fromCrypto.chain.id);
    return swapApproveRequest;
  }

  public async approveSwap(swapApproveRequest: SwapApproveRequest, swap: Swap): Promise<SwapApprove> {
    const wallet = await this.wallet.getValue('Wallet must be configured for swap approve');

    let signerWallet: IWallet;
    let swapSignParams: SignTypedDataParams = swapApproveRequest.swapSignParams;
    const chainId = swap.fromCrypto.chain.id;
    if (isSmartWallet(wallet)) {
      signerWallet = await wallet.getOwnerWallet();
      const from = await signerWallet.getAddress();
      swapSignParams = await wallet.getSignTypedDataParams({ ...swapSignParams, chainId, from });
    } else {
      signerWallet = wallet;
    }

    const swapSignature = await signerWallet.signTypedData(swapSignParams);
    const swapApprove = new SwapApprove(swapSignature);
    return swapApprove;
  }
}
