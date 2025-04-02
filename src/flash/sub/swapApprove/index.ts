import { getSwapDataMainV0 } from '../../../api/gen/main-v0';
import { isBitcoinCrypto } from '../../../helper/bitcoin';
import { isNativeCrypto } from '../../../helper/native';
import { isNotNull } from '../../../helper/null';
import { IWalletLike, isSmartWallet } from '../../../helper/wallet';
import { Swap, SwapApprove } from '../../../model';
import { GetSmartSignTypedDataParams } from '../../../smartWallet';
import { IWallet } from '../../../wallet';
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
    domainChainId: string | undefined,
  ): Promise<SwapApproveRequest> {
    const wallet = await this.wallet.getValue('Wallet must be configured for swap approve prepare');
    const needsCall = isNativeCrypto(swap.fromCrypto) && !isBitcoinCrypto(swap.fromCrypto) && !isSmartWallet(wallet);
    if (needsCall) {
      const swapApproveRequest = new SwapApproveRequest({ operation, from: swap.fromActor, data: '' });
      return swapApproveRequest;
    }

    const response = await getSwapDataMainV0(swap.hash, { domain_chain_id: domainChainId });
    const orderData = response.data.data;

    if (isNotNull(checkOrderData)) {
      await checkOrderData(orderData);
    }

    let swapApproveRequest = new SwapApproveRequest({ operation, from: swap.fromActor, data: orderData });

    if (isSmartWallet(wallet)) {
      const ownerWallet = await wallet.getOwnerWallet();
      const from = await ownerWallet.getAddress();
      const chainId = swap.fromCrypto.chain.id;
      const getSignParams: GetSmartSignTypedDataParams = { ...swapApproveRequest.swapSignParams, from, chainId };
      const signParams = await wallet.getSignTypedDataParams(getSignParams);
      swapApproveRequest = new SwapApproveRequest(signParams);
    }

    return swapApproveRequest;
  }

  public async approveSwap(swapApproveRequest: SwapApproveRequest): Promise<SwapApprove> {
    if (!swapApproveRequest.swapSignParams.data) {
      const swapApprove = new SwapApprove('');
      return swapApprove;
    }

    const wallet = await this.wallet.getValue('Wallet must be configured for swap approve');

    let signerWallet: IWallet;
    if (isSmartWallet(wallet)) {
      signerWallet = await wallet.getOwnerWallet();
    } else {
      signerWallet = wallet;
    }

    const swapSignature = await signerWallet.signTypedData(swapApproveRequest.swapSignParams);
    const swapApprove = new SwapApprove(swapSignature);
    return swapApprove;
  }
}
