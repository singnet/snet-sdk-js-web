import React, { useEffect, useState } from "react";
import "./App.css"
import { generateOptions, getDefaultServiceClient, getFreeCallServiceClient, getPaymentServiceClient, getServiceMetadata } from "./helperFunctions/sdkCallFunctions";
import ServiceDemo from "./components/ServiceDemo";
import ServiceInfo from "./components/ServiceInfo";
import WalletInfo from "./components/WalletInfo";
import { isEmpty } from "lodash";

const ExampleService = () => {
  const [serviceMetadata, setServiceMetadata] = useState();
  const [serviceClient, setServiceClient] = useState();
  const [isClientLoading, setIsClientLoading] = useState(false);
  // const [options, setOptions] = useState(generateOptions());
  const options = generateOptions();
  
  const getServiceClientHandler = async (getServiceClient) => {
    if (isClientLoading) {
      return;
    }
    setIsClientLoading(true);
    const serviceClient = await getServiceClient(serviceMetadata);
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
      if (!isEmpty(serviceMetadata)) {
        return;
      }
      const metadata =  await getServiceMetadata(options);
      setServiceMetadata(metadata);
    }

     getServiceMetadataFromSDK();
  }, [options])

    return (
      <div className="service-container">
        <div className="service-info">
          <ServiceInfo serviceMetadata={serviceMetadata} />
          <WalletInfo serviceMetadata={serviceMetadata}/>
        </div>
        <div className="loadServiceButtons">
          {serviceClientButtons.map(button => <button key={button.key} disabled={!serviceMetadata} onClick={() => getServiceClientHandler(button.clientLoader)}>{button.title}</button>
          )}
        </div>
        <ServiceDemo serviceClient={serviceClient}/>
      </div>
    );
}

export default ExampleService;
