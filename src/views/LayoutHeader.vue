<template>
  <header class="header">
    <router-link to="/"><el-button link>My Governance</el-button></router-link>
    <el-button-group v-if="isWalletConnected">
      <el-button round plain>
        <el-dropdown>
          <el-button link> {{ balance }} {{ MYTOKEN_SYMBOL }} </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="addToken"
                >Add MTK to MetaMask</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-button>
      <el-tooltip :content="walletAddress" placement="bottom" effect="light">
        <el-button round type="primary" plain>{{
          computedShortAddress
        }}</el-button>
      </el-tooltip>
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
import { shortAddress } from "@/utils/useCommon";
import { MYTOKEN_SYMBOL } from "@/consts/index";
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();
const walletAddress = computed(() => store.state.walletAddress);

const { connectMetamask, getAccount, addToken } = useMetamask();
const { getBalance } = useMyToken();

const isWalletConnected = ref(false);
const balance = ref(0);

const computedShortAddress = computed(() => {
  return shortAddress(walletAddress.value);
});

const getAccountAndBalance = () => {
  getAccount().then((res) => {
    if (res && res !== "") {
      isWalletConnected.value = true;
      store.commit("setWalletAddress", res);

      getBalance(walletAddress.value).then((balanceRes) => {
        balance.value = Number(balanceRes);
        store.commit("setWalletBalance", Number(balanceRes));
      });
    }
  });
};

const connectWallet = () => {
  const addressRes = connectMetamask();
  if (addressRes === "") {
    return;
  }

  getAccountAndBalance();
};

onMounted(() => {
  getAccountAndBalance();
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", getAccountAndBalance);
  }
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
