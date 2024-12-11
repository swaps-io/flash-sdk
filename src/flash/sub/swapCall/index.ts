import { manualReceiveMainV0 } from '../../../api/gen/main-v0';
import { isNull } from '../../../helper/null';
import { IWalletLike, isSmartWallet } from '../../../helper/wallet';
import { SwapSubmit } from '../../../model/swapSubmit';
import { FlashOptionalValue } from '../../optional';

import { SwapCallParams, SwapCallRequest } from './model';

export class SwapCallSubClient {
  private readonly wallet: FlashOptionalValue<IWalletLike>;

  public constructor(wallet: FlashOptionalValue<IWalletLike>) {
    this.wallet = wallet;
  }

  public async prepareSwapCall(operation: string | undefined, swapSubmit: SwapSubmit): Promise<SwapCallRequest> {
    if (!swapSubmit.needsCall) {
      const swapCallRequest = new SwapCallRequest(undefined);
      return swapCallRequest;
    }

    const { data } = await manualReceiveMainV0(swapSubmit.swapHash);
    const callParams: SwapCallParams = {
      operation,
      chainId: data.chain_id,
      from: data.from_address,
      to: data.to_address,
      data: data.data,
      value: data.value ?? undefined,
    };

    const swapCallRequest = new SwapCallRequest(callParams);
    return swapCallRequest;
  }

  public async callSwap(callRequest: SwapCallRequest): Promise<string> {
    if (isNull(callRequest.callParams)) {
      return '';
    }

    const wallet = await this.wallet.getValue('Wallet must be configured for swap call');

    let txid: string;
    if (isSmartWallet(wallet)) {
      const ownerWallet = await wallet.getOwnerWallet();
      const from = await ownerWallet.getAddress();
      const signCallParams = await wallet.getSignTransactionParams({ ...callRequest.callParams, from });
      const ownerSignature = await ownerWallet.signTypedData(signCallParams);
      const sendCallParams = await wallet.getSendTransactionParams({ ...signCallParams, ownerSignature });
      txid = await ownerWallet.sendTransaction(sendCallParams);
    } else {
      txid = await wallet.sendTransaction(callRequest.callParams);
    }
    return txid;
  }
}
