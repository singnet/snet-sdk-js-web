import {
    PaymentChannelStateService,
    PaymentChannelStateServiceClient,
} from './proto/state_service_pb_service';
import { Model, ModelClient } from './proto/training_pb_service';
import training_pb from './proto/training_pb';
import { debug } from 'loglevel';

export class ChannelModelProvider {
    constructor(serviceEndpoint) {
        this.serviceEndpoint = serviceEndpoint;
    }

    generatePaymentChannelStateServiceClient() {
        debug(
            `PaymentChannelStateService pointing to ${this.serviceEndpoint.host}, `,
            {
                tags: ['gRPC'],
            }
        );
        const host = `${this.serviceEndpoint.protocol}//${this.serviceEndpoint.host}`;
        return new PaymentChannelStateServiceClient(host);
    }

    getChannelStateRequestMethodDescriptor() {
        return PaymentChannelStateService.GetChannelState.requestType;
    }
}

export class TrainingModelProvider {
    _generateModelServiceClient(serviceEndpoint) {
        debug(
            `TrainingChannelStateService pointing to ${serviceEndpoint.host}, `,
            {
                tags: ['gRPC'],
            }
        );
        const host = `${serviceEndpoint.protocol}//${serviceEndpoint.host}`;
        return new ModelClient(host);
    }

    _getModelRequestMethodDescriptor() {
        return Model.get_all_models.requestType;
    }

    _getAuthorizationRequestMethodDescriptor() {
        return training_pb.AuthorizationDetails;
    }

    _getCreateModelRequestMethodDescriptor() {
        return Model.create_model.requestType;
    }

    _getDeleteModelRequestMethodDescriptor() {
        return Model.delete_model.requestType;
    }

    _getUpdateModelRequestMethodDescriptor() {
        return Model.update_model_access.requestType;
    }

    _getModelDetailsRequestMethodDescriptor() {
        return training_pb.ModelDetails;
    }
}
