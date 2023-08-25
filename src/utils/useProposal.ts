import { MYGOVERNOR_PROPOSAL_THRESHOLD } from "@/consts/index";
import { Web3 } from "web3";
import { keccak256, toUtf8Bytes, getAddress } from "ethers";
import {
  useViewMyGovernor,
  useSignMyGovernor,
  stateString,
} from "@/utils/useMyGovernor";
import { useMyToken } from "@/utils/useMyToken";
import { useDB, ProposalRecordReq, ProposalRecordRes } from "@/utils/useDB";
import { reactive, ref } from "vue";

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

export const toDescriptionHash = (title: string) => {
  return keccak256(toUtf8Bytes(title));
};

export const toProposalId = (
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

export const useProposal = () => {
  const getProposalList = async () => {
    const proposalListRes: ListProposal[] = [];

    const { getProposalRecordList } = useDB();

    const dbRes = await getProposalRecordList();
    if (dbRes.errors.length > 0) {
      return { proposalListRes, errors: dbRes.errors };
    }

    dbRes.records.forEach(async (record: ProposalRecordRes) => {
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
    const { proposalRecordRes, setProposalRecord } = useDB();

    await setProposalRecord(id);

    // from blockchain
    const { getProposalDetail, getProposalVotes } = useViewMyGovernor();

    const proposalDetail = await getProposalDetail(
      proposalRecordRes.proposal_id
    );

    const proposalVotes = await getProposalVotes(proposalRecordRes.proposal_id);

    Object.assign(proposal, {
      id: proposalRecordRes.id,
      proposalId: proposalRecordRes.proposal_id,
      title: proposalRecordRes.title,
      state: proposalDetail.stateString,
      voteStart: proposalDetail.snapshot,
      voteEnd: proposalDetail.deadline,
      againstVotes: proposalVotes.against,
      forVotes: proposalVotes.for,
      abstainVotes: proposalVotes.abstain,
      proposer: proposalDetail.proposer,
      overview: proposalRecordRes.overview,
      targetContractAddrs: proposalRecordRes.target_contract_addresses,
      calldatas: proposalRecordRes.call_datas,
      calldataDescs: proposalRecordRes.call_data_descriptions,
      ethValues: proposalRecordRes.eth_values,
      createdAt: proposalRecordRes.created_at,
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
    const { proposeRes, propose } = useSignMyGovernor();

    const proposeErrs = await propose(encodedCalldatas, title);
    if (proposeErrs.length > 0) {
      return proposeErrs;
    }

    // create record in firebase db
    const newProposalRecord: ProposalRecordReq = {
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

  const canPropose = ref(false);

  const setCanPropose = async (walletAddress: string) => {
    const { getVotes } = useViewMyGovernor();
    const { getBlock } = useMyToken();

    const blockNow = await getBlock();
    const votes = await getVotes(walletAddress, blockNow - 1);

    canPropose.value = votes >= MYGOVERNOR_PROPOSAL_THRESHOLD;

    return;
  };

  const cancelProposal = async (
    targetContractAddrs: string[],
    ethValues: number[],
    encodedCalldatas: string[],
    title: string
  ) => {
    const { cancel } = useSignMyGovernor();

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
    if (
      walletAddress &&
      state === stateString.pending &&
      getAddress(walletAddress) == proposer
    ) {
      return true;
    }

    return false;
  };

  const executeProposal = async (
    targetContractAddrs: string[],
    ethValues: number[],
    encodedCalldatas: string[],
    title: string
  ) => {
    const { execute } = useSignMyGovernor();

    const executeRes = await execute(
      targetContractAddrs,
      ethValues,
      encodedCalldatas,
      toDescriptionHash(title)
    );
    if (executeRes.errors.length > 0) {
      return { proposalId: "", errors: executeRes.errors };
    }
    return { proposalId: executeRes.proposalIdRes, errors: [] };
  };

  const canExecute = (state: string) => {
    if (state === stateString.succeeded || state === stateString.queued) {
      return true;
    }

    return false;
  };

  return {
    getProposalList,
    proposal,
    setProposal,
    createProposalRes,
    createProposal,
    canPropose,
    setCanPropose,
    cancelProposal,
    canCancel,
    executeProposal,
    canExecute,
  };
};
