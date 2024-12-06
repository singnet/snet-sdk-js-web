import { useState } from "react";
import { getWalletInfo } from "../../helperFunctions/sdkCallFunctions";
import { cogsToAgix, tokenName } from "../../helperFunctions/priceHelpers";
import "./styles.css";
import Loader from "../Loader/index.jsx";
import Table from "../Table/index.jsx";

const WalletInfo = ({serviceMetadata}) => {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState('');
    const [transactionCount, setTransactionCount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <div className="wallet-info">
            <div className="button-group">
                <button onClick={getWalletInfoFromSDK}>Get wallet info</button>
            </div>
            <Loader isLoading={isLoading} />
            {address && balance && <Table tableData={walletInfoMeta} />}
        </div>
)}

export default WalletInfo;