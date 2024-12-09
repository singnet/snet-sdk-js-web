import { debug } from 'loglevel';
import { toBNString } from 'snet-sdk-core/utils/bignumber_helper';
import {
    TokenService,
    TokenServiceClient,
} from './proto/token_service_pb_service';

class ConcurrencyManager {
    /**
     * @param {Account} account
     * @param {ServiceMetadataProvider} serviceMetadata
     * @param {number} concurrentCalls
     */
    constructor(account, serviceMetadata, concurrentCalls = 1) {
        this._account = account;
        this._concurrentCalls = concurrentCalls;
        this._serviceMetadata = serviceMetadata;
        this._tokenServiceClient = this._generateTokenServiceClient();
    }

    get concurrentCalls() {
        return this._concurrentCalls;
    }

    /**
     * @param {PaymentChannel} channel
     * @param {number} serviceCallPrice
     * @returns {Promise<string | undefined>}
     */
    async getToken(channel, serviceCallPrice) {
        const currentSignedAmount =
            channel.state.currentSignedAmount.toNumber();
        if (currentSignedAmount !== 0) {
            const { plannedAmount, usedAmount, token } =
                await this._getTokenForAmount(channel, currentSignedAmount);
            if (usedAmount < plannedAmount) {
                return token;
            }
        }
        const newAmountToBeSigned = currentSignedAmount + serviceCallPrice;
        return this._getNewToken(channel, newAmountToBeSigned);
    }

    /**
     * @param {ServiceClient} serviceMetadata
     * @param {PaymentChannel} channel
     * @param {number} amount
     * @returns {Promise<string | undefined>} token
     * @private
     */
    async _getNewToken(channel, amount) {
        const tokenResponse = await this._getTokenForAmount(channel, amount);
        const { token } = tokenResponse;
        return token;
    }

    /**
     * @param {PaymentChannel} channel
     * @param {number} amount
     * @returns {MethodDescriptor}
     * @private
     */
    async _getTokenServiceRequest(channel, amount) {
        const { nonce } = channel.state;
        const currentBlockNumber = await this._account.getCurrentBlockNumber();

        const mpeSignature = await this._generateMpeSignature(
            parseInt(channel.channelId, 10),
            parseInt(nonce, 10),
            amount
        );
        const tokenSignature = await this._generateTokenSignature(
            mpeSignature,
            currentBlockNumber
        );
        const GetTokenRequest = TokenService.GetToken.requestType;
        const request = new GetTokenRequest();
        request.setChannelId(parseInt(channel.channelId, 10));
        request.setCurrentNonce(parseInt(nonce, 10));
        request.setSignedAmount(amount);
        request.setSignature(tokenSignature);
        request.setCurrentBlock(toBNString(currentBlockNumber));
        request.setClaimSignature(mpeSignature);
        return request;
    }

    /**
     * Get token for the given amount
     * @param {PaymentChannel} channel
     * @param {number} amount
     * @returns {Promise<string>} token
     * @private
     */
    async _getTokenForAmount(channel, amount) {
        const request = await this._getTokenServiceRequest(channel, amount);
        return new Promise((resolve, reject) => {
            this._tokenServiceClient.getToken(
                request,
                (error, responseMessage) => {
                    if (error) {
                        console.log('token grpc error', error);
                        reject(error);
                    } else {
                        resolve({
                            plannedAmount: responseMessage.getPlannedAmount(),
                            usedAmount: responseMessage.getUsedAmount(),
                            token: responseMessage.getToken(),
                        });
                    }
                }
            );
        });
    }

    /**
     * @param {hex} mpeSignature
     * @param {BigNumber} currentBlockNumber
     * @returns {Buffer} - Signed binary data
     * @private
     */
    async _generateTokenSignature(mpeSignature, currentBlockNumber) {
        const mpeSignatureHex = mpeSignature.toString('hex');
        return this._account.signData(
            { t: 'bytes', v: mpeSignatureHex },
            { t: 'uint256', v: currentBlockNumber }
        );
    }

    /**
     * Generate signature for getting payment metadata
     * @param {uint256} channelId
     * @param {uint256} nonce
     * @param {uint256} amount
     * @returns {Promise<Buffer>}
     * @private
     */
    async _generateMpeSignature(channelId, nonce, signedAmount) {
        return this._account.signData(
            { t: 'string', v: '__MPE_claim_message' },
            { t: 'address', v: this._serviceMetadata.mpeContract.address },
            { t: 'uint256', v: channelId },
            { t: 'uint256', v: nonce },
            { t: 'uint256', v: signedAmount }
        );
    }

    /**
     * Generate Token service client
     * @returns {TokenServiceClient}
     */
    _generateTokenServiceClient() {
        debug('Creating TokenService client', { tags: ['gRPC'] });
        const serviceEndpoint = this._serviceMetadata.getServiceEndpoint();
        debug(`TokenService pointing to ${serviceEndpoint.host}, `, {
            tags: ['gRPC'],
        });
        const host = `${serviceEndpoint.protocol}//${serviceEndpoint.host}`;
        return new TokenServiceClient(host);
    }
}

export default ConcurrencyManager;
