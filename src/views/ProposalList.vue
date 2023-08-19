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
  <div v-for="proposal in proposalList" :key="proposal.createdAt">
    <span>proposalId: {{ proposal.proposalId }}</span>
    <span>title: {{ proposal.title }}</span>
    <span>state: {{ proposal.state }}</span>
    <span>deadline: block# {{ proposal.voteEnd }}</span>
    <span>created at:{{ proposal.createdAt }} </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useProposal, ListProposal } from "@/utils/useProposal";

const { getProposalList } = useProposal();

const proposalList = ref<ListProposal[]>([]);
const proposalListErrors = ref<string[]>([]);

const setProposalList = () => {
  getProposalList().then((value) => {
    if (value.errors.length > 0) {
      proposalListErrors.value = value.errors;
      return;
    }
    proposalList.value = value.proposalListRes;
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
</style>
