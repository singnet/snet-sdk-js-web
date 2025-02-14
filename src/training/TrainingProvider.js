import TrainingProvider from 'snet-sdk-core/training/TrainingProvider';
import { TrainingModelProvider } from '../ModelsProvider';
import PaidCallPaymentStrategyWeb from '../payment_strategies/PaidCallPaymentStrategy';
import { grpc } from '@improbable-eng/grpc-web';

class TrainingProviderWeb extends TrainingProvider {
    /**
     * Initializing the training provider
     * @param {Account} account
     * @param {string} serviceEndpoint
     * @param {serviceClient} serviceClient
     */
    constructor(account, serviceEndpoint, serviceClient) {
        super(account, serviceEndpoint);
        this.serviceClient = serviceClient;
        this.TrainingModelProvider = new TrainingModelProvider();
        this._modelServiceClient =
            this.TrainingModelProvider?._generateModelServiceClient(
                serviceEndpoint
            );
    }

    async _generateTrainingPaymentMetadata(modelId, amount) {
        let metadata = new grpc.Metadata();
        const paidCallPaymentStrategy = new PaidCallPaymentStrategyWeb(this.account, this.serviceClient.metadataProvider);
        const paymentMetadata = await paidCallPaymentStrategy.getTrainingPaymentMetadata(modelId, amount);
        
        this.serviceClient._enhanceMetadataDefault(metadata, paymentMetadata);
        return metadata;
    }
}

export default TrainingProviderWeb;
