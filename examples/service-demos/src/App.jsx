import { Fragment, useEffect, useState } from "react";
import "./App.css"
import { getDefaultServiceClient, getFreeCallServiceClient, getPaymentServiceClient, getServiceMetadata } from "./helperFunctions/sdkCallFunctions";
import { AppContext } from "./AppContext";

// import ServiceDemo, {serviceConfig} from "./components/ServiceDemos/HateSpeechDetection";
// import ServiceDemo, {serviceConfig} from "./components/ServiceDemos/Calculator";
import ServiceDemo, {serviceConfig} from "./components/ServiceDemos/SemyonDev";
// import ServiceDemo, {serviceConfig} from "./components/ServiceDemos/TossSER_FreeTrain";


import ServiceInfo from "./components/ServiceInfo";
import WalletInfo from "./components/WalletInfo";
import TrainingModel from "./components/TrainingModel";
import freecallsConfig from "./configs/freecallsConfig";
import Error from "./components/Error";
import Loader from "./components/Loader";

const ExampleService = () => {
  const [isServiceMetadataLoading, setIsServiceMetadataLoading] = useState(false);
  const [serviceMetadata, setServiceMetadata] = useState();
  const [serviceClient, setServiceClient] = useState();
  const [serviceClientData, setServiceClientData] = useState();
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [error, setError] = useState();
  
  const getServiceClientHandler = async (getServiceClient) => {
    if (isClientLoading) {
      return;
    }
    try {
      setIsClientLoading(true);
      const serviceClient = await getServiceClient(serviceMetadata);
      setServiceClientData({name: serviceClient.constructor.name, paymentStrategy: serviceClient.paymentChannelManagementStrategy.constructor.name})
      setServiceClient(serviceClient);
    } catch(err) {
      console.error(err); 
    } finally {
      setIsClientLoading(false);
    }
  }

  const serviceClientButtons = [
      {
        key: "default",
        title: "Load service client",
        clientLoader: getDefaultServiceClient
      },
      {
        key: "paid",
        title: "Load Paid Strategy client",
        clientLoader: getPaymentServiceClient
      },
      {
        key: "freeCall",
        title: "Load Free-call client",
        clientLoader: getFreeCallServiceClient
      }
  ]

  useEffect(() => {
    const getServiceMetadataFromSDK =  async () => {
      try {
        setError()
        setIsServiceMetadataLoading(true);
        const metadata =  await getServiceMetadata(serviceConfig, freecallsConfig);  
        setServiceMetadata(metadata);
      } catch(error) {
        console.error(error);
        setError(error.message)
      } finally {
        setIsServiceMetadataLoading(false);
      }
    }

     getServiceMetadataFromSDK();
  }, []);
  
  const LoaderMetadata = () => {
    return (
      isServiceMetadataLoading && <Fragment>
        <Loader isLoading={true} />
        <p>Please wait! Service metadata is loading</p>
      </Fragment>
    )
  }

    return (
      <AppContext.Provider value={setError}>
      <div className="service-container">
        <LoaderMetadata />
        {serviceMetadata && <Fragment>
          <div className="service-info">
            <ServiceInfo serviceMetadata={serviceMetadata} />
            <WalletInfo serviceMetadata={serviceMetadata}/>
          </div>
          <div className="button-group">
            {serviceClientButtons.map(button => 
              <button
                key={button.key}
                disabled={!serviceMetadata}
                onClick={() => getServiceClientHandler(button.clientLoader)}>
                  {button.title}
              </button>
            )}
          </div>
            <Loader isLoading={isClientLoading} />
        </Fragment>}
        {serviceClient && <Fragment>
          <p>Service client name: {serviceClientData?.name}</p>
          <p>Service client payment startegy: {serviceClientData?.paymentStrategy}</p>
          <ServiceDemo serviceClient={serviceClient}/>
          <TrainingModel serviceMetadata={serviceMetadata} serviceClient={serviceClient}/>
        </Fragment>}
        <Error errorMessage={error} />
      </div>
      </AppContext.Provider>
    );
}

export default ExampleService;
