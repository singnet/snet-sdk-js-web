import React from "react";
import { HSD } from "../../stubs/hate_speech_detection_pb_service";
import { MODEL, BLOCKS, LABELS } from "./metadata";
import "./styles.css";
import Error from "../Error";
import Loader from "../Loader";

const { rangeRestrictions, valueRestrictions } = MODEL.restrictions;
const onlyLatinsRegex = new RegExp(valueRestrictions.ONLY_LATINS_REGEX.value);

const EMPTY_STRING = "";
const OK_CODE = 0;
const SPACE = " ";
const SPACED_SLASH = " / ";
const keysToDelete = { TEXT: "text" };

const outlinedTextAreaAdditionalProps = {
  ON_CHANGE: "onChange",
};

class HateSpeechDetection extends React.Component {
  constructor(props) {
    const { state } = MODEL;
    super(props);
    this.submitAction = this.submitAction.bind(this);
    this.handleTextInput = this.handleTextInput.bind(this);
    this.inputMaxLengthHelperFunction = this.inputMaxLengthHelperFunction.bind(
      this
    );

    this.state = state;
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

  isOk(status) {
    return status === OK_CODE;
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

  parseResponse(response) {
    const { message, status, statusMessage } = response;
    if (!this.isOk(status)) {
      throw new Error(statusMessage);
    }

    const [result] = JSON.parse(message.getResult());

    //delete repeating of user input
    delete result[keysToDelete.TEXT];

    this.setState({
      response: result,
      isSubmitCompleted: true,
      isLoading: false
    });
  }

  submitAction() {
    const { textInputValue } = this.state;
    const { service } = MODEL;
    this.setState({isLoading: true})
    const methodDescriptor = HSD[service.METHOD];
    const request = new methodDescriptor.requestType();

    request.setValue(this.constructRequest(textInputValue));

    const props = {
      request,
      onEnd: (response) => this.parseResponse(response),
    };
    this.props.serviceClient.unary(methodDescriptor, props);
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