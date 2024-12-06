import TrainingProvider from 'snet-sdk-core/training/TrainingProvider';
import { TrainingModelProvider } from '../ModelsProvider';

class TrainingProviderWeb extends TrainingProvider {
    constructor(account, orgId, serviceId, groupId, serviceEndpoint) {
        super(account, orgId, serviceId, groupId, serviceEndpoint);
        this.TrainingModelProvider = new TrainingModelProvider();
        this._modelServiceClient =
            this.TrainingModelProvider?._generateModelServiceClient(
                serviceEndpoint
            );
    }
}

export default TrainingProviderWeb;
