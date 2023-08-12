import { MYGOVERNOR_ADDRESS, MYTOKEN_ADDRESS } from "@/consts/index";
import { MyGovernor__factory } from "@/abis/index";
import { ethers, Eip1193Provider } from "ethers";
import { reactive } from "vue";

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

    return MyGovernor__factory.connect(MYGOVERNOR_ADDRESS, provider);
  };

  const getContractSigner = async () => {
    const provider = new ethers.BrowserProvider(
      window.ethereum as Eip1193Provider
    );
    const signer = await provider.getSigner();

    return MyGovernor__factory.connect(MYGOVERNOR_ADDRESS, signer);
  };

  const propose = async (encodedCalldatas: string[], description: string) => {
    let proposalId = 0;
    const errors: string[] = [];
    const myGovernorContract = getContract();
    const myGovernorContractSigner = await getContractSigner();

    const ethValues = new Array(encodedCalldatas.length).fill(0);
    const myTokenAddrs = new Array(encodedCalldatas.length).fill(
      MYTOKEN_ADDRESS
    );

    const proposalIdRes = await myGovernorContractSigner
      .propose(myTokenAddrs, ethValues, encodedCalldatas, description)
      .catch((err) => {
        console.error(err);
        errors.push(err);
      });

    if (!proposalIdRes) {
      return { proposalId, errors };
    }
    proposalId = Number(proposalIdRes);

    myGovernorContract.on(
      myGovernorContract.filters.ProposalCreated(proposalId),
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

    return { proposalId, errors };
  };

  return { proposal, propose };
};
