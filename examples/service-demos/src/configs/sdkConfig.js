import SnetSDK from 'snet-sdk-web';

export const TOKEN_NAME = "FET";
const EXPECTED_ID_ETHEREUM_NETWORK = 11155111;

export const initSDK = async () => {
    try {
        const snetConfig = {
            networkId: EXPECTED_ID_ETHEREUM_NETWORK,
            web3Provider: window?.ethereum,
            defaultGasPrice: '4700000',
            defaultGasLimit: '210000',
            tokenName: TOKEN_NAME,
            standType: 'demo'
        };
        return new SnetSDK(snetConfig);
    } catch (error) {
        throw error;
    }
};
