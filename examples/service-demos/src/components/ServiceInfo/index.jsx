import { isUndefined } from "lodash";

import { useContext, useState } from "react";
import { AppContext } from "../../AppContext.js";
import "./styles.css";
import { getAvailableFreeCalls } from "../../helperFunctions/sdkCallFunctions.js";

import Table from "../Table/index.jsx";
import { cogsToToken } from "snet-sdk-web/utils";
import { TOKEN_NAME } from "../../configs/sdkConfig.js";

const ServiceInfo = ({serviceMetadata}) => {
    const setError = useContext(AppContext);
    const [availableFreeCalls, setAvailibleFreeCalls] = useState();
    
    const metadata = serviceMetadata.serviceMetadata;
    const orgMetadata = serviceMetadata._orgMetadata;
    const group = serviceMetadata.group;
    

    const generatePriceInfoMeta = (priceInfo) => {
        return [
            { title: "free calls", value: group.free_calls},
            { title: "pricing model", value: priceInfo.price_model },
            { title: "is default", value: String(priceInfo.default) },
            { title: "price", value: cogsToToken(priceInfo.price_in_cogs, TOKEN_NAME) + " " + TOKEN_NAME }
        ]
    }

    const getAvailableFreeCallsFromSDK = async () => {
        try {
            setAvailibleFreeCalls(await getAvailableFreeCalls(serviceMetadata));
        } catch(error) {
            console.error(error);
            setError(error.message ?? error);
        }
    }
    
    const OrgMetadata = () => {
        const {description, short_description } = orgMetadata.description;
        return (
            <div className="info-card">
                <h2>{orgMetadata.org_name}</h2>
                <p>short description: {short_description}</p>
                <p>description: {description}</p>
                <p>contacts: {orgMetadata?.contacts[1]?.email}</p>
            </div>
        )
    }

    return (
        <div className="service-info-container">
            <OrgMetadata />
            <div className="main-service-info-container info-card">
                {metadata.media.map(image =>
                    <div key={image.url} className="service-image-container">
                        <img src={image.url} alt={image.altText} />
                    </div>
                )}
                <div className="main-service-info">
                    <h2>{metadata.display_name}</h2>
                    <button disabled={!serviceMetadata} onClick={getAvailableFreeCallsFromSDK}>Get free-calls available</button>
                    {!isUndefined(availableFreeCalls) && <p>Available free-calls: <b>{availableFreeCalls}</b></p>}
                </div>
            </div>
            <h2>Service groups:</h2>
            <div className="groups-container">
                {metadata.groups.map((group) => (
                    <div key={group.group_id} className="group info-card">
                        <h3>{group.group_name}</h3>
                        {group.pricing.map(price =>{
                            const priceInfoMeta = generatePriceInfoMeta(price);
                            return <Table key={price.price_model} tableData={priceInfoMeta} />
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ServiceInfo;