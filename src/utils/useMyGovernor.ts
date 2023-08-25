import { useMyToken, myTokenAddress } from "@/utils/useMyToken";
import { MyGovernor__factory } from "@/abis/index";
import { ethers, Eip1193Provider, EventLog } from "ethers";
import { reactive } from "vue";

export const myGovernorAddress = process.env.VUE_APP_MYGOVERNOR_ADDRESS || "";

export interface ProposeRes {
  proposalId: string;
  proposer: string;
  targetContractAddrs: string[];
  ethValues: number[];
  signatures: string[];
  calldatas: string[];
  voteStart: number;
  voteEnd: number;
  title: string;
}

export interface CastVoteRes {
  voter: string;
  proposalId: string;
  voteType: string;
  weight: number;
  reason: string;
}

export const stateString = {
  pending: "Pending",
  active: "Active",
  canceled: "Canceled",
  defeated: "Defeated",
  succeeded: "Succeeded",
  queued: "Queued",
  expired: "Expired",
  executed: "Executed",
};

export const voteTypeNum = {
  against: 0,
  for: 1,
  abstain: 2,
};

const toStateString = (stateInt: number) => {
  switch (stateInt) {
    case 0:
      return stateString.pending;
    case 1:
      return stateString.active;
    case 2:
      return stateString.canceled;
    case 3:
      return stateString.defeated;
    case 4:
      return stateString.succeeded;
    case 5:
      return stateString.queued;
    case 6:
      return stateString.expired;
    case 7:
      return stateString.executed;
    default:
      return "";
  }
};

const toVoteTypeString = (num: number) => {
  switch (num) {
    case voteTypeNum.against:
      return "Against";
    case voteTypeNum.for:
      return "For";
    case voteTypeNum.abstain:
      return "Abstain";
    default:
      return "";
  }
};

export const useViewMyGovernor = () => {
  const contract = () => {
    const provider = new ethers.BrowserProvider(
      window.ethereum as Eip1193Provider
    );

    return MyGovernor__factory.connect(myGovernorAddress, provider);
  };

  const getProposalDetail = async (proposalId: string) => {
    const myGovernorContract = contract();

    const { state, snapshot, deadline, proposer } = await myGovernorContract
      .proposalDetail(proposalId)
      .catch((err) => {
        console.error(err);
        return {
          state: BigInt(10), // assign a out of range index to perform "zero value" because enum start from 0
          snapshot: BigInt(0),
          deadline: BigInt(0),
          proposer: "",
        };
      });

    return {
      stateString: toStateString(Number(state)),
      snapshot: Number(snapshot),
      deadline: Number(deadline),
      proposer: proposer,
    };
  };

  const getQuorumOfProposal = async (proposalId: string) => {
    const myGovernorContract = contract();
    const snapshot = await myGovernorContract
      .proposalSnapshot(proposalId)
      .catch((err) => {
        console.error(err);
        return BigInt(0);
      });
    if (snapshot == BigInt(0)) {
      return 0;
    }

    const { getBlock } = useMyToken();
    const block = await getBlock().catch((err) => {
      console.error(err);
      return 0;
    });
    if (block < snapshot) {
      return 0;
    }

    const quorum = await myGovernorContract
      .quorum(snapshot - BigInt(1))
      .catch((err) => {
        console.error(err);
        return BigInt(0);
      });

    return Number(quorum);
  };

  const getProposalVotes = async (proposalId: string) => {
    const myGovernorContract = contract();

    const { againstVotes, forVotes, abstainVotes } = await myGovernorContract
      .proposalVotes(proposalId)
      .catch((err) => {
        console.error(err);
        return {
          againstVotes: BigInt(0),
          forVotes: BigInt(0),
          abstainVotes: BigInt(0),
        };
      });

    return {
      against: Number(againstVotes),
      for: Number(forVotes),
      abstain: Number(abstainVotes),
    };
  };

  const getVotes = async (account: string, timepoint: number) => {
    const myGovernorContract = contract();

    const weight = await myGovernorContract
      .getVotes(account, timepoint)
      .catch((err) => {
        console.error(err);
        return BigInt(0);
      });

    return weight;
  };

  const hasVoted = async (proposalId: string, account: string) => {
    const myGovernorContract = contract();

    const voted = await myGovernorContract
      .hasVoted(proposalId, account)
      .catch((err) => {
        console.error(err);
        return true;
      });

    return voted;
  };

  return {
    getProposalDetail,
    getProposalVotes,
    getQuorumOfProposal,
    getVotes,
    hasVoted,
  };
};

