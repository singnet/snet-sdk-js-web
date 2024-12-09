import {
    FreeCallStateServiceClient,
    FreeCallStateService,
} from '../proto/state_service_pb_service';
import FreeCallPaymentStrategy from 'snet-sdk-core/payment_strategies/FreeCallPaymentStrategy';

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
    }

    /**
     * Create the grpc client for free call state service
     * @returns {FreeCallStateServiceClient}
     * @private
     */
    _generateFreeCallStateServiceClient() {
        const serviceEndpoint = this._serviceMetadata.getServiceEndpoint();
        let host = serviceEndpoint.origin;

        return new FreeCallStateServiceClient(host);
    }

    /**
     * @returns {MethodDescriptor}
     * @private
     */
    _generateFreeCallStateMethodDescriptor() {
        return FreeCallStateService.GetFreeCallsAvailable;
    }
}

export default FreeCallPaymentStrategyWeb;
