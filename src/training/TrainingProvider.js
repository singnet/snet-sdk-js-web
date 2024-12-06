import TrainingProvider from 'snet-sdk-core/training/TrainingProvider';
import { TrainingModelProvider } from '../ModelsProvider';

class TrainingProviderWeb extends TrainingProvider {
    /**
     * Initializing the training provider
     * @param {Account} account
     * @param {string} serviceEndpoint
     */
    constructor(account, serviceEndpoint) {
        super(account, serviceEndpoint);
        this.TrainingModelProvider = new TrainingModelProvider();
        this._modelServiceClient =
            this.TrainingModelProvider?._generateModelServiceClient(
                serviceEndpoint
            );
    }
}

export default TrainingProviderWeb;
