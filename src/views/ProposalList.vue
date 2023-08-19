<template>
  <div class="proposal-list-header">
    <span>Proposals</span>
    <router-link to="/propose"
      ><el-button round type="primary">Propose</el-button></router-link
    >
  </div>
  <div v-if="proposalListErrors.length > 0">
    Errors: {{ proposalListErrors }}
  </div>

  <el-row v-for="proposal in proposalList" :key="proposal.createdAt"
    ><router-link class="proposal-list-frame" :to="`/proposal/${proposal.id}`">
      <el-button link>
        <el-col :span="24" class="proposal-list-frame2">
          <span class="proposal-list-frame3"
            >proposalId: {{ proposal.proposalId }}</span
          >
          <span class="proposal-list-frame3">title: {{ proposal.title }}</span>
          <span class="proposal-list-frame3"
            >created at:{{ proposal.createdAt }}
          </span>
        </el-col>
      </el-button>
    </router-link>
  </el-row>
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
.proposal-list-header {
  width: 60%;
  display: grid;
  grid-template-columns: 1fr auto;
  justify-content: space-around;
  margin: 50px 0 50px 20%;
}
.proposal-list-frame {
  width: 60%;
  margin: 50px 0 50px 20%;
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