export const useSignMyGovernor = () => {
  const contractSigner = async () => {
    const provider = new ethers.BrowserProvider(
      window.ethereum as Eip1193Provider
    );
    const signer = await provider.getSigner();

    return MyGovernor__factory.connect(myGovernorAddress, signer);
  };

  const proposeRes = reactive<ProposeRes>({
    proposalId: "0",
    proposer: "",
    targetContractAddrs: [],
    ethValues: [],
    signatures: [],
    calldatas: [],
    voteStart: 0,
    voteEnd: 0,
    title: "",
  });

  const propose = async (encodedCalldatas: string[], title: string) => {
    const errors: string[] = [];
    const myGovernorContractSigner = await contractSigner();

    const ethValues = new Array(encodedCalldatas.length).fill(0);
    const myTokenAddrs = new Array(encodedCalldatas.length).fill(
      myTokenAddress
    );

    const txResponse = await myGovernorContractSigner
      .propose(myTokenAddrs, ethValues, encodedCalldatas, title)
      .catch((err) => {
        console.error(err);
        errors.push(err);
      })
      .then();
    if (!txResponse) {
      return errors;
    }

    const txReceipt = await txResponse.wait();
    if (txReceipt) {
      if (txReceipt.logs[0] instanceof EventLog) {
        const {
          proposalId,
          proposer,
          targets,
          signatures,
          calldatas,
          voteStart,
          voteEnd,
          description,
        } = txReceipt.logs[0].args;

        Object.assign(proposeRes, {
          proposalId: String(proposalId),
          proposer: proposer,
          targetContractAddrs: targets,
          ethValues: ethValues, // 0 array because fixed req
          signatures: signatures,
          calldatas: calldatas,
          voteStart: Number(voteStart),
          voteEnd: Number(voteEnd),
          title: description,
        });
      }
    }

    return errors;
  };

  const cancel = async (
    targetContractAddrs: string[],
    ethValues: number[],
    encodedCalldatas: string[],
    titleHash: string
  ) => {
    const errors: string[] = [];
    let proposalIdRes = "";
    const myGovernorContractSigner = await contractSigner();

    const txResponse = await myGovernorContractSigner
      .cancel(targetContractAddrs, ethValues, encodedCalldatas, titleHash)
      .catch((err) => {
        console.error(err);
        errors.push(err);
      })
      .then();
    if (!txResponse) {
      return { proposalIdRes, errors };
    }

    const txReceipt = await txResponse.wait();
    if (txReceipt) {
      if (txReceipt.logs[0] instanceof EventLog) {
        const { proposalId } = txReceipt.logs[0].args;

        proposalIdRes = String(proposalId);
      }
    }

    return { proposalIdRes, errors };
  };

  const execute = async (
    targetContractAddrs: string[],
    ethValues: number[],
    encodedCalldatas: string[],
    titleHash: string
  ) => {
    const errors: string[] = [];
    let proposalIdRes = "";
    const myGovernorContractSigner = await contractSigner();

    const txResponse = await myGovernorContractSigner
      .execute(targetContractAddrs, ethValues, encodedCalldatas, titleHash)
      .catch((err) => {
        console.error(err);
        errors.push(err);
      })
      .then();
    if (!txResponse) {
      return { proposalIdRes, errors };
    }

    const txReceipt = await txResponse.wait();
    if (txReceipt) {
      if (txReceipt.logs[0] instanceof EventLog) {
        const { proposalId } = txReceipt.logs[0].args;

        proposalIdRes = String(proposalId);
      }
    }

    return { proposalIdRes, errors };
  };

  const castVoteRes = reactive<CastVoteRes>({
    voter: "",
    proposalId: "0",
    voteType: "",
    weight: 0,
    reason: "",
  });

  const castVote = async (proposalId: string, voteType: number) => {
    const errors: string[] = [];
    const myGovernorContractSigner = await contractSigner();

    const txResponse = await myGovernorContractSigner
      .castVote(proposalId, voteType)
      .catch((err) => {
        console.error(err);
        errors.push(err);
      })
      .then();
    if (!txResponse) {
      return errors;
    }

    const txReceipt = await txResponse.wait();
    if (txReceipt) {
      if (txReceipt.logs[0] instanceof EventLog) {
        const { voter, proposalId, support, weight, reason } =
          txReceipt.logs[0].args;

        Object.assign(castVoteRes, {
          voter: String(voter),
          proposalId: String(proposalId),
          voteType: toVoteTypeString(Number(support)),
          weight: Number(weight),
          reason: String(reason),
        });
      }
    }

    return errors;
  };

  return {
    proposeRes,
    propose,
    cancel,
    execute,
    castVoteRes,
    castVote,
  };
};
