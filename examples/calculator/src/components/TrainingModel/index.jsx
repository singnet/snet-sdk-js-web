import { useEffect, useState } from 'react';
import {
    getTrainingProvider,
    getWalletInfo,
} from '../../helperFunctions/sdkCallFunctions';
import './styles.css';
import Table from '../Table';
import { isNull } from 'lodash';

const grpcService = '/vits.VITSTrainingService/inference'
    .split('.')[1]
    .split('/')[0];

const TrainingModel = ({ serviceMetadata }) => {
    const [trainingProvider, setTrainingProvider] = useState();
    const [createdModel, setCreatedModel] = useState();
    const [excitingModels, setExcitingModels] = useState();
    const [trainingMethod, setTrainingMethod] = useState()
    const serviceEndpoint = serviceMetadata?.getServiceEndpoint();


    useEffect(() => {
        console.log("trainingMethod: ", trainingMethod);
        
        if (trainingMethod) {
            return;
        }
        const fetchServiceTrainingDataAPI = async () => {
            try {
                const url = `${serviceEndpoint}heartbeat`;
                const response = await fetch(url);
                const trainingData = await response.json();
                setTrainingMethod(trainingData?.trainingMethods[0]);
            } catch (error) {
                setTrainingMethod(null);;
            }
        };

        fetchServiceTrainingDataAPI();
    }, [trainingMethod])
    

    const getTrainingProviderFromSDK = async () => {
        const training = await getTrainingProvider(
            serviceEndpoint
        );
        setTrainingProvider(training);
    };

    const createModel = async () => {
        const { address } = await getWalletInfo();
        const params = {
            address,
            orgId: serviceMetadata.orgId,
            serviceId: serviceMetadata.serviceId,
            groupId: serviceMetadata.groupId,
            grpcServiceName: 'Model name',
            grpcMethod: trainingMethod,
            serviceName: grpcService,
            description: 'Model description',
            publicAccess: false,
            dataLink: 'Link to dataset',
            accessAddressList: [],
        };
        const createdModel = await trainingProvider.createModel(
            params
        );

        setCreatedModel(createdModel);
    };

    const deleteModel = async (model) => {
        const { address } = await getWalletInfo();
        const params = {
            modelId: model.modelId,
            grpcMethod: trainingMethod,
            address,
            grpcServiceName: grpcService,
        };
        await trainingProvider.deleteModel(params);
        await getExistingModel();
    };

    const updateModel = async (model) => {
        const { address } = await getWalletInfo();
        const params = {
            orgId: serviceMetadata.orgId,
            serviceId: serviceMetadata.serviceId,
            groupId: serviceMetadata.groupId,
            modelId: model.modelId,
            address,
            grpcMethod: trainingMethod,
            grpcServiceName: model.serviceName,
            dataLink: model.dataLink,
            modelName: model.trainingModelName + 'update_model',
            description: model.trainingModelDescription,
            publicAccess: !model.isRestrictAccessModel,
            accessAddressList: model.isRestrictAccessModel
                ? model.accessAddresses
                : [],
            status: model.status,
            updatedDate: model.updatedDate,
        };
        console.log('updating model: ', params);

        await trainingProvider.updateModel(params);
        await getExistingModel();
    };

    const getExistingModel = async () => {
        const { address } = await getWalletInfo();
        const params = {
            grpcMethod: trainingMethod,
            grpcServiceName: grpcService,
            address,
        };
        const existingModels = await trainingProvider.getExistingModel(params);
        setExcitingModels(existingModels);
    };

    const getModelStatus = async (model) => {
        const { address } = await getWalletInfo();
        const params = {
            modelId: model.modelId,
            grpcMethod: trainingMethod,
            grpcServiceName: grpcService,
            address,
        };
        const newModelStatus = await trainingProvider.getModelStatus(params);
        console.log('new model status: ', newModelStatus);
    };

    const generateModelInfoMeta = (modelInfo) => {
        return [
            { title: 'accessAddressList', value: modelInfo.accessAddressList },
            { title: 'dataLink', value: modelInfo.dataLink },
            { title: 'description', value: modelInfo.description },
            { title: 'methodName', value: modelInfo.methodName },
            { title: 'modelId', value: modelInfo.modelId },
            { title: 'modelName', value: modelInfo.modelName },
            { title: 'publicAccess', value: String(modelInfo.publicAccess) },
            { title: 'serviceName', value: modelInfo.serviceName },
            { title: 'status', value: modelInfo.status },
            { title: 'updatedDate', value: modelInfo.updatedDate },
        ];
    };

    const Model = ({ model }) => {
        const modelInfoMeta = generateModelInfoMeta(model);
        return (
            <div className='model-container'>
                <Table tableData={modelInfoMeta} />
                <div className='model-buttons button-group'>
                    <button onClick={() => getModelStatus(model)}>
                        Get model status
                    </button>
                    <button onClick={() => updateModel(model)}>
                        Update model
                    </button>
                    <button
                        className='delete-button'
                        onClick={() => deleteModel(model)}
                    >
                        Delete model
                    </button>
                </div>
            </div>
        );
    };

    const ExcitingModels = () => {
        return (
            <div className='exciting-models-container'>
                <h2>Exciting models</h2>
                <div className='exciting-models'>
                    {excitingModels.map((excitingModel, index) => (
                        <Model key={index} model={excitingModel} />
                    ))}
                </div>
            </div>
        );
    };
    
    if (isNull(trainingMethod)) {
        return <h2>For this service training is not avalable</h2>
    }

    return (
        <div>
            <div className='button-group'>
                {!trainingProvider ? (
                    <button
                        disabled={!serviceMetadata}
                        onClick={getTrainingProviderFromSDK}
                    >
                        Get Training Provider
                    </button>
                ) : (
                    <>
                        <button onClick={createModel}>Create Model</button>
                        <button onClick={getExistingModel}>
                            Get Existing Models
                        </button>
                    </>
                )}
            </div>
            <div className='models-container'>
                {createdModel && (
                    <>
                        <h2>Created Model</h2>
                        <Model model={createdModel} />
                    </>
                )}
                {excitingModels && <ExcitingModels />}
            </div>
        </div>
    );
};

export default TrainingModel;
