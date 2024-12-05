import PrepaidPaymentStrategy from './PrepaidPaymentStrategy';
import PaidCallPaymentStrategy from './PaidCallPaymentStrategy';
import DefaultPaymentStrategy from 'snet-sdk-core/payment_strategies/DefaultPaymentStrategy';
import FreeCallPaymentStrategyWeb from './FreeCallPaymentStrategy';

class DefaultPaymentStrategyWeb extends DefaultPaymentStrategy {
    /**
     * Initializing the payment strategy
     * @param {number} concurrentCalls
     */
    constructor(account, concurrentCalls) {
        super(account, concurrentCalls);
        this._account = account;
        this._concurrentCalls = concurrentCalls;
    }

    /**
     * map the metadata for the gRPC call
     * @param {BaseServiceClient} serviceClient
     * @returns {Promise<({'snet-payment-type': string}|{'snet-payment-channel-id': string}|{'snet-payment-channel-nonce': string}|{'snet-payment-channel-amount': string}|{'snet-payment-channel-signature-bin': string.base64})[]>}
     */
    async getPaymentMetadata(serviceMetadata) {
        const freeCallPaymentStrategy = new FreeCallPaymentStrategyWeb(
            this._account,
            serviceMetadata
        );
        const isFreeCallsAvailable =
            await freeCallPaymentStrategy.isFreeCallAvailable();
        let paymentStrategy;

        if (isFreeCallsAvailable) {
            paymentStrategy = freeCallPaymentStrategy;
        } else if (serviceMetadata.concurrencyFlag) {
            paymentStrategy = new PrepaidPaymentStrategy(
                this._account,
                serviceMetadata
            );
        } else {
            paymentStrategy = new PaidCallPaymentStrategy(
                this._account,
                serviceMetadata
            );
        }
        const metadata = await paymentStrategy.getPaymentMetadata(
            serviceMetadata
        );
        return metadata;
    }
}

export default DefaultPaymentStrategyWeb;
