<template>
  <div class="detail-frame">
    <span class="detail-frame2">{{ proposal.title }}</span>
    <el-tag size="large" :type="stateTagType">{{ proposal.state }}</el-tag>
    <el-button
      type="danger"
      round
      class="detail-frame3"
      v-if="canProposalCancel"
      @click="showConfirmCancelDialog = true"
      >Cancel</el-button
    >
    <el-tooltip
      :content="proposal.proposalId"
      placement="bottom"
      effect="light"
    >
      <div>proposal ID: {{ shortProposalId }}</div>
    </el-tooltip>
    <el-tooltip :content="proposal.proposer" placement="bottom" effect="light">
      <div>proposer: {{ shortProposer }}</div>
    </el-tooltip>
    <div>
      <span class="detail-frame2"
        >vote start at: Block #{{ proposal.voteStart }}</span
      >
      <span class="detail-frame2"
        >vote end at: Block #{{ proposal.voteEnd }}</span
      >
      <span>created at: {{ createdAtDate }}</span>
    </div>
  </div>
  <div class="detail-frame">
    <div class="detail-vote">
      <el-progress
        class="detail-frame2"
        type="circle"
        :percentage="forPercentage"
        status="success"
        :width="200"
      >
        <div>For {{ proposal.forVotes }}</div>
        <el-button
          type="success"
          round
          class="vote-button"
          v-if="canVote"
          @click="showConfirmVoteForDialog = true"
          >Vote For</el-button
        >
      </el-progress>
      <el-progress
        class="detail-frame2"
        type="circle"
        :percentage="againstPercentage"
        status="exception"
        :width="200"
      >
        <div>Against {{ proposal.againstVotes }}</div>
        <el-button
          type="danger"
          round
          class="vote-button"
          v-if="canVote"
          @click="showConfirmVoteAgainstDialog = true"
          >Vote Against</el-button
        >
      </el-progress>
      <el-progress
        class="detail-frame2"
        type="circle"
        :percentage="abstainPercentage"
        status="warning"
        :width="200"
      >
        <div>Abstain {{ proposal.abstainVotes }}</div>
        <el-button
          type="warning"
          round
          class="vote-button"
          v-if="canVote"
          @click="showConfirmVoteAbstainDialog = true"
          >abstain your vote</el-button
        >
      </el-progress>
    </div>
  </div>
  <div class="detail-frame-border">
    <div class="detail-text">
      <div class="detail-overview">Overview</div>
      <div>{{ proposal.overview }}</div>
    </div>
  </div>
  <div class="detail-frame-border">
    <div class="detail-text">
      <div>Actions</div>
      <div v-for="cnt in actionCount" :key="cnt" class="detail-text">
        <span class="detail-frame2">#{{ cnt }}</span>
        <span>{{ proposal.calldataDescs[cnt - 1] }}</span>
        <el-tooltip
          :content="proposal.targetContractAddrs[cnt - 1]"
          placement="bottom"
          effect="light"
          ><div>
            target contract:
            {{ shortAddress(proposal.targetContractAddrs[cnt - 1]) }}
          </div>
        </el-tooltip>
        <el-tooltip
          :content="proposal.calldatas[cnt - 1]"
          placement="bottom"
          effect="light"
        >
          <div>hash: {{ shortHash(proposal.calldatas[cnt - 1]) }}</div>
        </el-tooltip>
      </div>
    </div>
  </div>

  <el-dialog
    v-model="showConfirmCancelDialog"
    title="Cancel Proposal"
    width="30%"
  >
    <span>Are you sure? Cannot undo</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showConfirmCancelDialog = false" round
          >I'm not sure</el-button
        >
        <el-button
          type="danger"
          @click="
            showConfirmCancelDialog = false;
            cancel();
          "
          round
        >
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    v-model="showConfirmVoteForDialog"
    title="Vote For Proposal"
    width="30%"
  >
    <span>{{ proposal.title }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showConfirmVoteForDialog = false" round
          >Cancel</el-button
        >
        <el-button
          type="primary"
          @click="
            showConfirmVoteForDialog = false;
            voteFor();
          "
          round
        >
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    v-model="showConfirmVoteAgainstDialog"
    title="Vote Against Proposal"
    width="30%"
  >
    <span>{{ proposal.title }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showConfirmVoteAgainstDialog = false" round
          >Cancel</el-button
        >
        <el-button
          type="primary"
          @click="
            showConfirmVoteAgainstDialog = false;
            voteAgainst();
          "
          round
        >
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    v-model="showConfirmVoteAbstainDialog"
    title="Abstain Your Vote"
    width="30%"
  >
    <span>{{ proposal.title }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showConfirmVoteAbstainDialog = false" round
          >Cancel</el-button
        >
        <el-button
          type="primary"
          @click="
            showConfirmVoteAbstainDialog = false;
            voteAbstain();
          "
          round
        >
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    v-model="isVoteSucceed"
    title="Vote Succeed!"
    width="50%"
    @close="reloadPage"
  >
    <div>
      {{ voteRes.voter }} voted {{ voteRes.weight }} {{ voteRes.voteType }} to
      {{ proposal.title }} (id: {{ voteRes.proposalId }})
    </div>
  </el-dialog>
  <el-dialog
    v-model="isCancelSucceed"
    title="Cancel Succeed!"
    width="50%"
    @close="reloadPage"
  >
    <div>
      Canceled proposal {{ proposal.title }} (id: {{ cancaledProposalId }})
    </div>
  </el-dialog>
  <el-dialog v-model="isFailed" title="Failed!" width="50%">
    <span>{{ errors }}</span>
  </el-dialog>
</template>

<script setup lang="ts">
import { useProposal } from "@/utils/useProposal";
import { useVote } from "@/utils/useVote";
import { useMyGovernor } from "@/utils/useMyGovernor";
import { toDate, shortHash, shortAddress } from "@/utils/useCommon";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const walletAddress = computed(() => store.state.walletAddress);

const { proposal, setProposal, canCancel, cancelProposal } = useProposal();
const { calVotesPercentage, canVote, setCanVote, voteRes, vote } = useVote();
const { stateString, voteTypeNum } = useMyGovernor();
const route = useRoute();

const reloadPage = () => {
  location.reload();
};

const id = ref("");
const actionCount = ref(0);
const forPercentage = ref(0);
const againstPercentage = ref(0);
const abstainPercentage = ref(0);
const errors = ref<string[]>([]);
const cancaledProposalId = ref("");
const showConfirmCancelDialog = ref(false);
const showConfirmVoteForDialog = ref(false);
const showConfirmVoteAgainstDialog = ref(false);
const showConfirmVoteAbstainDialog = ref(false);

const createdAtDate = computed(() => toDate(proposal.createdAt));
const shortProposalId = computed(() => shortHash(proposal.proposalId));
const shortProposer = computed(() => shortAddress(proposal.proposer));
const canProposalCancel = computed(() =>
  canCancel(proposal.state, proposal.proposer, walletAddress.value)
);
const stateTagType = computed(() => {
  switch (proposal.state) {
    case stateString.active:
      return "success";
    case stateString.succeeded:
      return "success";
    case stateString.queued:
      return "success";
    case stateString.executed:
      return "success";
    case stateString.canceled:
      return "info";
    case stateString.defeated:
      return "danger";
    case stateString.expired:
      return "warning";
    default:
      return "";
  }
});
const isVoteSucceed = computed(
  () => voteRes.proposalId != "0" && voteRes.proposalId != ""
);
const isCancelSucceed = computed(() => cancaledProposalId.value != "");
const isFailed = computed(() => errors.value.length > 0);

const calVotes = async () => {
  const forPer = await calVotesPercentage(
    proposal.proposalId,
    proposal.forVotes
  );
  forPercentage.value = forPer;
  const againstPer = await calVotesPercentage(
    proposal.proposalId,
    proposal.againstVotes
  );
  againstPercentage.value = againstPer;
  const abstainPer = await calVotesPercentage(
    proposal.proposalId,
    proposal.abstainVotes
  );
  abstainPercentage.value = abstainPer;
};
const cancel = () => {
  cancelProposal(
    proposal.targetContractAddrs,
    proposal.ethValues,
    proposal.calldatas,
    proposal.title
  ).then((res) => {
    if (res.errors.length > 0) {
      errors.value = res.errors;
      return;
    }
    cancaledProposalId.value = res.proposalId;
  });
};
const voteFor = () => {
  vote(proposal.proposalId, voteTypeNum.for).then((errorsRes) => {
    if (errorsRes.length > 0) {
      errors.value = errorsRes;
      return;
    }
  });
};
const voteAgainst = () => {
  vote(proposal.proposalId, voteTypeNum.against).then((errorsRes) => {
    if (errorsRes.length > 0) {
      errors.value = errorsRes;
      return;
    }
  });
};
const voteAbstain = () => {
  vote(proposal.proposalId, voteTypeNum.abstain).then((errorsRes) => {
    if (errorsRes.length > 0) {
      errors.value = errorsRes;
      return;
    }
  });
};

onMounted(async () => {
  id.value = route.params.id as string;
  await setProposal(id.value);
  actionCount.value = proposal.calldataDescs.length;
  await calVotes();
  setCanVote(
    proposal.proposalId,
    walletAddress.value,
    proposal.voteStart,
    proposal.state
  );
  store.subscribe((mutation, state) => {
    if (mutation.type === "setWalletAddress") {
      setCanVote(
        proposal.proposalId,
        state.walletAddress,
        proposal.voteStart,
        proposal.state
      );
    }
  });
});
</script>

<style>
.detail-frame {
  width: 60%;
  margin: 50px 0 50px 20%;
}
.detail-frame-border {
  width: 60%;
  margin: 0 0 50px 20%;
  border: solid rgb(198, 198, 198);
  border-radius: 15px;
}
.detail-frame2 {
  margin-right: 20px;
}
.detail-frame3 {
  margin-left: 50px;
}
.detail-vote {
  display: flex;
  justify-content: center;
}
.detail-text {
  margin: 20px;
}
.detail-overview {
  margin-bottom: 20px;
}
.vote-button {
  margin-top: 10px;
}
</style>
