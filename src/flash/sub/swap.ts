import {
  AmountSourceMainV0,
  CreateSwapMainV0,
  LiqSendTransactionMainV0,
  ReportNoSendTransactionMainV0,
  SlashTransactionMainV0,
  SubmitSwapMainV0,
  SwapMainV0,
  TransactionMainV0,
  createSwapMainV0,
  getSwapMainV0,
  submitSwapMainV0,
} from '../../api/gen/main-v0';
import { CryptoAggregator } from '../../cryptoAggregator';
import { CryptoApprover } from '../../cryptoApprove';
import { BITCOIN_CHAIN_ID, makeBitcoinAmount } from '../../helper/bitcoin';
import { isNativeCrypto, makeNativeAmount } from '../../helper/native';
import { isNotNull, isNull } from '../../helper/null';
import { IWalletLike, isSmartWallet } from '../../helper/wallet';
import {
  Amount,
  AmountSource,
  Crypto,
  CryptoApprove,
  Duration,
  Instant,
  LiqSendTransaction,
  LiqSendTransactionData,
  Quote,
  ReportNoSendTransaction,
  ReportNoSendTransactionData,
  SlashTransaction,
  SlashTransactionData,
  Swap,
  SwapApprove,
  SwapData,
  Transaction,
  TransactionData,
} from '../../model';
import { SwapState, toSwapState } from '../../model/swap/state';
import { SwapSubmit } from '../../model/swapSubmit';
import { FlashError } from '../error';
import { FlashOptionalValue } from '../optional';
import { OnInconsistencyError } from '../param';

type QuoteLike = Pick<Quote, 'fromCrypto' | 'toCrypto' | 'collateralChain' | 'amountSource'>;

const AMOUNT_SOURCE_MAP: Record<AmountSourceMainV0, AmountSource> = {
  from: AmountSource.From,
  to: AmountSource.To,
};

const FALLBACK_SWAP_STATE = SwapState.AwaitingSignature;

export class SwapSubClient {
  private readonly cryptoAggregator: CryptoAggregator;
  private readonly cryptoApprover: CryptoApprover;
  private readonly wallet: FlashOptionalValue<IWalletLike>;
  private readonly swapMinToAmountFactor: Amount;
  private readonly swapMaxFromAmountFactor: Amount;
  private readonly onInconsistencyError: OnInconsistencyError | undefined;

  public constructor(
    cryptoAggregator: CryptoAggregator,
    cryptoApprover: CryptoApprover,
    wallet: FlashOptionalValue<IWalletLike>,
    swapToAmountTolerance: Amount,
    swapFromAmountTolerance: Amount,
    onInconsistencyError: OnInconsistencyError | undefined,
  ) {
    this.cryptoAggregator = cryptoAggregator;
    this.cryptoApprover = cryptoApprover;
    this.wallet = wallet;
    this.swapMinToAmountFactor = SwapSubClient.calcSwapMinToAmountFactor(swapToAmountTolerance);
    this.swapMaxFromAmountFactor = SwapSubClient.calcSwapMaxFromAmountFactor(swapFromAmountTolerance);
    this.onInconsistencyError = onInconsistencyError;
  }

