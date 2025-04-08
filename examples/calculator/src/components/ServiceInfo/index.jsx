import { isUndefined } from "lodash";
import { cogsToAgix, tokenName } from "../../helperFunctions/priceHelpers";
import Loader from "../Loader/index.jsx";
import Table from "../Table/index.jsx";
import "./styles.css";
import { getAvailableFreeCalls } from "../../helperFunctions/sdkCallFunctions.js";
import { useState } from "react";

const ServiceInfo = ({serviceMetadata}) => {
    const [availableFreeCalls, setAvailibleFreeCalls] = useState();

    if (!serviceMetadata) {
        return <div className="loader"></div>
    }
    const metadata = serviceMetadata.metadata;
    const group = serviceMetadata.group;

    const generatePriceInfoMeta = (priceInfo) => {
        return [
            { title: "free calls", value: group.free_calls},
            { title: "pricing model", value: priceInfo.price_model },
            { title: "is default", value: String(priceInfo.default) },
            { title: "price", value: cogsToAgix(priceInfo.price_in_cogs) + " " + tokenName }
        ]
    }

    const getAvailableFreeCallsFromSDK = async () => {
        setAvailibleFreeCalls(await getAvailableFreeCalls(serviceMetadata));
    }
    
    return (
        <div className="service-info-container">
            <div className="main-service-info-container">
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
                    <div key={group.group_id} className="group">
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