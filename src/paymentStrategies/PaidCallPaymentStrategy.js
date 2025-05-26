import PaidCallPaymentStrategy from 'snet-sdk-core/paymentStrategies/PaidCallPaymentStrategy';
import { PaymentMetadataGenerator, TrainingPaymentMetadataGenerator } from 'snet-sdk-core/utils/metadataUtils';

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
        this.trainingMetadataGenerator = new TrainingPaymentMetadataGenerator();
    }

    /**
     * Get the metadata for the gRPC payment call
     * @returns {Promise<[{'snet-payment-type': string}, {'snet-payment-channel-id': string}, {'snet-payment-channel-nonce': string}, {'snet-payment-channel-amount': string}, {'snet-payment-channel-signature-bin': Buffer}]>}
     */
    async getPaymentMetadata() {
        const metadataFields = await super.getPaymentMetadata();
        return this.metadataGenerator.generateMetadata(metadataFields);
    }

    /**
     * @returns {Promise<[{'snet-payment-type': string}, {'snet-payment-channel-id': string}, {'snet-payment-channel-nonce': string}, {'snet-payment-channel-amount': string}, {'snet-payment-channel-signature-bin': Buffer}]>}
     */
      async getTrainingPaymentMetadata(modelId, amount) {
        const metadataFields = await super.getTrainingPaymentMetadata(modelId, amount);
        return this.trainingMetadataGenerator.generateMetadata(metadataFields);
      }
}

export default PaidCallPaymentStrategyWeb;
