import {
  MYTOKEN_ADDRESS,
  MYTOKEN_DECIMALS,
  MYTOKEN_SYMBOL,
  MYTOKEN_SYMBOL_SMALL,
} from "@/consts/index";
import { MyToken__factory } from "@/abis/index";
import { ethers, Eip1193Provider } from "ethers";

export const useMyToken = () => {
  const getContract = () => {
    const provider = new ethers.BrowserProvider(
      window.ethereum as Eip1193Provider
    );

    const myTokenContract = MyToken__factory.connect(MYTOKEN_ADDRESS, provider);
    return myTokenContract;
  };

  const getBalance = async (address: string) => {
    const myTokenContract = getContract();

    const balance = await myTokenContract.balanceOf(address).catch((err) => {
      console.error(err);
      return { balance: 0, unit: "" };
    });

    if (Number(balance) < 10 ** (MYTOKEN_DECIMALS - 3)) {
      return { balance: Number(balance), unit: MYTOKEN_SYMBOL_SMALL };
    }
    return {
      balance: Number(balance) / 10 ** MYTOKEN_DECIMALS,
      unit: MYTOKEN_SYMBOL,
    };
  };

  return { getBalance };
};
