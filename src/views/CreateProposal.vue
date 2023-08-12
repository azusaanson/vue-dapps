<template>
  <div class="create-proposal-frame">
    <div>Create Proposal</div>
    <div class="frame">
      <div>
        <span>Title</span
        ><span class="invalid-input" v-if="isTitleInvalid()"
          >invalid title</span
        >
      </div>
      <el-input v-model="title" placeholder="Please input" clearable />
      <div>
        <span>Overview</span
        ><span class="invalid-input" v-if="isOverviewInvalid()"
          >invalid overview</span
        >
      </div>
      <el-input
        v-model="overview"
        placeholder="Please input"
        clearable
        type="textarea"
        :autosize="{ minRows: 2 }"
      />
    </div>
    <div class="frame" v-for="cnt in actionCount" :key="cnt">
      <div>
        <span>Action #{{ cnt }}</span>
        <el-button
          round
          type="danger"
          class="margin-left"
          @click="deleteLastEncodedAction"
          v-if="cnt === actionCount && cnt !== 0"
          >Delete</el-button
        >
      </div>
      <div>{{ targetFuncDescs[cnt - 1] }}</div>
      <div>{{ encodedTargetFuncs[cnt - 1] }}</div>
    </div>
    <div class="frame border" v-if="isAddingAction">
      <div class="frame2">
        <div>Add Action</div>
        <div>Contract: MyToken</div>
        <div>
          <span>Function: </span>
          <el-select-v2
            v-model="selectedFunc"
            :options="funcOptions"
            placeholder="Please select"
          />
        </div>
        <div v-if="haveUintParam" class="param">
          <el-input-number v-model="paramUint" :min="0" :precision="0" />
          <span class="margin-left">MTK</span>
          <span class="invalid-input" v-if="isParamUintInvalid()"
            >invalid amount</span
          >
        </div>
        <div v-if="haveAddressParam" class="param">
          <el-input
            v-model="paramAddress"
            placeholder="Please input"
            clearable
            style="width: 500px"
          >
            <template #prepend>To</template>
          </el-input>
          <span class="invalid-input" v-if="isParamAddressInvalid()"
            >invalid address</span
          >
        </div>
        <div>
          <el-button
            round
            @click="encodeActionAndPush"
            :disabled="isPushActionDisabled"
            >Add</el-button
          >
          <el-button round type="danger" @click="deleteLastActionInput"
            >Delete</el-button
          >
        </div>
      </div>
    </div>
    <div>
      <el-button round @click="addActionInput" v-if="!isAddingAction"
        >Add Action</el-button
      >
    </div>
    <div class="frame">
      <el-button
        round
        type="primary"
        :disabled="isProposeDisabled"
        @click="createProposal"
        >Propose</el-button
      >
      <router-link to="/" class="margin-left"
        ><el-button round type="danger">Cancel</el-button></router-link
      >
    </div>
    <div class="frame" v-if="isCreateSucceed">
      <div class="create-succeed">Propose Succeed!</div>
      <div>Proposal Detail</div>
      <div>proposal id: {{ proposal.proposalId }}</div>
      <div>description: {{ proposal.description }}</div>
      <div>proposer: {{ proposal.proposer }}</div>
      <div>vote start at: {{ proposal.voteStart }}</div>
      <div>vote end at: {{ proposal.voteEnd }}</div>
      <div>target contract addresses: {{ proposal.targets }}</div>
      <div>target functions: {{ proposal.calldatas }}</div>
    </div>
    <div class="frame create-failed" v-if="isCreateFailed">
      Propose Failed! Errors: {{ createErrors }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { isAddress } from "web3-validator";
import { useMyGovernor } from "@/utils/useMyGovernor";
import { useMyToken } from "@/utils/useMyToken";

const { proposal, propose } = useMyGovernor();
const {
  myTokenFuncType,
  encodeTransfer,
  encodeUpdateGovernor,
  encodeMint,
  encodeBurn,
} = useMyToken();

const title = ref<string>("");
const overview = ref<string>("");
const encodedTargetFuncs = ref<string[]>([]);
const targetFuncDescs = ref<string[]>([]);
const selectedFunc = ref<string>(myTokenFuncType.transfer);
const paramUint = ref<number>(0);
const paramAddress = ref<string>("");
const actionCount = ref(0);
const isAddingAction = ref(false);

const funcOptions = [
  { value: myTokenFuncType.transfer, label: myTokenFuncType.transfer },
  { value: myTokenFuncType.mint, label: myTokenFuncType.mint },
  { value: myTokenFuncType.burn, label: myTokenFuncType.burn },
  {
    value: myTokenFuncType.updateGovernor,
    label: myTokenFuncType.updateGovernor,
  },
];

const isTitleInvalid = () => {
  return title.value == "";
};
const isOverviewInvalid = () => {
  return overview.value == "";
};
const isEncodedFuncInvalid = (i: number) => {
  return encodedTargetFuncs.value[i] == "";
};
const isParamUintInvalid = () => {
  return isNaN(+paramUint.value) || paramUint.value <= 0;
};
const isParamAddressInvalid = () => {
  return !isAddress(paramAddress.value);
};

const haveAddressParam = computed(
  () =>
    selectedFunc.value === myTokenFuncType.transfer ||
    selectedFunc.value === myTokenFuncType.updateGovernor
);
const haveUintParam = computed(
  () =>
    selectedFunc.value === myTokenFuncType.transfer ||
    selectedFunc.value === myTokenFuncType.mint ||
    selectedFunc.value === myTokenFuncType.burn
);
const isProposeDisabled = computed(() => {
  if (isTitleInvalid() || isOverviewInvalid() || isAddingAction.value) {
    return true;
  }

  for (
    let proposalIndex = 0;
    proposalIndex < actionCount.value;
    proposalIndex++
  ) {
    if (isEncodedFuncInvalid(proposalIndex)) {
      return true;
    }
  }
  return false;
});
const isPushActionDisabled = computed(() => {
  switch (selectedFunc.value) {
    case myTokenFuncType.transfer:
      return isParamUintInvalid() || isParamAddressInvalid();
    case myTokenFuncType.mint:
      return isParamUintInvalid();
    case myTokenFuncType.burn:
      return isParamUintInvalid();
    case myTokenFuncType.updateGovernor:
      return isParamAddressInvalid();
    default:
      return true;
  }
});

const initActionInput = () => {
  selectedFunc.value = myTokenFuncType.transfer;
  paramUint.value = 0;
  paramAddress.value = "";
};
const encodeActionAndPush = () => {
  let encodedFunc = "";

  switch (selectedFunc.value) {
    case myTokenFuncType.transfer:
      encodedFunc = encodeTransfer(paramAddress.value, paramUint.value);
      encodedTargetFuncs.value.push(encodedFunc);
      targetFuncDescs.value.push(
        "transfer " + paramUint.value + " MTK to " + paramAddress.value
      );
      actionCount.value += 1;
      deleteLastActionInput();
      return;
    case myTokenFuncType.mint:
      encodedFunc = encodeMint(paramUint.value);
      encodedTargetFuncs.value.push(encodedFunc);
      targetFuncDescs.value.push("mint " + paramUint.value + " MTK");
      actionCount.value += 1;
      deleteLastActionInput();
      return;
    case myTokenFuncType.burn:
      encodedFunc = encodeBurn(paramUint.value);
      encodedTargetFuncs.value.push(encodedFunc);
      targetFuncDescs.value.push("burn " + paramUint.value + " MTK");
      actionCount.value += 1;
      deleteLastActionInput();
      return;
    case myTokenFuncType.updateGovernor:
      encodedFunc = encodeUpdateGovernor(paramAddress.value);
      encodedTargetFuncs.value.push(encodedFunc);
      targetFuncDescs.value.push("updateGovernor to" + paramAddress.value);
      actionCount.value += 1;
      deleteLastActionInput();
      return;
    default:
      return;
  }
};
const deleteLastEncodedAction = () => {
  encodedTargetFuncs.value.pop();
  targetFuncDescs.value.pop();
  actionCount.value -= 1;
};
const deleteLastActionInput = () => {
  isAddingAction.value = false;
  initActionInput();
};
const addActionInput = () => {
  isAddingAction.value = true;
  initActionInput();
};

const createErrors = ref<string[]>([]);
const isAfterCreate = ref(false);

const isCreateSucceed = computed(
  () => isAfterCreate.value && createErrors.value.length == 0
);
const isCreateFailed = computed(
  () => isAfterCreate.value && createErrors.value.length > 0
);

const createProposal = () => {
  propose(encodedTargetFuncs.value, title.value).then((errs) => {
    if (errs.length > 0) {
      createErrors.value = errs;
    }
  });
  isAfterCreate.value = true;
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
.frame2 {
  margin: 15px;
}
.border {
  border: solid rgb(198, 198, 198);
  border-radius: 15px;
}
.param {
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 80px;
}
.invalid-input {
  color: red;
  margin-left: 10px;
}
.create-succeed {
  color: green;
}
.create-failed {
  color: red;
}
.margin-left {
  margin-left: 10px;
}
</style>