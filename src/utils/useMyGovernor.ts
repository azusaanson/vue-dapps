import { MYGOVERNOR_ADDRESS, MYTOKEN_ADDRESS } from "@/consts/index";
import { MyGovernor__factory } from "@/abis/index";
import { ethers, Eip1193Provider, EventLog } from "ethers";
import { reactive } from "vue";

export interface ProposeResProposal {
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

export const useMyGovernor = () => {
  const proposal = reactive<ProposeResProposal>({
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

  const getContract = () => {
    const provider = new ethers.BrowserProvider(
      window.ethereum as Eip1193Provider
    );

    return MyGovernor__factory.connect(MYGOVERNOR_ADDRESS, provider);
  };

  const stateString = {
    pending: "Pending",
    active: "Active",
    canceled: "Canceled",
    defeated: "Defeated",
    succeeded: "Succeeded",
    queued: "Queued",
    expired: "Expired",
    executed: "Executed",
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

  const getProposalDetail = async (proposalId: string) => {
    const myGovernorContract = getContract();

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
      state: toStateString(Number(state)),
      voteStart: Number(snapshot),
      voteEnd: Number(deadline),
      proposer: proposer,
    };
  };

  const getProposalVotes = async (proposalId: string) => {
    const myGovernorContract = getContract();

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

  const getContractSigner = async () => {
    const provider = new ethers.BrowserProvider(
      window.ethereum as Eip1193Provider
    );
    const signer = await provider.getSigner();

    return MyGovernor__factory.connect(MYGOVERNOR_ADDRESS, signer);
  };

  const propose = async (encodedCalldatas: string[], title: string) => {
    const errors: string[] = [];
    const myGovernorContractSigner = await getContractSigner();

    const ethValues = new Array(encodedCalldatas.length).fill(0);
    const myTokenAddrs = new Array(encodedCalldatas.length).fill(
      MYTOKEN_ADDRESS
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
        proposal.proposalId = String(proposalId);
        proposal.proposer = proposer;
        proposal.targetContractAddrs = targets;
        proposal.ethValues = ethValues; // 0 array because fixed req
        proposal.signatures = signatures;
        proposal.calldatas = calldatas;
        proposal.voteStart = Number(voteStart);
        proposal.voteEnd = Number(voteEnd);
        proposal.title = description;
      }
    }

    return errors;
  };

  return { proposal, getProposalDetail, getProposalVotes, propose };
};
