import PaidCallPaymentStrategy from 'snet-sdk-core/payment_strategies/PaidCallPaymentStrategy';
import { PaymentMetadataGenerator } from 'snet-sdk-core/utils/metadataUtils';

class PaidCallPaymentStrategyWeb extends PaidCallPaymentStrategy {
    /**
     * @param {Account} account
     * @param {ServiceMetadataProvider} serviceMetadata
     * @param {number} blockOffset
     * @param {number} callAllowance
     */
    constructor(
        account,
        serviceMetadata,
        blockOffset = 240,
        callAllowance = 1
    ) {
        super(account, serviceMetadata, blockOffset, callAllowance);
        this.metadataGenerator = new PaymentMetadataGenerator();
    }

    /**
     * Get the metadata for the gRPC payment call
     * @returns {Promise<[{'snet-payment-type': string}, {'snet-payment-channel-id': string}, {'snet-payment-channel-nonce': string}, {'snet-payment-channel-amount': string}, {'snet-payment-channel-signature-bin': Buffer}]>}
     */
    async getPaymentMetadata(serviceMetadata) {
        const metadataFields = await super.getPaymentMetadata(serviceMetadata);
        return this.metadataGenerator.generateMetadata(metadataFields);
    }
}

export default PaidCallPaymentStrategyWeb;
