import {
    FreeCallStateServiceClient,
    FreeCallStateService,
} from '../proto/state_service_pb_service';
import FreeCallPaymentStrategy from 'snet-sdk-core/payment_strategies/FreeCallPaymentStrategy';

class FreeCallPaymentStrategyWeb extends FreeCallPaymentStrategy {
    constructor(serviceClient) {
        super(serviceClient);
        this._serviceClient = serviceClient;
        this._freeCallStateServiceClient =
            this._generateFreeCallStateServiceClient();
        this._freeCallStateMethodDescriptor =
            this._generateFreeCallStateMethodDescriptor();
    }

    /**
     * create the grpc client for free call state service
     * @returns {FreeCallStateServiceClient}
     * @private
     */
    _generateFreeCallStateServiceClient() {
        const serviceEndpoint = this._serviceClient._getServiceEndpoint();
        let host = serviceEndpoint.protocol + '//' + serviceEndpoint.hostname;
        if (serviceEndpoint.hasOwnProperty('port')) {
            host = host + ':' + serviceEndpoint.port;
        }

        return new FreeCallStateServiceClient(host);
    }

    _generateFreeCallStateMethodDescriptor() {
        return FreeCallStateService.GetFreeCallsAvailable;
    }
}

export default FreeCallPaymentStrategyWeb;
