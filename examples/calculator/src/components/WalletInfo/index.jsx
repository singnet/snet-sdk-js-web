import { useState } from "react";
import { getWalletInfo } from "../../helperFunctions/sdkCallFunctions";
import { cogsToAgix, tokenName } from "../../helperFunctions/priceHelpers";
import "./styles.css";
import Loader from "../Loader";
import Table from "../Table";
import Error from "../Error";

const WalletInfo = () => {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState('');
    const [transactionCount, setTransactionCount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const getWalletInfoFromSDK = async () => {
        setError()
        try {
            setIsLoading(true);
            const {address, balance, transactionCount} = await getWalletInfo();
            setAddress(address);
            setBalance(cogsToAgix(balance))
            setTransactionCount(transactionCount);
        } catch(error) {
            setError(error.message)
        } finally {
            setIsLoading(false);
        }
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
            <Error errorMessage={error} />
        </div>
)}

export default WalletInfo;