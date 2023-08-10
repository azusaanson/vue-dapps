import { MYTOKEN_ADDRESS } from "@/consts/address";
import MetaMaskOnboarding from "@metamask/onboarding";
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export const useMetamask = () => {
  const isMetamaskInstalled: boolean =
    window.ethereum !== undefined && window.ethereum.isMetaMask;

  const addToken = async () => {
    if (window.ethereum) {
      await window.ethereum
        .request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: MYTOKEN_ADDRESS,
              symbol: "MTK",
              decimals: 18,
            },
          },
        })
        .then((success) => {
          if (success) {
            console.log("MTK successfully added to wallet!");
          } else {
            throw new Error("Something went wrong.");
          }
        })
        .catch(console.error);
    }
  };

  const requestAccount = async () => {
    if (window.ethereum) {
      const accounts: string[] = await window.ethereum
        .request({
          method: "eth_requestAccounts",
        })
        .then();

      if (accounts && accounts.length !== 0) {
        return accounts[0];
      }
    }
    return "";
  };

  const getAccount = async () => {
    if (window.ethereum) {
      const accounts: string[] = await window.ethereum
        .request({
          method: "eth_accounts",
        })
        .then();

      if (accounts && accounts.length !== 0) {
        return accounts[0];
      }
    }
    return "";
  };

  const connectMetamask = async () => {
    if (!isMetamaskInstalled) {
      const onboarding = new MetaMaskOnboarding();
      onboarding.startOnboarding();
      return "";
    }

    const account: string = await requestAccount().then();

    return account;
  };

  return {
    isMetamaskInstalled,
    addToken,
    getAccount,
    connectMetamask,
  };
};
