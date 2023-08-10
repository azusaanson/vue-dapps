<template>
  <header class="header">
    <router-link to="/">My Governance</router-link>
    <el-button-group v-if="isWalletConnected">
      <el-button round plain>{{ balance }} MTK</el-button>
      <el-button round plain @click="addToken">add MTK</el-button>
      <el-button round type="primary" plain>{{ shortAddress }}</el-button>
    </el-button-group>
    <el-button round type="primary" plain @click="connectWallet" v-else
      >Connect Wallet</el-button
    >
  </header>
  <router-view />
</template>

<script setup lang="ts">
import { useMetamask } from "@/utils/useWallet";
import { useMyToken } from "@/utils/useMyToken";
import { ref, onMounted, computed } from "vue";

const { connectMetamask, getAccount, addToken } = useMetamask();
const { getBalance } = useMyToken();

const isWalletConnected = ref(false);
const address = ref("");
const balance = ref(0);

const shortAddress = computed(() => {
  if (address.value !== "") {
    return (
      address.value.substring(0, 4) +
      "..." +
      address.value.substring(address.value.length - 4, address.value.length)
    );
  }
  return "";
});

const connectWallet = () => {
  connectMetamask().then((res) => {
    if (res !== "") {
      isWalletConnected.value = true;
      address.value = res;
      getBalance(address.value).then((res) => (balance.value = Number(res)));
    }
  });
};

onMounted(() => {
  getAccount().then((res) => {
    if (res !== "") {
      isWalletConnected.value = true;
      address.value = res;
    }
  });
  getBalance(address.value).then((res) => (balance.value = Number(res)));
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
