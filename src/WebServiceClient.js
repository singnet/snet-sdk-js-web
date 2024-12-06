import { grpc } from '@improbable-eng/grpc-web';
import { isEmpty } from 'lodash';

class WebServiceClient {
    constructor(metadataProvider, paymentChannelManagementStrategy) {
        this.metadataProvider = metadataProvider;
        this.paymentChannelManagementStrategy =
            paymentChannelManagementStrategy;
    }
    /**
     * @param {MethodDescriptor} methodDescriptor
     * @param {InvokeRpcOptions} props
     * @returns {Request}
     */
    async invoke(methodDescriptor, props) {
        const requestProps = await this._generateRequestProps(
            methodDescriptor,
            props
        );
        return grpc.invoke(methodDescriptor, requestProps);
    }

    /**
     * @param {UnaryMethodDefinition} methodDescriptor
     * @param {UnaryRpcOptions} props
     * @returns {Request}
     */
    async unary(methodDescriptor, props) {
        const requestProps = await this._generateRequestProps(
            methodDescriptor,
            props
        );
        return grpc.unary(methodDescriptor, requestProps);
    }

    /**
     *
     * @param {UnaryMethodDefinition} methodDescriptor
     * @param {UnaryRpcOptions} props
     * @returns {Promise<UnaryRpcOptions>}
     * @private
     */
    async _generateRequestProps(methodDescriptor, props) {
        const serviceEndpoint = this.metadataProvider.getServiceEndpoint();
        const host = serviceEndpoint.origin;
        const metadata = await this._enhanceMetadata(
            props.metadata,
            methodDescriptor
        );
        return {
            ...props,
            host,
            metadata,
        };
    }

    // TODO is it need to move to Service metadata provider?
    /*
     * @param {UnaryMethodDefinition} methodDescriptor
     */
    async _enhanceMetadata(metadata = new grpc.Metadata(), methodDescriptor) {
        if (this.metadataProvider._options.disableBlockchainOperations) {
            return metadata;
        }

        if (this.metadataProvider._options.metadataGenerator) {
            const { serviceName } = methodDescriptor.service;
            const { methodName } = methodDescriptor;
            const customMetadata =
                await this.metadataProvider._options.metadataGenerator(
                    this,
                    serviceName,
                    methodName
                );
            forOwn(customMetadata, (value, key) => {
                metadata.append(key, value);
            });
            return metadata;
        }

        let paymentMetadata = await this.metadataProvider.fetchPaymentMetadata(
            this.paymentChannelManagementStrategy
        );
        if (isEmpty(paymentMetadata)) {
            return;
        }

        if (!Array.isArray(paymentMetadata)) {
            paymentMetadata = [paymentMetadata];
        }
        paymentMetadata.forEach((paymentMeta) => {
            Object.entries(paymentMeta).forEach(([key, value]) => {
                metadata.append(key, value);
            });
        });

        metadata.append(
            'snet-payment-mpe-address',
            this.metadataProvider._mpeContract.address
        );
        return metadata;
    }
}

export default WebServiceClient;
