import Vue from "vue";
import Vuex from "vuex";
// import 'es6-promise/auto';
import layout from "./modules/layout";
import menu from "./modules/menu";
import createPersistedState from "vuex-persistedstate";
Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    auth: {
      token: "",
      role: "",
      user: {}
    }
  },
  getters: {
    loggedIn: (state) => state.auth.token,
    role: (state) => state.auth.role
  },
  mutations: {
    SET_AUTH(state, payload) {
      state.auth = payload;
    }
  },
  actions: {
    login({ commit }, data) {
      let auth = {};
      console.log(data);
      auth.token = data.jwt;
      auth.role = data.user.role.name;
      auth.user = data.user;
      commit("SET_AUTH", auth);
    },
    logout({ commit }) {
      commit("SET_AUTH", { token: "", role: "", user: {} });
    }
  },
  modules: {
    layout,
    menu
  },
  plugins: [
    createPersistedState({
      paths: ["auth"]
    })
  ]
});
