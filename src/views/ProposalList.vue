<template>
  <div class="proposal-list-header">
    <span>Proposals</span>
    <router-link to="/propose" v-if="!isProposeDisabled"
      ><el-button round type="primary" :disabled="isProposeDisabled"
        >Propose</el-button
      ></router-link
    >
    <el-button
      round
      type="primary"
      :disabled="isProposeDisabled"
      v-if="isProposeDisabled"
      >Propose</el-button
    >
  </div>
  <div v-if="proposalListErrors.length > 0">
    Errors: {{ proposalListErrors }}
  </div>

  <el-row v-for="proposal in proposalList" :key="proposal.createdAt"
    ><router-link class="proposal-list-frame" :to="`/proposal/${proposal.id}`">
      <el-button link>
        <el-col :span="24" class="proposal-list-frame2">
          <span class="proposal-list-frame3">{{ proposal.title }}</span>
          <span class="proposal-list-frame3"
            >proposal ID: {{ shortHash(proposal.proposalId) }}</span
          >
          <span class="proposal-list-frame3"
            >created at:{{ toDate(proposal.createdAt) }}
          </span>
        </el-col>
      </el-button>
    </router-link>
  </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useProposal, ListProposal } from "@/utils/useProposal";
import { toDate, shortHash } from "@/utils/useCommon";
import { useStore } from "vuex";

const store = useStore();
const walletBalance = computed(() => store.state.walletBalance);

const { getProposalList, canPropose } = useProposal();

const proposalList = ref<ListProposal[]>([]);
const proposalListErrors = ref<string[]>([]);

const isProposeDisabled = computed(() => !canPropose(walletBalance.value));

const setProposalList = () => {
  getProposalList().then((res) => {
    if (res.errors.length > 0) {
      proposalListErrors.value = res.errors;
      return;
    }
    proposalList.value = res.proposalListRes;
  });
};

onMounted(() => {
  setProposalList();
});
</script>

<style>
.proposal-list-header {
  width: 60%;
  display: grid;
  grid-template-columns: 1fr auto;
  justify-content: space-around;
  margin: 50px 0 50px 20%;
}
.proposal-list-frame {
  width: 60%;
  margin: 20px 0 0 20%;
  border: solid rgb(198, 198, 198);
  border-radius: 15px;
}
.proposal-list-frame2 {
  margin: 20px;
}
.proposal-list-frame3 {
  margin-right: 20px;
}
</style>
