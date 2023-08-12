import { MYTOKEN_ADDRESS } from "@/consts/index";
import { MyToken__factory } from "@/abis/index";
import { ethers, Eip1193Provider } from "ethers";

export const useMyToken = () => {
  const getContract = () => {
    const provider = new ethers.BrowserProvider(
      window.ethereum as Eip1193Provider
    );

    return MyToken__factory.connect(MYTOKEN_ADDRESS, provider);
  };

  const getBalance = async (address: string) => {
    const myTokenContract = getContract();

    const balance = await myTokenContract.balanceOf(address).catch((err) => {
      console.error(err);
      return 0;
    });

    return Number(balance);
  };

  const myTokenFuncType = {
    transfer: "transfer",
    updateGovernor: "updateGovernor",
    mint: "mint",
    burn: "burn",
  };

  const encodeTransfer = (toAddr: string, amount: number) => {
    return getContract().interface.encodeFunctionData("transfer", [
      toAddr,
      amount,
    ]);
  };

  const encodeUpdateGovernor = (newGovernorAddr: string) => {
    return getContract().interface.encodeFunctionData("updateGovernor", [
      newGovernorAddr,
    ]);
  };

  const encodeMint = (amount: number) => {
    return getContract().interface.encodeFunctionData("mint", [amount]);
  };

  const encodeBurn = (amount: number) => {
    return getContract().interface.encodeFunctionData("burn", [amount]);
  };

  return {
    getBalance,
    myTokenFuncType,
    encodeTransfer,
    encodeUpdateGovernor,
    encodeMint,
    encodeBurn,
  };
};
