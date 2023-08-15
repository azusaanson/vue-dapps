import { Web3 } from "web3";
import { keccak256, toUtf8Bytes } from "ethers";

export interface Proposal {
  id: number;
  proposalId: string;
  title: string;
  state: string;
  voteStart: number;
  voteEnd: number;
  againstVotes: number;
  forVotes: number;
  abstainVotes: number;
  proposer: string;
  overview: string;
  targetContractAddrs: string[];
  calldatas: string[];
  calldataDescs: string[];
  ethValues: number[];
  createdAt: number;
}

export interface ListProposal {
  id: number;
  proposalId: string;
  title: string;
  state: string;
  voteEnd: number;
  againstVotes: number;
  forVotes: number;
  abstainVotes: number;
}

export const useProposal = () => {
  const getDescriptionHash = (title: string) => {
    return keccak256(toUtf8Bytes(title));
  };

  const getProposalId = (
    targetContractAddrs: string[],
    ethValues: number[],
    calldatas: string[],
    title: string
  ) => {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    return web3.eth.abi.encodeParameters(
      ["address[]", "uint256[]", "bytes[]", "bytes32"],
      [targetContractAddrs, ethValues, calldatas, getDescriptionHash(title)]
    );
  };

  return { getDescriptionHash, getProposalId };
};
