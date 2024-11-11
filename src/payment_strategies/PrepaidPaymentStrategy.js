import PrepaidPaymentStrategy from 'snet-sdk-core/payment_strategies/PrepaidPaymentStrategy';
import { PrepaidMetadataGenerator } from 'snet-sdk-core/utils/metadataUtils';

class PrepaidPaymentStrategyWeb extends PrepaidPaymentStrategy {
    /**
     * @param {BaseServiceClient} serviceClient
     * @param {number} blockOffset
     * @param {number} callAllowance
     */
    constructor(serviceClient, blockOffset = 240, callAllowance = 1) {
        super(serviceClient, blockOffset, callAllowance);
        this.metadataGenerator = new PrepaidMetadataGenerator();
    }

    /**
     * @returns {Promise<[{'snet-payment-type': string}, {'snet-payment-channel-id': string}, {'snet-payment-channel-nonce': string}, {'snet-prepaid-auth-token-bin': *}]>}
     */
    async getPaymentMetadata() {
        const metadataFields = await super.getPaymentMetadata();
        //     { 'snet-prepaid-auth-token-bin': tokenBytes.toString('base64') },
        // ];
        return this.metadataGenerator.generateMetadata(metadataFields);
    }
}

export default PrepaidPaymentStrategyWeb;
