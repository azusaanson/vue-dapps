import { Web3 } from "web3";
import { keccak256, toUtf8Bytes } from "ethers";
import { useMyGovernor } from "@/utils/useMyGovernor";
import { useDB } from "@/utils/useDB";
import { reactive } from "vue";
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
}

export interface CreateProposalRes {
  proposalId: string;
  title: string;
  overview: string;
  voteStart: number;
  voteEnd: number;
  ipfsAddress: string;
  firebaseID: string;
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

  const createProposalRes = reactive<CreateProposalRes>({
    proposalId: "0",
    title: "",
    overview: "",
    voteStart: 0,
    voteEnd: 0,
    ipfsAddress: "",
    firebaseID: "",
  });

  const createProposal = async (
    encodedCalldatas: string[],
    title: string,
    overview: string
  ) => {
    // create proposal in contract
    const { proposeRes, propose } = useMyGovernor();

    const proposeErrs = await propose(encodedCalldatas, title);
    if (proposeErrs.length > 0) {
      return proposeErrs;
    }

    // create record in db
    const { createProposalRecord } = useDB();

    const newProposalRecord = "ipfs address" + proposeRes.proposalId;

    const dbRes = await createProposalRecord(newProposalRecord);
    if (dbRes.errors.length > 0) {
      return dbRes.errors;
    }

    Object.assign(createProposalRes, {
      proposalId: proposeRes.proposalId,
      title: title,
      overview: overview,
      voteStart: proposeRes.voteStart,
      voteEnd: proposeRes.voteEnd,
      ipfsAddress: newProposalRecord,
      firebaseID: dbRes.id,
    });

    return [];
  };

  return {
    getDescriptionHash,
    getProposalId,
    createProposalRes,
    createProposal,
  };
};
