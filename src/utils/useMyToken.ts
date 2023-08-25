import { MyToken__factory } from "@/abis/index";
import { ethers, Eip1193Provider } from "ethers";

export const myTokenFuncType = {
  transfer: "transfer",
  updateGovernor: "updateGovernor",
  mint: "mint",
  burn: "burn",
};

export const myTokenAddress = process.env.VUE_APP_MYTOKEN_ADDRESS || "";

export const useMyToken = () => {
  const contract = () => {
    const provider = new ethers.BrowserProvider(
      window.ethereum as Eip1193Provider
    );

    return MyToken__factory.connect(myTokenAddress, provider);
  };

  const getBalance = async (address: string) => {
    const myTokenContract = contract();

    const balance = await myTokenContract.balanceOf(address).catch((err) => {
      console.error(err);
      return BigInt(0);
    });

    return Number(balance);
  };

  const getBlock = async () => {
    const myTokenContract = contract();

    const block = await myTokenContract.clock().catch((err) => {
      console.error(err);
      return BigInt(0);
    });

    return Number(block);
  };

  const encodeTransfer = (toAddr: string, amount: number) => {
    return contract().interface.encodeFunctionData("transfer", [
      toAddr,
      amount,
    ]);
  };

  const encodeUpdateGovernor = (newGovernorAddr: string) => {
    return contract().interface.encodeFunctionData("updateGovernor", [
      newGovernorAddr,
    ]);
  };

  const encodeMint = (amount: number) => {
    return contract().interface.encodeFunctionData("mint", [amount]);
  };

  const encodeBurn = (amount: number) => {
    return contract().interface.encodeFunctionData("burn", [amount]);
  };

  return {
    getBalance,
    getBlock,
    encodeTransfer,
    encodeUpdateGovernor,
    encodeMint,
    encodeBurn,
  };
};
