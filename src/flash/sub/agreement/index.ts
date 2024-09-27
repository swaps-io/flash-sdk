import { createUserMainV0, getMessageMainV0, getUserMainV0 } from '../../../api/gen/main-v0';
import { isNotNull, isNull } from '../../../helper/null';
import { IWalletLike, isSmartWallet } from '../../../helper/wallet';
import { IWallet } from '../../../wallet';
import { FlashOptionalValue } from '../../optional';
import { AcceptAgreementParams } from '../../param';

export class AgreementSubClient {
  private readonly wallet: FlashOptionalValue<IWalletLike>;

  public constructor(wallet: FlashOptionalValue<IWalletLike>) {
    this.wallet = wallet;
  }

  public async acceptAgreement(params: AcceptAgreementParams): Promise<string> {
    const wallet = await this.wallet.getValue('Wallet must be configured for agreement accept');

    let address: string;
    if (isSmartWallet(wallet)) {
      const ownerWallet = await wallet.getOwnerWallet();
      address = await ownerWallet.getAddress();
    } else {
      address = await wallet.getAddress();
    }

    const { data: agreement } = await getUserMainV0(address);
    if (isNotNull(agreement.signature)) {
      return agreement.signature;
    }

    let signerWallet: IWallet;
    if (isSmartWallet(wallet)) {
      signerWallet = await wallet.getOwnerWallet();
    } else {
      signerWallet = wallet;
    }

    const signature = await signerWallet.signMessage({
      from: address,
      message: agreement.message,
      tag: 'accept-agreement',
      operation: params.operation,
    });
    await createUserMainV0({ address, signature });

    return signature;
  }

  public async getAgreementAccepted(address: string | undefined): Promise<boolean> {
    if (isNull(address)) {
      const wallet = await this.wallet.getValue('Wallet must be configured for agreement accept check');

      if (isSmartWallet(wallet)) {
        const ownerWallet = await wallet.getOwnerWallet();
        address = await ownerWallet.getAddress();
      } else {
        address = await wallet.getAddress();
      }
    }

    const { data: agreement } = await getUserMainV0(address);
    const agreementAccepted = isNotNull(agreement.signature);
    return agreementAccepted;
  }

  public async getAgreementMessage(): Promise<string> {
    const { data } = await getMessageMainV0();
    return data.message;
  }
}
