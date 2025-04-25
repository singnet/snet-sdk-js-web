import { useContext } from "react";
import "./styles.css";
import { ReactComponent as CrossIcon} from "../../assets/images/Cross.svg";
import { AppContext } from "../../AppContext";

const Error = ({errorMessage, setError}) => {
    const setErrorFromContext = useContext(AppContext);
    const setErrorCallback = setError ?? setErrorFromContext;
    return errorMessage?
    <div className="error">
        {errorMessage}
        <CrossIcon onClick={() => setErrorCallback()}/>
    </div> : null;
}

export default Error;