  public async createSwap(
    quote: Quote,
    cryptoApprove: CryptoApprove,
    fromActorBitcoin: string | undefined,
    fromActorReceiver: string | undefined,
  ): Promise<Swap> {
    const wallet = await this.wallet.getValue('Wallet must be configured for swap creation');

    let fromAddress: string;
    if (isSmartWallet(wallet)) {
      fromAddress = await wallet.getAddress({ chainId: quote.fromCrypto.chain.id });
    } else {
      fromAddress = await wallet.getAddress();
    }

    let fromAmountValue: string | undefined;
    let toAmountValue: string | undefined;
    if (quote.amountSource === AmountSource.From) {
      fromAmountValue = quote.fromAmount.normalizeValue(quote.fromCrypto.decimals);
    } else {
      toAmountValue = quote.toAmount.normalizeValue(quote.toCrypto.decimals);
    }

    const createSwapParams: CreateSwapMainV0 = {
      from_actor: fromAddress,
      from_chain_id: quote.fromCrypto.chain.id,
      from_token_address: quote.fromCrypto.address,
      from_actor_bitcoin: fromActorBitcoin,
      from_actor_receiver: fromActorReceiver,
      from_amount: fromAmountValue,
      to_chain_id: quote.toCrypto.chain.id,
      to_token_address: quote.toCrypto.address,
      to_amount: toAmountValue,
      permit_transaction: cryptoApprove.permitTransaction,
    };
    const { data: responseSwap } = await createSwapMainV0(createSwapParams);

    this.cryptoApprover.consumePermit();

    const inconsistencyErrors: string[] = [];

    const addInconsistency = (param: string, response: string, expected: string): void => {
      const error = `Swap inconsistency in "${param}": got "${response}", expected "${expected}"`;
      inconsistencyErrors.push(error);
    };

    if (responseSwap.from_actor !== fromAddress) {
      addInconsistency('from_actor', responseSwap.from_actor, fromAddress);
    }
    if (responseSwap.from_actor_receiver !== (fromActorReceiver ?? fromAddress)) {
      addInconsistency('from_actor_receiver', responseSwap.from_actor_receiver, fromActorReceiver ?? fromAddress);
    }
    if (responseSwap.from_actor_bitcoin != fromActorBitcoin) {
      addInconsistency('from_actor_bitcoin', responseSwap.from_actor_bitcoin ?? '<null>', fromActorBitcoin ?? '<null>');
    }
    if (responseSwap.from_chain_id !== quote.fromCrypto.chain.id) {
      addInconsistency('from_chain_id', responseSwap.from_chain_id, quote.fromCrypto.chain.id);
    }
    if (responseSwap.from_token_address !== quote.fromCrypto.address) {
      addInconsistency('from_token_address', responseSwap.from_token_address, quote.fromCrypto.address);
    }
    if (responseSwap.to_actor !== quote.toActor) {
      addInconsistency('to_actor', responseSwap.to_actor, quote.toActor);
    }
    if (responseSwap.to_chain_id !== quote.toCrypto.chain.id) {
      addInconsistency('to_chain_id', responseSwap.to_chain_id, quote.toCrypto.chain.id);
    }
    if (responseSwap.to_token_address !== quote.toCrypto.address) {
      addInconsistency('to_token_address', responseSwap.to_token_address, quote.toCrypto.address);
    }
    if (isNotNull(fromAmountValue) && responseSwap.from_amount !== fromAmountValue) {
      addInconsistency('from_amount', responseSwap.from_amount, fromAmountValue);
    }
    if (isNotNull(toAmountValue) && responseSwap.to_amount !== toAmountValue) {
      addInconsistency('to_amount', responseSwap.to_amount, toAmountValue);
    }
    if (responseSwap.collateral_chain_id !== quote.collateralChain.id) {
      addInconsistency('collateral_chain_id', responseSwap.collateral_chain_id, quote.collateralChain.id);
    }

    if (inconsistencyErrors.length > 0) {
      const propagate = this.onInconsistencyError?.(inconsistencyErrors) ?? true;
      if (propagate) {
        throw new FlashError('Inconsistent Flash API swap response');
      }
    }

    if (quote.amountSource === AmountSource.From) {
      const toAmount = new Amount({ value: responseSwap.to_amount, decimals: quote.toCrypto.decimals });
      const minToAmount = quote.toAmount.mul(this.swapMinToAmountFactor);
      if (toAmount.is('less', minToAmount)) {
        throw new FlashError('Flash API swap has lower "to" amount than quote had');
      }
    } else {
      const fromAmount = new Amount({ value: responseSwap.from_amount, decimals: quote.fromCrypto.decimals });
      const maxFromAmount = quote.fromAmount.mul(this.swapMaxFromAmountFactor);
      if (fromAmount.is('greater', maxFromAmount)) {
        throw new FlashError('Flash API swap has greater "from" amount than quote had');
      }
    }

    const swap = this.mapSwap(responseSwap, quote);
    return swap;
  }

  public async submitSwap(swap: Swap, swapApprove: SwapApprove): Promise<SwapSubmit> {
    const submitSwapParams: SubmitSwapMainV0 = {
      signature: swapApprove.swapSignature,
    };
    await submitSwapMainV0(swap.hash, submitSwapParams);

    const needsCall = isNativeCrypto(swap.fromCrypto);
    const swapSubmit = new SwapSubmit(swap.hash, needsCall);
    return swapSubmit;
  }

