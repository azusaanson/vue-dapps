<template>
  <div class="detail-header">
    <span class="detail-frame2">{{ proposal.title }}</span>
    <el-tag size="large">{{ proposal.state }}</el-tag>
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
    <div class="detail-text">
      <span class="detail-frame2">For: {{ proposal.forVotes }}</span>
      <span class="detail-frame2">Against: {{ proposal.againstVotes }}</span>
      <span>abstain: {{ proposal.abstainVotes }}</span>
    </div>
  </div>
  <div class="detail-frame">
    <div class="detail-text">
      <div class="detail-overview">Overview</div>
      <div>{{ proposal.overview }}</div>
    </div>
  </div>
  <div class="detail-frame">
    <div class="detail-text">
      <div>Actions</div>
      <div v-for="cnt in actionCount" :key="cnt" class="detail-text">
        <span class="detail-frame2">#{{ cnt }}</span>
        <span>{{ proposal.calldataDescs[cnt - 1] }}</span>
        <div>target contract: {{ proposal.targetContractAddrs[cnt - 1] }}</div>
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
</template>

<script setup lang="ts">
import { useProposal } from "@/utils/useProposal";
import { toDate, shortHash, shortAddress } from "@/utils/useCommon";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const { proposal, setProposal } = useProposal();
const route = useRoute();

const id = ref("");
const actionCount = ref(0);

const createdAtDate = computed(() => toDate(proposal.createdAt));
const shortProposalId = computed(() => shortHash(proposal.proposalId));
const shortProposer = computed(() => shortAddress(proposal.proposer));

onMounted(async () => {
  id.value = route.params.id as string;
  await setProposal(id.value);
  actionCount.value = proposal.calldataDescs.length;
});
</script>

<style>
.detail-header {
  width: 60%;
  margin: 50px 0 50px 20%;
}
.detail-frame {
  width: 60%;
  margin: 50px 0 50px 20%;
  border: solid rgb(198, 198, 198);
  border-radius: 15px;
}
.detail-frame2 {
  margin-right: 20px;
}
.detail-text {
  margin: 20px;
}
.detail-overview {
  margin-bottom: 20px;
}
</style>
