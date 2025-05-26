import SnetSDK from 'snet-sdk-core';
import WebServiceClient from './WebServiceClient';
import RegistryContract from './RegistryContract';
import { DefaultPaymentStrategy } from './paymentStrategies';
import ServiceMetadataProviderWeb from './ServiceMetadataProvider';
import { isEmpty } from 'lodash';
import TrainingProviderWeb from './training/TrainingProvider';
import { WalletRPCIdentity } from './identities';

class WebSdk extends SnetSDK {
    /**
     * @param {Config} config
     * @param {IPFSMetadataProvider} metadataProvider
     */
    constructor(config, metadataProvider) {
        super(config, metadataProvider);
        this._registryContract = new RegistryContract(
            this._web3,
            this._networkId,
            this._config.tokenName,
            this._config.standType
        );
    }

    /**
     * @param {ServiceMetadataProviderWeb} metadataProvider
     * @param {PaymentChannelManagementStrategy} [paymentChannelManagementStrategy=DefaultPaymentChannelManagementStrategy]
     * @returns {Promise<WebServiceClient>}
     */
    async createServiceClient(
        metadataProvider,
        paymentChannelManagementStrategy
    ) {
        if (isEmpty(metadataProvider) || typeof metadataProvider === 'string') {
            return new Error('metadata provider is empty');
        }
        let paymentStrategy = paymentChannelManagementStrategy;
        if (isEmpty(paymentStrategy)) {
            paymentStrategy = this._constructStrategy();
        }

        return new WebServiceClient(metadataProvider, paymentStrategy);
    }

    /**
     * @param {string} orgId
     * @param {string} serviceId
     * @param {string} [groupName]
     * @param {ServiceClientOptions} options
     * @returns {Promise<ServiceMetadataProviderWeb>}
     */
    async createServiceMetadataProvider(
        orgId,
        serviceId,
        groupName = null,
        options = {}
    ) {
        const serviceMetadata = await this._metadataProvider.metadata(
            orgId,
            serviceId
        );
        const group = await this._serviceGroup(
            serviceMetadata,
            orgId,
            serviceId,
            groupName
        );
        return new ServiceMetadataProviderWeb(
            this.account,
            orgId,
            serviceId,
            serviceMetadata,
            this._mpeContract,
            group,
            options
        );
    }

    /**
     * @param {URL} serviceEndpoint
     * @returns {TrainingProviderWeb}
     */
    createTrainingProvider(serviceEndpoint, serviceClient) {
        return new TrainingProviderWeb(this.account, serviceEndpoint, serviceClient );
    }

    /**
     * @returns {WalletRPCIdentity}
     */
    _createIdentity() {
        return new WalletRPCIdentity(this._networkId);
    }

    /**
     * @param {number} concurrentCalls
     * @returns {DefaultPaymentStrategy}
     * @private
     */
    _constructStrategy(concurrentCalls = 1) {
        return new DefaultPaymentStrategy(this._account, concurrentCalls);
    }
}

export default WebSdk;
