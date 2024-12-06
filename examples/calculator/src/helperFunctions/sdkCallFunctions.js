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

export const getTrainingProvider = async (serviceEndpoint) => {
    const sdk = await getSDK();
    const trainingProvider = await sdk.createTrainingProvider(serviceEndpoint);
    return trainingProvider;
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