  public async getSwap(swapRef: Swap | string): Promise<Swap> {
    const isHashRef = typeof swapRef === 'string';
    const swapHash = isHashRef ? swapRef : swapRef.hash;

    const { data: responseSwap } = await getSwapMainV0(swapHash);

    let swap: Swap;
    if (isHashRef) {
      swap = this.mapSwapUnassisted(responseSwap);
    } else {
      swap = this.mapSwap(responseSwap, swapRef);
    }
    return swap;
  }

  private static calcSwapMinToAmountFactor(swapToAmountTolerance: Amount): Amount {
    const toleranceFactor = swapToAmountTolerance.div(Amount.fromDecimalString('100'));
    const minAmountFactor = Amount.fromDecimalString('1').sub(toleranceFactor);
    return minAmountFactor;
  }

  private static calcSwapMaxFromAmountFactor(swapFromAmountTolerance: Amount): Amount {
    const toleranceFactor = swapFromAmountTolerance.div(Amount.fromDecimalString('100'));
    const maxAmountFactor = Amount.fromDecimalString('1').add(toleranceFactor);
    return maxAmountFactor;
  }

  private mapSwap(s: SwapMainV0, q: QuoteLike): Swap {
    const collateralContract = q.collateralChain.contract.collateral;
    if (isNull(collateralContract)) {
      throw new FlashError(`Collateral is not supported by chain ID ${q.collateralChain.id} specified in quote`);
    }

    const fromAmount = new Amount({ value: s.from_amount, decimals: q.fromCrypto.decimals });
    const fromFeeEstimate =
      s.from_chain_id === BITCOIN_CHAIN_ID
        ? makeBitcoinAmount(s.from_fee_estimate)
        : makeNativeAmount(s.from_fee_estimate);

    const toAmount = new Amount({ value: s.to_amount, decimals: q.toCrypto.decimals });
    const toFeeEstimate =
      s.to_chain_id === BITCOIN_CHAIN_ID ? makeBitcoinAmount(s.to_fee_estimate) : makeNativeAmount(s.to_fee_estimate);

    const collateralAmount = new Amount({ value: s.collateral_amount, decimals: collateralContract.decimals });

    const createdAt = Instant.fromEpochDuration(Duration.fromSeconds(s.created_at));
    const timeEstimate = Duration.fromSeconds(s.time_estimate);

    const timeToLockBitcoin = isNull(s.time_to_lock_bitcoin) ? undefined : Duration.fromSeconds(s.time_to_lock_bitcoin);
    const timeToReceive = Duration.fromSeconds(s.time_to_receive);
    const timeToSend = Duration.fromSeconds(s.time_to_send);
    const timeToLiqSend = Duration.fromSeconds(s.time_to_liq_send);

    const deadlineLockBitcoin = isNull(s.deadline_lock_bitcoin)
      ? undefined
      : Instant.fromEpochDuration(Duration.fromSeconds(s.deadline_lock_bitcoin));
    const deadlineReceive = Instant.fromEpochDuration(Duration.fromSeconds(s.deadline_receive));
    const deadlineSend = Instant.fromEpochDuration(Duration.fromSeconds(s.deadline_send));
    const deadlineLiqSend = Instant.fromEpochDuration(Duration.fromSeconds(s.deadline_liq_send));

    const txLockBitcoin = isNull(s.tx_lock_bitcoin) ? undefined : this.mapTransaction(s.tx_lock_bitcoin);
    const txReceive = isNull(s.tx_receive) ? undefined : this.mapTransaction(s.tx_receive);
    const txSend = isNull(s.tx_send) ? undefined : this.mapTransaction(s.tx_send);
    const txLiqSend = isNull(s.tx_liq_send) ? undefined : this.mapLiqSendTransaction(s.tx_liq_send);
    const txReportNoSend = s.tx_report_no_send.map((tx) => this.mapReportNoSendTransaction(tx));
    const txSlash = isNull(s.tx_slash) ? undefined : this.mapSlashTransaction(s.tx_slash, txReportNoSend);

    const data: SwapData = {
      hash: s.hash,
      createdAt: createdAt.data,
      fromActor: s.from_actor,
      fromCryptoId: q.fromCrypto.id,
      fromAmount: fromAmount.data,
      toActor: s.to_actor,
      toActorBitcoin: isNull(s.to_actor_bitcoin) ? undefined : s.to_actor_bitcoin,
      fromActorBitcoin: isNull(s.from_actor_bitcoin) ? undefined : s.from_actor_bitcoin,
      fromActorReceiver: s.from_actor_receiver,
      toCryptoId: q.toCrypto.id,
      toAmount: toAmount.data,
      collateralChainId: q.collateralChain.id,
      collateralAmount: collateralAmount.data,
      timeEstimate: timeEstimate.data,
      timeToReceive: timeToReceive.data,
      timeToLockBitcoin: timeToLockBitcoin?.data,
      timeToSend: timeToSend.data,
      timeToLiqSend: timeToLiqSend.data,
      deadlineLockBitcoin: deadlineLockBitcoin?.data,
      deadlineReceive: deadlineReceive.data,
      deadlineSend: deadlineSend.data,
      deadlineLiqSend: deadlineLiqSend.data,
      nonce: BigInt(s.nonce),
      fromFeeEstimate: fromFeeEstimate.data,
      toFeeEstimate: toFeeEstimate.data,
      state: toSwapState(s.state) ?? FALLBACK_SWAP_STATE,
      amountSource: q.amountSource,
      txLockBitcoin: txLockBitcoin?.data,
      txReceive: txReceive?.data,
      txSend: txSend?.data,
      txLiqSend: txLiqSend?.data,
      txReportNoSend: txReportNoSend.map((tx) => tx.data),
      txSlash: txSlash?.data,
    };
    const swap = new Swap(
      data,
      (...args) => this.cryptoAggregator.getCryptoById(...args),
      (...args) => this.cryptoAggregator.getChainById(...args),
    );
    return swap;
  }

