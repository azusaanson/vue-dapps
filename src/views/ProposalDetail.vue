<template>
  <div class="detail-frame">
    <span class="detail-frame2">{{ proposal.title }}</span>
    <el-tag size="large">{{ proposal.state }}</el-tag>
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
        <span>For {{ proposal.forVotes }}</span>
      </el-progress>
      <el-progress
        class="detail-frame2"
        type="circle"
        :percentage="againstPercentage"
        status="exception"
        :width="200"
      >
        <span>Against {{ proposal.againstVotes }}</span>
      </el-progress>
      <el-progress
        class="detail-frame2"
        type="circle"
        :percentage="abstainPercentage"
        status="warning"
        :width="200"
      >
        <span>Abstain {{ proposal.abstainVotes }}</span>
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
</template>

<script setup lang="ts">
import { useProposal } from "@/utils/useProposal";
import { useVote } from "@/utils/useVote";
import { toDate, shortHash, shortAddress } from "@/utils/useCommon";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const walletAddress = computed(() => store.state.walletAddress);

const { proposal, setProposal, canCancel, cancelProposal } = useProposal();
const { calVotesPercentage } = useVote();
const route = useRoute();

const id = ref("");
const actionCount = ref(0);
const forPercentage = ref(0);
const againstPercentage = ref(0);
const abstainPercentage = ref(0);
const errors = ref<string[]>([]);
const cancaledProposalId = ref("");
const showConfirmCancelDialog = ref(false);

const createdAtDate = computed(() => toDate(proposal.createdAt));
const shortProposalId = computed(() => shortHash(proposal.proposalId));
const shortProposer = computed(() => shortAddress(proposal.proposer));
const canProposalCancel = computed(() =>
  canCancel(proposal.state, proposal.proposer, walletAddress.value)
);

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

onMounted(async () => {
  id.value = route.params.id as string;
  await setProposal(id.value);
  actionCount.value = proposal.calldataDescs.length;
  await calVotes();
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
</style>
