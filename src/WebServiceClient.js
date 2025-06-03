import { grpc } from '@improbable-eng/grpc-web';
import { isEmpty } from 'lodash';

class WebServiceClient {
    /**
     * @param {ServiceMetadataProviderWeb} metadataProvider
     * @param {DefaultPaymentStrategyWeb || FreeCallPaymentStrategyWeb || PaidCallPaymentStrategyWeb || PrepaidPaymentStrategyWeb} paymentChannelManagementStrategy
     */
    constructor(metadataProvider, paymentChannelManagementStrategy, options) {
        this.metadataProvider = metadataProvider;
        this.paymentChannelManagementStrategy =
            paymentChannelManagementStrategy;
        this._options = {...options, ...metadataProvider?._options};
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
     * @param {UnaryMethodDefinition} methodDescriptor
     * @param {UnaryRpcOptions} props
     * @returns {Promise<UnaryRpcOptions>}
     * @private
     */
    async _generateRequestProps(methodDescriptor, props) {
        const serviceEndpoint = this.metadataProvider._getServiceEndpoint();
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

    /**
     * @param {grpc.Metadata} metadata
     * @param {UnaryMethodDefinition} methodDescriptor
     */
    async _enhanceMetadataViaMetadataGenerator(metadata, methodDescriptor) {
        const { serviceName } = methodDescriptor.service;
        const { methodName } = methodDescriptor;
        const customMetadata =
            await this._options.metadataGenerator(
                this,
                serviceName,
                methodName
            );
        forOwn(customMetadata, (value, key) => {
            metadata.append(key, value);
        });
        return metadata;
    }
    
    _enhanceMetadataDefault(metadata, paymentMetadata) {
        paymentMetadata.forEach((paymentMeta) => {
          Object.entries(paymentMeta).forEach(([key, value]) => {
            metadata.append(key, value);
          });
        });
    
        metadata.append(
            "snet-payment-mpe-address", 
            this.metadataProvider._mpeContract.address
        );
        return metadata;
    }
    
    /**
     * @param {grpc.Metadata} metadata
     * @param {UnaryMethodDefinition} methodDescriptor
     */
    async _enhanceMetadata(metadata = new grpc.Metadata(), methodDescriptor) {
        if (this._options.disableBlockchainOperations) {
          return metadata;
        }
    
        if (this._options.metadataGenerator) {
          return await this._enhanceMetadataViaMetadataGenerator(metadata, methodDescriptor);
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
        
        return this._enhanceMetadataDefault(metadata, paymentMetadata);
    }
}

export default WebServiceClient;
