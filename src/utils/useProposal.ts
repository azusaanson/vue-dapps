import { Web3 } from "web3";
import { keccak256, toUtf8Bytes } from "ethers";
import { useMyGovernor } from "@/utils/useMyGovernor";
import { useDB, ProposalRecord } from "@/utils/useDB";
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
  againstVotes: number;
  forVotes: number;
  abstainVotes: number;
}

export interface CreateProposalRes {
  proposalId: string;
  title: string;
  voteStart: number;
  voteEnd: number;
  ipfs_address: string;
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
    voteStart: 0,
    voteEnd: 0,
    ipfs_address: "",
  });

  const createProposal = async (
    encodedCalldatas: string[],
    title: string,
    overview: string
  ) => {
    const errors: string[] = [];

    // create proposal in contract
    const { proposeRes, propose } = useMyGovernor();

    const proposeErrs = await propose(encodedCalldatas, title);

    if (proposeErrs.length > 0) {
      return proposeErrs;
    }

    // create record in db
    const newProposalRecord: ProposalRecord = {
      id: 0,
      proposal_id: Number(proposeRes.proposalId),
      title: proposeRes.title,
      overview: overview,
      ipfs_address: "ipfs address",
    };

    const { proposalRecord, createProposalRecord } = await useDB();

    const dbRes = await createProposalRecord(newProposalRecord);

    if (!dbRes) {
      errors.push("db error: cannot create proposal data in db");
      return errors;
    }

    Object.assign(createProposalRes, {
      proposalId: proposeRes.proposalId,
      title: proposalRecord.title,
      voteStart: proposeRes.voteStart,
      voteEnd: proposeRes.voteEnd,
      ipfs_address: proposalRecord.ipfs_address,
    });

    return errors;
  };

  return {
    getDescriptionHash,
    getProposalId,
    createProposalRes,
    createProposal,
  };
};
