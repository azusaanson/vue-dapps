import { Web3 } from "web3";
import { keccak256, toUtf8Bytes } from "ethers";
import { useMyGovernor } from "@/utils/useMyGovernor";
import { useIpfs, ProposalIpfsRecord } from "@/utils/useIpfs";
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
    voteStart: 0,
    voteEnd: 0,
    ipfsAddress: "",
    firebaseID: "",
  });

  const createProposal = async (
    encodedCalldatas: string[],
    title: string,
    overview: string,
    callDataDescs: string[]
  ) => {
    // create proposal in contract
    const { proposeRes, propose } = useMyGovernor();

    const proposeErrs = await propose(encodedCalldatas, title);
    if (proposeErrs.length > 0) {
      return proposeErrs;
    }

    // create record in ipfs
    const { createProposalIpfsRecord } = await useIpfs();

    const newProposalIpfsRecord: ProposalIpfsRecord = {
      proposal_id: proposeRes.proposalId,
      title: title,
      overview: overview,
      target_contract_addresses: proposeRes.targetContractAddrs,
      eth_values: proposeRes.ethValues,
      call_datas: proposeRes.calldatas,
      call_data_descriptions: callDataDescs,
      created_at: Date.now(),
    };

    const ipfsRes = await createProposalIpfsRecord(newProposalIpfsRecord);
    if (ipfsRes.errors.length > 0) {
      return ipfsRes.errors;
    }

    // create record in firebase db
    const { createProposalRecord } = useDB();

    const dbRes = await createProposalRecord(ipfsRes.ipfsAddress);
    if (dbRes.errors.length > 0) {
      return dbRes.errors;
    }

    Object.assign(createProposalRes, {
      proposalId: proposeRes.proposalId,
      title: title,
      voteStart: proposeRes.voteStart,
      voteEnd: proposeRes.voteEnd,
      ipfsAddress: ipfsRes.ipfsAddress,
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
