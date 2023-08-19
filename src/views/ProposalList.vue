<template>
  <div class="header">
    <span>Proposals</span>
    <router-link to="/propose"
      ><el-button round type="primary">Propose</el-button></router-link
    >
  </div>
  <div v-if="proposalListErrors.length > 0">
    Errors: {{ proposalListErrors }}
  </div>

  <div class="frame" v-for="proposal in proposalList" :key="proposal.createdAt">
    <router-link :to="`/proposal/${proposal.id}`">
      <div>proposalId: {{ proposal.proposalId }}</div>
      <span class="frame2">title: {{ proposal.title }}</span>
      <span class="frame2">created at:{{ proposal.createdAt }} </span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useProposal, ListProposal } from "@/utils/useProposal";

const { getProposalList } = useProposal();

const proposalList = ref<ListProposal[]>([]);
const proposalListErrors = ref<string[]>([]);

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
.header {
  width: 60%;
  display: grid;
  grid-template-columns: 1fr auto;
  justify-content: space-around;
  margin: 50px 0 50px 20%;
}
.frame {
  width: 60%;
  margin: 50px 0 50px 20%;
}
.frame2 {
  display: inline-block;
  margin-right: 20px;
}
</style>
