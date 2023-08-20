import { createStore } from "vuex";

export default createStore({
  state: {
    walletAddress: "",
  },
  getters: {},
  mutations: {
    setWalletAddress(state, newAddress) {
      state.walletAddress = newAddress;
    },
  },
  actions: {},
  modules: {},
});
