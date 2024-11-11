import PrepaidPaymentStrategy from './PrepaidPaymentStrategy';
import PaidCallPaymentStrategy from './PaidCallPaymentStrategy';
import DefaultPaymentStrategy from 'snet-sdk-core/payment_strategies/DefaultPaymentStrategy';
import FreeCallPaymentStrategyWeb from './FreeCallPaymentStrategy';

class DefaultPaymentStrategyWeb extends DefaultPaymentStrategy {
    /**
     * Initializing the payment strategy
     * @param {number} concurrentCalls
     */
    constructor() {
        super();
    }

    /**
     * map the metadata for the gRPC call
     * @param {BaseServiceClient} serviceClient
     * @returns {Promise<({'snet-payment-type': string}|{'snet-payment-channel-id': string}|{'snet-payment-channel-nonce': string}|{'snet-payment-channel-amount': string}|{'snet-payment-channel-signature-bin': string.base64})[]>}
     */
    async getPaymentMetadata(serviceClient) {
        const freeCallPaymentStrategy = new FreeCallPaymentStrategyWeb(
            serviceClient
        );
        const isFreeCallsAvailable =
            await freeCallPaymentStrategy.isFreeCallAvailable();
        let paymentStrategy;

        if (isFreeCallsAvailable) {
            paymentStrategy = freeCallPaymentStrategy;
        } else if (serviceClient.concurrencyFlag) {
            paymentStrategy = new PrepaidPaymentStrategy(serviceClient);
        } else {
            paymentStrategy = new PaidCallPaymentStrategy(serviceClient);
        }
        const metadata = await paymentStrategy.getPaymentMetadata();
        console.log('DefaultPaymentStrategy Web metadata: ', metadata);

        return metadata;
    }
}

export default DefaultPaymentStrategyWeb;