  private mapTransaction(t: TransactionMainV0): Transaction {
    const createdAt = Instant.fromEpochDuration(Duration.fromSeconds(t.created_at));
    const data: TransactionData = {
      txid: t.txid,
      createdAt: createdAt.data,
      confirmed: t.confirmed,
    };
    const tx = new Transaction(data);
    return tx;
  }

  private mapReportNoSendTransaction(t: ReportNoSendTransactionMainV0): ReportNoSendTransaction {
    const tx = this.mapTransaction(t);
    const data: ReportNoSendTransactionData = {
      ...tx.data,
      reporter: t.reporter,
    };
    const rtx = new ReportNoSendTransaction(data);
    return rtx;
  }

  private mapLiqSendTransaction(t: LiqSendTransactionMainV0): LiqSendTransaction {
    const tx = this.mapTransaction(t);
    const data: LiqSendTransactionData = {
      ...tx.data,
      liquidator: t.liquidator,
    };
    const ltx = new LiqSendTransaction(data);
    return ltx;
  }

  private mapSlashTransaction(t: SlashTransactionMainV0, reportTxs: ReportNoSendTransaction[]): SlashTransaction {
    const reportIndex = t.report_no_send_index;
    if (reportIndex < 0 || reportIndex >= reportTxs.length) {
      throw new FlashError('Slash no-send report tx index is out of range');
    }

    const txReportNoSend = reportTxs[reportIndex];
    const tx = this.mapTransaction(t);
    const data: SlashTransactionData = {
      ...tx.data,
      txReportNoSend: txReportNoSend.data,
    };
    const stx = new SlashTransaction(data);
    return stx;
  }

  private mapSwapUnassisted(s: SwapMainV0): Swap {
    const fromCryptoId = Crypto.makeId(s.from_chain_id, s.from_token_address);
    const fromCrypto = this.cryptoAggregator.getCryptoById(fromCryptoId);
    const toCryptoId = Crypto.makeId(s.to_chain_id, s.to_token_address);
    const toCrypto = this.cryptoAggregator.getCryptoById(toCryptoId);
    const collateralChain = this.cryptoAggregator.getChainById(s.collateral_chain_id);
    const amountSource = AMOUNT_SOURCE_MAP[s.amount_source];
    const quoteProps: QuoteLike = {
      fromCrypto,
      toCrypto,
      collateralChain,
      amountSource,
    };
    const swap = this.mapSwap(s, quoteProps);
    return swap;
  }
}
