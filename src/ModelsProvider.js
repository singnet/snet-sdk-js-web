import {
    PaymentChannelStateService,
    PaymentChannelStateServiceClient,
} from './proto/state_service_pb_service';
import { Model, ModelClient } from './proto/training_pb_service';
import training_pb from './proto/training_pb';
import { logMessage } from 'snet-sdk-core/utils/logger';

export class ChannelModelProvider {
    /**
     * @param {string} serviceEndpoin
     */
    constructor(serviceEndpoint) {
        this.serviceEndpoint = serviceEndpoint;
    }

    /**
     * @returns {PaymentChannelStateServiceClient}
     */
    generatePaymentChannelStateServiceClient() {
        logMessage('debug', 'ChannelModelProvider', `PaymentChannelStateService pointing to ${this.serviceEndpoint.host}, `);
        const host = `${this.serviceEndpoint.protocol}//${this.serviceEndpoint.host}`;
        return new PaymentChannelStateServiceClient(host);
    }

    /**
     * @return {MethodDescriptor}
     */
    getChannelStateRequestMethodDescriptor() {
        return PaymentChannelStateService.GetChannelState.requestType;
    }
}

export class TrainingModelProvider {
    /**
     * @param {string} serviceEndpoin
     * @returns {PaymentChannelStateServiceClient}
     */
    _generateModelServiceClient(serviceEndpoint) {
        logMessage('debug', 'ChannelModelProvider', `TrainingChannelStateService pointing to ${serviceEndpoint.origin}, `);

        const host = serviceEndpoint.origin;
        if (!host) {
            throw new Error('host is undefined');
        }
        return new ModelClient(host);
    }

    /**
     * @return {MethodDescriptor}
     */
    _getModelRequestMethodDescriptor() {
        return Model.get_all_models.requestType;
    }

    /**
     * @return {MethodDescriptor}
     */
    _getAuthorizationRequestMethodDescriptor() {
        return training_pb.AuthorizationDetails;
    }

    /**
     * @return {MethodDescriptor}
     */
    _getCreateModelRequestMethodDescriptor() {
        return Model.create_model.requestType;
    }

    /**
     * @return {MethodDescriptor}
     */
    _getDeleteModelRequestMethodDescriptor() {
        return Model.delete_model.requestType;
    }

    /**
     * @return {MethodDescriptor}
     */
    _getUpdateModelRequestMethodDescriptor() {
        return Model.update_model_access.requestType;
    }

    /**
     * @return {MethodDescriptor}
     */
    _getModelDetailsRequestMethodDescriptor() {
        return training_pb.ModelDetails;
    }
}
