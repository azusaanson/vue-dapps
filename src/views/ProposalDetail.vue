<template>
  <div class="frame">
    <div>proposalId: {{ proposal.proposalId }}</div>
    <div>title: {{ proposal.title }}</div>
    <div>state: {{ proposal.state }}</div>
    <div>createdAt: {{ proposal.createdAt }}</div>
    <div>voteStart: {{ proposal.voteStart }}</div>
    <div>voteEnd: {{ proposal.voteEnd }}</div>
    <div>proposer: {{ proposal.proposer }}</div>
    <div>overview: {{ proposal.overview }}</div>
    <div>forVotes: {{ proposal.forVotes }}</div>
    <div>againstVotes: {{ proposal.againstVotes }}</div>
    <div>abstainVotes: {{ proposal.abstainVotes }}</div>
    <div>targetContractAddrs: {{ proposal.targetContractAddrs }}</div>
    <div>ethValues: {{ proposal.ethValues }}</div>
    <div>calldataDescs: {{ proposal.calldataDescs }}</div>
    <div>calldatas: {{ proposal.calldatas }}</div>
  </div>
</template>

<script setup lang="ts">
import { useProposal } from "@/utils/useProposal";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const { proposal, setProposal } = useProposal();
const route = useRoute();

const id = ref("");

onMounted(async () => {
  id.value = route.params.id as string;
  await setProposal(id.value);
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
