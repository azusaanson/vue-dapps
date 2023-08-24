import { Web3 } from "web3";
import { keccak256, toUtf8Bytes, getAddress } from "ethers";
import { useMyGovernor } from "@/utils/useMyGovernor";
import {
  useDB,
  ProposalRecordInput,
  ProposalRecordOutput,
} from "@/utils/useDB";
import { reactive } from "vue";

export interface Proposal {
  id: string;
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
  id: string;
  proposalId: string;
  title: string;
  createdAt: number;
}

export interface CreateProposalRes {
  proposalId: string;
  title: string;
  voteStart: number;
  voteEnd: number;
  firebaseID: string;
}

export const useProposal = () => {
  const toDescriptionHash = (title: string) => {
    return keccak256(toUtf8Bytes(title));
  };

  const toProposalId = (
    targetContractAddrs: string[],
    ethValues: number[],
    calldatas: string[],
    title: string
  ) => {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    return web3.eth.abi.encodeParameters(
      ["address[]", "uint256[]", "bytes[]", "bytes32"],
      [targetContractAddrs, ethValues, calldatas, toDescriptionHash(title)]
    );
  };

  const getProposalList = async () => {
    const proposalListRes: ListProposal[] = [];

    const { getProposalRecordList } = useDB();

    const dbRes = await getProposalRecordList();
    if (dbRes.errors.length > 0) {
      return { proposalListRes, errors: dbRes.errors };
    }

    dbRes.records.forEach(async (record: ProposalRecordOutput) => {
      proposalListRes.push({
        id: record.id,
        proposalId: record.proposal_id,
        title: record.title,
        createdAt: record.created_at,
      });
    });

    return { proposalListRes, errors: [] };
  };

  const proposal = reactive<Proposal>({
    id: "",
    proposalId: "",
    title: "",
    state: "",
    voteStart: 0,
    voteEnd: 0,
    againstVotes: 0,
    forVotes: 0,
    abstainVotes: 0,
    proposer: "",
    overview: "",
    targetContractAddrs: [],
    calldatas: [],
    calldataDescs: [],
    ethValues: [],
    createdAt: 0,
  });

  const setProposal = async (id: string) => {
    // from firebase
    const { proposalRecordOutput, setProposalRecord } = useDB();

    await setProposalRecord(id);

    // from blockchain
    const { getProposalDetail, getProposalVotes } = useMyGovernor();

    const proposalDetail = await getProposalDetail(
      proposalRecordOutput.proposal_id
    );

    const proposalVotes = await getProposalVotes(
      proposalRecordOutput.proposal_id
    );

    Object.assign(proposal, {
      id: proposalRecordOutput.id,
      proposalId: proposalRecordOutput.proposal_id,
      title: proposalRecordOutput.title,
      state: proposalDetail.stateString,
      voteStart: proposalDetail.snapshot,
      voteEnd: proposalDetail.deadline,
      againstVotes: proposalVotes.against,
      forVotes: proposalVotes.for,
      abstainVotes: proposalVotes.abstain,
      proposer: proposalDetail.proposer,
      overview: proposalRecordOutput.overview,
      targetContractAddrs: proposalRecordOutput.target_contract_addresses,
      calldatas: proposalRecordOutput.call_datas,
      calldataDescs: proposalRecordOutput.call_data_descriptions,
      ethValues: proposalRecordOutput.eth_values,
      createdAt: proposalRecordOutput.created_at,
    });
  };

  const createProposalRes = reactive<CreateProposalRes>({
    proposalId: "0",
    title: "",
    voteStart: 0,
    voteEnd: 0,
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

    // create record in firebase db
    const newProposalRecord: ProposalRecordInput = {
      proposal_id: proposeRes.proposalId,
      title: title,
      overview: overview,
      target_contract_addresses: proposeRes.targetContractAddrs,
      eth_values: proposeRes.ethValues,
      call_datas: proposeRes.calldatas,
      call_data_descriptions: callDataDescs,
      created_at: Date.now(),
    };

    const { createProposalRecord } = useDB();

    const dbRes = await createProposalRecord(newProposalRecord);
    if (dbRes.errors.length > 0) {
      return dbRes.errors;
    }

    Object.assign(createProposalRes, {
      proposalId: proposeRes.proposalId,
      title: title,
      voteStart: proposeRes.voteStart,
      voteEnd: proposeRes.voteEnd,
      firebaseID: dbRes.id,
    });

    return [];
  };

  const canPropose = (walletBalance: number) => {
    return walletBalance >= 1000;
  };

  const cancelProposal = async (
    targetContractAddrs: string[],
    ethValues: number[],
    encodedCalldatas: string[],
    title: string
  ) => {
    const { cancel } = useMyGovernor();

    const cancelRes = await cancel(
      targetContractAddrs,
      ethValues,
      encodedCalldatas,
      toDescriptionHash(title)
    );
    if (cancelRes.errors.length > 0) {
      return { proposalId: "", errors: cancelRes.errors };
    }
    return { proposalId: cancelRes.proposalIdRes, errors: [] };
  };

  const canCancel = (
    state: string,
    proposer: string,
    walletAddress: string
  ) => {
    const { stateString } = useMyGovernor();

    if (
      walletAddress &&
      state === stateString.pending &&
      getAddress(walletAddress) == proposer
    ) {
      return true;
    }

    return false;
  };

  return {
    toProposalId,
    getProposalList,
    proposal,
    setProposal,
    createProposalRes,
    createProposal,
    canPropose,
    cancelProposal,
    canCancel,
  };
};
