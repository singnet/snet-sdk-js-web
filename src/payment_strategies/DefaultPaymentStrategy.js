import PrepaidPaymentStrategy from './PrepaidPaymentStrategy';
import ConcurrencyManager from '../ConcurrencyManager';
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
        console.log('constructor DefaultPaymentStrategyWeb');
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
        console.log('freeCallPaymentStrategy web: ', freeCallPaymentStrategy);

        const isFreeCallsAvailable =
            await freeCallPaymentStrategy.isFreeCallAvailable();
        let paymentStrategy;

        if (isFreeCallsAvailable) {
            paymentStrategy = freeCallPaymentStrategy;
        } else if (serviceClient.concurrencyFlag) {
            const concurrencyManager = new ConcurrencyManager(
                this._concurrentCalls,
                serviceClient
            );
            console.log('web concurrencyManager: ', concurrencyManager);

            paymentStrategy = new PrepaidPaymentStrategy(
                serviceClient,
                concurrencyManager
            );
        } else {
            paymentStrategy = new PaidCallPaymentStrategy(serviceClient);
        }
        const metadata = await paymentStrategy.getPaymentMetadata();
        console.log('DefaultPaymentStrategy Web metadata: ', metadata);

        return metadata;
    }
}

export default DefaultPaymentStrategyWeb;
