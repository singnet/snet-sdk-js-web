import { useState } from "react";
import { getWalletInfo } from "../../helperFunctions/sdkCallFunctions";
import "./styles.css";
import Loader from "../Loader";
import Table from "../Table";
import Error from "../Error";
import PopUp from "../PopUp";
import { cogsToToken } from "snet-sdk-core/utils/tokenUtils";
import { TOKEN_NAME } from "../../configs/sdkConfig";

const WalletInfo = () => {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState('');
    const [transactionCount, setTransactionCount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isWalletDataVisible, setIsWalletDataVisible] = useState(false);
    const [error, setError] = useState();

    const getWalletInfoFromSDK = async () => {
        setError();
        setIsWalletDataVisible(true);
        try {
            setIsLoading(true);
            const {address, balance, transactionCount} = await getWalletInfo();
            setAddress(address);
            setBalance(cogsToToken(balance, TOKEN_NAME))
            setTransactionCount(transactionCount);
        } catch(error) {
            setError(error.message)
        } finally {
            setIsLoading(false);
        }
    }

    const walletInfoMeta = [
        { title: "address", value: address },
        { title: "balance", value: balance + " " + TOKEN_NAME },
        { title: "transactions", value: transactionCount },
    ]

    return (
        <div className="wallet-info">
            <div className="button-group">
                <button onClick={getWalletInfoFromSDK}>Get wallet info</button>
            </div>
            <PopUp 
                isPopupView={isWalletDataVisible}
                closePopUp={() => setIsWalletDataVisible(false)}
                position="left"
            >
                <Loader isLoading={isLoading} />
                {!isLoading && address && balance && <Table className="wallet-info-table" tableData={walletInfoMeta} />}
            </PopUp>
            <Error errorMessage={error} />
        </div>
)}

export default WalletInfo;