<template>
  <div class="create-proposal-frame">
    <div>Create Proposal</div>
    <div class="frame">
      <div>Description</div>
      <el-input
        v-model="description"
        placeholder="Please input"
        clearable
        type="textarea"
        :autosize="{ minRows: 2 }"
      />
    </div>
    <div class="frame" v-for="cnt in executionCount" :key="cnt">
      <div>
        <span>Execution #{{ cnt }}</span>
        <el-button
          round
          type="danger"
          @click="deleteLastExecution"
          v-if="cnt === executionCount && cnt !== 1"
          >Delete</el-button
        >
      </div>
      <div>
        <div>Target Contract Address</div>
        <el-input
          v-model="targetAddrs[cnt - 1]"
          placeholder="Please input"
          clearable
        />
        <div>Call Data</div>
        <el-input
          v-model="calldatas[cnt - 1]"
          placeholder="Please input"
          clearable
          type="textarea"
          :autosize="{ minRows: 2 }"
        />
      </div>
    </div>
    <div>
      <el-button round @click="addExecution">Add Execution</el-button>
    </div>
    <div class="frame">
      <el-button round type="primary">Propose</el-button>
      <router-link to="/"
        ><el-button round type="danger">Cancel</el-button></router-link
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const description = ref<string>("");
const targetAddrs = ref<string[]>([""]);
const calldatas = ref<string[]>([""]);
const executionCount = ref(1);

const addExecution = () => {
  executionCount.value += 1;
  targetAddrs.value.push("");
  calldatas.value.push("");
};
const deleteLastExecution = () => {
  executionCount.value -= 1;
  targetAddrs.value.pop();
  calldatas.value.pop();
};
</script>

<style>
.create-proposal-frame {
  width: 60%;
  margin: 50px 0 50px 20%;
}
.frame {
  margin-top: 30px;
  margin-bottom: 30px;
}
</style>
