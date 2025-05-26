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
 * Creates a WebServiceClient instance with proper initialization
 * @param {Object} params
 * @param {string} params.orgId - Organization ID (required)
 * @param {string} params.serviceId - Service ID (required)
 * @param {PaymentStrategy} [params.paymentStrategy] - Payment strategy instance
 * @param {ServiceMetadataProvider|string} [params.serviceMetadataProvider] - Metadata provider or endpoint URL
 * @returns {Promise<WebServiceClient>}
 * @throws {Error} When required parameters are missing or invalid
 */
async createServiceClient({ 
    orgId, 
    serviceId, 
    paymentStrategy = this._constructStrategy(),
    serviceMetadataProvider = null
} = {}) {
    // Validate required parameters
    if ((!orgId || !serviceId) && !serviceMetadataProvider) {
        throw new Error("orgId and serviceId are required parameters if serviceMetadataProvider isn't provided");
    }

    // Initialize metadata provider if needed
    if (!serviceMetadataProvider || typeof serviceMetadataProvider === 'string') {
        try {
            serviceMetadataProvider = await this.createServiceMetadataProvider(
                orgId, 
                serviceId,
                typeof serviceMetadataProvider === 'string' ? serviceMetadataProvider : undefined
            );
        } catch (error) {
            throw new Error(`Failed to create metadata provider: ${error.message}`);
        }
    }

    return new WebServiceClient(serviceMetadataProvider, paymentStrategy);
}

    /**
     * Creates a service metadata provider instance for web clients
     * @param {string} orgId - Organization ID (must be a non-empty string)
     * @param {string} serviceId - Service ID (must be a non-empty string)
     * @param {string} [groupName="default_group"] - Name of the service group to use
     * @param {Object} [options] - Additional configuration options
     * @param {boolean} [options.concurrency=true] - Whether to enable concurrent requests
     * @param {PaidCallMetadataGenerator} [options.paidCallMetadataGenerator] - Custom metadata generator for paid calls
     * @param {string|URL} [options.endpoint] - Custom service endpoint URL (string or URL object)
     * @returns {Promise<ServiceMetadataProviderWeb>} Resolves with initialized metadata provider
     * @throws {TypeError} When orgId or serviceId are missing or invalid
     * @throws {Error} When service metadata cannot be fetched or group is not found
     */
    async createServiceMetadataProvider(
        orgId,
        serviceId,
        groupName = "default_group",
        options = {}
    ) {
        if (!orgId || typeof orgId !== 'string') {
            throw new Error('Valid orgId is required');
        }
        if (!serviceId || typeof serviceId !== 'string') {
            throw new Error('Valid serviceId is required');
        }

        try {
            const metadata = await this._metadataProvider.getMetadata(
                orgId,
                serviceId
            );
            const { serviceMetadata } = metadata;
            const group = await this._serviceGroup(
                serviceMetadata,
                orgId,
                serviceId,
                groupName
            );

            if (!group) {
                throw new Error(`Group ${groupName} not found`);
            }

            return new ServiceMetadataProviderWeb(
                this.account,
                orgId,
                serviceId,
                metadata,
                this._mpeContract,
                group,
                options
            );
        } catch (error) {
            throw new Error(`Failed to create metadata provider: ${error.message}`);
        }
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
