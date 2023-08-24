import { createStore } from "vuex";

export default createStore({
  state: {
    walletAddress: "",
    walletBalance: 0,
  },
  getters: {},
  mutations: {
    setWalletAddress(state, newAddress) {
      state.walletAddress = newAddress;
    },
    setWalletBalance(state, newBalance) {
      state.walletBalance = newBalance;
    },
  },
  actions: {},
  modules: {},
});
