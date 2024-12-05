import serviceConfig from '../configs/serviceConfig';
import { initSDK } from '../configs/sdkConfig';
import {
    PrepaidPaymentStrategy,
    FreeCallPaymentStrategy,
} from 'snet-sdk-web/payment_strategies';

let sdk;

const getSDK = async () => {
    return sdk ? sdk : await initSDK();
};

export const generateOptions = () => {
    return {
        disableBlockchainOperations: false,
        tokenExpirationBlock: 7388515,
        tokenToMakeFreeCall:
            '17b77edf22bc5bceae5562f5fb26fea0ccbf7c22c99a56287c14cc90cbe17f633f7338712e6a9dbf1e44dad2fd8c710613354904df688fa4d3a90a54db2afc9e1b',
        email: 'fospipakno@gufum.com',
        concurrency: true,
    };
};

export const getServiceMetadata = async (options) => {
    const sdk = await getSDK();
    // const options = generateOptions();
    const serviceMetadata = await sdk.createServiceMetadataProvider(
        serviceConfig.orgID,
        serviceConfig.serviceID,
        'default_group',
        options
    );
    return serviceMetadata;
};

const getServiceClient = async (serviceMetadataProvider, paymentStrategy) => {
    const sdk = await getSDK();
    const client = await sdk.createServiceClient(
        serviceMetadataProvider,
        paymentStrategy
    );
    return client;
};

export const getPaymentServiceClient = async (serviceMetadata) => {
    const sdk = await getSDK();
    const paymentStrategy = new PrepaidPaymentStrategy(
        sdk.account,
        serviceMetadata
    );
    const paymentServiceClient = await getServiceClient(
        serviceMetadata,
        paymentStrategy
    );
    return paymentServiceClient;
};

const createFreecallStrategy = async (serviceMetadata) => {
    const sdk = await getSDK();
    const paymentStrategy = new FreeCallPaymentStrategy(
        sdk.account,
        serviceMetadata
    );

    return paymentStrategy;
};

export const getFreeCallServiceClient = async (serviceMetadata) => {
    const paymentStrategy = await createFreecallStrategy(serviceMetadata);
    const freeCallServiceClient = await getServiceClient(
        serviceMetadata,
        paymentStrategy
    );
    return freeCallServiceClient;
};

export const getDefaultServiceClient = async (serviceMetadata) => {
    const defaultServiceClient = await getServiceClient(serviceMetadata);
    return defaultServiceClient;
};

export const getWalletInfo = async () => {
    const sdk = await getSDK();
    const address = await sdk.account.getAddress();
    const balance = await sdk.account.balance();
    const transactionCount = Number(await sdk.account._transactionCount());
    return { address, balance, transactionCount };
};

export const getAvailableFreeCalls = async (serviceMetadata) => {
    const freecallStrategy = await createFreecallStrategy(serviceMetadata);
    const availableFreeCalls = await freecallStrategy.getFreeCallsAvailable();
    return availableFreeCalls;
};
