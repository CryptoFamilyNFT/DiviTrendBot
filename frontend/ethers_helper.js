const { ethers } = require("ethers");

/**
*  WalletCard Component - use it to connect to the wallet and handle the wallet related functions
*  @params {null}
*  @returns {Element} // functions
*/
const WalletCard = () => {
    let errorMessage = null;
    let defaultAccount = null;
    let userBalance = null;
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
  
    const connectwalletHandler = () => {
      if (window.Ethereum) {
        provider.send("eth_requestAccounts", []).then(async () => {
          await accountChangedHandler(provider.getSigner());
        })
      } else {
        errorMessage = "Please Install Metamask!";
      }
    }
  
    const accountChangedHandler = async (newAccount) => {
      const address = await newAccount.getAddress();
      defaultAccount = address;
      const balance = await newAccount.getBalance()
      userBalance = ethers.utils.formatEther(balance);
      await getuserBalance(address)
    }
  
    const getuserBalance = async (address) => {
      const balance = await provider.getBalance(address, "latest")
    }
  
    return (
      <div className="WalletCard">
        <img src={Ethereum} className="App-logo" alt="logo" />
        <h3 className="h4">
          Welcome to a decentralized Application
        </h3>
        <button
          style={{ background: defaultAccount ? "#A5CC82" : "white" }}
          onClick={connectwalletHandler}>
          {defaultAccount ? "Connected!!" : "Connect"}
        </button>
        <div className="displayAccount">
          <h4 className="walletAddress">Address:{defaultAccount}</h4>
          <div className="balanceDisplay">
            <h3>
              Wallet Amount: {userBalance}
            </h3>
          </div>
        </div>
        {errorMessage}
      </div>
    )
}

module.exports = WalletCard;
