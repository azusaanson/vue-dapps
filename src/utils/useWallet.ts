import {
  MYTOKEN_ADDRESS,
  MYTOKEN_SYMBOL,
  MYTOKEN_DECIMALS,
} from "@/consts/index";
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
              symbol: MYTOKEN_SYMBOL,
              decimals: MYTOKEN_DECIMALS,
            },
          },
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const requestAccount = async () => {
    if (window.ethereum) {
      const accounts: string[] = await window.ethereum
        .request({
          method: "eth_requestAccounts",
        })
        .catch((err) => {
          console.error(err);
          return [];
        })
        .then();

      if (accounts.length !== 0) {
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
        .catch((err) => {
          console.error(err);
          return [];
        })
        .then();

      if (accounts.length !== 0) {
        return accounts[0];
      }
    }
    return "";
  };

  const connectMetamask = () => {
    if (!isMetamaskInstalled) {
      const onboarding = new MetaMaskOnboarding();
      onboarding.startOnboarding();
      return "";
    }

    requestAccount()
      .catch((err) => {
        console.error(err);
        return "";
      })
      .then((account) => {
        return account;
      });

    return "";
  };

  return {
    isMetamaskInstalled,
    addToken,
    getAccount,
    connectMetamask,
  };
};
