import { MYGOVERNOR_ADDRESS, MYTOKEN_ADDRESS } from "@/consts/index";
import { MyGovernor__factory } from "@/abis/index";
import { ethers, Eip1193Provider, EventLog } from "ethers";
import { reactive } from "vue";

export interface Proposal {
  proposalId: string;
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
    proposalId: "0",
    proposer: "",
    targets: [],
    values: [],
    signatures: [],
    calldatas: [],
    voteStart: 0,
    voteEnd: 0,
    description: "",
  });

  const getContractSigner = async () => {
    const provider = new ethers.BrowserProvider(
      window.ethereum as Eip1193Provider
    );
    const signer = await provider.getSigner();

    return MyGovernor__factory.connect(MYGOVERNOR_ADDRESS, signer);
  };

  const propose = async (encodedCalldatas: string[], description: string) => {
    const errors: string[] = [];
    const myGovernorContractSigner = await getContractSigner();

    const ethValues = new Array(encodedCalldatas.length).fill(0);
    const myTokenAddrs = new Array(encodedCalldatas.length).fill(
      MYTOKEN_ADDRESS
    );

    const txResponse = await myGovernorContractSigner
      .propose(myTokenAddrs, ethValues, encodedCalldatas, description)
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
        proposal.targets = targets;
        proposal.signatures = signatures;
        proposal.calldatas = calldatas;
        proposal.voteStart = Number(voteStart);
        proposal.voteEnd = Number(voteEnd);
        proposal.description = description;
      }
    }

    return errors;
  };

  return { proposal, propose };
};
