import SnetSDK from 'snet-sdk-core';
import WebServiceClient from './WebServiceClient';
import RegistryContract from './RegistryContract';
import { DefaultPaymentStrategy } from './payment_strategies';
import ServiceMetadataProviderWeb from './ServiceMetadataProvider';
import { isEmpty } from 'lodash';
import TrainingProviderWeb from './training/TrainingProvider';
import { WalletRPCIdentity } from './identities';

class WebSdk extends SnetSDK {
    constructor(...args) {
        super(...args);
        this._registryContract = new RegistryContract(
            this._web3,
            this._networkId
        );
    }

    /**
     * @param {string} orgId
     * @param {string} serviceId
     * @param {string} [groupName]
     * @param {PaymentChannelManagementStrategy} [paymentChannelManagementStrategy=DefaultPaymentChannelManagementStrategy]
     * @param {ServiceClientOptions} options
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

    createTrainingProvider(serviceEndpoint) {
        return new TrainingProviderWeb(this.account, serviceEndpoint);
    }

    _createIdentity() {
        return new WalletRPCIdentity(this._config, this._web3);
    }

    async setupAccount() {
        // TODO check for what this func
        await this._account._identity.setupAccount();
    }

    _constructStrategy(concurrentCalls = 1) {
        return new DefaultPaymentStrategy(this._account, concurrentCalls);
    }
}

export default WebSdk;
