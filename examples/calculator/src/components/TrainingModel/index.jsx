import { useState } from 'react';
import {
    getTrainingProvider,
    getWalletInfo,
} from '../../helperFunctions/sdkCallFunctions';
import './styles.css';
import { isNull } from 'lodash';
import Model from './Model';
import Loader from "../Loader";
import FilterModels from './FilterModels';
import EditModelPopUp, { EditModelPopIpTypes } from './EditModelPopUp';
import PopUp from '../PopUp';
import Table from '../Table';

const TrainingModel = ({ serviceMetadata, serviceClient }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateModelView, setIsCreateModelView] = useState(false);
    const [models, setModels] = useState();
    const [trainingProvider, setTrainingProvider] = useState();
    const [trainingMetadata, setTrainingMetadata] = useState({isTrainingEnabled: false, hasTrainingInProto: false, trainingServicesAndMethods: []})
    const [methodMetadata, setMethodMetadata] = useState({
        isOpen: false,
        data: ''
    });

    const serviceEndpoint = new URL("https://3f61-185-167-96-119.ngrok-free.app") //serviceMetadata?._getServiceEndpoint(); TODO

    const closeMethadataPopUp = () => {
        setMethodMetadata({...methodMetadata, isOpen: false})
    }

    const getTrainingProviderFromSDK = async () => {
            const training = await getTrainingProvider(
                serviceEndpoint,
                serviceClient
            );
            setTrainingProvider(training);
            getTrainingMetadata(training);
        };

    const createModel = async (modelParams) => {
        try {
            const { address } = await getWalletInfo();
            const params = {
                address,
                ...modelParams
            };
            console.log("params: ", params);     
            await trainingProvider.createModel(
                params
            );
            setIsCreateModelView(false);
            await getAllModels();
        } catch (err) {
            console.log(err);
        }
    };

    const closeCreateModel = () => {
        setIsCreateModelView(false);
    }

    const getAllModels = async (filters = {}) => {
        try {
            setIsLoading(true);
            const { address } = await getWalletInfo();
            const params = {
                ...filters,
                isUnifiedSign: true, 
                address, 
            };
            const existingModels = await trainingProvider.getAllModels(params);
            setModels(existingModels);
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
            const metadata =  await trainingProvider.getMethodMetadata(params);
            const parsedMetadata = Object.keys(metadata).map(metadataKey => ({title: metadataKey, value: metadata[metadataKey] }))
            console.log('method metadata by method: ', metadata);
            setMethodMetadata({isOpen: true, data: parsedMetadata})
        } catch (err) {
            console.log(err);
            setMethodMetadata({isOpen: false, data: ""})
        } finally {
            setIsLoading(false);
        }
    };

    const trainingActions = [
        {id: "createModel", label: "Create Model", action: () => setIsCreateModelView(true)},
        {id: "getMethodMetadataByMethod", label: "Get Method Metadata", action: getMethodMetadataByMethod},
    ];


    const ExcitingModels = () => {
        return (
            <div className='exciting-models-container'>
                <h2>Exciting models</h2>
                <div className='exciting-models'>
                    {models.map((excitingModel, index) => (
                        <Model trainingProvider={trainingProvider} getAllModels={getAllModels} key={index} modelData={excitingModel} />
                    ))}
                </div>
            </div>
        );
    };

    const getTrainingMetadata = async (trainingProvider) => {
        const serviceMetadata = await trainingProvider.getTrainingMetadata();
        console.log("trainingProvider; ", serviceMetadata.trainingmethodsMap[0][1].valuesList.stringValue);
        console.log("getServiceMetadata: ", serviceMetadata);
        const grpcServiceName = serviceMetadata.trainingmethodsMap[0][0];
        const grpcServiceMethod = serviceMetadata.trainingmethodsMap[0][1].valuesList[0].stringValue;
        console.log("getServiceMetadata: ", grpcServiceName, grpcServiceMethod, serviceMetadata.trainingmethodsMap[0][1]);
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
                ): (
                    <>
                        <FilterModels
                            trainingMetadata={trainingMetadata}
                            onFilterApply={getAllModels}
                        />
                        {
                            trainingActions.map(trainingAction => (
                                <button key={trainingAction.id} onClick={trainingAction.action}>
                                    {trainingAction.label}
                                </button>
                            ))
                        }
                    </>
                )}
            </div>
            <PopUp isPopupView={methodMetadata.isOpen} closePopUp={closeMethadataPopUp}>
                <Table tableData={methodMetadata.data} />
            </PopUp>
            <EditModelPopUp
                isModalView={isCreateModelView}
                closeModal={closeCreateModel}
                trainingMetadata={trainingMetadata}
                action={createModel}
                type={EditModelPopIpTypes.CREATE}
            />
            {isLoading && <Loader isLoading={isLoading}/>}
            <div className='models-container'>
                {models && <ExcitingModels />}
            </div>
        </div>
    );
};

export default TrainingModel;
