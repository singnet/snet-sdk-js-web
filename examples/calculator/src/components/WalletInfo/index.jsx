import { useState } from "react";
import { getWalletInfo, getAvailableFreeCalls } from "../../helperFunctions/sdkCallFunctions";
import { cogsToAgix, tokenName } from "../../helperFunctions/priceHelpers";
import "./styles.css";
import Loader from "../Loader/index.jsx";

const WalletInfo = ({serviceMetadata}) => {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState('');
    const [transactionCount, setTransactionCount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [availableFreeCalls, setAvailibleFreeCalls] = useState("");

    const getWalletInfoFromSDK = async () => {
        setIsLoading(true);
        const {address, balance, transactionCount} = await getWalletInfo();
        setAddress(address);
        setBalance(cogsToAgix(balance))
        setTransactionCount(transactionCount);
        setIsLoading(false);
    }

    const walletInfoMeta = [
        { title: "address", value: address },
        { title: "balance", value: balance + " " + tokenName },
        { title: "transactions", value: transactionCount },
    ]

    const getAvailableFreeCallsFromSDK = async () => {
        setAvailibleFreeCalls(await getAvailableFreeCalls(serviceMetadata));
    }

    return (
        <div className="wallet-info">
            <div className="wallet-info-button-group">
                <button onClick={getWalletInfoFromSDK}>Get wallet info</button>
                <button disabled={!serviceMetadata} onClick={getAvailableFreeCallsFromSDK}>Get freecalls available</button>
            </div>
            <Loader isLoading={isLoading} />
            {address && balance &&
            <table className="wallet-info-table">
                <tbody>
                    {walletInfoMeta.map(infoRow =>
                    <tr key={infoRow.title}>
                        <th scope="row">{infoRow.title}</th>
                        <td>{infoRow.value}</td>
                    </tr>)}
                </tbody>
            </table>}
            <p>Available free-calls: <b>{availableFreeCalls}</b></p>
        </div>
)}

export default WalletInfo;