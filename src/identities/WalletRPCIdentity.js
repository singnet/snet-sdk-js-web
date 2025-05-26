import { isUndefined } from "lodash";
import { logMessage } from "snet-sdk-core/utils/logger";
import Web3 from "web3";

const ethereumMethods = {
  REQUEST_ACCOUNTS: 'eth_requestAccounts',
  REQUEST_CHAIN_ID: 'eth_chainId',
  REQUEST_SWITCH_CHAIN: 'wallet_switchEthereumChain'
};

export const ON_ACCOUNT_CHANGE = "accountsChanged";
export const ON_NETWORK_CHANGE = "chainChanged";

/**
 * @implements Identity
 */
class WalletRPCIdentity {
  /**
   * @param {number} networkId
   */
  constructor(networkId) {
    this._networkId = networkId;
    this._web3 = this.defineWeb3();
    this._web3Provider = new Web3(this._web3);
    this.setupAccount();
    this.addListenersForWeb3();
  }

  get web3() {
    return this._web3;
  }

  defineWeb3() {
    if (isUndefined(window.ethereum)) {
      throw new Error('Metamask is not found');
    }
    return window.ethereum;
  }

  async detectEthereumNetwork() {
    try {
        const chainIdHex = await this._web3.request({
        method: ethereumMethods.REQUEST_CHAIN_ID,
        params: []
        });
        const networkId = parseInt(chainIdHex);
        return networkId;
    } catch(err) {
        console.error("detecting network: ", err);
        throw new Error("Can't send the request to getting network ID");
    }
  }

  async isUserAtExpectedEthereumNetwork() {
    try {
        const currentNetworkId = await this.detectEthereumNetwork();
        return Number(currentNetworkId) === this._networkId;
    } catch(err) {
        throw new Error("Can't detect the network ID");
    }
  }

  async switchNetwork() {
    try {
        const hexifiedChainId = "0x" + this._networkId.toString(16);
        await this._web3.request({
            method: ethereumMethods.REQUEST_SWITCH_CHAIN,
            params: [{
                chainId: hexifiedChainId
            }]
        });
    } catch(err) {
        console.error("switching network: ", err);
        throw new Error("Can't send the request to switch network");
    }
  }

  async checkAndSwitchNetwork() {
        try {
            const isExpectedNetwork = await this.isUserAtExpectedEthereumNetwork();
            if (!isExpectedNetwork) {
                await this.switchNetwork();
            }
        } catch(err) {
            throw new Error('Unable to check and switch network');
        }
    }

  async requestAccounts() {
    try {
      const accounts = await this._web3.request({
        method: ethereumMethods.REQUEST_ACCOUNTS
      });
      return accounts;
    } catch (err) {
        throw new Error("request accounts err: ", err);
    }
  }

  async signData(sha3Message) {
    try {
      const address = await this.getAddress();
      return this._web3Provider.eth.personal.sign(sha3Message, address, '');
    } catch (error) {
      throw new Error('signing data error: ', error);
    }
  }
  async sendTransaction(transactionObject) {
    try {  
      return new Promise((resolve, reject) => {
        this._web3Provider.eth.sendTransaction(transactionObject).on('transactionHash', hash => {
          logMessage('info', 'WalletRPCIdentity', `Transaction hash: ${hash}`);
        }).on('error', txError => {
          logMessage('error', 'WalletRPCIdentity', `Couldn't send transaction. ${txError}`);
          reject(txError);
        }).then(receipt => {
          if (receipt.status) {
            resolve(receipt);
          } else {
            reject(receipt);
          }
        });
      });
    } catch (error) {
      throw new Error('sending transaction error: ', error);
    }
  }

  async setupAccount() {
    try {
        await this.checkAndSwitchNetwork();
        this._web3Provider.eth.defaultAccount = await this.getAddress();
    } catch(err) {
        console.error("setupAccount err: ", err);
    }
  }

  async getAddress() {
    try {
      const accounts = await this.requestAccounts();
      if (accounts.length > 0) {
        return accounts[0];
      } else {
        logMessage('error', 'WalletRPCIdentity', 'No accounts found');
      }
    } catch (error) {
      throw new Error('gettind account error: ', error);
    }
  }
  addListenersForWeb3 = () => {
    this._web3.addListener(ON_ACCOUNT_CHANGE, async accounts => {
      this.getAddress();
      const event = new CustomEvent("snetMMAccountChanged", {
        bubbles: true,
        details: accounts[0]
      });
      window.dispatchEvent(event);
    });
    this._web3.addListener(ON_NETWORK_CHANGE, network => {
      this.switchNetwork();
      const event = new CustomEvent("snetMMNetworkChanged", {
        detail: {
          network
        }
      });
      window.dispatchEvent(event);
    });
  };
}

export default WalletRPCIdentity;