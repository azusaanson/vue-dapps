import { MYGOVERNOR_ADDRESS } from "@/consts/index";
import { MyGovernor__factory } from "@/abis/index";
import { ethers, Eip1193Provider } from "ethers";
import { reactive } from "vue";
import { Web3 } from "web3";

export interface Proposal {
  proposalId: number;
  proposer: string;
  targets: string[];
  values: number[];
  signatures: string[];
  calldatas: string[];
  voteStart: number;
  voteEnd: number;
  description: string;
}

export const useMyGovernor = () => {
  const proposal = reactive<Proposal>({
    proposalId: 0,
    proposer: "",
    targets: [],
    values: [],
    signatures: [],
    calldatas: [],
    voteStart: 0,
    voteEnd: 0,
    description: "",
  });

  const getContract = () => {
    const provider = new ethers.BrowserProvider(
      window.ethereum as Eip1193Provider
    );

    const myGovernorContract = MyGovernor__factory.connect(
      MYGOVERNOR_ADDRESS,
      provider
    );
    return myGovernorContract;
  };

  const propose = async (
    targetAddrs: string[],
    targetFuncNames: string[],
    description: string
  ) => {
    const errors: string[] = [];
    const myGovernorContract = getContract();
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    const ethValues = new Array(targetAddrs.length).fill(0);
    const encodedCalldatas = targetFuncNames.map((fn) =>
      web3.eth.abi.encodeFunctionSignature(fn)
    );

    const proposalIdRes = await myGovernorContract
      .propose(targetAddrs, ethValues, encodedCalldatas, description)
      .catch((err) => {
        console.error(err);
        errors.push(err);
      });

    if (!proposalIdRes) {
      return { proposal, errors };
    }

    myGovernorContract.on(
      myGovernorContract.filters.ProposalCreated(),
      (
        proposalId,
        proposer,
        targets,
        values,
        signatures,
        calldatas,
        voteStart,
        voteEnd,
        description
      ) => {
        proposal.proposalId = Number(proposalId);
        proposal.proposer = proposer;
        proposal.targets = targets;
        proposal.values = values.map((x) => Number(x));
        proposal.signatures = signatures;
        proposal.calldatas = calldatas;
        proposal.voteStart = Number(voteStart);
        proposal.voteEnd = Number(voteEnd);
        proposal.description = description;
      }
    );

    return { proposal, errors };
  };

  return { propose };
};
