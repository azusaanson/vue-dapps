import { useMyGovernor } from "@/utils/useMyGovernor";

export const useVote = () => {
  const calVotesPercentage = async (proposalId: string, votes: number) => {
    const { getQuorumOfProposal } = useMyGovernor();
    const quorum = await getQuorumOfProposal(proposalId);
    if (quorum == 0) {
      return 0;
    }

    return Number(((100 * votes) / quorum).toFixed(0));
  };

  return { calVotesPercentage };
};
