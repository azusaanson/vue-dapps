<template>
  <div>
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
import { onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const id = route.query.id;
const { proposal, setProposal } = useProposal();

onMounted(async () => {
  await setProposal(String(id));
});
</script>
