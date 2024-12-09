import { ServiceMetadataProvider } from 'snet-sdk-core';
import ConcurrencyManager from './ConcurrencyManager';
import { ChannelModelProvider } from './ModelsProvider';

class ServiceMetadataProviderWeb extends ServiceMetadataProvider {
    /**
     * @param {Account} account
     * @param {String} orgId
     * @param {String} serviceId
     * @param {ServiceMetadata} metadata
     * @param {MPEContract} mpeContract
     * @param {Group} group
     * @param {ServiceClientOptions} [options={}]
     */
    constructor(
        account,
        orgId,
        serviceId,
        metadata,
        mpeContract,
        group,
        options = {}
    ) {
        super(orgId, serviceId, metadata, mpeContract, group, options);
        this.account = account;
    }

    get concurrencyManager() {
        return new ConcurrencyManager(
            this.account,
            this,
            this._concurrentCalls
        );
    }

    get ChannelModelProvider() {
        const serviceEndpoint = this.getServiceEndpoint();
        return new ChannelModelProvider(serviceEndpoint);
    }
}

export default ServiceMetadataProviderWeb;
