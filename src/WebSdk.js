import SnetSDK, { WalletRPCIdentity } from 'snet-sdk-core';
import WebServiceClient from './WebServiceClient';
import RegistryContract from './RegistryContract';
import { DefaultPaymentStrategy } from './payment_strategies';

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
        orgId,
        serviceId,
        groupName = null,
        paymentChannelManagementStrategy = null,
        options = {}
    ) {
        console.log('createServiceClient web options: ', options);

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

        const paymentStartegy = this._constructStrategy(
            paymentChannelManagementStrategy
        );

        return new WebServiceClient(
            this,
            orgId,
            serviceId,
            this._mpeContract,
            serviceMetadata,
            group,
            paymentStartegy,
            options
        );
    }

    _createIdentity() {
        return new WalletRPCIdentity(this._config, this._web3);
    }

    async setupAccount() {
        await this._account._identity.setupAccount();
    }

    _constructStrategy(paymentChannelManagementStrategy, concurrentCalls = 1) {
        console.log("_constructStrategy WEB");
        
        // const coreStartegy = super._constructStrategy(
        //     paymentChannelManagementStrategy,
        //     concurrentCalls
        // );
        // console.log("coreStartegy: ", coreStartegy);

        return new DefaultPaymentStrategy(concurrentCalls);
    }
}

export default WebSdk;
