import { useState } from "react";
import PopUp from "../../PopUp";
import Loader from "../../Loader";
import "./style.css";

export const EditModelPopIpTypes = {
    UPDATE: "update",
    CREATE: "create"
}


const EditModelPopUp = ({ isModalView, closeModal, type, action, trainingMetadata}) => {
    const initialStateUpdate = {
        modelName: '',
        description: '',
        addressList: []
    };
    
    const initialStateCreate = (trainingMetadata) => (
        {
            grpcMethod: trainingMetadata?.grpcServiceMethod,
            serviceName:  trainingMetadata?.grpcServiceName,
            isPublic: true,
            modelName: 'New',
            description: 'New',
            addressList: []
        }
    );
    
    const initialState = (trainingMetadata) =>(
        {
            [EditModelPopIpTypes.CREATE]: initialStateCreate(trainingMetadata),
            [EditModelPopIpTypes.UPDATE]: initialStateUpdate,
        }
    )
    const [isLoading, setIsLoading] = useState(false);
    const [newModel, setNewModel] = useState(initialState(trainingMetadata)[type]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewModel(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeAddressList = (e) => {
        const { name, value } = e.target;
        const addressesString = value;
        const addressesArray = addressesString.split(", ");
        setNewModel(prev => ({ ...prev, [name]: addressesArray }));
    };

    const handleModelAction = async () => {
        try {
            setIsLoading(true);
            await action(newModel)
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const DropDownSelect = ({title, name, value, onChange, list}) => {   
        return (
            <div className="form-group">
                <p>{title}</p>
                <select name={name} value={value} onChange={onChange}>
                    <option value="">Select {title} </option>
                    {list.map(method => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
            </div>
        )
    }

    const CreateModelAdditionalFields = () => {
        const grpcMethods = trainingMetadata.trainingmethodsMap[0][1].valuesList.map(service => (service.stringValue));
        const grpcServices = trainingMetadata.trainingmethodsMap.map(service => (service[0]));

        return (
            <>
                <DropDownSelect title="GRPC Method" name="grpcMethod" list={grpcMethods} value={newModel.grpcMethod} onChange={handleChange} optionKey="stringValue"/>
                <DropDownSelect title="Service Name" name="serviceName" list={grpcServices} value={newModel.serviceName} onChange={handleChange}/>
                <div className="form-group">
                    <p>Is Public:</p>
                    <select name="isPublic" value={newModel.isPublic} onChange={handleChange}>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                </div>
            </>
        )
    }
    
    return (
        <PopUp isPopupView={isModalView} closePopUp={closeModal} >
            <div className="create-model-form">
            {isLoading ? <Loader isLoading={isLoading}/> :
            <>
                <div className="form-group">
                    <p>Name:</p>
                    <input type="text" name="modelName" value={newModel.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <p>Description:</p>
                    <input type="text" name="description" value={newModel.description} onChange={handleChange} />
                </div>
                {type === EditModelPopIpTypes.CREATE && (
                    <CreateModelAdditionalFields />
                )}
                <div className="form-group">
                    <p>Access address list</p>
                    <input type="text" name="addressList" value={newModel.addressList.toString()} onChange={handleChangeAddressList} />
                </div>
                <button onClick={handleModelAction}>{type} model</button>
            </>
            }
            </div>
        </PopUp>
    )
}

export default EditModelPopUp;