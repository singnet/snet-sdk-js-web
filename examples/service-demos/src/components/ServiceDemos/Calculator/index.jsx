import { useState, Fragment, useContext } from "react";
import { Calculator } from "../../../stubs/example_pb_service.js";
import Error from "../../Error/index.jsx";
import "../common/styles.css";
import Loader from "../../Loader/index.jsx";

export {default as serviceConfig} from "./serviceConfig";

const ACTIONS = [
    {value: "add", title: "+"},
    {value: "sub", title: "-"},
    {value: "mul", title: "*"},
    {value: "div", title: "/"},
];

const SUCCESS_CODE = 0;

const ServiceDemo = ({serviceClient}) => {
    const [values, setValues] = useState({
        firstValue: '',
        secondValue: ''
    });
    const [response, setResponse] = useState();
    const [isSubmitCompleted, setIsSubmitCompleted] = useState(false);
    const [error, setError] = useState();
    const [selectedAction, setSelectedAction] = useState(ACTIONS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitDisable, setIsSubmitDisable] = useState(true);

    const onActionEnd = (response) => {
        const { message, status, statusMessage } = response;
        setIsSubmitCompleted(true);
        if (status !== SUCCESS_CODE) {
            setError(statusMessage);
        }

        setResponse(message.getValue());
        setIsLoading(false);
    }

    const submitAction = async () => {
        try {
            setIsLoading(true);
            const methodDescriptor = Calculator[selectedAction.value];
            const request = new methodDescriptor.requestType();
        
            request.setA(values.firstValue);
            request.setB(values.secondValue);
        
            const props = {
                request,
                preventCloseServiceOnEnd: false,
                onEnd: onActionEnd,
            };
            await serviceClient.unary(methodDescriptor, props);
        } catch (error) {
            console.error(error);
            setError(error.message ?? error);
        } finally {
            setIsLoading(false);
        }
      }
    
    const handleInput = (event) => {
        const targetField = event.target;
        if (!Number(targetField.value)) {
            setIsSubmitDisable(true);
            setError('Values should be numbers')
        } else {
            setIsSubmitDisable(false);
            setError();
        }
        setValues({...values, [targetField.name]: targetField.value})
    }

    return (
        <Fragment>
            <div className="service-input">
                <input name="firstValue" onChange={handleInput} />
                <select onChange={event => setSelectedAction(event.target.value)}>
                    {ACTIONS.map(action => 
                        <option value={action.value} key={action.value}>{action.title}</option>
                    )}
                </select>
                <input name="secondValue" onChange={handleInput} />
            </div>
            <button 
                disabled={isSubmitDisable || !values.firstValue || !values.secondValue} 
                onClick={submitAction}
            >
                Submit
            </button>
            <Error errorMessage={error} setError={setError}/>
            <Loader isLoading={isLoading} />
            {isSubmitCompleted && !error && <div className="service-output">
                Response: {values.firstValue} {selectedAction.title} {values.secondValue} = {response}
            </div>
            }
        </Fragment>
    )
}

export default ServiceDemo;