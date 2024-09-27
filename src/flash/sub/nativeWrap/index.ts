import { CryptoAggregator } from '../../../cryptoAggregator';
import { NATIVE_DECIMALS } from '../../../helper/native';
import { IWalletLike, isSmartWallet } from '../../../helper/wallet';
import { evm } from '../../../lib/evm';
import { Amount, Chain } from '../../../model';
import { SendTransactionParams } from '../../../wallet';
import { FlashOptionalValue } from '../../optional';

export class NativeWrapSubClient {
  private readonly wallet: FlashOptionalValue<IWalletLike>;
  private readonly cryptoAggregator: CryptoAggregator;

  public constructor(wallet: FlashOptionalValue<IWalletLike>, cryptoAggregator: CryptoAggregator) {
    this.wallet = wallet;
    this.cryptoAggregator = cryptoAggregator;
  }

  public async wrap(chainRef: Chain | string, amount: Amount, operation?: string): Promise<string> {
    const chain = await this.resolveChainRef(chainRef);
    const wallet = await this.wallet.getValue('Wallet must be configured for native wrap');

    const { NATIVE_WRAP_ABI } = await import('./abi');
    const depositData = await evm.functionDataEncode(NATIVE_WRAP_ABI, 'deposit');

    const depositTransactionParams: Omit<SendTransactionParams, 'from'> = {
      operation,
      tag: 'wrap-native',
      chainId: chain.id,
      to: chain.contract.nativeWrapCrypto.address,
      data: depositData,
      value: amount.normalizeValue(NATIVE_DECIMALS),
    };

    let txid: string;
    if (isSmartWallet(wallet)) {
      const ownerWallet = await wallet.getOwnerWallet();
      const from = await ownerWallet.getAddress();
      const signDepositParams = await wallet.getSignTransactionParams({ ...depositTransactionParams, from });
      const ownerSignature = await ownerWallet.signTypedData(signDepositParams);
      const sendDepositParams = await wallet.getSendTransactionParams({ ...signDepositParams, ownerSignature });
      txid = await ownerWallet.sendTransaction(sendDepositParams);
    } else {
      const from = await wallet.getAddress();
      txid = await wallet.sendTransaction({ ...depositTransactionParams, from });
    }
    return txid;
  }

  public async unwrap(chainRef: Chain | string, amount: Amount, operation?: string): Promise<string> {
    const chain = await this.resolveChainRef(chainRef);
    const wallet = await this.wallet.getValue('Wallet must be configured for native wrap');

    const { NATIVE_WRAP_ABI } = await import('./abi');
    const withdrawData = await evm.functionDataEncode(NATIVE_WRAP_ABI, 'withdraw', [
      amount.normalizeValue(NATIVE_DECIMALS),
    ]);

    const withdrawTransactionParams: Omit<SendTransactionParams, 'from'> = {
      operation,
      tag: 'unwrap-native',
      chainId: chain.id,
      to: chain.contract.nativeWrapCrypto.address,
      data: withdrawData,
    };

    let txid: string;
    if (isSmartWallet(wallet)) {
      const ownerWallet = await wallet.getOwnerWallet();
      const from = await ownerWallet.getAddress();
      const signWithdrawParams = await wallet.getSignTransactionParams({ ...withdrawTransactionParams, from });
      const ownerSignature = await ownerWallet.signTypedData(signWithdrawParams);
      const sendWithdrawParams = await wallet.getSendTransactionParams({ ...signWithdrawParams, ownerSignature });
      txid = await ownerWallet.sendTransaction(sendWithdrawParams);
    } else {
      const from = await wallet.getAddress();
      txid = await wallet.sendTransaction({ ...withdrawTransactionParams, from });
    }
    return txid;
  }

  private async resolveChainRef(chainRef: Chain | string): Promise<Chain> {
    if (typeof chainRef !== 'string') {
      const chain: Chain = chainRef;
      return chain;
    }

    const chainId: string = chainRef;
    await this.cryptoAggregator.getCryptoData(false);
    const chain = this.cryptoAggregator.getChainById(chainId);
    return chain;
  }
}
