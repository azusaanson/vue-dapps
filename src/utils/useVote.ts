import { useMyGovernor } from "@/utils/useMyGovernor";
import { ref } from "vue";

export const useVote = () => {
  const calVotesPercentage = async (proposalId: string, votes: number) => {
    const { getQuorumOfProposal } = useMyGovernor();
    const quorum = await getQuorumOfProposal(proposalId);
    if (quorum == 0) {
      return 0;
    }

    return Number(((100 * votes) / quorum).toFixed(0));
  };

  const canVote = ref(false);

  const setCanVote = async (
    proposalId: string,
    walletAddress: string,
    proposalStartAtBlock: number,
    proposalState: string
  ) => {
    const { stateString, getVotes, hasVoted } = useMyGovernor();

    const votes = await getVotes(walletAddress, proposalStartAtBlock);
    const voted = await hasVoted(proposalId, walletAddress);

    canVote.value = proposalState === stateString.active && votes > 0 && !voted;

    return;
  };

  return { calVotesPercentage, canVote, setCanVote };
};
