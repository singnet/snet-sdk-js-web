import {
    FreeCallStateServiceClient,
    FreeCallStateService,
} from '../proto/state_service_pb_service';
import FreeCallPaymentStrategy from 'snet-sdk-core/paymentStrategies/FreeCallPaymentStrategy';

class FreeCallPaymentStrategyWeb extends FreeCallPaymentStrategy {
    /**
     * Initializing the free-call payment strategy for web SDK
     * @param {Account} account
     * @param {number} concurrentCalls
     */
    constructor(account, serviceMetadata) {
        super(account, serviceMetadata);
        this._serviceMetadata = serviceMetadata;
        this._freeCallStateServiceClient =
            this._generateFreeCallStateServiceClient();
        this._freeCallStateMethodDescriptor =
            this._generateFreeCallStateMethodDescriptor();
        this._freeCallTokenMethodDescriptor =
            this._generateFreeCallTokenMethodDescriptor();
    }

    /**
     * Create the grpc client for free call state service
     * @returns {FreeCallStateServiceClient}
     * @private
     */
    _generateFreeCallStateServiceClient() {
        const serviceEndpoint = this._serviceMetadata._getServiceEndpoint();
        return new FreeCallStateServiceClient(serviceEndpoint.origin);
    }

    /**
     * @returns {MethodDescriptor}
     * @private
     */
    _generateFreeCallStateMethodDescriptor() {
        return FreeCallStateService.GetFreeCallsAvailable;
    }

    /**
     * @returns {MethodDescriptor}
     * @private
     */
    _generateFreeCallTokenMethodDescriptor() {
        return FreeCallStateService.GetFreeCallToken;
    }

}

export default FreeCallPaymentStrategyWeb;
