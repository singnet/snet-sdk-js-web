import { useState } from 'react';
import {
    getTrainingProvider,
    getWalletInfo,
} from '../../helperFunctions/sdkCallFunctions';
import './styles.css';
import { isNull } from 'lodash';
import Model from './Model';
import Loader from "../Loader";

const TrainingModel = ({ serviceMetadata, serviceClient }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [trainingProvider, setTrainingProvider] = useState();
    const [excitingModels, setExcitingModels] = useState();
    const [trainingMetadata, setTrainingMetadata] = useState({isTrainingEnabled: false, hasTrainingInProto: false, trainingServicesAndMethods: []})
    const serviceEndpoint = serviceMetadata?._getServiceEndpoint();

    const getTrainingProviderFromSDK = async () => {
            const training = await getTrainingProvider(
                serviceEndpoint,
                serviceClient
            );
            setTrainingProvider(training);
            getTrainingMetadata(training);
        };

    const createModel = async () => {
        try {
            setIsLoading(true);
            const { address } = await getWalletInfo();
            const params = {
                address,
                name: 'Model not public',
                description: 'Model description',
                is_public: false,
                address_list: ['0x6E7BaCcc00D69eab748eDf661D831cd2c7f3A4DF', '0x0709e9B78756B740ab0C64427f43f8305fD6D1A7'],
                grpcMethod: trainingMetadata.grpcServiceMethod,
                serviceName: trainingMetadata.grpcServiceName,
            };
            await trainingProvider.createModel(
                params
            );
            await getAllModels();
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getAllModels = async () => {
        try {
            setIsLoading(true);
            const { address } = await getWalletInfo();
            const params = {
                grpcMethod: trainingMetadata.grpcServiceMethod,
                serviceName: trainingMetadata.grpcServiceName,
                name: "",
                statuses: [],
                isPublic: false,
                createdByAddress: '',
                pageSize: 100,
                page: 0,
                address,
            };
            const existingModels = await trainingProvider.getAllModels(params);
            setExcitingModels(existingModels);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };


    const getMethodMetadataByMethod = async () => {
        try {
            setIsLoading(true);
            const params = {
                grpcMethod: trainingMetadata.grpcServiceMethod,
                serviceName: trainingMetadata.grpcServiceName,
            };
            const methodMetadata =  await trainingProvider.getMethodMetadata(params);;
            console.log('method metadata by method: ', methodMetadata);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    const trainingActions = [
        {id: "createModel", label: "Create Model", action: createModel},
        {id: "getAllModels", label: "Get Existing Models", action: getAllModels},
        {id: "getMethodMetadataByMethod", label: "Get Method Metadata", action: getMethodMetadataByMethod},
    ];


    const ExcitingModels = () => {
        return (
            <div className='exciting-models-container'>
                <h2>Exciting models</h2>
                <div className='exciting-models'>
                    {excitingModels.map((excitingModel, index) => (
                        <Model trainingProvider={trainingProvider} getAllModels={getAllModels} key={index} model={excitingModel} />
                    ))}
                </div>
            </div>
        );
    };

    const getTrainingMetadata = async (trainingProvider) => {
        const serviceMetadata = await trainingProvider.getServiceMetadata();
        console.log("getServiceMetadata: ", serviceMetadata);
        const grpcServiceName = serviceMetadata.trainingmethodsMap[0][0];
        const grpcServiceMethod = serviceMetadata.trainingmethodsMap[0][1];
        setTrainingMetadata({...serviceMetadata, grpcServiceName, grpcServiceMethod});
    }
    
    if (isNull(trainingMetadata)) {
        return <h2>For this service training is not avalable</h2>
    }

    return (
        <div className='training-model-container'>
            <div className='button-group'>
                {!trainingMetadata.grpcServiceName ? (
                    <button
                        disabled={!serviceMetadata || isLoading}
                        onClick={getTrainingProviderFromSDK}
                        
                    >
                        Get Training Provider
                    </button>
                ) : (
                    trainingActions.map(trainingAction => (
                        <button key={trainingAction.id} onClick={trainingAction.action}>
                            {trainingAction.label}
                        </button>
                    ))
                )}
            </div>
            {isLoading && <Loader isLoading={isLoading}/>}
            <div className='models-container'>
                {excitingModels && <ExcitingModels />}
            </div>
        </div>
    );
};

export default TrainingModel;
