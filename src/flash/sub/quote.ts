import { QuoteMainV0, getQuoteMainV0 } from '../../api/gen/main-v0';
import { CryptoAggregator } from '../../cryptoAggregator';
import { BITCOIN_CHAIN_ID, makeBitcoinAmount } from '../../helper/bitcoin';
import { makeNativeAmount } from '../../helper/native';
import { isNotNull, isNull } from '../../helper/null';
import { Amount, AmountSource, Crypto, Duration } from '../../model';
import { Quote } from '../../model/quote';
import { QuoteData } from '../../model/quote/data';
import { FlashError } from '../error';
import { OnInconsistencyError } from '../param';

export class QuoteSubClient {
  private readonly cryptoAggregator: CryptoAggregator;
  private readonly onInconsistencyError: OnInconsistencyError | undefined;

  public constructor(cryptoAggregator: CryptoAggregator, onInconsistencyError: OnInconsistencyError | undefined) {
    this.cryptoAggregator = cryptoAggregator;
    this.onInconsistencyError = onInconsistencyError;
  }

  public async getQuote(
    fromCrypto: Crypto,
    toCrypto: Crypto,
    fromAmount?: Amount,
    toAmount?: Amount,
    fromActor?: string,
    fromActorReceiver?: string,
    fromActorWalletOwner?: string,
    fromActorReceiverWalletOwner?: string,
    maxSlippage?: number,
  ): Promise<Quote> {
    if (isNull(fromAmount) === isNull(toAmount)) {
      throw new FlashError('Either "from" or "to" amount must be specified in quote params');
    }

    let fromAmountValue: string | undefined;
    if (isNotNull(fromAmount)) {
      fromAmountValue = fromAmount.normalizeValue(fromCrypto.decimals);
    }

    let toAmountValue: string | undefined;
    if (isNotNull(toAmount)) {
      toAmountValue = toAmount.normalizeValue(toCrypto.decimals);
    }

    const { data: responseQuote } = await getQuoteMainV0({
      from_chain_id: fromCrypto.chain.id,
      from_token_address: fromCrypto.address,
      from_amount: fromAmountValue,
      to_chain_id: toCrypto.chain.id,
      to_token_address: toCrypto.address,
      to_amount: toAmountValue,
      from_actor: fromActor,
      from_actor_receiver: fromActorReceiver,
      from_actor_wallet_owner: fromActorWalletOwner,
      from_actor_receiver_wallet_owner: fromActorReceiverWalletOwner,
      max_slippage_pct: maxSlippage,
    });

    const inconsistencyErrors: string[] = [];

    const addInconsistency = (param: string, got: string, expected: string): void => {
      const error = `Quote inconsistency in "${param}": got "${got}", expected "${expected}"`;
      inconsistencyErrors.push(error);
    };

    if (responseQuote.from_chain_id !== fromCrypto.chain.id) {
      addInconsistency('from_chain_id', responseQuote.from_chain_id, fromCrypto.chain.id);
    }
    if (responseQuote.from_token_address !== fromCrypto.address) {
      addInconsistency('from_token_address', responseQuote.from_token_address, fromCrypto.address);
    }
    if (isNotNull(fromAmountValue) && responseQuote.from_amount !== fromAmountValue) {
      addInconsistency('from_amount', responseQuote.from_amount, fromAmountValue);
    }
    if (isNotNull(toAmountValue) && responseQuote.to_amount !== toAmountValue) {
      addInconsistency('to_amount', responseQuote.to_amount, toAmountValue);
    }
    if (responseQuote.to_chain_id !== toCrypto.chain.id) {
      addInconsistency('to_chain_id', responseQuote.to_chain_id, toCrypto.chain.id);
    }
    if (responseQuote.to_token_address !== toCrypto.address) {
      addInconsistency('to_token_address', responseQuote.to_token_address, toCrypto.address);
    }

    if (inconsistencyErrors.length > 0) {
      const propagate = this.onInconsistencyError?.(inconsistencyErrors) ?? true;
      if (propagate) {
        throw new FlashError('Inconsistent Flash API quote response');
      }
    }

    const amountSource = isNotNull(fromAmount) ? AmountSource.From : AmountSource.To;

    const quote = this.mapQuote(responseQuote, fromCrypto, toCrypto, amountSource);
    return quote;
  }

  private mapQuote(q: QuoteMainV0, fromCrypto: Crypto, toCrypto: Crypto, amountSource: AmountSource): Quote {
    const collateralChain = this.cryptoAggregator.getChainById(q.collateral_chain_id);
    const collateralContract = collateralChain.contract.collateral;
    if (isNull(collateralContract)) {
      throw new FlashError(`Collateral is not supported by chain ID ${collateralChain.id} specified in quote`);
    }

    const fromAmount = new Amount({ value: q.from_amount, decimals: fromCrypto.decimals });
    const fromFeeEstimate =
      q.from_chain_id === BITCOIN_CHAIN_ID
        ? makeBitcoinAmount(q.from_fee_estimate)
        : makeNativeAmount(q.from_fee_estimate);

    const toAmount = new Amount({ value: q.to_amount, decimals: toCrypto.decimals });
    const toAmountExpected = new Amount({ value: q.to_amount_expected, decimals: toCrypto.decimals });
    const toAmountMin = new Amount({ value: q.to_amount_min, decimals: toCrypto.decimals });
    const toFeeEstimate =
      q.to_chain_id === BITCOIN_CHAIN_ID ? makeBitcoinAmount(q.to_fee_estimate) : makeNativeAmount(q.to_fee_estimate);

    const collateralAmount = new Amount({ value: q.collateral_amount, decimals: collateralContract.decimals });

    const timeEstimate = Duration.fromSeconds(q.time_estimate);
    const timeToLockBitcoin = isNull(q.time_to_lock_bitcoin) ? undefined : Duration.fromSeconds(q.time_to_lock_bitcoin);

    const timeToReceive = Duration.fromSeconds(q.time_to_receive);
    const timeToSend = Duration.fromSeconds(q.time_to_send);
    const timeToLiqSend = Duration.fromSeconds(q.time_to_liq_send);

    const data: QuoteData = {
      fromCryptoId: fromCrypto.id,
      fromAmount: fromAmount.data,
      toActor: q.to_actor,
      toCryptoId: toCrypto.id,
      toAmount: toAmount.data,
      timeEstimate: timeEstimate.data,
      collateralChainId: collateralChain.id,
      collateralAmount: collateralAmount.data,
      timeToLockBitcoin: timeToLockBitcoin?.data,
      timeToReceive: timeToReceive.data,
      timeToSend: timeToSend.data,
      timeToLiqSend: timeToLiqSend.data,
      fromFeeEstimate: fromFeeEstimate.data,
      toFeeEstimate: toFeeEstimate.data,
      amountSource: amountSource,
      toAmountExpected: toAmountExpected.data,
      toAmountMin: toAmountMin.data,
    };
    const quote = new Quote(
      data,
      (...args) => this.cryptoAggregator.getCryptoById(...args),
      (...args) => this.cryptoAggregator.getChainById(...args),
    );
    return quote;
  }
}
