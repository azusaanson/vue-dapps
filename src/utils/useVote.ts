import {
  useViewMyGovernor,
  useSignMyGovernor,
  stateString,
} from "@/utils/useMyGovernor";
import { ref, reactive } from "vue";

export interface VoteRes {
  voter: string;
  proposalId: string;
  voteType: string;
  weight: number;
}

export const useVote = () => {
  const calVotesPercentage = async (proposalId: string, votes: number) => {
    const { getQuorumOfProposal } = useViewMyGovernor();
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
    const { getVotes, hasVoted } = useViewMyGovernor();

    if (proposalState !== stateString.active) {
      canVote.value = false;
      return;
    }

    const votes = await getVotes(walletAddress, proposalStartAtBlock);
    const voted = await hasVoted(proposalId, walletAddress);

    canVote.value = proposalState === stateString.active && votes > 0 && !voted;
    return;
  };

  const voteRes = reactive<VoteRes>({
    voter: "",
    proposalId: "0",
    voteType: "",
    weight: 0,
  });

  const vote = async (proposalId: string, voteType: number) => {
    const { castVoteRes, castVote } = useSignMyGovernor();

    const proposeErrs = await castVote(proposalId, voteType);
    if (proposeErrs.length > 0) {
      return proposeErrs;
    }

    Object.assign(voteRes, {
      voter: castVoteRes.voter,
      proposalId: castVoteRes.proposalId,
      voteType: castVoteRes.voteType,
      weight: castVoteRes.weight,
    });

    return [];
  };

  return {
    calVotesPercentage,
    canVote,
    setCanVote,
    voteRes,
    vote,
  };
};
