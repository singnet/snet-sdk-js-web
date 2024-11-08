import PaidCallPaymentStrategy from 'snet-sdk-core/payment_strategies/PaidCallPaymentStrategy';
import { PaymentMetadataGenerator } from 'snet-sdk-core/utils/metadataUtils';

class PaidCallPaymentStrategyWeb extends PaidCallPaymentStrategy {
    /**
     * @param {BaseServiceClient} serviceClient
     * @param {number} blockOffset
     * @param {number} callAllowance
     */
    constructor(serviceClient, blockOffset = 240, callAllowance = 1) {
        super(serviceClient, blockOffset, callAllowance);
        this.metadataGenerator = new PaymentMetadataGenerator();
    }

    /**
     * @returns {Promise<[{'snet-payment-type': string}, {'snet-payment-channel-id': string}, {'snet-payment-channel-nonce': string}, {'snet-payment-channel-amount': string}, {'snet-payment-channel-signature-bin': Buffer}]>}
     */
    async getPaymentMetadata() {
        const metadataFields = await super.getPaymentMetadata();
        return this.metadataGeneratorgenerateMetadata(metadataFields);
    }
}

export default PaidCallPaymentStrategyWeb;
