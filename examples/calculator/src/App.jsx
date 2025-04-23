import React, { createContext, Fragment, useEffect, useState } from "react";
import "./App.css"
import { getDefaultServiceClient, getFreeCallServiceClient, getPaymentServiceClient, getServiceMetadata } from "./helperFunctions/sdkCallFunctions";

// import ServiceDemo from "./components/ServiceDemo";
import ServiceDemo from "./components/ServiceDemo/index_calculator";

import ServiceInfo from "./components/ServiceInfo";
import WalletInfo from "./components/WalletInfo";
import TrainingModel from "./components/TrainingModel";
import freecallsConfig from "./configs/freecallsConfig";
import Error from "./components/Error";
import Loader from "./components/Loader";

export const AppContext = createContext(null);

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
    setIsClientLoading(true);
    const serviceClient = await getServiceClient(serviceMetadata);
    console.log("serviceClient: ", serviceClient, serviceClient.constructor.name, serviceClient.paymentChannelManagementStrategy.constructor.name);
    setServiceClientData({name: serviceClient.constructor.name, paymentStrategy: serviceClient.paymentChannelManagementStrategy.constructor.name})
    setServiceClient(serviceClient);
    setIsClientLoading(false);
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
      if (isServiceMetadataLoading || serviceMetadata) {
        return;
      }
      try {
        setError()
        setIsServiceMetadataLoading(true);
        const metadata =  await getServiceMetadata(freecallsConfig);
        setServiceMetadata(metadata);
      } catch(error) {
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
