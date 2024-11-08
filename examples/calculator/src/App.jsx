import React, { useState } from "react";
import "./App.css"
import { getServiceClient } from "./helperFunctions/sdkCallFunctions";
import ServiceDemo from "./components/ServiceDemo";
import ServiceInfo from "./components/ServiceInfo";
import WalletInfo from "./components/WalletInfo";

const ExampleService = () => {
  const [serviceClient, setServiceClient] = useState();
  const [isClientLoading, setIsClientLoading] = useState(false);

  // useEffect(() => {
  //   console.log("ExampleService init");
    
    const getServiceData = async () => {
      if (isClientLoading) {
        return;
      }
      setIsClientLoading(true);
      const serviceClient = await getServiceClient();
      setServiceClient(serviceClient);
      setIsClientLoading(false);
    }

  //   getServiceData()
  // }, [])

    return (
      <div className="service-container">
        <button onClick={getServiceData}>load service client</button>
        <div className="service-info">
          <ServiceInfo serviceClient={serviceClient} />
          <WalletInfo />
        </div>
        <ServiceDemo serviceClient={serviceClient}/>
      </div>
    );
}

export default ExampleService;
