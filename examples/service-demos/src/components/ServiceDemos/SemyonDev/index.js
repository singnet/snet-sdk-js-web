import { useState } from "react";
import { ExampleService } from "./service_pb_service";
import { basicSttInput } from "./service_pb";
import "./style.css";

const TextToText = ({ serviceClient, isComplete }) => {
  const [output, setOutput] = useState("Hello, I'm pleased to showcase this feature.");

  const ServiceInput = () => {
    const [textInput, setTextInput] = useState("");

    const isAllowedToRun = () => !!textInput;

    const onActionEnd = ({ message, status, statusMessage }) => {
      if (status !== 0) {
        throw new Error(statusMessage);
      }
      setOutput(message.getResult());
    };

    const submitAction = () => {
      // descriptor exactly как в сгенерированном файле
      const methodDescriptor = ExampleService.basic_stt;

      // создаём и заполняем запрос
      const request = new basicSttInput();
      request.setText(textInput);
      console.log("request: ", request, request.toObject());
      

      // props для unary
      const props = {
        request,
        preventCloseServiceOnEnd: false,
        onEnd: onActionEnd,
      };

      serviceClient.unary(methodDescriptor, props);
    };

    return (
      <div className="content-box">
        <h4>Input</h4>
        <div className="content-box">
          <input
            type="text"
            label="Text"
            // helperTxt="Enter text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>
        <div className="content-box">
          <button
            variant="contained"
            onClick={submitAction}
            disabled={!isAllowedToRun()}
          >Submit</button>
        </div>
      </div>
    );
  };

  const ServiceOutput = () => {
    if (!output) {
      return (
        <div className="content-box">
          <h4>Something went wrong...</h4>
        </div>
      );
    }

    return (
      <div className="content-box">
        <h4>Output</h4>
        <div className="content-box">
          <input
            type="text"
            value={output}
            readOnly
          />
        </div>
      </div>
    );
  };

  return (
    <div className="service-container">
      {!isComplete ? <ServiceInput /> : <ServiceOutput />}
    </div>
  );
};

export default TextToText;
export {default as serviceConfig} from "./serviceConfig";
