import React from "react";
import { HSD } from "../../../stubs/hate_speech_detection_pb_service";
import { MODEL, BLOCKS, LABELS } from "./metadata";
import "../common/styles.css";
import Error from "../../Error";
import Loader from "../../Loader";
import { wrapUnaryToPromise } from "snet-sdk-core/utils/protoHelper";
import { AppContext } from "../../../AppContext";

export {default as serviceConfig} from "./serviceConfig";

const { rangeRestrictions, valueRestrictions } = MODEL.restrictions;
const onlyLatinsRegex = new RegExp(valueRestrictions.ONLY_LATINS_REGEX.value);

const EMPTY_STRING = "";
const SPACE = " ";
const SPACED_SLASH = " / ";
const keysToDelete = { TEXT: "text" };

const outlinedTextAreaAdditionalProps = {
  ON_CHANGE: "onChange",
};

class HateSpeechDetection extends React.Component {
    static contextType = AppContext;

  constructor(props) {
    const { state } = MODEL;
    super(props);
    this.submitAction = this.submitAction.bind(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    this.inputMaxLengthHelperFunction = this.inputMaxLengthHelperFunction.bind(
      this
    );
    this.backToInputAction = this.backToInputAction.bind(this);

    this.state = state;
  }
  setError(errorString) {
    this.context(errorString);
  }

  getErrorMessageByKey(errorKey) {
    const { errors } = LABELS;
    return errors[errorKey];
  }

  getValidationMeta() {
    const errorKey = valueRestrictions.ONLY_LATINS_REGEX.errorKey;
    return {
      regex: onlyLatinsRegex,
      errorKey: errorKey,
    };
  }

  isValidInput(regex, text) {
    return regex.exec(text);
  }

  validateInput(targetValue) {
    const { errors } = this.state.status;
    const { regex, errorKey } = this.getValidationMeta();
    let isAllRequirementsMet = true;

    if (!this.isValidInput(regex, targetValue)) {
      const errorMessage = this.getErrorMessageByKey(errorKey);
      errors.set(errorKey, errorMessage);
    } else {
      errors.delete(errorKey);
    }

    if (errors.size > 0) {
      isAllRequirementsMet = false;
    }

    this.setState({
      status: {
        errors: errors,
        isAllRequirementsMet: isAllRequirementsMet,
      },
    });
  }

  canBeInvoked() {
    const { status, textInputValue } = this.state;
    const { isAllRequirementsMet } = status;

    return isAllRequirementsMet && textInputValue !== EMPTY_STRING;
  }

  handleTextInput(event) {
    const targetName = event.target.name;
    const targetValue = event.target.value;

    this.validateInput(targetValue);

    this.setState({
      [targetName]: targetValue,
    });
  }

  constructRequest(data) {
    let request = [
      {
        text: data,
      },
    ];
    return JSON.stringify(request);
  }

  _buildRequestForSubmitAction(methodDescriptor) {
    const { textInputValue } = this.state;
    const request = new methodDescriptor.requestType();

    request.setValue(this.constructRequest(textInputValue));
    return request;
  }
  async submitAction() {
    try {
        this.setState({isLoading: true});

        const { service } = MODEL;
        const methodDescriptor = HSD[service.METHOD];
        const request = this._buildRequestForSubmitAction(methodDescriptor);

        const props = {
            request,
        };
        const message = await wrapUnaryToPromise(this.props.serviceClient, methodDescriptor, props);
        const [result] = JSON.parse(message.getResult());

        //delete repeating of user input
        delete result[keysToDelete.TEXT];

        this.setState({
            response: result,
            isSubmitCompleted: true,
        });
    } catch(error) {
        console.error(error);
        this.setError(error.message);        
    } finally {
        this.setState({
            isLoading: false
        });
    }
  }

  inputMaxLengthHelperFunction(textLengthValue, restrictionKey) {
    const { labels } = LABELS;

    return (
      textLengthValue +
      SPACED_SLASH +
      rangeRestrictions[restrictionKey].max +
      SPACE +
      labels.CHARS
    );
  }

  createHandleConfiguration(meta) {
    const { handleFunctionKey, rangeRestrictionKey } = meta;

    let InputHandlerConfiguration = {};

    if (this[handleFunctionKey]) {
      InputHandlerConfiguration[
        outlinedTextAreaAdditionalProps.ON_CHANGE
      ] = this[handleFunctionKey];
    }
    return InputHandlerConfiguration;
  }

  renderTextArea(meta) {
    const { labels } = LABELS;

    let InputHandlerConfiguration = [];

    if (meta.edit) {
      InputHandlerConfiguration = this.createHandleConfiguration(meta);
    }
    
    return (
        <input
          id={meta.id}
          name={meta.name}
          rows={meta.rows}
          label={labels[meta.labelKey]}
          value={this.state[meta.stateKey]}
          {...InputHandlerConfiguration}
        />
    );
  }

  renderOutputBlockSet() {
    const { labels } = LABELS;
    const { response } = this.state;
    const outputKeysArray = Object.keys(response);

    return (
      <div>
        <span className="output-label">{labels.SERVICE_OUTPUT}</span>
        {outputKeysArray.map((outputKey) => (
          <div
            key={outputKey}
            className="output-line"
          >
            <div className="response-category">
              {outputKey}
            </div>
            <div>
              {response[outputKey]}
            </div>
          </div>
        ))}
      </div>
    );
  }

  renderInvokeButton() {
    const { labels } = LABELS;

    return (
      <div className="invoke-button">
        <button
          onClick={this.submitAction}
          disabled={!this.canBeInvoked()}
        >
          {labels.INVOKE_BUTTON}
        </button>
      </div>
    );
  }

  renderValidationStatusBlocks(errors) {
    const errorKeysArray = Array.from(errors.keys());

    return (
      <div className="alerts-container">
        {errorKeysArray.map((arrayErrorKey) => (
          <Error errorMessage={errors.get(arrayErrorKey)} key={arrayErrorKey} className="alert-message"/>
        ))}
      </div>
    );
  }

  renderServiceInput() {
    const { inputBlocks } = BLOCKS;
    const { errors } = this.state.status;
    return (
      <div className="column">
        {this.renderTextArea(inputBlocks.TEXT_INPUT)}
        {this.renderInvokeButton()}
        {errors.size ? this.renderValidationStatusBlocks(errors) : null}
        <Loader isLoading={this.state.isLoading} />
      </div>
    );
  }

  backToInputAction() {
    this.setState({
      isSubmitCompleted: false,
      isLoading: false,
      response: undefined,
    });
  }
  renderBackToInputControls() {
    const { labels } = LABELS;

    return (
      <div className="back-to-input-button">
        <button
          onClick={this.backToInputAction}
        >
          {labels.BACK_TO_INPUT_BUTTON}
        </button>
      </div>
    );
  }

  renderServiceOutput() {
    const { response } = this.state;
    const { outputBlocks } = BLOCKS;
    const { status } = LABELS;

    if (!response) {
      return <h4>{status.NO_RESPONSE}</h4>;
    }

    return (
      <div className="column">
        {this.renderTextArea(outputBlocks.USER_TEXT_INPUT)}
        {this.renderOutputBlockSet()}
        {this.renderBackToInputControls()}
      </div>
    );
  }

  render() {
    if (!this.state.isSubmitCompleted) {
      return this.renderServiceInput();
    } else {
      return this.renderServiceOutput();
    }
  }
}

export default HateSpeechDetection;