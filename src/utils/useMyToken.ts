import { MYTOKEN_ADDRESS } from "@/consts/address";
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

    const balance = await myTokenContract.balanceOf(address).then();
    return balance;
  };

  return { getBalance };
};