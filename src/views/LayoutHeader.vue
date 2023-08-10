<template>
  <nav>
    <router-link to="/">My Governance</router-link>
    <el-button-group v-if="isWalletConnected">
      <el-button>{{ balance }}</el-button>
      <el-button>{{ address }}</el-button>
      <el-button>Disconnect</el-button>
    </el-button-group>
    <el-button @click="connectWallet" v-else>Connect Wallet</el-button>
  </nav>
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

<style></style>
