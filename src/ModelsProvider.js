import {
    PaymentChannelStateService,
    PaymentChannelStateServiceClient,
} from './proto/state_service_pb_service';
import { Daemon, DaemonClient } from "./proto/training_daemon_pb_service";
import training_daemon_pb from "./proto/training_daemon_pb";
import training_pb from "./proto/training_pb";
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
        return new DaemonClient(host);
    }

    /**
     * @return {MethodDescriptor}
     */
    _getAllModelRequestMethodDescriptor() {
        return Daemon.get_all_models.requestType;
    };
    
    /**
     * @return {MethodDescriptor}
     */
    _getTrainingMetadataRequestMethodDescriptor() {
        return Daemon.get_training_metadata.requestType;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getMethodMetadataRequestMethodDescriptor() {
        return Daemon.get_method_metadata.requestType;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getCreateModelRequestMethodDescriptor() {
        return Daemon.create_model.requestType;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getDeleteModelRequestMethodDescriptor() {
        return Daemon.delete_model.requestType;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getUpdateModelRequestMethodDescriptor() {
        return Daemon.update_model.requestType;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getValidateModelPriceRequestMethodDescriptor() {
        return Daemon.validate_model_price.requestType;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getTrainModelPriceRequestMethodDescriptor() {
        return Daemon.train_model_price.requestType;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getTrainModelRequestMethodDescriptor() {
        return Daemon.train_model.requestType;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getValidateModelRequestMethodDescriptor() {
        return Daemon.validate_model.requestType;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getModelStatusRequestMethodDescriptor() {
        return Daemon.get_model.requestType;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getNewModelRequestMethodDescriptor() {
        return training_pb.NewModel;
    };

    /**
     * @return {MethodDescriptor}
     */
    _getAuthorizationRequestMethodDescriptor() { 
        return training_daemon_pb.AuthorizationDetails;
    };
}
