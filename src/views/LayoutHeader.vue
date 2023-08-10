<template>
  <header class="header">
    <router-link to="/">My Governance</router-link>
    <el-button-group v-if="isWalletConnected">
      <el-button round plain>{{ balance }} MTK</el-button>
      <el-button round type="primary" plain>{{ address }}</el-button>
      <el-button type="danger" round plain>Disconnect</el-button>
    </el-button-group>
    <el-button round type="primary" plain @click="connectWallet" v-else
      >Connect Wallet</el-button
    >
  </header>
  <router-view />
</template>

<script setup lang="ts">
import { useMetamask } from "@/utils/useWallet";
import { ref, onMounted } from "vue";

const isWalletConnected = ref(false);
const balance = ref(0);
const address = ref("");

const { connectMetamask, getAccount } = useMetamask();

const connectWallet = () => {
  connectMetamask().then((res) => {
    if (res !== "") {
      isWalletConnected.value = true;
      address.value = res;
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
