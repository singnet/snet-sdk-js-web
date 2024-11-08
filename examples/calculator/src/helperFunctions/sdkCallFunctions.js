import serviceConfig from '../configs/serviceConfig';
import { initSDK } from '../configs/sdkConfig';
import PrepaidPaymentStrategy from 'snet-sdk-web/payment_strategies/PrepaidPaymentStrategy';
import PaidCallPaymentStrategy from 'snet-sdk-web/payment_strategies/PaidCallPaymentStrategy';
import { DefaultPaymentStrategy } from 'snet-sdk-web/payment_strategies';
import { FreecallMetadataGenerator } from 'snet-sdk-core/utils/metadataUtils';

let sdk;

const getSDK = async () => {
    return sdk ? sdk : await initSDK();
};

const frecallMEtadataGenerator = () => {
    const metadaValues = {
        type: 'free-call',
        userId: 'fospipakno@gufum.com',
        currentBlockNumber: '',   
        freecallAuthToken: '91194d6b7ebd593836b06fdd19325eed074ae9cabefde29b6593596d924655704fdf13f127ac6f43aa60b438a9d3e4c21fbdf66e709e5f84a3987fd351a877601b',
        freecallTokenExpiryBlock: 7208319,
        signatureBytes: '',
    }
    // const frecallMEtadataGenerator = new FreecallMetadataGenerator();
    // "snet-payment-type": data["snet-payment-type"],
    // "snet-free-call-user-id": data["snet-free-call-user-id"],
    // "snet-current-block-number": `${data["snet-current-block-number"]}`,
    // "snet-payment-channel-signature-bin": parseSignature(data["snet-payment-channel-signature-bin"]),
    // "snet-free-call-auth-token-bin": parseSignature(data["snet-free-call-auth-token-bin"]),
    // "snet-free-call-token-expiry-block": `${data["snet-free-call-token-expiry-block"]}`,
    // "snet-payment-mpe-address"
}

const generateOptions = () => {
    return {
        disableBlockchainOperations: false,
        tokenExpirationBlock: 7208319,
        tokenToMakeFreeCall:
            '91194d6b7ebd593836b06fdd19325eed074ae9cabefde29b6593596d924655704fdf13f127ac6f43aa60b438a9d3e4c21fbdf66e709e5f84a3987fd351a877601b',
        email: 'fospipakno@gufum.com',
        concurrency: true,
    };
};

export const getServiceClient = async () => {
    const sdk = await getSDK();
    const options = generateOptions();
    const client = await sdk.createServiceClient(
        serviceConfig.orgID,
        serviceConfig.serviceID,
        'default_group',
        null, // paymentStrategy
        options
    );
    console.log('client: ', client);

    return client;
};

export const getWalletInfo = async () => {
    const sdk = await getSDK();
    const address = await sdk.account.getAddress();
    const balance = await sdk.account.balance();
    const transactionCount = Number(await sdk.account._transactionCount());
    return { address, balance, transactionCount };
};
